#!/bin/bash
# usage: with_turn.sh <komento...>   Vuoro pyynnot.mdhen: odottaa, jos joku muu ajo käynnissä.
cd /f/code/heldenleben-video
LINE="- osa 2: still/renderi käynnissä (31.10.2026)"
for i in $(seq 1 120); do
  if grep -v "osa 2:" runs/muste-1230/pyynnot.md | sed -n '/## Vuoro/,/## Pyynn/p' | grep -q "käynnissä"; then sleep 60; else break; fi
done
python - <<'PY'
p='runs/muste-1230/pyynnot.md'
s=open(p,encoding='utf8').read()
l="- osa 2: still/renderi käynnissä (31.10.2026)\n"
if l not in s: s=s.replace("## Vuoro (vain yksi renderi tai still-ajo kerrallaan koko koneella)\n","## Vuoro (vain yksi renderi tai still-ajo kerrallaan koko koneella)\n"+l,1)
open(p,'w',encoding='utf8').write(s)
PY
"$@"
rc=$?
python - <<'PY'
p='runs/muste-1230/pyynnot.md'
s=open(p,encoding='utf8').read()
s=s.replace("- osa 2: still/renderi käynnissä (31.10.2026)\n","")
open(p,'w',encoding='utf8').write(s)
PY
exit $rc
