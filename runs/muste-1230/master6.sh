#!/usr/bin/env bash
# 2160p YouTube-master kierroksen 2 renderistä (docs/youtube.md luku 3), sitten väritagien remux.
cd /f/code/heldenleben-video || exit 1
IN=runs/muste-1230/renders/heldenleben_muste_A_v6.mp4
TMP=runs/muste-1230/renders/heldenleben_muste_A_v6_2160p_tmp.mp4
OUT=runs/muste-1230/renders/heldenleben_muste_A_v6_youtube_2160p.mp4
LOG=runs/muste-1230/youtube_2160p_v6.log
echo "alkaa $(date)" > "$LOG"
"${FFMPEG:-ffmpeg}" -v error -y -i "$IN" \
  -vf "scale=3840:2160:flags=lanczos+accurate_rnd+full_chroma_int:in_range=pc:out_range=tv:in_color_matrix=bt470bg:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset medium -crf 20 -maxrate 60M -bufsize 120M -profile:v high -level 5.1 \
  -g 30 -keyint_min 15 -bf 2 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a copy -movflags +faststart "$TMP" >> "$LOG" 2>&1
"${FFMPEG:-ffmpeg}" -v error -y -i "$TMP" -c copy \
  -bsf:v h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0 \
  -movflags +faststart "$OUT" >> "$LOG" 2>&1 && rm -f "$TMP"
echo "valmis $(date)" >> "$LOG"; ls -la "$OUT" >> "$LOG"
