#!/usr/bin/env bash
# WhatsApp-versio kierroksen 2 renderistä (720p, enintään 170 Mt; sama resepti kuin final_chain.sh,
# katto 900k jotta koko jää ~160 Mt:n alle). Ajettu Claude-istunnon Linux-VM:ssä 31.10.
cd "$(dirname "$0")/../.." || exit 1
IN=runs/muste-1230/renders/heldenleben_muste_A_v2.mp4
OUT=runs/muste-1230/renders/heldenleben_muste_A_v2_whatsapp.mp4
LOG=runs/muste-1230/whatsapp_v2.log
echo "alkaa $(date)" > "$LOG"
echo "- ohjaaja: WhatsApp v2 -koodaus käynnissä $(date) (whatsapp_v2.sh)" >> runs/muste-1230/pyynnot.md
ffmpeg -nostdin -v error -stats -y -i "$IN" -vf scale=-2:720 -c:v libx264 -preset medium -crf 26 -maxrate 900k -bufsize 1800k \
  -c:a aac -b:a 128k -movflags +faststart "$OUT.tmp.mp4" 2>> "$LOG" && mv -f "$OUT.tmp.mp4" "$OUT"
echo "exit $? valmis $(date)" >> "$LOG"
sed -i '/whatsapp_v2.sh/d' runs/muste-1230/pyynnot.md
ls -la "$OUT" >> "$LOG"
