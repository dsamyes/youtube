#!/usr/bin/env bash
# Idempotent setup for The If Engine (local machine or CI). Uses pip + npm only (no curl|bash).
# Needs: python3 (3.10+), node 20+, ffmpeg/ffprobe, and either Chrome (REMOTION_CHROME=/path) or
# network access for Remotion's own headless-shell download (REMOTION_CHROME unset or "bundled").
set -euo pipefail
cd "$(dirname "$0")"

[ -x .venv/bin/python ] || python3 -m venv .venv
.venv/bin/pip install --disable-pip-version-check -q -r requirements.txt

[ -d remotion/node_modules ] || (cd remotion && npm ci --no-audit --no-fund)
if [ -z "${REMOTION_CHROME:-}" ] || [ "${REMOTION_CHROME}" = "bundled" ]; then
  (cd remotion && npx remotion browser ensure)
fi

# Local neural TTS voice (Kokoro v1.0, Apache-2.0 weights) from the kokoro-onnx GitHub release.
# Plain file downloads verified against pinned SHA-256 sums; nothing is executed.
mkdir -p models/kokoro
fetch() { [ -s "models/kokoro/$1" ] || curl -fsSL --retry 3 -o "models/kokoro/$1" \
  "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$1"; }
fetch kokoro-v1.0.onnx
fetch voices-v1.0.bin
(cd models/kokoro && sha256sum -c --quiet - <<'SUMS'
7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5  kokoro-v1.0.onnx
bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d  voices-v1.0.bin
SUMS
)
echo "setup OK"
