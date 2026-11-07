#!/usr/bin/env bash
# Koko A-puolen lopullinen renderi. Odottaa, että osa 3 kirjoittaa tarkistus.md:n ja ettei
# kukaan muu renderöi (pyynnot.md), sitten: renderi (ääni kuuntelukopiosta) -> videotarkistus -> WhatsApp.
cd /f/code/heldenleben-video || exit 1
OUT=runs/muste-1230/renders/heldenleben_muste_A_final.mp4
LOG=runs/muste-1230/final_chain.log
T0=$(date +%s)
echo "odotus alkaa $(date)" > "$LOG"
# 1) odota osa 3:n raporttia (enintään 2 h)
while true; do
  if [ -f runs/muste-1230/osa_3/tarkistus.md ] && [ "$(stat -c %Y runs/muste-1230/osa_3/tarkistus.md)" -gt "$T0" ]; then break; fi
  if [ $(( $(date +%s) - T0 )) -gt 7200 ]; then echo "osa 3 ei valmistunut 2 h:ssa, renderöidään silti $(date)" >> "$LOG"; break; fi
  sleep 60
done
# 2) odota, ettei kukaan muu renderöi
while grep -qi "käynnissä" runs/muste-1230/pyynnot.md 2>/dev/null; do
  if [ $(( $(date +%s) - T0 )) -gt 9000 ]; then break; fi
  sleep 60
done
echo "- ohjaaja: KOKO A-puolen renderi käynnissä $(date) (final_chain.sh)" >> runs/muste-1230/pyynnot.md
echo "renderi alkaa $(date)" >> "$LOG"
node render/render.mjs --page visual/muste/index.html --data build/demo400 --out "$OUT" --workers 2 --fade-out 3.5 >> "$LOG" 2>&1
echo "renderi loppui $(date) exit $?" >> "$LOG"
.venv/Scripts/python.exe -I analysis/videotarkistus.py "$OUT" > runs/muste-1230/videotarkistus_final.txt 2>&1
ffmpeg -v error -y -i "$OUT" -vf scale=-2:720 -c:v libx264 -preset slow -crf 26 -maxrate 1000k -bufsize 2000k -c:a aac -b:a 128k runs/muste-1230/renders/heldenleben_muste_A_final_whatsapp.mp4 >> "$LOG" 2>&1
sed -i '/final_chain.sh/d' runs/muste-1230/pyynnot.md
echo "valmis $(date)" >> "$LOG"
ls -la runs/muste-1230/renders/ >> "$LOG"
