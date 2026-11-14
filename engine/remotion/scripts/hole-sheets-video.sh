#!/usr/bin/env bash
# Contact sheets for the hole short cut straight from the final render (out/hole/video.mp4, or a video given as $1):
# two frames per shot (start+10 and the main action frame), 6 per sheet, labelled with shot id and frame number,
# plus two sheets of extra key frames.
set -euo pipefail
cd "$(dirname "$0")/.."
VID="${1:-out/hole/video.mp4}"
OUT=out/hole/sheets; mkdir -p "$OUT/frames"
PAIRS="1:10:103 2:128:183 3:239:249 4:274:290 5:329:353 6:403:431 7:458:510 8:547:566 9:608:636 10:664:669 11:695:728 12:753:803 13:871:899 14:925:1024 15:1133:1215 16:1278:1442 17:1475:1484 18:1547:1598 19:1624:1660 20:1717:1737 21:1763:1856"
EXTRA="1:117 2:150 5:343 6:440 12:838 14:955 14:1100 15:1258 16:1344 18:1580 21:1851 21:1930"
grab() { ffmpeg -v error -y -ss "$(awk "BEGIN{printf \"%.4f\", ($1 - 0.5) / 30}")" -i "$VID" -vf "scale=540:960" -frames:v 1 -q:v 3 "$OUT/frames/f$1.jpg"; }
for p in $PAIRS; do IFS=: read -r s a b <<<"$p"; grab "$a"; grab "$b"; done
for p in $EXTRA; do IFS=: read -r s a <<<"$p"; grab "$a"; done
n=1; args=(); k=0
for p in $PAIRS; do IFS=: read -r s a b <<<"$p"
  args+=("shot $s  f$a=$OUT/frames/f$a.jpg" "shot $s  f$b=$OUT/frames/f$b.jpg"); k=$((k+2))
  if [ $k -eq 6 ]; then python3 scripts/toon-sheet.py "$OUT/sheet_$(printf %02d $n).jpg" --cols 6 --h 800 "${args[@]}"; n=$((n+1)); args=(); k=0; fi
done
args=(); k=0
for p in $EXTRA; do IFS=: read -r s a <<<"$p"
  args+=("shot $s  f$a (extra)=$OUT/frames/f$a.jpg"); k=$((k+1))
  if [ $k -eq 6 ]; then python3 scripts/toon-sheet.py "$OUT/sheet_$(printf %02d $n)_extra.jpg" --cols 6 --h 800 "${args[@]}"; n=$((n+1)); args=(); k=0; fi
done
