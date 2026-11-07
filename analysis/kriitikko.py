"""Kriitikkoportti: aineisto tuoreelle tarkistajalle, joka vertaa aikomusta kuvaan.

Kolme osaa (kaikki valinnaisia, index.md kokoaa):

1. Palautekohdat (--items): ruutusarja (tile) jokaisesta kohdasta, sarakkeet "piti näkyä / näkyy / ero".
2. Otot (--otot camcheck.txt): camcheckin ottolistasta jokaiselle otolle kaksi täysleveää stilliä (1/3 ja 2/3
   oton kestosta) rinnakkain, elementti-inventaariota varten: tarkistaja nimeää jokaisen kuvassa näkyvän
   elementin ja sen lähteen (ohjaus.md:n rivi, roolit.json, kuvasäännöt). Elementti ilman lähdettä on bugi
   (käyttäjä 1.11.2026: "jokaisella graafisella elementillä pitää olla tarkoitus").
3. Liikkeet (--liikkeet liikkeet.json): jokaisesta nimetystä liikkeestä liikekäyrä (analysis/liikekayra.py):
   onko liike yksi kaari vai monta (käyttäjä 1.11.2026: "pilvet avautuvat kolmesti", "liikkeiden pitää olla
   sujuvia, ei nykiviä"). Lisäksi 4 fps ruutusarja liikkeen ajalta.

    python -I analysis/kriitikko.py <video.mp4> --items docs/kriitikko_kohdat.json --otot runs/<ajo>/camcheck.txt \
        --liikkeet docs/liikkeet.json --out runs/<ajo>/kriitikko [--start 0]

Ajat ovat videon aikaa (A-puolella sama kuin puolen aika, kun video alkaa 0:sta; muuten --start).
"""
import argparse, json, math, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def tile(ffmpeg, video, vt0, dur, fps, width, cols, rows_n, path, t0_label):
    vf = (f"fps={fps},scale={width}:-2,"
          f"drawtext=text='%{{eif\\:{t0_label}+t\\:d}}.%{{eif\\:mod(({t0_label}+t)*10\\,10)\\:d}}s':x=6:y=6:fontsize=18:"
          f"fontcolor=white:box=1:boxcolor=black@0.6,tile={cols}x{rows_n}")
    cmd = [ffmpeg, '-v', 'error', '-y', '-ss', f'{vt0:.3f}', '-t', f'{dur:.3f}', '-i', video, '-vf', vf, '-frames:v', '1', path]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:   # drawtext voi puuttua (fontconfig): ilman aikaleimaa
        vf2 = f"fps={fps},scale={width}:-2,tile={cols}x{rows_n}"
        subprocess.run([ffmpeg, '-v', 'error', '-y', '-ss', f'{vt0:.3f}', '-t', f'{dur:.3f}', '-i', video, '-vf', vf2, '-frames:v', '1', path], check=False)


def still_pair(ffmpeg, video, ta, tb, width, path):
    """Kaksi stilliä rinnakkain (ta ja tb) yhdeksi kuvaksi."""
    cmd = [ffmpeg, '-v', 'error', '-y', '-ss', f'{ta:.3f}', '-i', video, '-ss', f'{tb:.3f}', '-i', video,
           '-filter_complex', f'[0:v]scale={width}:-2[a];[1:v]scale={width}:-2[b];[a][b]hstack', '-frames:v', '1', path]
    subprocess.run(cmd, check=False, capture_output=True)


def parse_camcheck(path):
    """Rivit muotoa '  229.0 s  F tasanko ja myrsky/23 nosturi huipulle   kääntö max ...' -> [(t, nimi)]."""
    shots = []
    for line in open(path, encoding='utf-8', errors='replace'):
        m = re.match(r'\s*([0-9.]+) s\s+(.+?)\s{2,}kääntö', line)
        if m:
            shots.append((float(m.group(1)), m.group(2).strip()))
    return shots


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--items')
    ap.add_argument('--otot', help='camcheck.txt, josta ottolista')
    ap.add_argument('--liikkeet', help='liikkeet.json: nimetyt liikkeet liikekäyrää varten')
    ap.add_argument('--out', required=True)
    ap.add_argument('--start', type=float, default=0.0, help='videon ensimmäisen ruudun aika puolen ajassa')
    ap.add_argument('--end', type=float, default=None, help='videon viimeinen aika puolen ajassa (ottolistan rajaus)')
    ap.add_argument('--max-frames', type=int, default=60)
    ap.add_argument('--width', type=int, default=480)
    ap.add_argument('--ffmpeg', default=os.environ.get('FFMPEG', 'ffmpeg'))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    md = [f"# Kriitikkoportti: {os.path.basename(a.video)}\n"]

    # 1. palautekohdat
    if a.items:
        items = json.load(open(a.items, encoding='utf-8'))
        md.append("\n## 1. Palautekohdat\n\nJokaisesta kohdasta: mitä piti näkyä, mitä ruuduissa näkyy, ero. "
                  "Ruudut rivi riviltä vasemmalta oikealle; aika ruudun kulmassa.\n\n"
                  "| # | Kohta | Ruudut | Piti näkyä | Näkyy | Ero / tila |\n|---|---|---|---|---|---|")
        for it in items:
            t0, t1 = float(it['t0']), float(it['t1'])
            fps = float(it.get('fps', 1))
            n = fps * (t1 - t0)
            if n > a.max_frames:
                fps = a.max_frames / (t1 - t0); n = a.max_frames
            n = max(1, int(math.ceil(n)))
            cols = min(6, n) if fps <= 2 else min(8, n)
            fn = f"{it['id']}_{t0:.1f}-{t1:.1f}.png"
            tile(a.ffmpeg, a.video, t0 - a.start, t1 - t0, fps, a.width, cols, int(math.ceil(n / cols)), os.path.join(a.out, fn), t0)
            print(f"{it['id']:8s} {t0:7.1f}-{t1:7.1f} s  {n:3d} ruutua @ {fps:.2f} fps  -> {fn}")
            md.append(f"| {it['id']} | {it.get('otsikko','')} ({t0}–{t1} s, {fps:.2f} fps) | `{fn}` | {it.get('piti_nakya','')} |  |  |")

    # 2. otot: elementti-inventaario
    if a.otot:
        shots = parse_camcheck(a.otot)
        md.append("\n## 2. Otot: elementti-inventaario\n\nJokaisesta otosta kaksi stilliä (1/3 ja 2/3 oton kestosta). "
                  "Tarkistaja luettelee JOKAISEN kuvassa näkyvän elementin ja sen lähteen (ohjaus.md:n otto, roolit.json, "
                  "kuvasäännöt kohta 8). Elementti, jolle ei löydy lähdettä tai joka ei vastaa soivaa musiikkia, on bugi "
                  "(\"jämä\"). Sarake 'tyyli': onko still tyyliohjeen mukainen kuva (yksi pääosa, lukusuunta, ei sekavaa mustetta).\n\n"
                  "| otto | aika | stillit | elementit ja lähde | irralliset / jämät | tyyli | tila |\n|---|---|---|---|---|---|---|")
        os.makedirs(os.path.join(a.out, 'otot'), exist_ok=True)
        end_default = shots[-1][0] + 10 if shots else 0
        for i, (t, name) in enumerate(shots):
            t_end = shots[i + 1][0] if i + 1 < len(shots) else (a.end if a.end else end_default)
            if a.end and t >= a.end: break
            if t_end <= a.start: continue
            ta, tb = t + (t_end - t) / 3, t + 2 * (t_end - t) / 3
            safe = re.sub(r'[^0-9A-Za-zåäöÅÄÖ._-]+', '_', name)[:60]
            fn = f"otot/{i:03d}_{t:.1f}_{safe}.png"
            still_pair(a.ffmpeg, a.video, ta - a.start, tb - a.start, 800, os.path.join(a.out, fn))
            md.append(f"| {i} | {t:.1f}–{t_end:.1f} s | `{fn}` ({ta:.1f} / {tb:.1f} s) | {name} |  |  |  |")
        print(f"otot: {len(shots)}")

    # 3. liikkeet
    if a.liikkeet:
        import liikekayra as LK
        import numpy as np
        L = json.load(open(a.liikkeet, encoding='utf-8'))
        md.append("\n## 3. Liikkeet: yksi musiikillinen tapahtuma = yksi kaari\n\nJokaisesta nimetystä liikkeestä liikekäyrä "
                  "(`analysis/liikekayra.py`) ja 4 fps ruutusarja. 'odotus' kertoo, montako liikettä saa olla (1 = yksi kaari; "
                  "'iskuittain' = yksi liike per isku). Enemmän = nykii (bugi), ellei tarkistaja löydä ruuduista musiikillista syytä.\n\n"
                  "| # | liike | aika | mode | mitattu: liikkuvia jaksoja / pysähdyksiä / suunnanvaihtoja | odotus | käyrä | ruudut | tila |\n|---|---|---|---|---|---|---|---|---|")
        os.makedirs(os.path.join(a.out, 'liikkeet'), exist_ok=True)
        for it in L:
            t0, t1 = float(it['t0']), float(it['t1'])
            crop = tuple(int(v) for v in it.get('crop', '0,0,1920,1080').split(','))
            mode = it.get('mode', 'luma'); thr = float(it.get('thr', 140))
            fps = 10.0
            try:
                fr = LK.read_frames(a.video, t0 - a.start, t1 - a.start, fps, crop, a.ffmpeg)
                x = LK.measure(fr, mode, thr)
                t = t0 + np.arange(len(x)) / fps
                ok = ~np.isnan(x)
                if ok.sum() < 5:
                    res = 'ei mitattavaa'; nmov = nstop = nrev = -1
                else:
                    xi = np.interp(t, t[ok], x[ok])
                    k = 3
                    xs = np.convolve(xi, np.ones(k) / k, mode='same')
                    rng = float(np.nanmax(xs) - np.nanmin(xs)) or 1.0
                    v = np.gradient(xs, 1 / fps) / rng
                    segs = LK.segments(t, v, float(it.get('vmin', 0.03)))
                    merged = []
                    for s in segs:
                        if merged and (s[2] - s[1]) < 0.4 and merged[-1][0] != s[0]:
                            merged[-1] = (merged[-1][0], merged[-1][1], s[2]); continue
                        if merged and merged[-1][0] == s[0]:
                            merged[-1] = (merged[-1][0], merged[-1][1], s[2]); continue
                        merged.append(s)
                    moving = [s for s in merged if s[0] != 0]
                    nmov = len(moving)
                    nstop = sum(1 for s in merged[1:-1] if s[0] == 0)
                    nrev = sum(1 for j in range(1, len(moving)) if moving[j][0] != moving[j - 1][0])
                    names = {1: 'nousee', -1: 'laskee', 0: 'paikallaan'}
                    res = '; '.join(f"{s[1]:.1f}–{s[2]:.1f} {names[s[0]]}" for s in merged)
                    import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
                    fig, ax = plt.subplots(2, 1, figsize=(9, 4.2), sharex=True)
                    ax[0].plot(t, xi, lw=0.6, color='0.6'); ax[0].plot(t, xs, lw=1.4, color='k'); ax[0].set_ylabel(mode)
                    ax[1].plot(t, v, lw=1.0, color='k'); ax[1].axhline(float(it.get('vmin', 0.03)), color='r', lw=0.5); ax[1].axhline(-float(it.get('vmin', 0.03)), color='r', lw=0.5)
                    ax[1].set_ylabel('nopeus/laajuus 1/s'); ax[1].set_xlabel('s')
                    for s in merged:
                        if s[0] == 0: ax[0].axvspan(s[1], s[2], color='orange', alpha=0.25)
                    fig.suptitle(f"{it['id']}: {it.get('otsikko','')} — liikkuvia jaksoja {nmov}")
                    fig.tight_layout(); fig.savefig(os.path.join(a.out, 'liikkeet', f"{it['id']}_kayra.png"), dpi=100); plt.close(fig)
            except Exception as e:   # mittaus ei saa kaataa porttia
                res = f'virhe: {e}'; nmov = nstop = nrev = -1
            n = int(math.ceil(4 * (t1 - t0)))
            cols = min(8, n)
            fnr = f"liikkeet/{it['id']}_ruudut.png"
            tile(a.ffmpeg, a.video, t0 - a.start, t1 - t0, 4, 320, cols, int(math.ceil(n / cols)), os.path.join(a.out, fnr), t0)
            print(f"{it['id']:14s} {t0:7.1f}-{t1:7.1f} s  {mode:6s} liikkeitä {nmov}  pysähdyksiä {nstop}  suunnanvaihtoja {nrev}")
            md.append(f"| {it['id']} | {it.get('otsikko','')} | {t0}–{t1} s | {mode} {crop} | **{nmov}** / {nstop} / {nrev}: {res} | {it.get('odotus','1')} | `liikkeet/{it['id']}_kayra.png` | `{fnr}` |  |")

    with open(os.path.join(a.out, 'index.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(md) + '\n')
    print('index:', os.path.join(a.out, 'index.md'))


if __name__ == '__main__':
    main()
