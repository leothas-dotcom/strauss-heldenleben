#!/usr/bin/env python3
"""Tekstitykset: selittävät tekstit videolle teemakartan ankkureista.

Tekstien ajat eivät ole tekstitiedostossa sekunteina: jokainen teksti nimeää ankkurin
(annotations/teemat.json, events[].id), ja aika lasketaan siitä, kuten kohtauksissa S.A(id).
Pitkissä jaksoissa ilman ankkuria aika on osuus kahden ankkurin välillä ("b", "osuus").

    python -I analysis/tekstitys.py --lahde runs/muste-1230/tekstitykset/tekstit.json \
        --video runs/muste-1230/renders/heldenleben_muste_A_v6.mp4 --out runs/muste-1230/tekstitykset

Säännöt, jotka tarkistetaan (rikkeet pysäyttävät):
  - enintään kaksi riviä, rivi enintään 42 merkkiä (japani 21 täysleveää)
  - lukunopeus: latinalaiset 15 merkkiä/s, japani 6 merkkiä/s; sama ajoitus kaikilla kielillä
    (kesto tulee hitaimmin luettavasta kielestä)
  - ei tekstiä yleistauon aikana (tyyliohje 13.7: hiljaisuus on tyhjää paperia)
  - teksti ei ajaudu yli 4 s irti ankkuristaan
Tulokset: srt/<nimi>.<kieli>.srt ja tekstitys.md (tarkistustaulukko).
--esikatselu <kieli> tekee kontaktiarkit, joissa teksti on ruudun päällä (vain tarkistukseen:
tekstejä ei polteta videoon, kuvasääntö 27).
"""
import argparse, io, json, math, os, subprocess, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ETU = 0.3        # teksti tulee hieman ennen ääntä (kuva ennakoi, tyyliohje 13.11)
ENNAKKO = 1.5    # "ennakko": katsoja ehtii lukea ennen tapahtumaa
VALI = 0.2       # väli peräkkäisten tekstien välillä
KESTO_MIN, KESTO_MAX = 2.2, 7.5
CPS = {'ja': 6.0}
CPS_MUU = 15.0
RIVI = 42        # leveysyksikköä; täysleveä merkki = 2
AJAUTUMA_MAX = 4.0


def leveys(s):
    return sum(2 if unicodedata.east_asian_width(c) in 'WF' else 1 for c in s)


def rivita(teksti):
    """Yksi tai kaksi riviä, tasapainotettuna. Rivinvaihto tekstissä pidetään."""
    if '\n' in teksti:
        return teksti.split('\n')
    if leveys(teksti) <= 40:
        return [teksti]
    sanat = teksti.split(' ')
    paras, paras_h = None, 1e9
    for i in range(1, len(sanat)):
        a, b = ' '.join(sanat[:i]), ' '.join(sanat[i:])
        h = abs(leveys(a) - leveys(b))
        if a[-1] in '.:;,?!':
            h -= 12          # katkaise mieluummin lauseen rajasta
        if len(sanat[i - 1]) <= 2:
            h += 8           # ei lyhyttä sanaa rivin loppuun
        if max(leveys(a), leveys(b)) > RIVI:
            h += 1000
        if h < paras_h:
            paras, paras_h = [a, b], h
    return paras or [teksti]


def srt_aika(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def mmss(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--lahde', required=True)
    ap.add_argument('--video', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--esikatselu')
    ap.add_argument('--ffmpeg', default=os.environ.get('FFMPEG', 'ffmpeg'))
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding='utf-8')
    L = json.load(io.open(a.lahde, encoding='utf-8'))
    kartta = json.load(io.open(os.path.join(ROOT, 'annotations', 'teemat.json'), encoding='utf-8'))
    A = {e['id']: float(e['t']) for e in kartta['events'] if e.get('side') == 1}
    p = subprocess.run([a.ffmpeg.replace('ffmpeg', 'ffprobe'), '-v', 'error', '-show_entries', 'format=duration',
                        '-of', 'csv=p=0', a.video], capture_output=True, text=True)
    loppu = float(p.stdout.strip())
    A['alku'], A['loppu'] = 0.0, loppu
    hilj0, hilj1 = A[L['hiljaisuus'][0]], A[L['hiljaisuus'][1]]

    # käännökset: kaannokset/<kieli>.json = {id: teksti}
    kielet = list(L['kielet'])
    kd = os.path.join(os.path.dirname(a.lahde), 'kaannokset')
    kaannos = {}
    for k in kielet:
        f = os.path.join(kd, k + '.json')
        if os.path.exists(f):
            kaannos[k] = json.load(io.open(f, encoding='utf-8'))
    virheet = []
    cues = []
    for c in L['tekstit']:
        if c['a'] not in A or ('b' in c and c['b'] not in A):
            virheet.append(f"{c['id']}: tuntematon ankkuri {c['a']} / {c.get('b')}")
            continue
        t = A[c['a']] + c.get('osuus', 0.0) * (A[c['b']] - A[c['a']]) if 'b' in c else A[c['a']]
        tekstit = {'fi': c['fi'], 'en': c['en']}
        for k, d in kaannos.items():
            if c['id'] in d:
                tekstit[k] = d[c['id']]
            else:
                virheet.append(f"{c['id']}: käännös puuttuu ({k})")
        cues.append({**c, 'ank': t, 'tekstit': tekstit})
    cues.sort(key=lambda c: c['ank'])

    # ajoitus: yhteinen kaikille kielille
    edellinen = 0.0
    for i, c in enumerate(cues):
        tarve = max(len(s.replace('\n', '')) / CPS.get(k, CPS_MUU) for k, s in c['tekstit'].items())
        kesto = min(KESTO_MAX, max(KESTO_MIN, tarve))
        alku = c['ank'] - (ENNAKKO if c.get('ennakko') else ETU)
        alku = max(alku, edellinen + VALI, 0.3)
        if hilj0 - 0.5 < alku < hilj1:
            alku = hilj1
        loppu_t = alku + kesto
        if alku < hilj0 < loppu_t:
            loppu_t = hilj0 - 0.1
        if loppu_t > loppu:
            loppu_t = loppu - 0.1
        c['alku'], c['loppu'], c['tarve'] = alku, loppu_t, tarve
        edellinen = loppu_t
        if alku - c['ank'] > AJAUTUMA_MAX:
            virheet.append(f"{c['id']}: {alku - c['ank']:.1f} s myöhässä ankkurista {c['a']}")
        if loppu_t - alku < tarve - 0.01 and tarve <= KESTO_MAX:
            virheet.append(f"{c['id']}: liian nopea ({loppu_t - alku:.1f} s, tarve {tarve:.1f} s)")
        if tarve > KESTO_MAX:
            virheet.append(f"{c['id']}: liian pitkä teksti (tarve {tarve:.1f} s)")
        for k, s in c['tekstit'].items():
            rivit = rivita(s)
            if len(rivit) > 2 or max(leveys(r) for r in rivit) > RIVI:
                virheet.append(f"{c['id']} [{k}]: rivit {[leveys(r) for r in rivit]}: {s}")

    os.makedirs(os.path.join(a.out, 'srt'), exist_ok=True)
    for k in sorted({k for c in cues for k in c['tekstit']}):
        with io.open(os.path.join(a.out, 'srt', f"{L['nimi']}.{k}.srt"), 'w', encoding='utf-8', newline='\n') as f:
            for i, c in enumerate(cues, 1):
                f.write(f"{i}\n{srt_aika(c['alku'])} --> {srt_aika(c['loppu'])}\n" + '\n'.join(rivita(c['tekstit'][k])) + '\n\n')

    peitto = sum(c['loppu'] - c['alku'] for c in cues)
    with io.open(os.path.join(a.out, 'tekstitys.md'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(f"# Tekstitykset: tarkistustaulukko\n\nGeneroitu: `analysis/tekstitys.py`. {len(cues)} tekstiä, "
                f"ruudulla {peitto:.0f} s / {loppu:.0f} s ({100 * peitto / loppu:.0f} %). Korjaukset tiedostoon `tekstit.json`.\n\n"
                "| # | Aika | Ankkuri | Suomi | English | Lähde |\n|---|---|---|---|---|---|\n")
        for i, c in enumerate(cues, 1):
            f.write(f"| {i} | {mmss(c['alku'])} | `{c['a']}` | {c['fi']} | {c['en']} | {c['lahde']} |\n")
    print(f"{len(cues)} tekstiä, ruudulla {peitto:.0f} s / {loppu:.0f} s ({100 * peitto / loppu:.0f} %), kielet {sorted(cues[0]['tekstit'])}")
    aukot = sorted(((cues[i + 1]['alku'] - cues[i]['loppu'], cues[i]['loppu']) for i in range(len(cues) - 1)), reverse=True)[:5]
    print('pisimmät tauot:', ', '.join(f"{g:.0f} s ({mmss(t)})" for g, t in aukot))
    for v in virheet:
        print('RIKE', v)

    if a.esikatselu:
        esikatselu(cues, a.esikatselu, a.video, a.ffmpeg, os.path.join(a.out, 'tyo'))
    return 1 if virheet else 0


def esikatselu(cues, kieli, video, ffmpeg, out):
    from PIL import Image, ImageDraw, ImageFont
    os.makedirs(out, exist_ok=True)
    W, H, SARAKE, RIVEJA = 640, 360, 4, 5
    fontti = ImageFont.truetype('C:/Windows/Fonts/YuGothM.ttc' if kieli == 'ja' else 'C:/Windows/Fonts/arial.ttf', 15)
    pieni = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 12)
    kuvat = []
    for i, c in enumerate(cues, 1):
        t = 0.5 * (c['alku'] + c['loppu'])
        raw = subprocess.run([ffmpeg, '-v', 'error', '-ss', f'{t:.2f}', '-i', video, '-frames:v', '1', '-vf', f'scale={W}:{H}',
                              '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
        im = Image.frombytes('RGB', (W, H), raw[:W * H * 3])
        d = ImageDraw.Draw(im, 'RGBA')
        rivit = rivita(c['tekstit'][kieli])
        y = H - 12 - 20 * len(rivit)
        for r in rivit:
            w = d.textlength(r, font=fontti)
            d.rectangle([(W - w) / 2 - 5, y - 1, (W + w) / 2 + 5, y + 19], fill=(8, 8, 8, 190))
            d.text(((W - w) / 2, y), r, font=fontti, fill=(255, 255, 255, 255))
            y += 20
        d.text((5, 4), f"{i} {mmss(c['alku'])}", font=pieni, fill=(255, 255, 0, 255))
        kuvat.append(im)
    n = SARAKE * RIVEJA
    for s in range(math.ceil(len(kuvat) / n)):
        arkki = Image.new('RGB', (W * SARAKE, H * RIVEJA))
        for j, im in enumerate(kuvat[s * n:(s + 1) * n]):
            arkki.paste(im, ((j % SARAKE) * W, (j // SARAKE) * H))
        arkki.save(os.path.join(out, f'esikatselu_{kieli}_{s + 1}.jpg'), quality=85)
    print('esikatselu:', out)


if __name__ == '__main__':
    sys.exit(main())
