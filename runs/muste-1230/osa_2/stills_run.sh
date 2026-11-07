#!/bin/bash
# usage: stills_run.sh dir t1,t2,...   (vuororivi pyynnot.mdhen; odottaa jos toinen ajo käynnissä)
cd /f/code/heldenleben-video
for i in $(seq 1 60); do
  if grep -q "käynnissä" runs/muste-1230/pyynnot.md && ! grep -q "osa 2: still/renderi käynnissä" runs/muste-1230/pyynnot.md; then sleep 60; else break; fi
done
python - <<'PY'
p='runs/muste-1230/pyynnot.md'
s=open(p,encoding='utf8').read()
l="- osa 2: still/renderi käynnissä (31.10.2026)\n"
if l not in s: s=s.replace("## Vuoro (vain yksi renderi tai still-ajo kerrallaan koko koneella)\n","## Vuoro (vain yksi renderi tai still-ajo kerrallaan koko koneella)\n"+l,1)
open(p,'w',encoding='utf8').write(s)
PY
node render/render.mjs --page visual/muste/index.html --data build/demo400 --stills $2 --workers 2 --dir runs/muste-1230/osa_2/$1 --debug ${3:-0} 2>&1 | grep -v "^still" | tail -8
python - <<'PY'
p='runs/muste-1230/pyynnot.md'
s=open(p,encoding='utf8').read()
s=s.replace("- osa 2: still/renderi käynnissä (31.10.2026)\n","")
open(p,'w',encoding='utf8').write(s)
PY
