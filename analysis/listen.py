"""Vaihe 2: kuuntelu näytönohjaimella (mallin "korvat").

Lukee prepare.py:n ja analyze.py:n tulosteet ja ajaa neuroverkkomallit GPU:lla:
  stemmit     Demucs htdemucs_ft    rummut, basso, muu, "laulu" + voimakkuus ruuduittain
  soittimet   PANNs CNN14 (SED)     AudioSet-soitinluokat 10 ms välein
  clap        CLAP (laion)          orkesterisoittimet ja luonne tekstikuvauksilla
  iskut       beat_this             iskut, tahdin alut, tahtinumerot, tempo
  savelet     torchcrepe            melodia ja basso stemmeistä, nuotit
Kirjoittaa: listen.json + listen.f32 (ruudut x kanavat, 30 fps), beats.json, notes.csv,
stems/*.wav, plots/listen.png ja LUE_MINUT.md. Jokaisen vaiheen näytönmuistin huippu
kirjataan listen.jsoniin.

Mallipainot tulevat kansiosta models/ (analysis/models.json, tarkistettu setup.ps1:llä).

Demo:  python -I analysis/listen.py build/demo
"""
import argparse
import csv
import json
import shutil
import subprocess
import threading
import time
from contextlib import contextmanager
from pathlib import Path

import librosa
import numpy as np
import scipy.ndimage as ndi
import soundfile as sf
import torch

ROOT = Path(__file__).resolve().parent.parent
MODELS = ROOT / "models"
FPS = 30
STEPS = ["stemmit", "soittimet", "clap", "iskut", "savelet"]
# CLAP ei ole oletuksena: laion/larger_clap_music antaa kaikille teksteille saman upotuksen
# (teksti-teksti 1,00, siniääni vs. kohina 0,97), myös transformers 4.57:llä. Vika on painoissa.
DEFAULT_STEPS = ["stemmit", "soittimet", "iskut", "savelet"]

PANNS_CLASSES = [
    "Violin, fiddle", "Cello", "Double bass", "String section", "Bowed string instrument", "Pizzicato",
    "French horn", "Trumpet", "Trombone", "Brass instrument", "Wind instrument, woodwind instrument",
    "Flute", "Clarinet", "Harp", "Timpani", "Cymbal", "Snare drum", "Bass drum", "Drum roll",
    "Glockenspiel", "Orchestra",
]
# CLAP on koulutettu englanniksi. Soittimet, joita AudioSetissä ei ole, sekä luonne.
CLAP_INSTRUMENTS = [
    "an oboe", "an english horn", "a bassoon", "a tuba", "a solo violin", "a string section",
    "french horns", "a trumpet fanfare", "muted trombones", "a flute", "a clarinet",
    "a harp glissando", "timpani rolls", "a snare drum", "a cymbal crash", "a full orchestra tutti",
]
CLAP_CHARACTER = [
    "heroic", "triumphant", "tender and romantic", "capricious and playful", "mocking and grotesque",
    "chaotic battle", "solemn", "peaceful and pastoral", "nostalgic",
]


def slug(s):
    return "".join(c if c.isalnum() else "_" for c in s.lower()).strip("_").replace("__", "_")


def pnorm(x, mask, lo=5, hi=95):
    a, b = np.nanpercentile(x[mask], [lo, hi])
    return np.clip((x - a) / (b - a + 1e-9), 0, 1)


def to_frames(values, times, n):
    """Arvot ajanhetkillä times (s) -> n ruutua 30 fps:llä (lineaarinen interpolointi)."""
    t = np.arange(n) / FPS
    if values.ndim == 1:
        return np.interp(t, times, values)
    return np.stack([np.interp(t, times, v) for v in values.T], axis=1)


def frame_rms_db(x, sr, n):
    hop = sr // FPS
    rms = librosa.feature.rms(y=x, frame_length=2 * hop, hop_length=hop)[0]
    rms = np.pad(rms, (0, max(0, n - len(rms))), mode="edge")[:n]
    return 20 * np.log10(rms + 1e-10)


class GpuMonitor(threading.Thread):
    """Seuraa koko kortin muistia ja käyttöastetta nvidia-smi:llä 0,5 s välein koko ajon ajan."""

    def __init__(self):
        super().__init__(daemon=True)
        self.samples = []
        self.proc = None

    def run(self):
        try:
            self.proc = subprocess.Popen(
                ["nvidia-smi", "--query-gpu=memory.used,utilization.gpu", "--format=csv,noheader,nounits",
                 "-lms", "500"], stdout=subprocess.PIPE, text=True)
            for line in self.proc.stdout:
                try:
                    mem, util = (int(v) for v in line.split(","))
                    self.samples.append((time.time(), mem, util))
                except ValueError:
                    pass
        except OSError:
            pass

    def stop(self, baseline_mb):
        if self.proc:
            self.proc.terminate()
        if not self.samples:
            return None
        mem = np.array([s[1] for s in self.samples])
        util = np.array([s[2] for s in self.samples])
        return {"perustaso_mt": baseline_mb, "huippu_mt": int(mem.max()), "lisays_huippu_mt": int(mem.max() - baseline_mb),
                "kayttoaste_keski_pct": round(float(util.mean()), 1), "kayttoaste_huippu_pct": int(util.max()),
                "naytteita": len(self.samples)}


def nvidia_smi_used_mb():
    try:
        out = subprocess.run(["nvidia-smi", "--query-gpu=memory.used", "--format=csv,noheader,nounits"],
                             capture_output=True, text=True, timeout=10).stdout
        return int(out.split()[0])
    except (OSError, ValueError, IndexError, subprocess.TimeoutExpired):
        return None


@contextmanager
def gpu_stage(name, log):
    """Kirjaa vaiheen keston ja näytönmuistin huipun."""
    torch.cuda.empty_cache()
    torch.cuda.reset_peak_memory_stats()
    t0 = time.time()
    entry = {}
    log[name] = entry
    yield entry
    torch.cuda.synchronize()
    entry["sekuntia"] = round(time.time() - t0, 1)
    entry["vram_huippu_mt"] = round(torch.cuda.max_memory_allocated() / 2**20)
    entry["vram_varattu_mt"] = round(torch.cuda.max_memory_reserved() / 2**20)
    entry["nvidia_smi_mt"] = nvidia_smi_used_mb()
    print(f"  {name}: {entry['sekuntia']} s, näytönmuistin huippu {entry['vram_huippu_mt']} Mt "
          f"(varattu {entry['vram_varattu_mt']} Mt, koko kortti {entry['nvidia_smi_mt']} Mt)")
    torch.cuda.empty_cache()


# --- Vaiheet -----------------------------------------------------------------

def step_stems(d, audio44, n, music, log):
    from demucs.apply import apply_model
    from demucs.pretrained import get_model

    with gpu_stage("stemmit (Demucs htdemucs_ft)", log):
        model = get_model("htdemucs_ft", repo=MODELS / "demucs")
        wav = torch.tensor(np.stack([audio44, audio44]), dtype=torch.float32)
        ref = wav.mean(0)
        mean, std = ref.mean(), ref.std()
        # shifts=2: kaksi satunnaisesti siirrettyä ajoa keskiarvoistetaan (parempi erottelu,
        # kaksinkertainen laskenta; näytönohjaimella on tilaa).
        out = apply_model(model, ((wav - mean) / std)[None], device="cuda", shifts=2, split=True,
                          overlap=0.25, progress=False)[0]
        out = (out * std + mean).mean(1).cpu().numpy()  # (lähteet, näytteet), mono
        names = list(model.sources)
        del model
    (d / "stems").mkdir(exist_ok=True)
    stems, energy = {}, []
    for name, x in zip(names, out):
        sf.write(d / "stems" / f"{name}.wav", x, 44100, subtype="FLOAT")
        stems[name] = x
        energy.append(ndi.gaussian_filter1d(10 ** (frame_rms_db(x, 44100, n) / 10), 3))
    # Stemmin osuus kokonaisenergiasta (summa 1): kertoo, mikä stemmi hallitsee, eikä
    # suurenna lähes hiljaista stemmiä täyteen mittaan.
    energy = np.array(energy)
    share = energy / (energy.sum(axis=0, keepdims=True) + 1e-12)
    return {f"stem_{name}": share[k] for k, name in enumerate(names)}, stems


def step_instruments(audio44, n, music, log):
    labels = Path.home() / "panns_data" / "class_labels_indices.csv"
    if not labels.exists():  # panns_inference lukee luokat tästä jo importissa
        labels.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(MODELS / "panns" / "class_labels_indices.csv", labels)
    from panns_inference import SoundEventDetection
    from panns_inference import labels as audioset

    audio = librosa.resample(audio44, orig_sr=44100, target_sr=32000)
    chunk, ctx = 32000 * 20, 32000  # 20 s palat, 1 s konteksti molemmin puolin
    with gpu_stage("soittimet (PANNs CNN14 SED)", log):
        sed = SoundEventDetection(checkpoint_path=str(MODELS / "panns" / "Cnn14_DecisionLevelMax_mAP=0.385.pth"),
                                  device="cuda")
        parts = []
        for s in range(0, len(audio), chunk):
            a, b = max(0, s - ctx), min(len(audio), s + chunk + ctx)
            fw = sed.inference(audio[None, a:b])[0]  # (ruudut 100 fps, 527)
            lo = (s - a) // 320
            parts.append(fw[lo: lo + (min(s + chunk, len(audio)) - s) // 320])
        del sed
    probs = np.concatenate(parts)
    times = np.arange(len(probs)) / 100.0
    idx = [audioset.index(c) for c in PANNS_CLASSES]
    frames = to_frames(probs[:, idx], times, n)
    return {f"panns_{slug(c)}": frames[:, k] for k, c in enumerate(PANNS_CLASSES)}


def embedding(out):
    """CLAP-upotus normalisoituna (transformers 4 palauttaa tensorin, 5 olion)."""
    feats = out.pooler_output if hasattr(out, "pooler_output") else out
    return torch.nn.functional.normalize(feats, dim=-1)


def step_clap(audio44, n, music, log, win_s=4.0, hop_s=0.5):
    from transformers import ClapModel, ClapProcessor

    audio = librosa.resample(audio44, orig_sr=44100, target_sr=48000)
    win, hop = int(win_s * 48000), int(hop_s * 48000)
    starts = list(range(0, max(1, len(audio) - win + 1), hop))
    centers = np.array([(s + win / 2) / 48000 for s in starts])
    prompts = [f"the sound of {x}" for x in CLAP_INSTRUMENTS] + [f"{x} orchestral music" for x in CLAP_CHARACTER]
    with gpu_stage("clap (laion/larger_clap_music)", log):
        proc = ClapProcessor.from_pretrained(MODELS / "clap")
        model = ClapModel.from_pretrained(MODELS / "clap").to("cuda").eval()
        with torch.no_grad():
            ti = proc(text=prompts, return_tensors="pt", padding=True).to("cuda")
            tf = embedding(model.get_text_features(**ti))
            sims = []
            for b in range(0, len(starts), 16):
                batch = [audio[s: s + win] for s in starts[b: b + 16]]
                ai = proc(audio=batch, sampling_rate=48000, return_tensors="pt").to("cuda")
                af = embedding(model.get_audio_features(**ai))
                sims.append((af @ tf.T).cpu().numpy())
            scale = float(model.logit_scale_a.exp().clamp(max=100))
        del model
    sims = np.concatenate(sims)
    # Kuvauksia verrataan toisiinsa samassa ikkunassa (softmax ryhmän sisällä, mallin oma
    # lämpötila). Jokaisen kuvauksen erillinen normalisointi ajan yli antaisi kaikille saman
    # kuvion, koska ääniupotuksen yhteinen vaihtelu peittää erot.
    out = {}
    for kind, labels, cols in (("clap", CLAP_INSTRUMENTS, slice(0, len(CLAP_INSTRUMENTS))),
                               ("luonne", CLAP_CHARACTER, slice(len(CLAP_INSTRUMENTS), None))):
        z = sims[:, cols] * scale
        p = np.exp(z - z.max(axis=1, keepdims=True))
        p /= p.sum(axis=1, keepdims=True)
        frames = to_frames(p, centers, n)
        for k, x in enumerate(labels):
            out[f"{kind}_{slug(x)}"] = frames[:, k]
    return out, {"prompts": prompts, "logit_scale": round(scale, 2), "raw_mean": sims.mean(0).round(4).tolist()}


def step_beats(audio44, n, t0, log):
    from beat_this.inference import Audio2Beats

    with gpu_stage("iskut (beat_this)", log):
        a2b = Audio2Beats(checkpoint_path=str(MODELS / "beat_this" / "final0.ckpt"), device="cuda", dbn=False)
        beats, downbeats = a2b(audio44, 44100)
        del a2b
    beats = np.asarray([b for b in beats if b >= t0 - 0.05])
    downbeats = np.asarray([b for b in downbeats if b >= t0 - 0.05])
    t = np.arange(n) / FPS
    ch = {}
    tempo_bars = bar_kinds = None
    raw_downbeats = downbeats
    if len(downbeats) >= 3:
        # Tempo tahdeista: iskuväleissä on oktaavivirheitä (puolinopeus <-> täysi nopeus),
        # tahdin alut ovat vakaampia. Lyhyet tai pitkät "tahdit" (virheelliset tahdin alut)
        # taitetaan mediaanin ympärille. Neljä iskua tahdissa.
        # beat_this voi vaihtaa metristä tasoa kokonaiseksi jaksoksi (tahdin alku joka puoli-
        # tahdissa), joten paikallinen mediaani ei riitä. Yksi johdonmukainen taso koko pätkälle:
        # yleisin tahdinpituus oktaavista riippumatta, sijoitettuna välille 1,5–3 s; jokainen
        # tahti taitetaan sen lähimpään oktaaviin. 'taitto' kertoo, paljonko tahtia korjattiin.
        bar = np.diff(downbeats)
        lg = np.log2(bar)
        hist, edges = np.histogram(np.mod(lg, 1.0), bins=24, range=(0, 1))
        phi = (edges[hist.argmax()] + edges[hist.argmax() + 1]) / 2
        ref = 2.0 ** phi
        while ref < 1.5:
            ref *= 2
        while ref >= 3.0:
            ref /= 2
        fold = np.clip(np.round(np.log2(ref) - lg), -2, 3)
        period = ndi.median_filter(bar * 2.0 ** fold, 5, mode="nearest")
        mids = downbeats[1:] - np.diff(downbeats) / 2
        # Puhdas tahtiruudukko: seuraava tahti paikallisen tahdinpituuden päästä; ensisijaisesti
        # tunnistettu tahdin alku, sitten lähin isku, viimeisenä laskettu kohta.
        grid, kinds = [downbeats[0]], ["tunnistettu"]
        end = len(audio44) / 44100
        while True:
            p = float(np.interp(grid[-1], mids, period))
            target = grid[-1] + p
            if target > end - 0.3 * p:
                break
            near_db = downbeats[np.abs(downbeats - target) <= 0.2 * p]
            near_b = beats[np.abs(beats - target) <= 0.15 * p]
            if len(near_db):
                grid.append(float(near_db[np.argmin(np.abs(near_db - target))])), kinds.append("tunnistettu")
            elif len(near_b):
                grid.append(float(near_b[np.argmin(np.abs(near_b - target))])), kinds.append("isku")
            else:
                grid.append(target), kinds.append("laskettu")
        grid = np.array(grid)
        bpm = 240 / ndi.median_filter(np.diff(grid), 3, mode="nearest")
        tempo_bars, bar_kinds = bpm, kinds
        ch["tempo_bpm"] = np.interp(t, grid[1:] - np.diff(grid) / 2, bpm)
        raw_downbeats, downbeats = downbeats, grid
    if len(beats) >= 2:
        i = np.clip(np.searchsorted(beats, t) - 1, 0, len(beats) - 2)
        ch["beat_phase"] = np.clip((t - beats[i]) / (beats[i + 1] - beats[i]), 0, 1) * (t >= beats[0])
    if len(downbeats) >= 2:
        i = np.clip(np.searchsorted(downbeats, t) - 1, 0, len(downbeats) - 2)
        ch["bar_phase"] = np.clip((t - downbeats[i]) / (downbeats[i + 1] - downbeats[i]), 0, 1) * (t >= downbeats[0])
    info = {
        "beats": beats.round(3).tolist(),
        "downbeats_raaka": np.asarray(raw_downbeats).round(3).tolist(),
        "bars": [{"bar": k + 1, "t": round(float(x), 3),
                  "tempo_bpm": round(float(tempo_bars[k]), 1) if tempo_bars is not None and k < len(tempo_bars) else None,
                  "lahde": bar_kinds[k] if bar_kinds else "tunnistettu"}
                 for k, x in enumerate(downbeats)],
        "tempo_median_bpm": round(float(np.median(tempo_bars)), 1) if tempo_bars is not None else None,
        "tempo_lahde": "puhdas tahtiruudukko (beat_this-tahdin alut ankkureina, yksi metrinen taso), 4 iskua/tahti",
        "tahtien_lahteet": {k: bar_kinds.count(k) for k in ("tunnistettu", "isku", "laskettu")} if bar_kinds else None,
    }
    return ch, info


def to_side_time(info, off):
    """beat_this antaa ajat paketin alusta; tiedostoon puolen aika (alkuperäinen FLAC)."""
    info = dict(info)
    info["beats"] = [round(b + off, 3) for b in info["beats"]]
    info["downbeats_raaka"] = [round(b + off, 3) for b in info["downbeats_raaka"]]
    info["bars"] = [{**b, "t": round(b["t"] + off, 3)} for b in info["bars"]]
    info["aika"] = "puolen aika (alkuperäinen FLAC), s"
    return info


def crepe_track(x, fmin, fmax):
    import torchcrepe

    audio = torch.tensor(librosa.resample(x, orig_sr=44100, target_sr=16000), dtype=torch.float32)[None].cuda()
    # torchcrepe lisää sävelarvioon satunnaista kohinaa (dither, ±20 senttiä) numpyn yleisestä
    # satunnaislähteestä; kiinteä siemen tekee nuoteista toistettavia.
    np.random.seed(0)
    pitch, periodicity = torchcrepe.predict(audio, 16000, hop_length=160, fmin=fmin, fmax=fmax, model="full",
                                            decoder=torchcrepe.decode.viterbi, return_periodicity=True,
                                            batch_size=1024, device="cuda")
    periodicity = torchcrepe.filter.median(periodicity, 3)
    pitch = torchcrepe.filter.mean(pitch, 3)
    pitch, periodicity = pitch[0].cpu().numpy(), periodicity[0].cpu().numpy()
    bad = ~np.isfinite(pitch) | ~np.isfinite(periodicity)
    return np.where(bad, fmin, pitch), np.where(bad, 0.0, periodicity)


def notes_from(midi, conf, times, source, min_conf=0.5, min_dur=0.06):
    notes, start = [], None
    for k in range(len(midi) + 1):
        ok = k < len(midi) and conf[k] >= min_conf
        if ok and start is not None and abs(midi[k] - np.median(midi[start:k])) > 0.6:
            ok_cont = False
        else:
            ok_cont = ok
        if start is not None and not ok_cont:
            if times[k - 1] - times[start] >= min_dur:
                seg = slice(start, k)
                notes.append([round(times[start], 3), round(times[k - 1] + 0.01, 3),
                              int(round(np.median(midi[seg]))), round(float(conf[seg].mean()), 3), source])
            start = None
        if ok and start is None:
            start = k
    return notes


def step_pitch(stems, audio44, n, music, log):
    tracks = {"melodia_laulu": (stems.get("vocals", audio44), 100, 2000),
              "melodia_muu": (stems.get("other", audio44), 100, 2000),
              "basso": (stems.get("bass", audio44), 32.7, 500)}  # CREPEn alaraja on C1
    ch, notes = {}, []
    with gpu_stage("savelet (torchcrepe full)", log):
        for name, (x, fmin, fmax) in tracks.items():
            hz, conf = crepe_track(x, fmin, fmax)
            times = np.arange(len(hz)) / 100.0
            midi = librosa.hz_to_midi(np.maximum(hz, 1e-3))
            fr_midi, fr_conf = to_frames(midi, times, n), to_frames(conf, times, n)
            ch[f"{name}_midi"] = np.where(fr_conf >= 0.5, fr_midi, -1.0)
            ch[f"{name}_varmuus"] = fr_conf
            notes += notes_from(midi, conf, times, name)
    # Johtava linja: kumpi melodiastemmi on varmempi ja voimakkaampi kussakin ruudussa.
    lv = ch["melodia_laulu_varmuus"]
    lm = ch["melodia_muu_varmuus"]
    use_vocals = lv >= lm
    ch["johtava_midi"] = np.where(use_vocals, ch["melodia_laulu_midi"], ch["melodia_muu_midi"])
    ch["johtava_varmuus"] = np.maximum(lv, lm)
    notes.sort(key=lambda r: r[0])
    return ch, notes


# --- Tarkistuskuva ja ohje -----------------------------------------------------

def plot(d, prep, n, ch, beats, loud, music_t):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    off = prep["start"]
    t = np.arange(n) / FPS + off
    paper, blue, red, black = "#E8DCC6", "#143E66", "#F5461A", "#1F1A18"
    groups = [
        ("PANNs (AudioSet)", [k for k in ch if k.startswith("panns_")]),
        ("CLAP: soittimet", [k for k in ch if k.startswith("clap_")]),
        ("CLAP: luonne", [k for k in ch if k.startswith("luonne_")]),
    ]
    fig, ax = plt.subplots(6, 1, figsize=(16, 22), sharex=True, facecolor=paper,
                           gridspec_kw={"height_ratios": [1, 2.4, 1.9, 1.1, 1, 1.6]})
    for x in ax:
        x.set_facecolor(paper)
        x.axvspan(off, music_t, color="#9A8B76", alpha=0.25, lw=0)

    ax[0].plot(t, loud, color=red, lw=1.2, label="voimakkuus")
    for b in beats.get("beats", []):
        ax[0].axvline(b, color=black, lw=0.3, alpha=0.5)
    for bar in beats.get("bars", []):
        ax[0].axvline(bar["t"], color=blue, lw=1.2)
        ax[0].text(bar["t"] + 0.05, 0.97, str(bar["bar"]), fontsize=7, color=blue, va="top")
    ax[0].set_ylim(0, 1.02)
    ax[0].set_title(f"Kuuntelu (GPU): LP-puoli {prep['side']}, {off:.0f}–{off + prep['duration']:.0f} s · "
                    f"tempo mediaani {beats.get('tempo_median_bpm')} BPM · tahteja {len(beats.get('bars', []))}",
                    loc="left")
    ax[0].set_ylabel("iskut ja tahdit")

    for x, (title, keys) in zip(ax[1:4], groups):
        if not keys:
            continue
        m = np.stack([ch[k] for k in keys])
        x.imshow(m, aspect="auto", origin="lower", cmap="Oranges" if "PANNs" in title else "Blues",
                 extent=[t[0], t[-1], -0.5, len(keys) - 0.5], vmin=0, vmax=None)
        x.set_yticks(range(len(keys)), [k.split("_", 1)[1] for k in keys], fontsize=7)
        x.set_ylabel(title)

    for k, c in zip([k for k in ch if k.startswith("stem_")], [black, blue, "#9A8B76", red]):
        ax[4].plot(t, ch[k], lw=0.9, color=c, label=k[5:])
    ax[4].legend(loc="upper right", fontsize=8)
    ax[4].set_ylabel("stemmit")

    for k, c in (("johtava", red), ("basso", blue)):
        if f"{k}_midi" in ch:
            m = ch[f"{k}_midi"] > 0
            ax[5].scatter(t[m], ch[f"{k}_midi"][m], s=2, color=c, label=k)
    ax[5].set_ylim(24, 96)
    ax[5].set_yticks(range(24, 97, 12), [f"C{o}" for o in range(1, 8)])
    ax[5].legend(loc="upper right", fontsize=8)
    ax[5].set_ylabel("sävelet (CREPE)")
    ax[5].set_xlabel("aika (s)")
    fig.tight_layout()
    (d / "plots").mkdir(exist_ok=True)
    fig.savefig(d / "plots" / "listen.png", dpi=80, facecolor=paper)


def write_readme(d, analysis_meta, listen_meta):
    lines = [
        "# Analyysipaketti – LUE MINUT",
        "",
        f"LP-puoli {listen_meta['side']}, {listen_meta['start']}–{listen_meta['start'] + listen_meta['duration']} s. "
        f"Musiikki alkaa {analysis_meta['music_start']} s.",
        "",
        "**Aika:** kaikki tiedostoihin kirjoitetut ajat (beats.json, notes.csv, events.json, segments.json, "
        "patina.json, analysis.json:n onsets ja keys_5s) ovat puolen aikaa eli alkuperäisen FLACin aikaa sekunteina. "
        f"Vain ruututaulukot (`*.f32`, 30 fps) ja äänitiedostot alkavat paketin alusta: ruutu i = "
        f"{listen_meta['start']} + i/30 s. Äänitiedostojen kello on tarkistettu alkuperäistä vasten "
        "(`analysis/kellot.py`).",
        "",
        "Kuunteluopas (sanoitusten vastine) on tiedostossa `annotations/kuunteluopas.md`.",
        "",
        "| Tiedosto | Sisältö |",
        "|---|---|",
        "| `analysis.json` + `analysis.f32` | signaalianalyysi (CPU): voimakkuus, attakit, rekisteri, kaistat, chroma, sävellaji, jännite |",
        "| `listen.json` + `listen.f32` | kuuntelu (GPU): soittimet, stemmit, luonne, sävelet, iskujen ja tahtien vaihe |",
        "| `beats.json` | iskut, tahdin alut, tahtinumerot (beat_this) |",
        "| `notes.csv` | nuotit: alku, loppu, MIDI, varmuus, lähde (melodia_laulu / melodia_muu / basso) |",
        "| `patina.json` | levyn naksahdukset (aika, voimakkuus) |",
        "| `stems/` | Demucs-stemmit (drums, bass, other, vocals) |",
        "",
        "## Kanavat ja luotettavuus",
        "",
        "- `panns_*`: AudioSet-soitinluokan todennäköisyys (0–1). Orkesteri sulautuu: vertaa suhteellisesti.",
        "- `clap_*`, `luonne_*`: kuvauksen todennäköisyys ryhmänsä sisällä samassa ikkunassa (softmax, summa 1). "
        "Suuntaa antava; vertaa kuvauksia toisiinsa.",
        "- `stem_*`: stemmin osuus kokonaisenergiasta (summa 1). Demucs on koulutettu popilla: rummut ≈ "
        "lyömäsoittimet, basso ≈ matala rekisteri, vocals ≈ ehkä johtava melodialinja (tarkistettava).",
        "- `*_midi`: sävelkorkeus MIDI-numerona, -1 kun varmuus < 0,5. `johtava_*` = varmempi melodiastemmi.",
        "- `tempo_bpm`, `beat_phase`, `bar_phase`: iskut ja tahdit; rubatossa epätarkka.",
        "",
        "## Näytönmuisti ja kestot",
        "",
        "| Vaihe | s | VRAM-huippu Mt | koko kortti Mt |",
        "|---|---|---|---|",
    ]
    for name, e in listen_meta["gpu"].items():
        lines.append(f"| {name} | {e['sekuntia']} | {e['vram_huippu_mt']} | {e['nvidia_smi_mt']} |")
    lines += ["", "Kanavat: " + ", ".join(f"`{c}`" for c in listen_meta["channels"])]
    (d / "LUE_MINUT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir", type=Path)
    ap.add_argument("--steps", default=",".join(DEFAULT_STEPS),
                    help="pilkuin eroteltuna: " + ",".join(STEPS) + " (oletus ilman clapia)")
    a = ap.parse_args()
    if not torch.cuda.is_available():
        raise SystemExit("CUDA ei käytettävissä: kuuntelutyökalu vaatii näytönohjaimen (aja setup.ps1)")
    steps = [s.strip() for s in a.steps.split(",") if s.strip()]
    d = a.dir if a.dir.is_absolute() else ROOT / a.dir
    prep = json.loads((d / "prepare.json").read_text(encoding="utf-8"))
    ameta = json.loads((d / "analysis.json").read_text(encoding="utf-8"))
    n = ameta["frames"]
    t0 = ameta["music_start"] - prep["start"]
    music = np.arange(n) / FPS >= t0
    adata = np.fromfile(d / "analysis.f32", dtype=np.float32).reshape(n, -1)
    loud = adata[:, ameta["channels"].index("loudness")]
    audio44, sr = sf.read(d / "clean_44k.wav", dtype="float32")
    assert sr == 44100, "aja prepare.py uudelleen (clean_44k.wav puuttuu tai väärä näytetaajuus)"

    gpu = torch.cuda.get_device_properties(0)
    print(f"Näytönohjain: {gpu.name}, {gpu.total_memory / 2**30:.1f} Gt · torch {torch.__version__}")
    log, channels, extra = {}, {}, {}
    stems, beats, notes = {}, {}, []
    baseline = nvidia_smi_used_mb()
    monitor = GpuMonitor()
    monitor.start()
    started = time.time()
    if "stemmit" in steps:
        ch, stems = step_stems(d, audio44, n, music, log)
        channels.update(ch)
    if "soittimet" in steps:
        channels.update(step_instruments(audio44, n, music, log))
    if "clap" in steps:
        ch, extra["clap"] = step_clap(audio44, n, music, log)
        channels.update(ch)
    # Tiedostoihin kirjoitetut ajat ovat puolen aikaa (alkuperäisen FLACin aika, s); vain
    # ruututaulukot (listen.f32) ja äänitiedostot alkavat paketin alusta (ruutu i = start + i/30).
    off = prep["start"]
    if "iskut" in steps:
        ch, beats = step_beats(audio44, n, t0, log)
        channels.update(ch)
        beats = to_side_time(beats, off)
        (d / "beats.json").write_text(json.dumps(beats, indent=1), encoding="utf-8")
    elif (d / "beats.json").exists():
        beats = json.loads((d / "beats.json").read_text(encoding="utf-8"))
    if "savelet" in steps:
        if not stems:  # sävelet stemmeistä, ei koko miksauksesta
            stems = {f.stem: sf.read(f, dtype="float32")[0] for f in sorted((d / "stems").glob("*.wav"))}
            if not stems:
                raise SystemExit("stemmit puuttuvat: aja ensin --steps stemmit")
        ch, notes = step_pitch(stems, audio44, n, music, log)
        channels.update(ch)
        with open(d / "notes.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["alku_s", "loppu_s", "midi", "varmuus", "lahde"])
            w.writerows([[round(a + off, 3), round(b + off, 3), *rest] for a, b, *rest in notes])

    extra["gpu_seuranta"] = monitor.stop(baseline)
    # Osittainen ajo (--steps) päivittää vain omat kanavansa; muut säilyvät edellisestä ajosta.
    if (d / "listen.json").exists() and set(steps) != set(STEPS):
        old = json.loads((d / "listen.json").read_text(encoding="utf-8"))
        if old.get("frames") == n:
            prev = np.fromfile(d / "listen.f32", dtype=np.float32).reshape(n, -1)
            channels = {**{c: prev[:, i] for i, c in enumerate(old["channels"])}, **channels}
            log = {**old.get("gpu", {}), **log}
    data = np.stack([np.asarray(v, dtype=np.float32) for v in channels.values()], axis=1)
    data.tofile(d / "listen.f32")
    meta = {
        "fps": FPS, "frames": n, "side": prep["side"], "start": prep["start"], "duration": prep["duration"],
        "music_start": ameta["music_start"], "channels": list(channels), "dtype": "float32",
        "layout": "frames x channels", "device": gpu.name, "torch": torch.__version__,
        "gpu": log, "total_s": round(time.time() - started, 1), **extra,
    }
    (d / "listen.json").write_text(json.dumps(meta, indent=1, ensure_ascii=False), encoding="utf-8")
    plot(d, prep, n, channels, beats, loud, ameta["music_start"])
    write_readme(d, ameta, meta)
    peak = max((e["vram_huippu_mt"] for e in log.values()), default=0)
    print(f"Valmis {meta['total_s']} s · {len(channels)} kanavaa · näytönmuistin huippu {peak} Mt · "
          f"{len(beats.get('bars', []))} tahtia · {len(notes)} nuottia")
    g = extra["gpu_seuranta"]
    if g:
        print(f"Näytönohjaimen seuranta ({g['naytteita']} näytettä): kortin muisti {g['perustaso_mt']} -> "
              f"{g['huippu_mt']} Mt (+{g['lisays_huippu_mt']}), käyttöaste keskimäärin {g['kayttoaste_keski_pct']} %, "
              f"huippu {g['kayttoaste_huippu_pct']} %")


if __name__ == "__main__":
    main()
