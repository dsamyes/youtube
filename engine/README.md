# The If Engine: automated video pipeline

"Run the impossible. Do the math." A faceless channel of science "what if" videos. Every number is
computed in code and cited in the description.

**Current method (since 2026-11-14): one cartoon short a day.** A 55 to 68 second vertical story with flat
cartoon characters in a painted 3D world, made with the `cartoon-3d-short` skill
(`.claude/skills/cartoon-3d-short/`, vendored from mromidev/claude-animated-shorts, MIT). The recurring hero
is Gus. The first short, `hole-through-earth` (youtube.com/shorts/HuUEsa9i4R4), is the reference for every
file format below.

- **Topic:** `toon/trends.py` collects what is trending (the week's most viewed shorts, YouTube's popular
  chart, trending searches, Wikipedia, science desks, this channel's own numbers). The producer picks a
  "What if you ...?" that rides one of those, and `toon/episodes.json` keeps it from repeating itself.
- **Voice:** Kokoro (free, local), `toon/voice.py`, word times by forced alignment (PocketSphinx).
- **Picture:** three.js inside Remotion. Shared code in `remotion/src/toon/kit/` (cast, places, camera,
  effects, look; manual in its README), three files per video in `remotion/src/videos/<id>/`.
- **Sound:** `toon/audio/build.py <id>` synthesises music and effects from `shots.json` events and
  `audio/score.json`, ducks them under the voice and masters to -14 LUFS (manual in `toon/audio/README.md`).

## How it runs (fully automatic)

`.github/workflows/produce.yml` runs once a day (02:23 UTC), on manual dispatch, and when a request file is
pushed to `engine/queue/*.json`. Five jobs:

1. **trends** (YouTube secrets, read-only calls, trusted code): writes the day's trend data.
2. **author** (sees only `CLAUDE_CODE_OAUTH_TOKEN`; read-only checkout): a headless `claude -p` follows
   [PRODUCER.md](PRODUCER.md): topic, facts, script, voice, shot plan, picture, sound, metadata. An inline
   integrity check fails the run if anything outside `videos/<id>/`, `remotion/src/videos/<id>/` and
   `toon/episodes.json` changed; `toon/check.py <id>` is the completeness gate. Output: a text-only patch
   plus the two wav files.
3. **render** (no secrets, six machines): each renders a sixth of the shots
   (`scripts/toon-render.py <id> --part i/6`).
4. **finish** (no secrets): joins the shots, muxes the sound, writes captions, checks every frame
   (`toon/finish.py`, `toon/check.py <id> --final`).
5. **publish** (YouTube secrets; no Claude, executes nothing Claude wrote): verifies and applies the patch,
   uploads the short scheduled for the next free 15:00 UTC slot, commits the text outputs.

Settings: `toon/config.json` (model, publish hour). Repo secrets: `CLAUDE_CODE_OAUTH_TOKEN`
(`claude setup-token`), `YOUTUBE_CLIENT_SECRET` and `YOUTUBE_TOKEN` (the JSON contents of
`secrets/client_secret.json` and `secrets/token.json`, from `pipeline/get_token.py`).

Preflights: push `engine/diag/ping.json` (does Claude answer on a runner, are the trend sources reachable)
or `engine/diag/infra.json` (setup, voice, sound and a test render on a fresh runner, no secrets).

## Layout
```
PRODUCER.md             manual for the headless producer (cartoon short)
producer.settings.json  Claude Code deny rules for that run (defence in depth)
queue/                  optional request files {"topic": "..."}
toon/                   trends.py voice.py check.py finish.py short_qa.py upload.py config.json episodes.json
toon/audio/             shared sound library (build.py, README.md)
remotion/src/toon/kit/  shared picture code (README.md is the manual)
remotion/src/videos/<id>/   entry.tsx story.ts staging.ts (+ anything new for that story)
remotion/src/videos/_template/  the folder a new video starts from
remotion/scripts/       toon-stills.mjs toon-sheet.py toon-render.py toon-qa.py
remotion/public-toon/   CC0 props (Kenney Nature Kit)
videos/<id>/            topic.json calc_video.py calc.json SCRIPT.md script.json voice/ shots.json
                        audio/score.json metadata.json captions.srt final/
pipeline/               the earlier long-form method (see below); upload.py and lib.py are still used
```

## Local use
```bash
engine/setup.sh                                   # pip + npm + Kokoro voice
cd engine
.venv/bin/python -B toon/trends.py                # needs secrets/ (or IF_ENGINE_SECRETS) for the YouTube rows
.venv/bin/python -B toon/voice.py <id>
.venv/bin/python -B toon/audio/build.py <id>
(cd remotion && python3 scripts/toon-sheet.py <id>)           # contact sheets in remotion/out/<id>/sheets
(cd remotion && python3 scripts/toon-render.py <id>)          # full render, resumable per shot (about 85 min)
.venv/bin/python -B toon/check.py <id>
.venv/bin/python -B toon/finish.py <id> && .venv/bin/python -B toon/check.py <id> --final
.venv/bin/python -B toon/upload.py <id> --publish-at 2026-11-17T15:00:00Z
```

## Earlier method (long-form, not scheduled)

`pipeline/` and `pipeline/PRODUCER_LONGFORM.md` hold the earlier long-form method (research, calc module,
script template, 3D scene library, ElevenLabs or Kokoro voice, native Shorts cut from the long video). Its
videos: `earth-stops-1s`, `light-speed-nines`, `fall-into-jupiter`. Nothing runs it automatically any more.

Fonts: Inter / Inter Display (SIL Open Font License 1.1, rsms.me/inter) in `remotion/public/fonts`.
