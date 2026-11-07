#!/bin/bash
# usage: stills.sh dir t1,t2,...  (vuororivi pyynnot.mdhen ennen ajoa, pois ajon jälkeen)
cd /f/code/heldenleben-video
python - <<'PY'
p='runs/muste-1230/pyynnot.md'
s=open(p,encoding='utf8').read()
l="- osa 1: still-ajo käynnissä (kirjoitettu 31.10.2026; poistetaan ajon jälkeen)\n"
if l not in s: s=s.replace("## Vuoro (vain yksi renderi tai still-ajo kerrallaan koko koneella)\n","## Vuoro (vain yksi renderi tai still-ajo kerrallaan koko koneella)\n"+l,1)
open(p,'w',encoding='utf8').write(s)
PY
node render/render.mjs --page visual/muste/index.html --data build/demo400 --stills $2 --workers 2 --dir runs/muste-1230/osa_1/$1 --debug ${3:-1} 2>&1 | grep -v "^still" | tail -5
python - <<'PY'
p='runs/muste-1230/pyynnot.md'
s=open(p,encoding='utf8').read()
s=s.replace("- osa 1: still-ajo käynnissä (kirjoitettu 31.10.2026; poistetaan ajon jälkeen)\n","")
open(p,'w',encoding='utf8').write(s)
PY
cd runs/muste-1230/osa_1 && python - <<PY
import glob,subprocess
fs=sorted(glob.glob('$1/t*.png'))
n=len(fs)
a=['ffmpeg','-y','-v','error']
for f in fs: a+=['-i',f]
flt=''.join(f'[{i}:v]scale=640:-1[s{i}];' for i in range(n))+''.join(f'[s{i}]' for i in range(n))+f'xstack=inputs={n}:layout='+'|'.join(f'{(i%3)*640}_{(i//3)*360}' for i in range(n))
subprocess.run(a+['-filter_complex',flt,'sheet_$1.png'],check=True)
print([f[-10:] for f in fs])
PY
