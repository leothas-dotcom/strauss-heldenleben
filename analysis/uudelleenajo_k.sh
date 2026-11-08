#!/usr/bin/env bash
# Nopeuskorjatun lähteen (audio/lahde.json, k = 0,98598) koko analyysiketju A-puolelle, 9.11.2026.
# docs/julkaisu2.md 1.5 b: paketit, kuuntelukopiot (aikojen totuus), teemaviiva, viuluviiva, cues, kuunteluopas, kellot.
# Vanhat paketit ja kuuntelukopiot siirretään build/v1/ ja build/kuuntelu_v1/ (alkuperäisen siirron aika).
# Edellytys: analysis/skaalaa_ajat.py on ajettu (teemat.json ym. korjatussa ajassa).
# Käynnistys Git Bashissa:  bash /f/code/heldenleben-video/analysis/uudelleenajo_k.sh
set -u
cd /f/code/heldenleben-video || exit 1
PY=.venv/Scripts/python.exe
FF="${FFMPEG:-ffmpeg}"
LOG=build/uudelleenajo_k.log
R=runs/muste-1230
echo "alkaa $(date)" > "$LOG"
echo "- ohjaaja: analyysiketju korjatulle lähteelle käynnissä $(date) (uudelleenajo_k.sh, GPU)" >> $R/pyynnot.md

step() { echo "== $* $(date +%T)" | tee -a "$LOG"; }
run() { "$@" >> "$LOG" 2>&1; local rc=$?; [ $rc -ne 0 ] && echo "   VIRHE rc=$rc: $*" | tee -a "$LOG"; return $rc; }

# 1. vanhat talteen (vain kerran)
step "vanhat paketit -> build/v1"
mkdir -p build/v1 build/kuuntelu_v1
for p in demo400 A2 A3 B1 B2 B3 B4 koko demo; do
  [ -d "build/$p" ] && [ ! -d "build/v1/$p" ] && mv "build/$p" "build/v1/$p"
done
[ -f build/kuuntelu/A_puoli_kuuntelu.wav ] && mv build/kuuntelu/*.wav build/kuuntelu_v1/ 2>/dev/null
mkdir -p build/kuuntelu build/koko

# 2. kuuntelukopiot = aikojen totuus (48 kHz, 16 bit, stereo, kuten 30.10.2026)
step "kuuntelukopiot korjatusta lähteestä"
run "$FF" -v error -y -i audio/lp_krauss_k/side1.flac -ar 48000 -sample_fmt s16 build/kuuntelu/A_puoli_kuuntelu.wav
run "$FF" -v error -y -i audio/lp_krauss_k/side2.flac -ar 48000 -sample_fmt s16 build/kuuntelu/B_puoli_kuuntelu.wav

# 3. paketit: prepare -> analyze -> listen (stemmit, soittimet, iskut, savelet) -> interpret -> segments -> aksentit
for spec in "demo400 0 400" "A2 400 420" "A3 800 460"; do
  set -- $spec; P=$1; S0=$2; D=$3
  step "paketti $P ($S0 s, $D s)"
  run $PY -I analysis/prepare.py --side 1 --start $S0 --duration $D --out build/$P || continue
  run $PY -I analysis/analyze.py build/$P || continue
  run $PY -I analysis/listen.py build/$P || continue
  run $PY -I analysis/interpret.py build/$P
  run $PY -I analysis/segments.py build/$P
  run $PY -I analysis/aksentit.py build/$P
  run $PY -I analysis/kellot.py build/$P
done

# 4. teemaviiva (alun sankariteema, tahtiankkurit skaalattu) ja viuluviiva (422/k .. 1126/k)
step "teemaviiva ja viuluviiva"
run $PY -I analysis/teemaviiva.py --side 1 --muoto annotations/sankariteema.json --out build/demo400/teemaviiva.json
run $PY -I analysis/viuluviiva.py --side 1 --from 428.0 --to 1142.0 --out build/koko/viuluviiva_A.json

# 5. merkinnät teemakartasta (skaalattu) + paketeista
step "make_cues ja kuunteluopas"
run $PY -I analysis/make_cues.py build/demo400 build/A2 build/A3
run $PY -I analysis/kuunteluopas.py
run $PY -I analysis/check_package.py build/demo400

sed -i '/uudelleenajo_k.sh/d' $R/pyynnot.md
echo "valmis $(date)" | tee -a "$LOG"
