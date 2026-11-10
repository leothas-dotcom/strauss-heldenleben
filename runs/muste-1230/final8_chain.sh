#!/usr/bin/env bash
# Julkaisu 2.0 (10.11.2026): koko A-puolen renderi v8 = v7 + kuvan korjaukset K1-K7 (harput ja patarumpu partituurista, held_reh11/reh12 korjattu).
# audio/lahde.json): paketit, teemakartta, cues ja kuuntelukopio korjatussa ajassa, puolen loppu 1258 s.
# Renderi -> videotarkistus -> jatkuvuus -> kontaktiarkki -> WhatsApp (720p).
# Käynnistys Git Bashissa:  bash /f/code/heldenleben-video/runs/muste-1230/final8_chain.sh
cd /f/code/heldenleben-video || exit 1
R=runs/muste-1230
OUT=$R/renders/heldenleben_muste_A_v8.mp4
LOG=$R/final8_chain.log
echo "odotus alkaa $(date)" > "$LOG"
while grep -qi "käynnissä" $R/pyynnot.md 2>/dev/null; do sleep 60; done
echo "- ohjaaja: KOKO A-puolen renderi v8 (nopeuskorjattu lähde) käynnissä $(date) (final8_chain.sh)" >> $R/pyynnot.md
node render/camcheck.mjs --page visual/muste/index.html --data build/demo400 --max 20 > $R/release2/camcheck_v8.txt 2>&1
node render/nakyvyys.mjs --from 243.4 --to 428 --step 0.5 --page visual/muste/index.html --data build/demo400 --json $R/release2/nakyvyys_v8.json > $R/release2/nakyvyys_v8.txt 2>&1
echo "renderi alkaa $(date)" >> "$LOG"
node render/render.mjs --page visual/muste/index.html --data build/demo400 --out "$OUT" --workers 2 --fade-out 3.5 >> "$LOG" 2>&1
echo "renderi loppui $(date) exit $?" >> "$LOG"
sed -i '/final8_chain.sh/d' $R/pyynnot.md
.venv/Scripts/python.exe -I analysis/videotarkistus.py "$OUT" > $R/release2/videotarkistus_v8.txt 2>&1
.venv/Scripts/python.exe -I analysis/jatkuvuus.py "$OUT" --start 0 --json $R/release2/jatkuvuus_v8.json > $R/release2/jatkuvuus_v8.txt 2>&1
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf "fps=1/5,scale=270:-1,tile=8x32" $R/renders/heldenleben_muste_A_v8_kontakti.jpg >> "$LOG" 2>&1
mkdir -p $R/release2/stillit_v8
# samat tarkistuskohdat kuin v6, korjatussa ajassa (t / k)
for T in 33.1 42.8 49.6 70.2 104.6 107.0 186.6 189.2 193.4 196.2 205.3 213.3 442.0 936.2 1191.9; do
  "${FFMPEG:-ffmpeg}" -v error -y -ss $T -i "$OUT" -frames:v 1 $R/release2/stillit_v8/t$T.png >> "$LOG" 2>&1
done
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf scale=-2:720 -c:v libx264 -preset slow -crf 26 -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 128k -movflags +faststart $R/renders/heldenleben_muste_A_v8_whatsapp.mp4 >> "$LOG" 2>&1
echo "valmis $(date)" >> "$LOG"
ls -la $R/renders/ >> "$LOG"
bash runs/muste-1230/master8.sh
