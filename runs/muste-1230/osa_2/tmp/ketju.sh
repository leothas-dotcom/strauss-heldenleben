#!/bin/bash
cd /f/code/heldenleben-video
O=runs/muste-1230/osa_2
bash $O/with_turn.sh node render/render.mjs --page visual/muste/index.html --data build/demo400 --start 243 --end 422 --workers 2 --out $O/renders/osa2_v2.mp4 > $O/render2.log 2>&1
.venv/Scripts/python.exe -I analysis/jatkuvuus.py $O/renders/osa2_v2.mp4 --start 243 --json $O/jatkuvuus2.json > $O/jatkuvuus2.txt 2>&1
.venv/Scripts/python.exe -I analysis/videotarkistus.py $O/renders/osa2_v2.mp4 --start 243 > $O/videotarkistus2.txt 2>&1
bash $O/with_turn.sh node $O/../perusta3/poseskan.mjs 243 422 > $O/poseskan_jalkeen.txt 2>&1
bash $O/with_turn.sh bash -c "node render/camcheck.mjs --page visual/muste/index.html --data build/demo400 --max 20 > $O/camcheck2.txt 2>&1; node render/kohtauscheck.mjs --page visual/muste/index.html --data build/demo400 --step 15 --from 236 --to 424 > $O/kohtauscheck2.txt 2>&1"
bash $O/with_turn.sh node $O/tmp/tipscan.mjs 243 422 > $O/tipscan2.txt 2>&1
rm -f $O/stills2/*.png
bash $O/stills_run.sh stills2 "$(cat $O/tmp/times.txt)" > $O/stills2.log 2>&1
echo VALMIS > $O/tmp/ketju.done
