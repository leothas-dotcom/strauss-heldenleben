#!/usr/bin/env bash
# v8:n jälkitarkistukset uudelleen 10.11.2026, kun osa 162,3-202,9 s (ruudut 4870-6086) renderöitiin uudelleen
# (putouksen vaahdon pehmeä nousu, loc_storm.js) ja liitettiin avainruuduista: videotarkistus, jatkuvuus,
# kontaktiarkki, stillit, WhatsApp-kopio ja 2160p-master. Käynnistys: bash runs/muste-1230/final8b_chain.sh
cd /f/code/heldenleben-video || exit 1
R=runs/muste-1230
OUT=$R/renders/heldenleben_muste_A_v8.mp4
LOG=$R/final8b_chain.log
echo "alkaa $(date)" > "$LOG"
.venv/Scripts/python.exe -I analysis/videotarkistus.py "$OUT" > $R/release2/videotarkistus_v8.txt 2>&1
.venv/Scripts/python.exe -I analysis/jatkuvuus.py "$OUT" --start 0 --json $R/release2/jatkuvuus_v8.json > $R/release2/jatkuvuus_v8.txt 2>&1
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf "fps=1/5,scale=270:-1,tile=8x32" $R/renders/heldenleben_muste_A_v8_kontakti.jpg >> "$LOG" 2>&1
for T in 186.6 189.2 191.4 193.4 195.7 196.2; do
  "${FFMPEG:-ffmpeg}" -v error -y -ss $T -i "$OUT" -frames:v 1 $R/release2/stillit_v8/t$T.png >> "$LOG" 2>&1
done
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf scale=-2:720 -c:v libx264 -preset slow -crf 26 -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 128k -movflags +faststart $R/renders/heldenleben_muste_A_v8_whatsapp.mp4 >> "$LOG" 2>&1
echo "tarkistukset valmiit $(date)" >> "$LOG"
bash runs/muste-1230/master8.sh
echo "valmis $(date)" >> "$LOG"
