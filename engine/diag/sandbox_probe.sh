#!/usr/bin/env bash
# Run by Claude's Bash tool in the diag workflow: do the producer's kinds of work (voice, a still through headless
# Chrome, ffmpeg, writing into the repo) succeed inside Claude Code's subprocess sandbox? Writes key=value lines.
set -u
cd "$(dirname "$0")/.."            # engine/
P=videos/_probe; rm -rf "$P"; mkdir -p "$P"
cat > "$P/script.json" <<'JSON'
{"id": "_probe", "title": "probe", "voice": {"provider": "kokoro", "voice": "am_michael", "speed": 1.2, "gap_s": 0.12},
 "lines": ["Gus has to eat a burger every three minutes.", "That is not even his biggest problem."]}
JSON
.venv/bin/python -B toon/voice.py _probe > "$P/voice.log" 2>&1; echo "voice=$?" > "$P/result.txt"
(cd remotion && node scripts/toon-stills.mjs _template 30 0.25 > "../$P/still.log" 2>&1); echo "still=$?" >> "$P/result.txt"
ffmpeg -v error -f lavfi -i testsrc=d=1:s=64x64 -y "$P/t.mp4" > /dev/null 2>&1; echo "ffmpeg=$?" >> "$P/result.txt"
if [ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then echo "token_visible=1"; else echo "token_visible=0"; fi >> "$P/result.txt"
touch /tmp/probe_tmp 2> /dev/null; echo "tmp_write=$?" >> "$P/result.txt"
# files the sandbox shows as empty placeholders at the top of the repository and of engine/ (names only)
(cd .. && find . engine -maxdepth 1 -size 0 ! -name .nojekyll -printf '%p ' 2> /dev/null) > "$P/empty_files.txt"
(cd remotion && npx tsc --noEmit -p tsconfig.toon.json > "../$P/tsc.log" 2>&1); echo "tsc=$?" >> "$P/result.txt"
cat "$P/result.txt"
