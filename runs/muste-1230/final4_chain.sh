#!/usr/bin/env bash
# Kierros 4 (1.11.2026): koko A-puolen renderi v4: E1 huipun pilvet ja A15 sädekehä, E2 alun aurinko, A14 kumppani ihmisenä, D8 puu, jämät (D10), olennot.
# glissandot partituurista). Renderi -> videotarkistus -> jatkuvuus -> kontaktiarkki -> WhatsApp (720p, <= 170 Mt).
# Käynnistys Git Bashissa:  bash /f/code/heldenleben-video/runs/muste-1230/final4_chain.sh
cd /f/code/heldenleben-video || exit 1
R=runs/muste-1230
OUT=$R/renders/heldenleben_muste_A_v4.mp4
LOG=$R/final4_chain.log
echo "odotus alkaa $(date)" > "$LOG"
while grep -qi "käynnissä" $R/pyynnot.md 2>/dev/null; do sleep 60; done
echo "- ohjaaja: KOKO A-puolen renderi v4 käynnissä $(date) (final4_chain.sh)" >> $R/pyynnot.md
echo "renderi alkaa $(date)" >> "$LOG"
node render/render.mjs --page visual/muste/index.html --data build/demo400 --out "$OUT" --workers 2 --fade-out 3.5 >> "$LOG" 2>&1
echo "renderi loppui $(date) exit $?" >> "$LOG"
sed -i '/final4_chain.sh/d' $R/pyynnot.md
.venv/Scripts/python.exe -I analysis/videotarkistus.py "$OUT" > $R/videotarkistus_v4.txt 2>&1
.venv/Scripts/python.exe -I analysis/jatkuvuus.py "$OUT" --start 0 --json $R/jatkuvuus_v4.json > $R/jatkuvuus_v4.txt 2>&1
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf "fps=1/5,scale=270:-1,tile=8x31" $R/renders/heldenleben_muste_A_v4_kontakti.jpg >> "$LOG" 2>&1
# tarkistusstillit korjauskohdista (A13 ja B10/B11)
mkdir -p $R/kierros4/stillit_v4
for T in 231 233 235.5 238 862 923 926 1000 1098 1116 1121 268 300; do
  "${FFMPEG:-ffmpeg}" -v error -y -ss $T -i "$OUT" -frames:v 1 $R/kierros4/stillit_v4/t$T.png >> "$LOG" 2>&1
done
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf scale=-2:720 -c:v libx264 -preset slow -crf 26 -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 128k -movflags +faststart $R/renders/heldenleben_muste_A_v4_whatsapp.mp4 >> "$LOG" 2>&1
echo "valmis $(date)" >> "$LOG"
ls -la $R/renders/ >> "$LOG"
