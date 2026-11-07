#!/bin/bash
cd /f/code/heldenleben-video
python - <<'PY'
p='runs/muste-1230/pyynnot.md'
s=open(p,encoding='utf8').read()
s=s.replace("## Vuoro (vain yksi renderi tai still-ajo kerrallaan koko koneella)\n","## Vuoro (vain yksi renderi tai still-ajo kerrallaan koko koneella)\n- osa 1: osarenderi 0-240 ja stillit käynnissä (kirjoitettu 31.10.2026; poistetaan ajon jälkeen)\n",1)
open(p,'w',encoding='utf8').write(s)
PY
node render/render.mjs --page visual/muste/index.html --data build/demo400 --start 0 --end 240 --workers 2 --out runs/muste-1230/osa_1/renders/osa1_0_240.mp4 > runs/muste-1230/osa_1/render.log 2>&1
rm -rf runs/muste-1230/osa_1/stills
node render/render.mjs --page visual/muste/index.html --data build/demo400 --stills "$(cat runs/muste-1230/osa_1_times.txt),30,48,57,128,132,157,234.5" --workers 2 --dir runs/muste-1230/osa_1/stills --debug 0 > runs/muste-1230/osa_1/stills.log 2>&1
python - <<'PY'
p='runs/muste-1230/pyynnot.md'
s=open(p,encoding='utf8').read()
s=s.replace("- osa 1: osarenderi 0-240 ja stillit käynnissä (kirjoitettu 31.10.2026; poistetaan ajon jälkeen)\n","")
open(p,'w',encoding='utf8').write(s)
PY
.venv/Scripts/python.exe -I analysis/videotarkistus.py runs/muste-1230/osa_1/renders/osa1_0_240.mp4 --start 0 > runs/muste-1230/osa_1/videotarkistus.txt 2>&1
echo VALMIS > runs/muste-1230/osa_1/final.done
