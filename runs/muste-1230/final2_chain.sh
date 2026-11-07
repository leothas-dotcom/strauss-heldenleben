#!/usr/bin/env bash
# Koko A-puolen renderi kierroksen 2 jälkeen: renderi (ääni kuuntelukopiosta) -> videotarkistus -> jatkuvuus -> kontaktiarkki.
cd /f/code/heldenleben-video || exit 1
OUT=runs/muste-1230/renders/heldenleben_muste_A_v2.mp4
LOG=runs/muste-1230/final2_chain.log
echo "renderi alkaa $(date)" > "$LOG"
while grep -qi "käynnissä" runs/muste-1230/pyynnot.md 2>/dev/null; do sleep 60; done
echo "- ohjaaja: KOKO A-puolen renderi käynnissä $(date) (final2_chain.sh)" >> runs/muste-1230/pyynnot.md
node render/render.mjs --page visual/muste/index.html --data build/demo400 --out "$OUT" --workers 2 --fade-out 3.5 >> "$LOG" 2>&1
echo "renderi loppui $(date) exit $?" >> "$LOG"
sed -i '/final2_chain.sh/d' runs/muste-1230/pyynnot.md
.venv/Scripts/python.exe -I analysis/videotarkistus.py "$OUT" > runs/muste-1230/videotarkistus_v2.txt 2>&1
.venv/Scripts/python.exe -I analysis/jatkuvuus.py "$OUT" --start 0 --json runs/muste-1230/jatkuvuus_v2.json > runs/muste-1230/jatkuvuus_v2.txt 2>&1
"${FFMPEG:-ffmpeg}" -v error -y -i "$OUT" -vf "fps=1/5,scale=270:-1,tile=8x31" runs/muste-1230/renders/heldenleben_muste_A_v2_kontakti.jpg >> "$LOG" 2>&1
echo "valmis $(date)" >> "$LOG"
