# The If Engine: automated video pipeline

"Run the impossible. Do the math." Faceless, cinematic science "what if" videos. Every number is
computed in code, shown as a light overlay or Math Card and cited in the description.

**Production method (since 2026-11, new videos only):**
- **Voice:** ElevenLabs (`pipeline/tts.py`), narrator "Max - Elearning and Documentary" on
  `eleven_multilingual_v2`, speed 1.05; with-timestamps endpoint (exact word times for captions and
  Shorts), request stitching between beats. Override with `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL`,
  `ELEVENLABS_SPEED`, `ELEVENLABS_STABILITY`. Kokoro only when the key is missing or the credits run
  out (a loud `::warning::`); a bad key fails the run (`TTS_FALLBACK_ON_ERROR=1` to fall back).
- **Visuals:** real 3D with `@remotion/three` (`src/components/three/`, `src/scenes/cinematic.tsx`):
  planets with NASA maps, atmosphere glow and zonal jets, the real Milky Way and 9k real stars,
  procedural nebulae, endless first-person cloud descents with lightning and plasma, planet
  cutaways, Ken Burns NASA photos, window/visor POV, light overlays (`src/components/Cinema.tsx`).
  Assets: `remotion/public/lib` (about 10 MB, credits in `public/lib/CREDITS.md`).
  WebGL is software in CI (`--gl=swangle`, `REMOTION_GL`); the 3D layer renders at 0.4-0.5x and is
  upscaled. `IfEngineLab` previews any list of shots: `npx remotion render IfEngineLab out --props=shots.json`.
- **Sound:** `pipeline/sound.py` synthesises a score that follows each section's `tension` and SFX
  from the visuals and `visual.sfx`, ducks them under the voice and masters to -14 LUFS / -1 dBTP.

## How it runs (fully automatic)

`.github/workflows/produce.yml` runs every 2 days (odd days 1-29) at about 01:07 UTC. It also runs on
manual dispatch, and when a request file is pushed to `engine/queue/*.json`.

1. **produce** job (sees only `CLAUDE_CODE_OAUTH_TOKEN`; read-only checkout).
   - A headless `claude -p` follows [PRODUCER.md](PRODUCER.md). It picks a topic from
     [topics.json](topics.json) or the queue, researches it, and writes three things:
     - `videos/<id>/` (research, calc module, script template, fact-check review);
     - `remotion/src/videos/<id>/scenes.tsx`;
     - a `produced` entry in topics.json.
   - An **inline integrity check** fails the run if anything else changed, including git-ignored
     venv, node_modules and pycache.
   - Trusted pipeline code then re-runs research → factcheck. It then does the voice (ElevenLabs,
     long-form and Shorts, in the only step that sees the key), captions, sound design, the full
     1080p render (resumable 60 s chunks), the thumbnail, metadata and Shorts.
   - The outputs plus a text-only patch go into a 1-day artifact.
2. **publish** job (sees only the YouTube secrets; no Claude).
   - Verifies that the patch only touches the allowed paths, then applies it.
   - Uploads the long-form, scheduled for the next 15:00 UTC at least 3 h ahead, with thumbnail,
     captions and playlist.
   - Uploads 3 Shorts at +6 h, +24 h and +42 h (before the next run's long-form).
   - Commits the text outputs (never renders or audio) and deletes the credentials.

Repo secrets:
- `CLAUDE_CODE_OAUTH_TOKEN` (create it with `claude setup-token`);
- `YOUTUBE_CLIENT_SECRET` and `YOUTUBE_TOKEN` (the JSON contents of `secrets/client_secret.json` and
  `secrets/token.json`, which `pipeline/get_token.py` produces);
- `ELEVENLABS_API_KEY` (the `sk_...` key; without it the run falls back to Kokoro). Optional repo
  variables: `TTS_PROVIDER` (default kokoro, the free voice), `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL`,
  `ELEVENLABS_SPEED`.

`YOUTUBE_API_KEY` is not used. Until the Google API audit passes, YouTube forces API uploads to
**private**; scheduling then has no effect.

## Layout
```
PRODUCER.md            playbook for the headless producer run (security rules, steps, budget)
producer.settings.json Claude Code deny rules for that run (defence in depth)
topics.json            backlog + production log (todo -> produced -> published)
queue/                 optional request files {"topic": "..."}
pipeline/              stage scripts; each one updates videos/<id>/manifest.json
  research.py  calc.py (+calclib.py)  build_script.py  factcheck.py  tts.py  captions.py  sound.py
  render.py  thumbnail.py  metadata.py  shorts.py  upload.py  get_token.py  run_pipeline.py
  build_asset_lib.py (one-off: rebuilds remotion/public/lib from downloaded originals)
remotion/src/scenes/cinematic.tsx   shared 3D scenes: space descent cutaway photo (+ components/three, components/Cinema.tsx)
remotion/src/scenes/shared.tsx      older 2D scenes: title rules recap outro bars number compare clock globe blank
remotion/public/lib/                shared textures, photos, star catalogue (CREDITS.md)
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
.venv/bin/python -B pipeline/render.py <id> --mode full --chunk 1800           # resumable long render (60 s chunks)
.venv/bin/python -B pipeline/shorts.py <id> --stills                          # QA frames of the native Shorts
.venv/bin/python -B pipeline/run_pipeline.py <id> --status
.venv/bin/python -B pipeline/get_token.py                                     # once, on your machine
.venv/bin/python -B pipeline/upload.py <id> --publish-at 2026-11-17T15:00:00Z --confirm-reviewed
.venv/bin/python -B pipeline/upload.py <id> --short 1 --related-id <longVideoId> --publish-at ... --confirm-reviewed
```

Videos: `earth-stops-1s` (published privately, youtu.be/KDFkzbBbN78), `moon-twice-as-close`
(validation draft from the playbook: passes factcheck, 540p only, not uploaded) and `light-speed-nines`
(the reference for the current quality bar: story-driven second-person escalation, a computed
relativistic star field, a persistent HUD, native vertical Shorts and a scene thumbnail). `fall-into-jupiter` (youtu.be/VKAQ3ZT74vo, private) is the
reference for the cinematic method: ElevenLabs narration, the 3D scene library, a depth gauge and
the generated score; its `scenes.tsx` only adds the gauge.

Shorts are NATIVE: each script `shorts[]` entry has its own beats; `shorts.py` voices them and renders
the composition `IfEngineShort` (1080x1920) with word-by-word captions. `shorts.py <id> --stills`
renders QA frames. Thumbnails can be a real frame of a scene (`IfEngineThumb`, see PRODUCER.md).

Fonts: Inter / Inter Display (SIL Open Font License 1.1, rsms.me/inter) in `remotion/public/fonts`.
