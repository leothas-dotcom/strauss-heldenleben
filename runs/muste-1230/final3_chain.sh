#!/usr/bin/env bash
# Kierros 3 (31.10.2026 ilta): koko A-puolen renderi korjauksista A13 (huippukohdan aurinko: otto 23 ja tablo), B10/B11 (harppu = kuun sillan välke,
# glissandot partituurista). Renderi -> videotarkistus -> jatkuvuus -> kontaktiarkki -> WhatsApp (720p, <= 170 Mt).
# Käynnistys Git Bashissa:  bash /f/code/heldenleben-video/runs/muste-1230/final3_chain.sh
cd /f/code/heldenleben-video || exit 1
R=runs/muste-1230
OUT=$R/renders/heldenleben_muste_A_v3.mp4
LOG=$R/final3_chain.log
echo "odotus alkaa $(date)" > "$LOG"
while grep -qi "käynnissä" $R/pyynnot.md 2>/dev/null; do sleep 60; done
echo "- ohjaaja: KOKO A-puolen renderi v3 käynnissä $(date) (final3_chain.sh)" >> $R/pyynnot.md
echo "renderi alkaa $(date)" >> "$LOG"
node render/render.mjs --page visual/muste/index.html --data build/demo400 --out "$OUT" --workers 2 --fade-out 3.5 >> "$LOG" 2>&1
echo "renderi loppui $(date) exit $?" >> "$LOG"
sed -i '/final3_chain.sh/d' $R/pyynnot.md
.venv/Scripts/python.exe -I analysis/videotarkistus.py "$OUT" > $R/videotarkistus_v3.txt 2>&1
.venv/Scripts/python.exe -I analysis/jatkuvuus.py "$OUT" --start 0 --json $R/jatkuvuus_v3.json > $R/jatkuvuus_v3.txt 2>&1
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf "fps=1/5,scale=270:-1,tile=8x31" $R/renders/heldenleben_muste_A_v3_kontakti.jpg >> "$LOG" 2>&1
# tarkistusstillit korjauskohdista (A13 ja B10/B11)
mkdir -p $R/kierros3/stillit_v3
for T in 230.5 232 233.6 236.5 238.3 805.3 807.6 812.0 814.2; do
  "${FFMPEG:-ffmpeg}" -v error -y -ss $T -i "$OUT" -frames:v 1 $R/kierros3/stillit_v3/t$T.png >> "$LOG" 2>&1
done
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf scale=-2:720 -c:v libx264 -preset slow -crf 26 -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 128k -movflags +faststart $R/renders/heldenleben_muste_A_v3_whatsapp.mp4 >> "$LOG" 2>&1
echo "valmis $(date)" >> "$LOG"
ls -la $R/renders/ >> "$LOG"
