#!/usr/bin/env bash
# Julkaisu 2.0 (9.11.2026): koko A-puolen renderi v7 = v6:n kuva nopeuskorjatulla lähteellä (k = 0,98598,
# audio/lahde.json): paketit, teemakartta, cues ja kuuntelukopio korjatussa ajassa, puolen loppu 1258 s.
# Renderi -> videotarkistus -> jatkuvuus -> kontaktiarkki -> WhatsApp (720p).
# Käynnistys Git Bashissa:  bash /f/code/heldenleben-video/runs/muste-1230/final7_chain.sh
cd /f/code/heldenleben-video || exit 1
R=runs/muste-1230
OUT=$R/renders/heldenleben_muste_A_v7.mp4
LOG=$R/final7_chain.log
echo "odotus alkaa $(date)" > "$LOG"
while grep -qi "käynnissä" $R/pyynnot.md 2>/dev/null; do sleep 60; done
echo "- ohjaaja: KOKO A-puolen renderi v7 (nopeuskorjattu lähde) käynnissä $(date) (final7_chain.sh)" >> $R/pyynnot.md
echo "renderi alkaa $(date)" >> "$LOG"
node render/render.mjs --page visual/muste/index.html --data build/demo400 --out "$OUT" --workers 2 --fade-out 3.5 >> "$LOG" 2>&1
echo "renderi loppui $(date) exit $?" >> "$LOG"
sed -i '/final7_chain.sh/d' $R/pyynnot.md
.venv/Scripts/python.exe -I analysis/videotarkistus.py "$OUT" > $R/release2/videotarkistus_v7.txt 2>&1
.venv/Scripts/python.exe -I analysis/jatkuvuus.py "$OUT" --start 0 --json $R/release2/jatkuvuus_v7.json > $R/release2/jatkuvuus_v7.txt 2>&1
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf "fps=1/5,scale=270:-1,tile=8x32" $R/renders/heldenleben_muste_A_v7_kontakti.jpg >> "$LOG" 2>&1
mkdir -p $R/release2/stillit_v7
# samat tarkistuskohdat kuin v6, korjatussa ajassa (t / k)
for T in 234.3 238.9 250.5 259.6 269.8 279.9 284 304.3 377.3 385.4 874.3 936.2 1014.2 1113.6 1131.9; do
  "${FFMPEG:-ffmpeg}" -v error -y -ss $T -i "$OUT" -frames:v 1 $R/release2/stillit_v7/t$T.png >> "$LOG" 2>&1
done
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf scale=-2:720 -c:v libx264 -preset slow -crf 26 -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 128k -movflags +faststart $R/renders/heldenleben_muste_A_v7_whatsapp.mp4 >> "$LOG" 2>&1
echo "valmis $(date)" >> "$LOG"
ls -la $R/renders/ >> "$LOG"
