#!/bin/bash
cd /f/code/heldenleben-video
O=runs/muste-1230/osa_2
bash $O/with_turn.sh node render/render.mjs --page visual/muste/index.html --data build/demo400 --start 243 --end 422 --workers 2 --out $O/renders/osa2_v2.mp4 > $O/render2.log 2>&1
.venv/Scripts/python.exe -I analysis/jatkuvuus.py $O/renders/osa2_v2.mp4 --start 243 --json $O/jatkuvuus2.json > $O/jatkuvuus2.txt 2>&1
.venv/Scripts/python.exe -I analysis/videotarkistus.py $O/renders/osa2_v2.mp4 --start 243 > $O/videotarkistus2.txt 2>&1
bash $O/with_turn.sh node render/render.mjs --page visual/muste/index.html --data build/demo400 --stills 244.5,245.5,247 --workers 2 --dir $O/stills2 --debug 0 > $O/stills2b.log 2>&1
echo VALMIS > $O/tmp/ketju2.done
