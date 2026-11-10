# The If Engine: automated video pipeline

"Run the impossible. Do the math." Faceless science "what if" explainers. Every number is computed
in code, shown on a Math Card and cited in the description.

## How it runs (fully automatic)

`.github/workflows/produce.yml` runs Mon and Thu at about 01:07 UTC. It also runs on manual dispatch,
and when a request file is pushed to `engine/queue/*.json`.

1. **produce** job (sees only `CLAUDE_CODE_OAUTH_TOKEN`; read-only checkout).
   - A headless `claude -p` follows [PRODUCER.md](PRODUCER.md). It picks a topic from
     [topics.json](topics.json) or the queue, researches it, and writes three things:
     - `videos/<id>/` (research, calc module, script template, fact-check review);
     - `remotion/src/videos/<id>/scenes.tsx`;
     - a `produced` entry in topics.json.
   - An **inline integrity check** fails the run if anything else changed, including git-ignored
     venv, node_modules and pycache.
   - Trusted pipeline code then re-runs research → factcheck. It then does the voice (Kokoro by
     default), captions, the full 1080p render, the thumbnail, metadata and Shorts.
   - The outputs plus a text-only patch go into a 1-day artifact.
2. **publish** job (sees only the YouTube secrets; no Claude).
   - Verifies that the patch only touches the allowed paths, then applies it.
   - Uploads the long-form, scheduled for the next Tue or Fri at 15:00 UTC, with thumbnail, captions
     and playlist.
   - Uploads 3 Shorts, scheduled one per day after it.
   - Commits the text outputs (never renders or audio) and deletes the credentials.

Repo secrets:
- `CLAUDE_CODE_OAUTH_TOKEN` (create it with `claude setup-token`);
- `YOUTUBE_CLIENT_SECRET` and `YOUTUBE_TOKEN` (the JSON contents of `secrets/client_secret.json` and
  `secrets/token.json`, which `pipeline/get_token.py` produces);
- optionally `ELEVENLABS_API_KEY`, plus the repo variable `TTS_PROVIDER=elevenlabs`.

`YOUTUBE_API_KEY` is not used. Until the Google API audit passes, YouTube forces API uploads to
**private**; scheduling then has no effect.

## Layout
```
PRODUCER.md            playbook for the headless producer run (security rules, steps, budget)
producer.settings.json Claude Code deny rules for that run (defence in depth)
topics.json            backlog + production log (todo -> produced -> published)
queue/                 optional request files {"topic": "..."}
pipeline/              stage scripts; each one updates videos/<id>/manifest.json
  research.py  calc.py (+calclib.py)  build_script.py  factcheck.py  tts.py  captions.py
  render.py  thumbnail.py  metadata.py  shorts.py  upload.py  get_token.py  run_pipeline.py
remotion/src/scenes/shared.tsx      shared scenes: title rules recap outro bars number compare clock globe blank
remotion/src/videos/<id>/scenes.tsx per-video scene registry (merged over the shared one)
remotion/src/generated/             written by render.py (props.json, registry.ts); git-ignored
videos/<id>/           research.md, calc_video.py, script.template.json, factcheck_review.json, then outputs
```

## Local use
```bash
engine/setup.sh                     # pip + npm + Kokoro voice (set REMOTION_CHROME=/path/to/chrome if remotion.media is blocked)
cd engine
.venv/bin/python -B pipeline/run_pipeline.py <id> --to factcheck              # validate a draft
.venv/bin/python -B pipeline/tts.py <id> --provider silent && .venv/bin/python -B pipeline/captions.py <id>
.venv/bin/python -B pipeline/render.py <id> --stills                          # contact sheets in videos/<id>/renders/stills
.venv/bin/python -B pipeline/run_pipeline.py <id> --from voice --render full   # everything; upload is a dry run
.venv/bin/python -B pipeline/run_pipeline.py <id> --status
.venv/bin/python -B pipeline/get_token.py                                     # once, on your machine
.venv/bin/python -B pipeline/upload.py <id> --publish-at 2026-11-17T15:00:00Z --confirm-reviewed
.venv/bin/python -B pipeline/upload.py <id> --short 1 --related-id <longVideoId> --publish-at ... --confirm-reviewed
```

Videos: `earth-stops-1s` (published privately, youtu.be/KDFkzbBbN78) and `moon-twice-as-close`
(validation draft from the playbook: passes factcheck, 540p only, not uploaded).

Fonts: Inter / Inter Display (SIL Open Font License 1.1, rsms.me/inter) in `remotion/public/fonts`.
