#!/usr/bin/env bash
# Kierros 4c (1.11.2026): koko A-puolen renderi v6: v5 + suon olennot tyyliohjeen kokoihin (ei tukkia), korjauserä (iskut t6-t11, jähmettymä 140,9, unen ja taistelun olennot, käden nosto, yö, nauha, luonnoksen reuna).
# glissandot partituurista). Renderi -> videotarkistus -> jatkuvuus -> kontaktiarkki -> WhatsApp (720p, <= 170 Mt).
# Käynnistys Git Bashissa:  bash /f/code/heldenleben-video/runs/muste-1230/final6_chain.sh
cd /f/code/heldenleben-video || exit 1
R=runs/muste-1230
OUT=$R/renders/heldenleben_muste_A_v6.mp4
LOG=$R/final6_chain.log
echo "odotus alkaa $(date)" > "$LOG"
while grep -qi "käynnissä" $R/pyynnot.md 2>/dev/null; do sleep 60; done
echo "- ohjaaja: KOKO A-puolen renderi v4 käynnissä $(date) (final6_chain.sh)" >> $R/pyynnot.md
echo "renderi alkaa $(date)" >> "$LOG"
node render/render.mjs --page visual/muste/index.html --data build/demo400 --out "$OUT" --workers 2 --fade-out 3.5 >> "$LOG" 2>&1
echo "renderi loppui $(date) exit $?" >> "$LOG"
sed -i '/final6_chain.sh/d' $R/pyynnot.md
.venv/Scripts/python.exe -I analysis/videotarkistus.py "$OUT" > $R/videotarkistus_v6.txt 2>&1
.venv/Scripts/python.exe -I analysis/jatkuvuus.py "$OUT" --start 0 --json $R/jatkuvuus_v6.json > $R/jatkuvuus_v6.txt 2>&1
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf "fps=1/5,scale=270:-1,tile=8x31" $R/renders/heldenleben_muste_A_v6_kontakti.jpg >> "$LOG" 2>&1
# tarkistusstillit korjauskohdista (A13 ja B10/B11)
mkdir -p $R/kierros4/stillit_v6
for T in 231 235.5 247 256 266 276 280 300 372 380 862 923 1000 1098 1116; do
  "${FFMPEG:-ffmpeg}" -v error -y -ss $T -i "$OUT" -frames:v 1 $R/kierros4/stillit_v6/t$T.png >> "$LOG" 2>&1
done
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf scale=-2:720 -c:v libx264 -preset slow -crf 26 -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 128k -movflags +faststart $R/renders/heldenleben_muste_A_v6_whatsapp.mp4 >> "$LOG" 2>&1
echo "valmis $(date)" >> "$LOG"
ls -la $R/renders/ >> "$LOG"
