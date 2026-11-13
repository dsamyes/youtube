# Vendored skill: claude-animated-shorts (cartoon-3d-short)

Source: https://github.com/mromidev/claude-animated-shorts (MIT, see LICENSE), commit e3b817b.
This is the production method of The If Engine's animated shorts. It is vendored so the automated producer
on GitHub Actions can load it as a project skill.

Not vendored: `references/frames/` and `references/sheets/` (third-party reference frames, study material only).

Local notes for this repo:
- A working copy of `templates/bridge/` lives in `engine/remotion/src/videos/bridge/`. Its `Bridge.tsx` carries one
  compatibility patch for @react-three/postprocessing >= 3.2 (the composer is created one commit late, so stills and
  first frames rendered blank). Start new shorts from that copy.
- Rendering here is software WebGL (`--gl=swangle`), final size 1080x1920.
- Voice: Kokoro (`engine/toon/voice.py`), word times by forced alignment. Finish/QA/upload: `engine/toon/`.
