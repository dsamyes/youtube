# _audio_test - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 960,000 samples = 600 frames at 30 fps = 20.000 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-3.4 dBTP**, LRA 1.2 LU, max momentary -12.6 LUFS, max short-term -13.4 LUFS
- Stems: voice -14.2 LUFS, music -25.2 LUFS, sfx -31.1 LUFS (master gain +5.09 dB on everything; the voice file itself is -19.3 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction -0.00 dB, active (>0.1 dB) on 0.00 % of samples, >0.5 dB on 0.00 %, >3 dB on 0.000 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -14.0 LUFS
    Threshold: -24.1 LUFS
  Loudness range:
    LRA:         1.2 LU
    Threshold: -34.1 LUFS
    LRA low:   -14.9 LUFS
    LRA high:  -13.7 LUFS
  True peak:
    Peak:       -3.4 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| 1 silence | 0-120 | -14.0 | -54.7 | -29.3 | -29.3 | 15.3 | 15.9 | 12.7 |
| 2 mystery | 120-263 | -14.3 | -25.8 | -30.4 | -24.5 | 10.2 | 10.6 | 8.7 |
| 3 chase a | 263-307 | -13.9 | -25.4 | -34.4 | -24.9 | 11.0 | 10.5 | 9.9 |
| 3 chase b | 307-355 | -17.5 | -27.8 | -34.5 | -26.9 | 9.4 | 11.8 | 9.9 |
| 3 chase c | 355-400 | -13.7 | -23.3 | -39.0 | -23.2 | 9.4 | 9.5 | 7.9 |
| 4 lullaby | 400-490 | -14.3 | -25.8 | -33.4 | -25.1 | 10.8 | 11.1 | 9.1 |
| 5 finale | 490-600 | -14.3 | -23.8 | -33.3 | -23.3 | 9.0 | 9.9 | 8.4 |

## Music map (key D major, plan tempo 150 bpm, tune "hop", seed 2026)
The tune: `D- A B D- F# E | E- B D Db- A | D E F#- D B Db A | D-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 mystery -11.5, 3 chase a -11.0, 3 chase b -10.3, 3 chase c -9.5, 4 lullaby -11.5, 5 finale -9.5. Applied section gains (dB): 1 silence -9.2, 2 mystery -9.2, 3 chase a -8.0, 3 chase b -15.0, 3 chase c -12.0, 4 lullaby -11.2, 5 finale -12.1.

Rides (music only, dB): f292-312 -2.5 - a line stays on top of a busy bar, the band blooms again after it.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 120.0 | 4.00 | MYSTERY: the tune at half speed in B minor (vibes), tick-tock woodblock + pizzicato, 201 bpm felt in two; soft |
| 191.5 | 6.38 | answering phrase a step higher |
| 227.2 | 7.58 | half cadence: the tick-tock slows and stops |
| 263.0 | 8.77 | CHASE OSTINATO: the tune's head as running eighths (marimba), 164 bpm and accelerating over 3 bars, climbing from D major |
| 307.0 | 10.23 | accent downbeat (bar 2): timpani + cymbal; 150 bpm, bass on every beat, xylophone doubles the ostinato |
| 355.0 | 11.83 | last bar: dominant seventh, 160 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 400.0 | 13.33 | LULLABY: the tune rocking in 6/8, Bb major (the home note is its third), music box + harp + warm pad, 80 dotted-quarters a minute |
| 445.0 | 14.83 | last bar climbs to an unresolved second (a rising slide whistle can aim for the same note) |
| 490.0 | 16.33 | FINALE: the tune comes home, D major, warm and a little faster (183.7 bpm): clarinet + glock + marimba, soft horns, pad |
| 568.4 | 18.95 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 588.0 | 19.60 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.2 LUFS integrated). Reverb by place: kitchen = room, space = void, street = open. Dead cuts (everything that sounded before them stops): f120.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 120 | 0.000 | rocket_rumble (bed) | engine roar (rise): low rumble + crackle | -13.0 | -13.0 | -27.2 | +0.00 |
| 2 | 120 | 400 | 4.000 | amb_rain (bed) | rain: hiss and patter | -23.0 | -23.0 | -37.2 | +0.00 |
| 3 | 120 |  | 4.000 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -25.2 | +0.00 |
| 4 | 124 | 176 | 4.133 | clock_tick | clock: tick-tock every 13 frames | -13.0 | -19.0 | -33.2 | -0.15 |
| 5 | 188 |  | 6.267 | thunder | thunder crack + rolling rumble: 'Thunder cracks' | -4.0 | -10.0 | -24.2 | +0.00 |
| 6 | 234 |  | 7.800 | crowd_gasp | crowd gasp: 'the neighbors gasp' | -6.0 | -12.0 | -26.2 | +0.00 |
| 7 | 263 | 300 | 8.767 | footsteps | 4 footsteps (hard ground): 'She runs inside' | -11.0 | -17.0 | -31.2 | +0.00 |
| 8 | 307 |  | 10.233 | door_slam | door slam: 'slams the door' | -4.0 | -10.0 | -24.2 | +0.00 |
| 9 | 400 | 600 | 13.333 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -38.2 | +0.00 |
| 10 | 400 |  | 13.333 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): up through the clouds | -2.0 | -8.0 | -22.2 | +0.00 |
| 11 | 470 | 545 | 15.667 | heartbeat | heartbeat, 84 bpm: 'one very loud heartbeat' | -8.0 | -14.0 | -28.2 | +0.00 |
| 12 | 541 |  | 18.033 | twinkle | sparkle run of five tiny bells: the rocket glints among the stars | -9.0 | -15.0 | -29.2 | +0.00 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): crowd_gasp@234
- Files: `mix.wav` 960,000 samples, 48000 Hz, 2 ch, 24-bit, peak -3.38 dBFS, 0 clipped; `stem_voice.wav` 960,000 samples, 48000 Hz, 2 ch, 24-bit, peak -4.09 dBFS, 0 clipped; `stem_music.wav` 960,000 samples, 48000 Hz, 2 ch, 24-bit, peak -8.87 dBFS, 0 clipped; `stem_sfx.wav` 960,000 samples, 48000 Hz, 2 ch, 24-bit, peak -10.22 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.0 LUFS** integrated, true peak **-3.37 dBTP** (sample peak -3.38 dBFS), LRA 1.23 LU, max momentary -12.59 LUFS. Stems minus mix: -127.3 dB.
- Event onsets in `stem_sfx.wav` (12 events, tolerance 1 frame): matched 12/12 within tolerance (largest error 0.47 frame, largest lag 9 samples); blind band-flux detector resolved 10 of them, 10 within tolerance (largest error 0.56 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): crowd_gasp@234, amb_drone@400.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **12.12 dB** over 16.09 s of speech (400 ms windows: median 11.63, 10th percentile 8.73, 90th 22.13 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-119.9 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -129.1 dBFS, below 20 Hz -44.4 dB, above 12 kHz -50.2 dB of the total energy, centroid 448 Hz. Bands (dB of total): 0-20 Hz -44.4, 20-60 Hz -23.1, 60-300 Hz -4.0, 300-3000 Hz -2.3, 3000-8000 Hz -21.6, 8000-12000 Hz -30.3, 12000-16000 Hz -50.2, 16000-24000 Hz -76.6.
- Score landmarks: first sound at f119.92; 1 silence f0-120: -240.0 dBFS; 2 mystery: onset at f119.92 (plan f120); 3 chase: onset at f262.94 (plan f263); 4 lullaby: onset at f400.04 (plan f400); 5 finale: onset at f489.98 (plan f490), button at f587.9 (plan f588); last 10 ms -84.4 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-120 | 21.72 | 21.99 | 18.44 |
| 2 mystery | 120-263 | 11.37 | 10.89 | 9.5 |
| 3 chase a | 263-307 | 12.52 | 11.63 | 10.85 |
| 3 chase b | 307-355 | 12.95 | 11.8 | 11.03 |
| 3 chase c | 355-400 | 9.79 | 10.12 | 6.12 |
| 4 lullaby | 400-490 | 11.12 | 11.32 | 8.01 |
| 5 finale | 490-600 | 10.63 | 10.21 | 7.66 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-112 | 21.72 | If you launched a rocket from your kitchen, would it ever come back do |
| 2 | 122-186 | 11.28 | Bea counts down while a storm rolls in. |
| 3 | 190-243 | 11.06 | Thunder cracks, and the neighbors gasp. |
| 4 | 258-318 | 12.63 | She runs inside and slams the door. |
| 5 | 345-438 | 10.23 | You see, above the clouds there is no weather at all. |
| 6 | 444-531 | 11.35 | Only the hum of space, and one very loud heartbeat. |
| 7 | 537-582 | 10.78 | The rocket is still up there. |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-120 | rocket_rumble | 0.06 | +0.06 | 1 | -0.04 | -0.04 | 16.4 | 0.96 |
| 120 | flash_hit | 119.65 | -0.35 | 2 | 120.14 | +0.14 | 7.9 | 1.00 |
| 120-400 | amb_rain | 120.03 | +0.03 | 2 | 120.14 | +0.14 | 5.6 | 1.00 |
| 124-176 | clock_tick | 124.0 | +0.00 | 1 | 123.92 | -0.08 | 16.0 | 1.00 |
| 188 | thunder | 188.0 | +0.00 | 2 | 187.94 | -0.06 | 16.3 | 1.00 |
| 234 | crowd_gasp | 234.13 | +0.13 | 2 | - | - | 4.0 | 1.00 |
| 263-300 | footsteps | 263.0 | +0.00 | 1 | 262.88 | -0.12 | 15.6 | 1.00 |
| 307 | door_slam | 307.0 | +0.00 | 1 | 306.92 | -0.08 | 18.0 | 1.00 |
| 400 | whoosh_big | 399.53 | -0.47 | 1 | 399.44 | -0.56 | 10.8 | 1.00 |
| 400-600 | amb_drone | 400.24 | +0.23 | 1 | - | - | 4.1 | 1.00 |
| 470-545 | heartbeat | 470.01 | +0.01 | -9 | 470.12 | +0.12 | 14.8 | 1.00 |
| 541 | twinkle | 541.0 | +0.00 | 2 | 540.92 | -0.08 | 63.8 | 1.00 |
