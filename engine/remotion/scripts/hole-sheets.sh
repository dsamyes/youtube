#!/usr/bin/env bash
# Contact sheets for the hole short: two stills per shot (start+10 and the main action frame), 6 per sheet,
# labelled with shot id and frame number.  usage: scripts/hole-sheets.sh [scale]
set -euo pipefail
cd "$(dirname "$0")/.."
export REMOTION_CHROME="${REMOTION_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
SCALE="${1:-0.5}"
OUT=out/hole/sheets; mkdir -p "$OUT/frames"
# shot:start+10:action
PAIRS="1:10:103 2:128:183 3:239:249 4:274:290 5:329:353 6:403:431 7:458:510 8:547:566 9:608:636 10:664:669 11:695:728 12:753:803 13:871:899 14:925:1024 15:1133:1215 16:1278:1442 17:1475:1484 18:1547:1598 19:1624:1660 20:1717:1737 21:1763:1856"
EXTRA="1:117 2:150 5:344 6:414 12:838 14:955 14:1100 15:1258 16:1344 18:1580 21:1800 21:1930"
FR=""; for p in $PAIRS; do IFS=: read -r s a b <<<"$p"; FR="$FR,$a,$b"; done
for p in $EXTRA; do IFS=: read -r s a <<<"$p"; FR="$FR,$a"; done
FR="${FR#,}"
A=$(echo "$FR" | tr ',' '\n' | awk 'NR%2==1' | paste -sd, -); B=$(echo "$FR" | tr ',' '\n' | awk 'NR%2==0' | paste -sd, -)
node scripts/toon-stills.mjs src/toon/hole-entry.tsx HoleShort "$OUT/frames/f" "$A" "$SCALE" > "$OUT/frames/log_a.txt" 2>&1 &
sleep 25
node scripts/toon-stills.mjs src/toon/hole-entry.tsx HoleShort "$OUT/frames/f" "$B" "$SCALE" > "$OUT/frames/log_b.txt" 2>&1 &
wait
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
