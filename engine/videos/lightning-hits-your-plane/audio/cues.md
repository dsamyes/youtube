# lightning-hits-your-plane - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,144,000 samples = 1965 frames at 30 fps = 65.500 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.4 LU, max momentary -9.3 LUFS, max short-term -12.7 LUFS
- Stems: voice -14.3 LUFS, music -24.2 LUFS, sfx -31.2 LUFS (master gain +7.36 dB on everything; the voice file itself is -20.8 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 7.66 dB, active (>0.1 dB) on 28.08 % of samples, >0.5 dB on 14.37 %, >3 dB on 1.884 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -14.0 LUFS
    Threshold: -24.0 LUFS
  Loudness range:
    LRA:         1.4 LU
    Threshold: -34.0 LUFS
    LRA low:   -14.8 LUFS
    LRA high:  -13.4 LUFS
  True peak:
    Peak:       -1.2 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| 1 silence | 0-197 | -14.5 | - | -29.1 | -29.1 | 14.5 | 16.0 | 9.7 |
| 2 theme | 197-312 | -13.9 | -23.2 | -32.3 | -22.7 | 8.8 | 8.2 | 6.1 |
| 3 chase a | 312-331 | -13.3 | -24.0 | -25.6 | -21.8 | 8.5 | 8.6 | 7.1 |
| 3 chase b | 331-454 | -14.1 | -23.3 | -31.8 | -22.7 | 8.7 | 8.0 | 5.5 |
| 3 chase c | 454-563 | -15.2 | -24.5 | -32.6 | -23.9 | 8.7 | 9.1 | 5.2 |
| 4 silence | 563-646 | -13.4 | - | -31.9 | -31.9 | 18.5 | 19.9 | 14.6 |
| 5 mystery | 646-1017 | -14.5 | -25.2 | -31.2 | -24.6 | 10.1 | 10.1 | 6.8 |
| 6 waltz | 1017-1161 | -14.3 | -24.5 | -32.7 | -23.8 | 9.6 | 9.7 | 4.9 |
| 7 mystery | 1161-1306 | -14.4 | -25.2 | -31.5 | -24.7 | 10.2 | 10.6 | 6.4 |
| 8 theme | 1306-1516 | -14.1 | -23.2 | -30.7 | -22.8 | 8.6 | 8.5 | 5.5 |
| 9 bittersweet | 1516-1720 | -14.4 | -25.4 | -32.6 | -24.7 | 10.3 | 9.6 | 6.8 |
| 10 runup | 1720-1799 | -14.0 | -23.0 | -32.7 | -22.7 | 8.7 | 7.9 | 3.5 |
| 11 finale | 1799-1965 | -14.1 | -23.1 | -32.6 | -22.6 | 8.5 | 8.2 | 5.6 |

## Music map (key D major, plan tempo 126 bpm, tune "hop", seed 2111)
The tune: `D- A B D- F# E | E- B D Db- A | D E F#- D B Db A | D-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 3 chase a -11.0, 3 chase b -10.3, 3 chase c -9.5, 5 mystery -11.5, 6 waltz -11.0, 7 mystery -11.5, 8 theme -9.5, 9 bittersweet -11.5, 10 runup -9.5, 11 finale -9.5. Applied section gains (dB): 1 silence -11.5, 2 theme -11.5, 3 chase a -11.3, 3 chase b -10.7, 3 chase c -15.2, 4 silence -11.1, 5 mystery -11.1, 6 waltz -11.8, 7 mystery -10.5, 8 theme -9.9, 9 bittersweet -11.2, 10 runup -12.1, 11 finale -13.2.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 197.0 | 6.57 | THEME: D major, swung, 125.2 bpm, 2 bars; clarinet tune, pizzicato boom-chick, brushes |
| 283.2 | 9.44 | stop chord (dominant seventh): the band leaves the next two beats to the sound effects, vibes ring |
| 312.0 | 10.40 | CHASE OSTINATO: the tune's head as running eighths (marimba), 379 bpm and accelerating over 5 bars, climbing from D major |
| 331.0 | 11.03 | accent downbeat (bar 2): timpani + cymbal; 113 bpm, bass on every beat, xylophone doubles the ostinato |
| 510.4 | 17.01 | last bar: dominant seventh, 137 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 563.0 | 18.77 | (no music: silence) |
| 646.0 | 21.53 | MYSTERY: the tune at half speed in B minor (vibes), tick-tock woodblock + pizzicato, 155 bpm felt in two; soft |
| 924.2 | 30.81 | answering phrase a step higher |
| 970.6 | 32.35 | half cadence: the tick-tock slows and stops |
| 1017.0 | 33.90 | WALTZ: music box in D major, 153 bpm, pick-up on f1020, downbeats at f1038, f1073, low point f1108 |
| 1072.8 | 35.76 | the tune steps down do-la-fa into |
| 1108.0 | 36.93 | the low point (low home note); then the arpeggio climbs, slower and slower, to the rest |
| 1151.0 | 38.37 | the rest: the high home note rings, everything else waits |
| 1161.0 | 38.70 | MYSTERY: the tune at half speed in B minor (vibes), tick-tock woodblock + pizzicato, 99 bpm felt in two; soft |
| 1233.5 | 41.12 | half cadence: the tick-tock slows and stops |
| 1306.0 | 43.53 | THEME: D major, swung, 137.1 bpm, 4 bars; clarinet tune, pizzicato boom-chick, brushes |
| 1463.5 | 48.78 | theme bar 4: the tune lands on the home note, 'pom-pom' answer on beats 3 and 4 |
| 1516.0 | 50.53 | BITTERSWEET, sweet: the head of the tune in Bb major (music box, harp), ending on a rolled chord |
| 1579.0 | 52.63 | the same phrase again ... |
| 1600.0 | 53.33 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1720.0 | 57.33 | RUN-UP: the ostinato on the dominant seventh, 177 bpm and accelerating, 2 bars up into the next section |
| 1799.0 | 59.97 | FINALE: the tune comes home, D major, warm and a little faster (161.5 bpm): clarinet + glock + marimba, soft horns, pad |
| 1932.7 | 64.42 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 1955.0 | 65.17 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.3 LUFS integrated). Reverb by place: cabin = room, garden = open, sky = void. Dead cuts (everything that sounded before them stops): f197, f331, f563.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 197 | 0.000 | amb_wind (bed) | wind: gusts with a wandering howl | -22.0 | -22.0 | -35.5 | +0.00 |
| 2 | 1 |  | 0.033 | thunder | thunder crack + rolling rumble: the bolt hits the nose | -3.0 | -9.0 | -22.5 | +0.00 |
| 3 | 4 |  | 0.133 | zap | electric spark: the bolt crackles | -7.0 | -13.0 | -26.5 | +0.00 |
| 4 | 23 |  | 0.767 | pop | small bright pop: the little sun pops in | -8.0 | -14.0 | -27.5 | +0.00 |
| 5 | 45 |  | 1.500 | sizzle | sizzle dying away: the sun sweats: hotter | -9.0 | -15.0 | -28.5 | +0.20 |
| 6 | 97 |  | 3.233 | impact_kick | speed-surge kick (sub thump + upward air burst): the cabin takes the hit, windows blaze | -5.0 | -11.0 | -24.5 | +0.00 |
| 7 | 164 |  | 5.467 | pop | small bright pop: the sleep bubble pops | -8.0 | -14.0 | -27.5 | +0.00 |
| 8 | 181 |  | 6.033 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): into the flash; Gus scowls | -2.0 | -8.0 | -21.5 | +0.00 |
| 9 | 197 | 281 | 6.567 | amb_wind (bed) | wind: gusts with a wandering howl | -22.0 | -22.0 | -35.5 | +0.00 |
| 10 | 197 |  | 6.567 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.5 | +0.00 |
| 11 | 229 |  | 7.633 | whoosh | quick whoosh (ease-out burst): the plane slides into the cloud | -10.0 | -16.0 | -29.5 | +0.00 |
| 12 | 254 |  | 8.467 | thunder | far thunder: the cloud flickers | -8.0 | -14.0 | -27.5 | +0.00 |
| 13 | 281 | 331 | 9.367 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.5 | +0.00 |
| 14 | 310 |  | 10.333 | thunder | thunder crack + rolling rumble: BANG | -3.0 | -9.0 | -22.5 | +0.00 |
| 15 | 331 | 439 | 11.033 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.5 | +0.00 |
| 16 | 331 |  | 11.033 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.5 | +0.00 |
| 17 | 358 |  | 11.933 | crowd_gasp | crowd gasp: his wife screams | -6.0 | -12.0 | -25.5 | +0.00 |
| 18 | 419 |  | 13.967 | oof | 'oh': the neighbor throws both hands up | -6.0 | -12.0 | -25.5 | +0.00 |
| 19 | 439 | 563 | 14.633 | amb_wind (bed) | wind: gusts with a wandering howl | -22.0 | -22.0 | -35.5 | +0.00 |
| 20 | 441 |  | 14.700 | zap | electric spark: the giant bolt crackles | -7.0 | -13.0 | -26.5 | +0.00 |
| 21 | 468 |  | 15.600 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.5 | +0.00 |
| 22 | 512 |  | 17.067 | glass_pop | glass pops: small pop + glass tink + tiny shards | -6.0 | -12.0 | -25.5 | +0.00 |
| 23 | 563 | 646 | 18.767 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.5 | +0.00 |
| 24 | 563 |  | 18.767 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.5 | +0.00 |
| 25 | 597 |  | 19.900 | twinkle | sparkle run of five tiny bells: nobody is hurt | -9.0 | -15.0 | -28.5 | +0.00 |
| 26 | 615 |  | 20.500 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.5 | +0.00 |
| 27 | 656 |  | 21.867 | pop | small bright pop: the lazy spark pops in | -8.0 | -14.0 | -27.5 | +0.00 |
| 28 | 680 |  | 22.667 | power_down | power down: he yawns | -8.0 | -14.0 | -27.5 | +0.00 |
| 29 | 710 | 740 | 23.667 | slide_whistle_down | slide whistle falling 1109 -> 294 Hz over 30 frames: he takes the metal slide | -7.0 | -13.0 | -26.5 | +0.00 |
| 30 | 780 |  | 26.000 | ting | triangle 'ting' (1175 Hz): the metal glints | -9.0 | -15.0 | -28.5 | +0.00 |
| 31 | 808 |  | 26.933 | twinkle | sparkle run of five tiny bells: a glint along the skin | -9.0 | -15.0 | -28.5 | +0.00 |
| 32 | 847 |  | 28.233 | pop | small bright pop: the magnifying glass | -8.0 | -14.0 | -27.5 | +0.00 |
| 33 | 868 |  | 28.933 | ting | triangle 'ting' (1175 Hz): the dime | -9.0 | -15.0 | -28.5 | +0.00 |
| 34 | 898 |  | 29.933 | zap | electric spark: the bolt lands on the nose | -7.0 | -13.0 | -26.5 | +0.00 |
| 35 | 940 |  | 31.333 | zip | 'zwip' pass-by: the glow runs along the outside | -7.0 | -13.0 | -26.5 | +0.00 |
| 36 | 982 |  | 32.733 | zap | electric spark: it jumps off the tail | -7.0 | -13.0 | -26.5 | +0.00 |
| 37 | 1000 |  | 33.333 | thunder | far thunder: and rolls away | -8.0 | -14.0 | -27.5 | +0.00 |
| 38 | 1017 | 1161 | 33.900 | amb_rain (bed) | rain: hiss and patter | -23.0 | -23.0 | -36.5 | +0.00 |
| 39 | 1041 |  | 34.700 | pop | small bright pop: the umbrella opens | -8.0 | -14.0 | -27.5 | +0.00 |
| 40 | 1098 |  | 36.600 | drip | water drop: water pours off the rim | -10.0 | -16.0 | -29.5 | +0.00 |
| 41 | 1121 |  | 37.367 | drip | water drop: and off the other side | -10.0 | -16.0 | -29.5 | +0.00 |
| 42 | 1144 |  | 38.133 | ding | friendly two-bell 'ding': dry: thumbs-up | -7.0 | -13.0 | -26.5 | +0.00 |
| 43 | 1186 |  | 39.533 | zip | 'zwip' pass-by: the arrow runs from nose to tail | -8.0 | -14.0 | -27.5 | +0.00 |
| 44 | 1231 |  | 41.033 | blip | blip at 990 Hz: the needle twitches: a few volts | -10.0 | -16.0 | -29.5 | +0.00 |
| 45 | 1262 |  | 42.067 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.5 | +0.00 |
| 46 | 1286 |  | 42.867 | beep | beep at 1318 Hz: the socket blinks | -9.0 | -15.0 | -28.5 | +0.00 |
| 47 | 1355 |  | 45.167 | zap | electric spark: first airliner | -7.0 | -13.0 | -26.5 | +0.00 |
| 48 | 1376 |  | 45.867 | zap | electric spark: second airliner | -7.0 | -13.0 | -26.5 | +0.00 |
| 49 | 1392 |  | 46.400 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.5 | +0.00 |
| 50 | 1421 |  | 47.367 | pop | small bright pop: ten little bolts | -8.0 | -14.0 | -27.5 | +0.00 |
| 51 | 1437 |  | 47.900 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.5 | +0.00 |
| 52 | 1458 |  | 48.600 | whoosh | quick whoosh (ease-out burst): the nose pokes into the charged cloud | -10.0 | -16.0 | -29.5 | +0.00 |
| 53 | 1489 |  | 49.633 | zap | electric spark: the plane sets it off | -7.0 | -13.0 | -26.5 | +0.00 |
| 54 | 1500 |  | 50.000 | thunder | far thunder: rumble | -8.0 | -14.0 | -27.5 | +0.00 |
| 55 | 1516 | 1965 | 50.533 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.5 | +0.00 |
| 56 | 1560 |  | 52.000 | twinkle | sparkle run of five tiny bells: safe | -9.0 | -15.0 | -28.5 | +0.00 |
| 57 | 1579 |  | 52.633 | gulp | cartoon gulp: Unluckily | -7.0 | -13.0 | -26.5 | +0.00 |
| 58 | 1614 |  | 53.800 | pop | small bright pop: the no-water sign | -8.0 | -14.0 | -27.5 | +0.00 |
| 59 | 1647 | 1716 | 54.900 | footsteps | 6 footsteps (soft ground): slippers on carpet | -11.0 | -17.0 | -30.5 | +0.00 |
| 60 | 1698 |  | 56.600 | squeak | rubber squeak: slippers | -8.0 | -14.0 | -27.5 | +0.00 |
| 61 | 1722 | 1758 | 57.400 | footsteps | 3 footsteps (soft ground): he shuffles to the bathroom | -11.0 | -17.0 | -30.5 | +0.00 |
| 62 | 1763 |  | 58.767 | power_up | power up: the charge builds as he reaches | -8.0 | -14.0 | -27.5 | +0.00 |
| 63 | 1797 |  | 59.900 | zap | electric spark: ZAP | -7.0 | -13.0 | -26.5 | +0.00 |
| 64 | 1808 |  | 60.267 | oof | 'ow': ow | -6.0 | -12.0 | -25.5 | +0.00 |
| 65 | 1844 |  | 61.467 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.5 | +0.00 |
| 66 | 1877 |  | 62.567 | sizzle | sizzle dying away: his fingertip smokes | -9.0 | -15.0 | -28.5 | +0.20 |
| 67 | 1922 |  | 64.067 | ting | triangle 'ting' (1175 Hz): the knob glints | -9.0 | -15.0 | -28.5 | +0.00 |
| 68 | 1939 |  | 64.633 | zap | electric spark: one more tiny spark | -10.0 | -16.0 | -29.5 | +0.00 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: impact_kick@97 -2.72 (snr 15.7), amb_drone@563 -2.04 (snr 9.5), thunder@1500 -2.50 (snr 11.0), footsteps@1647 -2.62 (snr 13.5)
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): thunder@254
- Files: `mix.wav` 3,144,000 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,144,000 samples, 48000 Hz, 2 ch, 24-bit, peak -0.48 dBFS, 0 clipped; `stem_music.wav` 3,144,000 samples, 48000 Hz, 2 ch, 24-bit, peak -9.27 dBFS, 0 clipped; `stem_sfx.wav` 3,144,000 samples, 48000 Hz, 2 ch, 24-bit, peak -7.94 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.43 LU, max momentary -9.32 LUFS. Stems minus mix: -126.7 dB.
- Event onsets in `stem_sfx.wav` (68 events, tolerance 1 frame): matched 68/68 within tolerance (largest error 0.53 frame, largest lag 35 samples); blind band-flux detector resolved 61 of them, 57 within tolerance (largest error 2.72 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): amb_wind@197, thunder@254, amb_drone@281, amb_drone@331, amb_wind@439, amb_rain@1017, amb_drone@1516.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **9.0 dB** over 53.17 s of speech (400 ms windows: median 7.77, 10th percentile 1.51, 90th 18.35 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-197, 563.1-645.9 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -67.9 dBFS, below 20 Hz -42.4 dB, above 12 kHz -45.2 dB of the total energy, centroid 813 Hz. Bands (dB of total): 0-20 Hz -42.4, 20-60 Hz -25.7, 60-300 Hz -3.7, 300-3000 Hz -3.1, 3000-8000 Hz -11.0, 8000-12000 Hz -24.3, 12000-16000 Hz -45.3, 16000-24000 Hz -68.0.
- Score landmarks: first sound at f196.98; 1 silence f0-197: -240.0 dBFS; 2 theme: onset at f196.98 (plan f197); 3 chase: onset at f311.9 (plan f312); 4 silence f563-646: -240.0 dBFS; 5 mystery: onset at f645.98 (plan f646); 6 waltz: onset at f1017.32 (plan f1017); 7 mystery: onset at f1160.9 (plan f1161); 8 theme: onset at f1305.98 (plan f1306); 9 bittersweet: onset at f1515.98 (plan f1516); 10 runup: onset at f1719.92 (plan f1720); 11 finale: onset at f1799.06 (plan f1799), button at f1954.88 (plan f1955); last 10 ms -77.4 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-197 | 16.15 | 18.69 | 11.38 |
| 2 theme | 197-312 | 6.98 | 5.42 | 2.83 |
| 3 chase a | 312-331 | 12.35 | 10.49 | 9.32 |
| 3 chase b | 331-454 | 8.9 | 7.12 | 1.71 |
| 3 chase c | 454-563 | 7.38 | 6.18 | 0.19 |
| 4 silence | 563-646 | 17.2 | 19.52 | 10.68 |
| 5 mystery | 646-1017 | 8.67 | 7.35 | 1.6 |
| 6 waltz | 1017-1161 | 8.11 | 5.99 | -0.27 |
| 7 mystery | 1161-1306 | 9.09 | 6.99 | 2.44 |
| 8 theme | 1306-1516 | 7.57 | 6.85 | -0.7 |
| 9 bittersweet | 1516-1720 | 9.49 | 7.93 | 3.04 |
| 10 runup | 1720-1799 | 8.65 | 7.25 | 1.43 |
| 11 finale | 1799-1965 | 8.11 | 6.1 | 2.6 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-194 | 16.15 | A lightning bolt five times hotter than the sun's surface just hit the |
| 2 | 197-308 | 6.98 | It's nine at night, two miles up in a storm cloud, and Gus is asleep. |
| 3 | 312-435 | 8.36 | Bang. A white flash. His wife screams. His neighbor throws both hands  |
| 4 | 439-559 | 9.03 | That bolt carries two thousand times the current that blows the fuse i |
| 5 | 563-643 | 17.2 | But wait. Nobody is hurt. So where did it all go? |
| 6 | 646-794 | 7.92 | You see, electricity is lazy. It takes the easy road, and nothing is e |
| 7 | 798-881 | 9.22 | The plane's skin is aluminum, no thicker than a dime. |
| 8 | 885-1013 | 9.13 | So the bolt lands on the nose, runs along the outside, and jumps off t |
| 9 | 1017-1158 | 8.11 | Ever stand under an umbrella in the rain? The water runs around you, a |
| 10 | 1161-1302 | 9.09 | Pushing all of it from nose to tail takes only a few volts. Less than  |
| 11 | 1306-1410 | 6.9 | And it's no accident. Every airliner gets hit about once a year. |
| 12 | 1414-1512 | 8.33 | Nine times out of ten, the plane sets the bolt off itself. |
| 13 | 1516-1575 | 7.79 | Luckily, the lightning can't get to Gus. |
| 14 | 1579-1716 | 10.49 | Unluckily, cabin air is bone dry, the floor is carpet, and Gus wears s |
| 15 | 1720-1795 | 8.65 | He shuffles to the bathroom and reaches for the knob. |
| 16 | 1799-1871 | 7.6 | Zap. That tiny spark is three thousand volts. |
| 17 | 1875-1949 | 8.57 | The lightning never touched him. The doorknob did. |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-197 | amb_wind | 0.08 | +0.08 | -1 | -0.1 | -0.10 | 18.6 | 0.99 |
| 1 | thunder | 1.0 | +0.00 | 2 | 0.92 | -0.08 | 24.6 | 1.00 |
| 4 | zap | 4.0 | +0.00 | 2 | 4.76 | +0.76 | 20.1 | 1.00 |
| 23 | pop | 23.0 | +0.00 | 1 | 22.94 | -0.06 | 17.8 | 1.00 |
| 45 | sizzle | 45.05 | +0.05 | 2 | 44.96 | -0.04 | 32.1 | 1.00 |
| 97 | impact_kick | 97.0 | +0.00 | 1 | 94.28 | -2.72 | 15.7 | 1.00 |
| 164 | pop | 164.0 | +0.00 | 1 | 163.88 | -0.12 | 22.5 | 1.00 |
| 181 | whoosh_big | 180.47 | -0.53 | 1 | 180.32 | -0.68 | 20.1 | 0.99 |
| 197 | flash_hit | 196.65 | -0.35 | 2 | 196.94 | -0.06 | 13.5 | 1.00 |
| 197-281 | amb_wind | 197.04 | +0.04 | 0 | - | - | 3.6 | 1.00 |
| 229 | whoosh | 229.0 | +0.00 | 2 | 229.1 | +0.10 | 9.4 | 1.00 |
| 254 | thunder | 254.43 | +0.43 | -8 | - | - | 4.4 | 1.00 |
| 281-331 | amb_drone | 281.28 | +0.28 | 0 | - | - | 2.8 | 0.95 |
| 310 | thunder | 310.0 | +0.00 | 2 | 309.92 | -0.08 | 22.5 | 0.63 |
| 331 | flash_hit | 330.65 | -0.35 | 2 | 331.04 | +0.04 | 11.1 | 1.00 |
| 331-439 | amb_drone | 331.04 | +0.04 | 0 | - | - | 3.9 | 1.00 |
| 358 | crowd_gasp | 358.12 | +0.12 | 2 | 358.1 | +0.10 | 6.9 | 1.00 |
| 419 | oof | 419.05 | +0.05 | 2 | 419.0 | +0.00 | 20.4 | 1.00 |
| 439-563 | amb_wind | 439.47 | +0.47 | -1 | - | - | 2.0 | 0.98 |
| 441 | zap | 441.0 | +0.00 | 2 | 440.9 | -0.10 | 51.1 | 1.00 |
| 468 | arrow_pop | 468.0 | +0.00 | 1 | 467.9 | -0.10 | 25.1 | 1.00 |
| 512 | glass_pop | 512.0 | +0.00 | 2 | 511.88 | -0.12 | 30.2 | 1.00 |
| 563 | record_stop | 563.0 | +0.00 | 2 | 562.88 | -0.12 | 24.7 | 1.00 |
| 563-646 | amb_drone | 563.02 | +0.02 | 1 | 560.96 | -2.04 | 9.5 | 1.00 |
| 597 | twinkle | 597.01 | +0.01 | 1 | 596.96 | -0.04 | 59.6 | 1.00 |
| 615 | question_blip | 615.01 | +0.01 | 1 | 614.96 | -0.04 | 29.8 | 1.00 |
| 656 | pop | 656.0 | +0.00 | 1 | 655.88 | -0.12 | 51.0 | 1.00 |
| 680 | power_down | 680.04 | +0.04 | 1 | 679.94 | -0.06 | 51.0 | 1.00 |
| 710-740 | slide_whistle_down | 710.02 | +0.02 | 1 | 709.94 | -0.06 | 70.9 | 1.00 |
| 780 | ting | 780.0 | +0.00 | 1 | 779.84 | -0.16 | 999.0 | 1.00 |
| 808 | twinkle | 808.01 | +0.01 | 2 | 807.86 | -0.14 | 999.0 | 1.00 |
| 847 | pop | 847.0 | +0.00 | 1 | 846.86 | -0.14 | 218.5 | 1.00 |
| 868 | ting | 868.0 | +0.00 | 1 | 867.86 | -0.14 | 999.0 | 1.00 |
| 898 | zap | 898.0 | +0.00 | 2 | 897.86 | -0.14 | 206.7 | 1.00 |
| 940 | zip | 939.48 | -0.52 | 1 | 939.38 | -0.62 | 31.3 | 1.00 |
| 982 | zap | 982.0 | +0.00 | 2 | 981.86 | -0.14 | 174.2 | 1.00 |
| 1000 | thunder | 1000.33 | +0.33 | -14 | 999.92 | -0.08 | 12.7 | 1.00 |
| 1017-1161 | amb_rain | 1017.11 | +0.11 | 2 | - | - | 3.0 | 1.00 |
| 1041 | pop | 1041.0 | +0.00 | 1 | 1040.96 | -0.04 | 23.4 | 1.00 |
| 1098 | drip | 1098.0 | +0.00 | 1 | 1097.9 | -0.10 | 35.4 | 1.00 |
| 1121 | drip | 1121.0 | +0.00 | 1 | 1120.94 | -0.06 | 37.8 | 1.00 |
| 1144 | ding | 1144.0 | +0.00 | 1 | 1143.92 | -0.08 | 75.6 | 1.00 |
| 1186 | zip | 1185.63 | -0.37 | 2 | 1185.56 | -0.44 | 39.6 | 1.00 |
| 1231 | blip | 1231.0 | +0.00 | 1 | 1230.86 | -0.14 | 632.8 | 1.00 |
| 1262 | arrow_pop | 1262.0 | +0.00 | 1 | 1261.88 | -0.12 | 100.7 | 1.00 |
| 1286 | beep | 1285.98 | -0.02 | -35 | 1285.88 | -0.12 | 999.0 | 1.00 |
| 1355 | zap | 1355.0 | +0.00 | 2 | 1354.82 | -0.18 | 999.0 | 1.00 |
| 1376 | zap | 1376.0 | +0.00 | 2 | 1375.88 | -0.12 | 122.3 | 1.00 |
| 1392 | arrow_pop | 1392.0 | +0.00 | 1 | 1391.9 | -0.10 | 39.1 | 1.00 |
| 1421 | pop | 1421.0 | +0.00 | 1 | 1420.88 | -0.12 | 64.8 | 1.00 |
| 1437 | flip_blip | 1437.01 | +0.01 | 1 | 1436.9 | -0.10 | 154.7 | 1.00 |
| 1458 | whoosh | 1457.91 | -0.09 | 2 | 1457.78 | -0.22 | 15.2 | 1.00 |
| 1489 | zap | 1489.0 | +0.00 | 2 | 1488.86 | -0.14 | 126.5 | 1.00 |
| 1500 | thunder | 1500.36 | +0.36 | -11 | 1497.5 | -2.50 | 11.0 | 1.00 |
| 1516-1965 | amb_drone | 1516.09 | +0.09 | 0 | - | - | 4.7 | 1.00 |
| 1560 | twinkle | 1560.01 | +0.01 | 1 | 1559.96 | -0.04 | 999.0 | 1.00 |
| 1579 | gulp | 1579.03 | +0.03 | -3 | 1579.04 | +0.04 | 13.6 | 1.00 |
| 1614 | pop | 1614.0 | +0.00 | 1 | 1613.9 | -0.10 | 22.3 | 1.00 |
| 1647-1716 | footsteps | 1647.0 | +0.00 | -22 | 1644.38 | -2.62 | 13.5 | 1.00 |
| 1698 | squeak | 1698.09 | +0.09 | 2 | 1698.14 | +0.14 | 12.3 | 1.00 |
| 1722-1758 | footsteps | 1721.99 | -0.01 | -19 | 1721.96 | -0.04 | 13.3 | 1.00 |
| 1763 | power_up | 1763.04 | +0.04 | 1 | 1763.24 | +0.24 | 10.5 | 1.00 |
| 1797 | zap | 1797.0 | +0.00 | 2 | 1796.84 | -0.16 | 43.9 | 1.00 |
| 1808 | oof | 1808.05 | +0.05 | 2 | 1807.94 | -0.06 | 16.9 | 1.00 |
| 1844 | arrow_pop | 1844.0 | +0.00 | 1 | 1843.94 | -0.06 | 24.1 | 1.00 |
| 1877 | sizzle | 1877.08 | +0.08 | 2 | 1877.06 | +0.06 | 26.9 | 1.00 |
| 1922 | ting | 1922.0 | +0.00 | 2 | 1921.88 | -0.12 | 160.1 | 1.00 |
| 1939 | zap | 1939.0 | +0.00 | 2 | 1938.92 | -0.08 | 36.5 | 1.00 |
