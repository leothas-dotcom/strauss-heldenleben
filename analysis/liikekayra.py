#!/usr/bin/env python3
"""Liikekäyrä: onko nimetty liike yksi kaari vai monta?

Mittaa videosta rajatulta alueelta yhden luvun ruutu ruudulta ja kertoo, montako kertaa liike
pysähtyy tai kääntyy. Kuvasäännön mukaan yksi musiikillinen tapahtuma on yksi liike: nousu, joka
pysähtyy ja jatkuu, lukee nykimisenä (käyttäjä 1.11.2026: "pilvet avautuvat kolmesti").

Mitattavat suureet (--mode):
  luma      alueen keskikirkkaus (0..255): valon avautuminen, sillan välke, paperin kuivuminen
  cover     niiden pikselien osuus, jotka ovat kynnystä kirkkaampia (--thr): pilvien/usvan avautuminen
  red-y     punaisten pikselien (sinooperi) painopisteen y alueella (ylöspäin kasvava, 0..1): aurinko, viirit
  red-x     sama x-suunnassa
  dark-y    tummien pikselien painopisteen y: vuoren/kerroksen liike

Tulos: aikasarja, nopeus, ja liikkeen jaksot (nousee / laskee / paikallaan). Kynnys --vmin kertoo,
mikä nopeus lasketaan paikallaanoloksi (suhteessa koko liikkeen laajuuteen sekunnissa).
Kirjoittaa --png:llä kuvaajan. Palauttaa 0, jos liike on yksi kaari (yksi liikkuva jakso), muuten 1.

Esim.  python -I analysis/liikekayra.py video.mp4 --start 28 --end 46 --crop 0,0,1920,560 --mode red-y --png kuvaaja.png
"""
import argparse, os, subprocess, sys
import numpy as np


def read_frames(video, start, end, fps, crop, ffmpeg):
    x, y, w, h = crop
    vf = f"fps={fps},crop={w}:{h}:{x}:{y}"
    cmd = [ffmpeg, '-v', 'error', '-ss', f'{start:.3f}', '-t', f'{end - start:.3f}', '-i', video,
           '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    raw = subprocess.run(cmd, stdout=subprocess.PIPE, check=True).stdout
    n = len(raw) // (w * h * 3)
    return np.frombuffer(raw[: n * w * h * 3], dtype=np.uint8).reshape(n, h, w, 3)


def measure(fr, mode, thr):
    f = fr.astype(np.int16)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    if mode == 'luma':
        return (0.299 * r + 0.587 * g + 0.114 * b).mean(axis=(1, 2))
    if mode == 'cover':
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        return (lum > thr).mean(axis=(1, 2))
    if mode in ('red-y', 'red-x'):
        m = (r > 150) & (g < 120) & (b < 100) & (r - g > 60)
    elif mode == 'dark-y':
        m = (0.299 * r + 0.587 * g + 0.114 * b) < thr
    else:
        raise SystemExit(f'tuntematon mode {mode}')
    h, w = m.shape[1:]
    ys = np.arange(h)[None, :, None]
    xs = np.arange(w)[None, None, :]
    cnt = m.sum(axis=(1, 2)).astype(float)
    out = np.full(len(m), np.nan)
    ok = cnt > 20
    if mode.endswith('-y'):
        out[ok] = 1 - (m * ys).sum(axis=(1, 2))[ok] / cnt[ok] / h   # 1 = ylhäällä
    else:
        out[ok] = (m * xs).sum(axis=(1, 2))[ok] / cnt[ok] / w
    return out


def segments(t, v, vmin):
    """Jaksot: +1 nousee, -1 laskee, 0 paikallaan. v = nopeus suhteessa liikkeen laajuuteen (1/s)."""
    state = np.where(v > vmin, 1, np.where(v < -vmin, -1, 0))
    segs = []
    i = 0
    while i < len(state):
        j = i
        while j + 1 < len(state) and state[j + 1] == state[i]:
            j += 1
        segs.append((state[i], t[i], t[j]))
        i = j + 1
    return segs


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('video')
    ap.add_argument('--start', type=float, required=True)
    ap.add_argument('--end', type=float, required=True)
    ap.add_argument('--crop', default='0,0,1920,1080', help='x,y,w,h')
    ap.add_argument('--mode', default='luma', choices=['luma', 'cover', 'red-y', 'red-x', 'dark-y'])
    ap.add_argument('--thr', type=float, default=140)
    ap.add_argument('--fps', type=float, default=10)
    ap.add_argument('--smooth', type=float, default=0.3, help='liukuva keskiarvo sekunteina ennen nopeutta')
    ap.add_argument('--vmin', type=float, default=0.03, help='paikallaan, jos |nopeus| < vmin * laajuus / s')
    ap.add_argument('--minseg', type=float, default=0.4, help='lyhyemmät jaksot sulautetaan naapuriin (s)')
    ap.add_argument('--png')
    ap.add_argument('--ffmpeg', default=os.environ.get('FFMPEG', 'ffmpeg'))
    a = ap.parse_args()
    crop = tuple(int(v) for v in a.crop.split(','))
    fr = read_frames(a.video, a.start, a.end, a.fps, crop, a.ffmpeg)
    x = measure(fr, a.mode, a.thr)
    t = a.start + np.arange(len(x)) / a.fps
    ok = ~np.isnan(x)
    if ok.sum() < 5:
        print('liian vähän mitattavaa (esim. ei punaista alueella)'); return 2
    xi = np.interp(t, t[ok], x[ok])
    k = max(1, int(round(a.smooth * a.fps)))
    xs = np.convolve(xi, np.ones(k) / k, mode='same')
    rng = float(np.nanmax(xs) - np.nanmin(xs)) or 1.0
    v = np.gradient(xs, 1 / a.fps) / rng        # osuus laajuudesta sekunnissa
    segs = segments(t, v, a.vmin)
    # sulauta lyhyet jaksot
    merged = []
    for s in segs:
        if merged and (s[2] - s[1]) < a.minseg and merged[-1][0] != s[0]:
            # lyhyt jakso: liitä edelliseen
            merged[-1] = (merged[-1][0], merged[-1][1], s[2]); continue
        if merged and merged[-1][0] == s[0]:
            merged[-1] = (merged[-1][0], merged[-1][1], s[2]); continue
        merged.append(s)
    moving = [s for s in merged if s[0] != 0]
    names = {1: 'nousee', -1: 'laskee', 0: 'paikallaan'}
    print(f'{os.path.basename(a.video)}  {a.start:.1f}-{a.end:.1f} s  mode={a.mode} crop={a.crop}  laajuus={rng:.3f}')
    print(f'arvo (1 s välein): ' + ' '.join(f'{xs[i]:.3f}' for i in range(0, len(xs), int(a.fps))))
    print('jaksot:')
    for st, t0, t1 in merged:
        print(f'  {t0:7.2f}-{t1:7.2f} s  {names[st]:10s}  ({t1 - t0:.1f} s)')
    nrev = sum(1 for i in range(1, len(moving)) if moving[i][0] != moving[i - 1][0])
    print(f'liikkuvia jaksoja {len(moving)}, suunnanvaihtoja {nrev}, pysähdyksiä liikkeen sisällä '
          f'{max(0, sum(1 for s in merged[1:-1] if s[0] == 0))}')
    if a.png:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots(2, 1, figsize=(10, 5), sharex=True)
        ax[0].plot(t, xi, lw=0.6, color='0.6'); ax[0].plot(t, xs, lw=1.4, color='k'); ax[0].set_ylabel(a.mode)
        ax[1].plot(t, v, lw=1.0, color='k'); ax[1].axhline(a.vmin, color='r', lw=0.5); ax[1].axhline(-a.vmin, color='r', lw=0.5)
        ax[1].set_ylabel('nopeus / laajuus (1/s)'); ax[1].set_xlabel('s')
        for st, t0, t1 in merged:
            if st == 0: ax[0].axvspan(t0, t1, color='orange', alpha=0.25)
        fig.suptitle(f'{a.mode} {a.start}-{a.end} s: liikkuvia jaksoja {len(moving)}')
        fig.tight_layout(); fig.savefig(a.png, dpi=110)
        print('kuvaaja', a.png)
    verdict = 'YKSI KAARI' if len(moving) <= 1 else f'EI YKSI KAARI ({len(moving)} liikettä)'
    print('tulos:', verdict)
    return 0 if len(moving) <= 1 else 1


if __name__ == '__main__':
    sys.exit(main())
