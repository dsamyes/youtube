# jump-on-a-cloud - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,177,600 samples = 1986 frames at 30 fps = 66.200 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.6 LU, max momentary -10.0 LUFS, max short-term -12.9 LUFS
- Stems: voice -14.3 LUFS, music -24.4 LUFS, sfx -29.6 LUFS (master gain +5.70 dB on everything; the voice file itself is -19.3 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 5.99 dB, active (>0.1 dB) on 27.29 % of samples, >0.5 dB on 13.26 %, >3 dB on 1.624 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -14.0 LUFS
    Threshold: -24.1 LUFS
  Loudness range:
    LRA:         1.6 LU
    Threshold: -34.1 LUFS
    LRA low:   -14.9 LUFS
    LRA high:  -13.3 LUFS
  True peak:
    Peak:       -1.2 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| 1 silence | 0-146 | -14.9 | - | -23.8 | -23.8 | 8.9 | 8.9 | 4.7 |
| 2 theme | 146-584 | -14.2 | -23.1 | -33.1 | -22.7 | 8.5 | 8.7 | 5.1 |
| 3 mystery | 584-765 | -14.3 | -25.6 | -31.8 | -24.7 | 10.3 | 10.2 | 6.9 |
| 4 chase a | 765-771 | -14.4 | -30.8 | -40.7 | -30.4 | 16.0 | 11.0 | 10.8 |
| 4 chase b | 771-938 | -14.1 | -23.7 | -31.8 | -23.1 | 9.0 | 9.7 | 4.6 |
| 4 chase c | 938-985 | -13.8 | -22.3 | -27.5 | -21.2 | 7.4 | 6.5 | 3.2 |
| 5 silence | 985-1036 | -13.8 | -67.4 | -29.7 | -29.7 | 15.9 | 18.8 | 12.3 |
| 6 mystery | 1036-1393 | -14.4 | -25.5 | -31.9 | -25.0 | 10.5 | 10.7 | 8.0 |
| 7 lullaby | 1393-1575 | -13.9 | -25.0 | -30.9 | -24.1 | 10.2 | 10.6 | 6.0 |
| 8 bittersweet | 1575-1807 | -14.2 | -25.3 | -32.0 | -24.7 | 10.5 | 10.4 | 7.2 |
| 9 runup | 1807-1872 | -15.5 | -24.7 | -32.9 | -24.1 | 8.5 | 10.9 | 4.2 |
| 10 finale | 1872-1986 | -14.3 | -23.5 | -32.5 | -23.0 | 8.6 | 9.0 | 6.8 |

## Music map (key G major, plan tempo 126 bpm, tune "hop", seed 1118)
The tune: `G- D E G- B A | A- E G F#- D | G A B- G E F# D | G-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 3 mystery -11.5, 4 chase a -11.0, 4 chase b -10.3, 4 chase c -9.5, 6 mystery -11.5, 7 lullaby -11.5, 8 bittersweet -11.5, 9 runup -9.5, 10 finale -9.5. Applied section gains (dB): 1 silence -8.6, 2 theme -8.6, 3 mystery -9.0, 4 chase a -6.5, 4 chase b -9.7, 4 chase c -11.7, 5 silence -9.2, 6 mystery -9.2, 7 lullaby -10.6, 8 bittersweet -9.3, 9 runup -13.0, 10 finale -12.4.

Rides (music only, dB): f762-778 -6.0 - a line stays on top of a busy bar, the band blooms again after it.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 146.0 | 4.87 | THEME: G major, swung, 131.5 bpm, 8 bars; clarinet tune, pizzicato boom-chick, brushes |
| 310.2 | 10.34 | theme bar 4: the tune lands on the home note, 'pom-pom' answer on beats 3 and 4 |
| 365.0 | 12.17 | second statement: tune doubled by marimba and glockenspiel |
| 556.6 | 18.55 | stop chord (dominant seventh): the band leaves the next two beats to the sound effects, vibes ring |
| 584.0 | 19.47 | MYSTERY: the tune at half speed in E minor (vibes), tick-tock woodblock + pizzicato, 159 bpm felt in two; soft |
| 674.5 | 22.48 | answering phrase a step higher |
| 719.8 | 23.99 | half cadence: the tick-tock slows and stops |
| 765.0 | 25.50 | CHASE OSTINATO: the tune's head as running eighths (marimba), 1200 bpm and accelerating over 5 bars, climbing from G major |
| 771.0 | 25.70 | accent downbeat (bar 2): timpani + cymbal; 121 bpm, bass on every beat, xylophone doubles the ostinato |
| 938.0 | 31.27 | accent downbeat (bar 5): timpani + cymbal; 153 bpm, running bass, glock on top, soft brass swells |
| 938.0 | 31.27 | last bar: dominant seventh, 153 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 985.0 | 32.83 | (no music: silence) |
| 1036.0 | 34.53 | MYSTERY: the tune at half speed in E minor (vibes), tick-tock woodblock + pizzicato, 161 bpm felt in two; soft |
| 1303.8 | 43.46 | answering phrase a step higher |
| 1348.4 | 44.95 | half cadence: the tick-tock slows and stops |
| 1393.0 | 46.43 | LULLABY: the tune rocking in 6/8, Eb major (the home note is its third), music box + harp + warm pad, 59 dotted-quarters a minute |
| 1514.3 | 50.48 | last bar climbs to an unresolved second (a rising slide whistle can aim for the same note) |
| 1575.0 | 52.50 | BITTERSWEET, sweet: the head of the tune in Eb major (music box, harp), ending on a rolled chord |
| 1702.0 | 56.73 | the same phrase again ... |
| 1726.0 | 57.53 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1807.0 | 60.23 | RUN-UP: the ostinato on the dominant seventh, 215 bpm and accelerating, 2 bars up into the next section |
| 1872.0 | 62.40 | FINALE: the tune comes home, G major, warm and a little faster (173.1 bpm): clarinet + glock + marimba, soft horns, pad |
| 1955.2 | 65.17 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 1976.0 | 65.87 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.3 LUFS integrated). Reverb by place: cloud = void, garden = open, sky = open. Dead cuts (everything that sounded before them stops): f146, f985.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 146 | 0.000 | wind_rush (bed) | falling rush under the hook, rising into the flash (noise band + faint whistle + flutter, follows the speed) | -8.5 | -8.5 | -22.1 | +0.00 |
| 2 | 37 |  | 1.233 | whoosh | quick whoosh (ease-out burst): he goes into the cloud top, no bounce | -10.0 | -16.0 | -29.6 | +0.00 |
| 3 | 80 |  | 2.667 | zip | 'zwip' pass-by: he drops out of the cloud's belly | -7.0 | -13.0 | -26.6 | +0.00 |
| 4 | 131 |  | 4.367 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): rush before the flash | -2.0 | -8.0 | -21.6 | +0.00 |
| 5 | 146 | 302 | 4.867 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 6 | 146 |  | 4.867 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.6 | +0.00 |
| 7 | 175 |  | 5.833 | bird_tweet | bird chirps: birds cross the sky | -11.0 | -17.0 | -30.6 | +0.20 |
| 8 | 208 | 240 | 6.933 | swing_creak | ropes creak in rhythm: 2 creaks at f208, 226 | -9.0 | -15.0 | -28.6 | +0.15 |
| 9 | 283 |  | 9.433 | twinkle | sparkle run of five tiny bells: a glint on the fat little cloud | -9.0 | -15.0 | -28.6 | +0.00 |
| 10 | 313 |  | 10.433 | pop | small bright pop: a pillow pops onto the cloud | -8.0 | -14.0 | -27.6 | +0.00 |
| 11 | 328 |  | 10.933 | pop | small bright pop: a blanket pops onto the cloud | -8.0 | -14.0 | -27.6 | +0.00 |
| 12 | 343 |  | 11.433 | ding | friendly two-bell 'ding': sparkle: the softest bed in the world | -7.0 | -13.0 | -26.6 | +0.00 |
| 13 | 357 | 508 | 11.900 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 14 | 389 |  | 12.967 | whoosh | quick whoosh (ease-out burst): his wife waves the idea away | -10.0 | -16.0 | -29.6 | +0.00 |
| 15 | 440 |  | 14.667 | boing | spring 'boing': the neighbor bobs behind his fence: he'll bounce | -5.0 | -11.0 | -24.6 | +0.00 |
| 16 | 482 |  | 16.067 | click | click: the parachute harness snaps on | -11.0 | -17.0 | -30.6 | +0.00 |
| 17 | 496 |  | 16.533 | click | click: he tugs the straps tight | -11.0 | -17.0 | -30.6 | +0.00 |
| 18 | 508 | 823 | 16.933 | amb_wind (bed) | wind: gusts with a wandering howl | -22.0 | -22.0 | -35.6 | +0.00 |
| 19 | 512 |  | 17.067 | flame_poof | 'fwoomp' + flutter + crackle: the balloon's burner | -6.0 | -12.0 | -25.6 | +0.20 |
| 20 | 545 | 578 | 18.167 | slide_whistle_up_slowing | slide whistle rising 587 -> 1568 Hz, slower and slower, fading to nothing by f578 | -9.0 | -15.0 | -28.6 | +0.00 |
| 21 | 616 |  | 20.533 | knock | 2 knocks on wood: he raps on the cloud: it looks solid | -7.0 | -13.0 | -26.6 | +0.00 |
| 22 | 658 |  | 21.933 | thud | heavy soft thud: the 500 weight lands on the cloud | -5.0 | -11.0 | -24.6 | +0.00 |
| 23 | 728 |  | 24.267 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 24 | 736 |  | 24.533 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 25 | 744 |  | 24.800 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 26 | 771 |  | 25.700 | jump_boing | spring 'boing': Gus jumps off the basket | -5.0 | -11.0 | -24.6 | +0.00 |
| 27 | 781 | 800 | 26.033 | slide_whistle_down | slide whistle falling 1480 -> 392 Hz over 19 frames: he drops to the cloud top | -7.0 | -13.0 | -26.6 | +0.00 |
| 28 | 800 |  | 26.667 | whoosh | quick whoosh (ease-out burst): into the cloud like into nothing | -10.0 | -16.0 | -29.6 | +0.00 |
| 29 | 823 | 985 | 27.433 | wind_rush (bed) | rush: pitch and level rise to f943, then hold (noise band + faint whistle + flutter, follows the speed) | -16.0 | -16.0 | -29.6 | +0.00 |
| 30 | 898 |  | 29.933 | pop | small bright pop: a stopwatch pops in | -8.0 | -14.0 | -27.6 | +0.00 |
| 31 | 904 | 938 | 30.133 | timer_ticks | egg timer: 11 tick-tocks, one every 3.4 frames, last one on f938 | -14.0 | -20.0 | -33.6 | -0.15 |
| 32 | 938 |  | 31.267 | timer_ding | kitchen-timer bell, rings about 1 s: time is up: through the cloud | -4.0 | -10.0 | -23.6 | -0.15 |
| 33 | 985 | 1040 | 32.833 | amb_wind (bed) | wind: gusts with a wandering howl | -27.0 | -27.0 | -40.6 | +0.00 |
| 34 | 985 |  | 32.833 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.6 | +0.00 |
| 35 | 998 |  | 33.267 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.6 | +0.00 |
| 36 | 1036 |  | 34.533 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): the lens pulls far back: the cloud is huge | -2.0 | -8.0 | -21.6 | +0.00 |
| 37 | 1095 |  | 36.500 | paper_flick | paper flaps + board knock: a fridge-sized piece is cut out | -11.0 | -17.0 | -30.6 | +0.00 |
| 38 | 1125 |  | 37.500 | thud | heavy soft thud: the fridge stands there | -8.0 | -14.0 | -27.6 | +0.00 |
| 39 | 1156 |  | 38.533 | drip | water drop: ten drops, first row | -10.0 | -16.0 | -29.6 | +0.00 |
| 40 | 1166 |  | 38.867 | drip | water drop: ten drops | -10.0 | -16.0 | -29.6 | +0.00 |
| 41 | 1177 |  | 39.233 | drip | water drop: ten drops, last one | -10.0 | -16.0 | -29.6 | +0.00 |
| 42 | 1195 | 1212 | 39.833 | door_creak | door creak: the fridge door opens: air | -9.0 | -15.0 | -28.6 | +0.00 |
| 43 | 1241 |  | 41.367 | pop | small bright pop: one droplet | -8.0 | -14.0 | -27.6 | +0.00 |
| 44 | 1288 | 1336 | 42.933 | slide_whistle_down | slide whistle falling 1480 -> 392 Hz over 48 frames: it sinks, very slowly | -11.0 | -17.0 | -30.6 | +0.00 |
| 45 | 1342 |  | 44.733 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 46 | 1383 |  | 46.100 | ting | triangle 'ting' (1568 Hz): it hangs in the air | -9.0 | -15.0 | -28.6 | +0.00 |
| 47 | 1389 | 1480 | 46.300 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 48 | 1397 | 1412 | 46.567 | footsteps | 1 footsteps (soft ground): Gus feels his way through the fog | -11.0 | -17.0 | -30.6 | +0.00 |
| 49 | 1456 |  | 48.533 | thud | heavy soft thud: the cloud sits down on the lawn | -5.0 | -11.0 | -24.6 | +0.00 |
| 50 | 1480 | 1606 | 49.333 | wind_rush (bed) | rush up to top speed and down again (noise band + faint whistle + flutter, follows the speed) | -18.0 | -18.0 | -31.6 | +0.00 |
| 51 | 1541 |  | 51.367 | pop | small bright pop: one cup of water | -8.0 | -14.0 | -27.6 | +0.00 |
| 52 | 1555 |  | 51.833 | splash | plop + bubbles: the cup empties onto his helmet | -5.0 | -11.0 | -24.6 | +0.00 |
| 53 | 1606 |  | 53.533 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): the parachute opens | -5.0 | -11.0 | -24.6 | +0.00 |
| 54 | 1623 | 1702 | 54.100 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 55 | 1650 |  | 55.000 | thud | heavy soft thud: he lands on his lawn | -5.0 | -11.0 | -24.6 | +0.00 |
| 56 | 1684 |  | 56.133 | drip | water drop: one drop falls off his helmet: barely damp | -10.0 | -16.0 | -29.6 | +0.00 |
| 57 | 1724 |  | 57.467 | twinkle | sparkle run of five tiny bells: a million droplets | -9.0 | -15.0 | -28.6 | +0.00 |
| 58 | 1763 |  | 58.767 | zip | 'zwip' pass-by: they rush together | -8.0 | -14.0 | -27.6 | +0.00 |
| 59 | 1777 |  | 59.233 | pop | small bright pop: one raindrop | -8.0 | -14.0 | -27.6 | +0.00 |
| 60 | 1803 | 1905 | 60.100 | amb_garden_evening (bed) | evening garden: soft breeze, blackbird phrases, crickets | -25.0 | -25.0 | -38.6 | +0.00 |
| 61 | 1831 |  | 61.033 | thunder | far thunder: the cloud has grown dark | -8.0 | -14.0 | -27.6 | +0.00 |
| 62 | 1897 |  | 63.233 | drip | water drop: the first drop taps his helmet | -10.0 | -16.0 | -29.6 | +0.00 |
| 63 | 1905 | 1986 | 63.500 | amb_rain (bed) | rain: hiss and patter | -23.0 | -23.0 | -36.6 | +0.00 |
| 64 | 1927 |  | 64.233 | pop | small bright pop: his wife opens her umbrella just in time | -8.0 | -14.0 | -27.6 | +0.00 |
| 65 | 1940 |  | 64.667 | splash | big splash: thump, slap, bubble cloud, spray: the cloud lands on Gus | -6.0 | -12.0 | -25.6 | +0.00 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: bird_tweet@175 -2.96 (snr 73.2), slide_whistle_up_slowing@545 -1.68 (snr 14.3)
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): zip@80, whoosh_big@131, thunder@1831
- Files: `mix.wav` 3,177,600 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,177,600 samples, 48000 Hz, 2 ch, 24-bit, peak -0.4 dBFS, 0 clipped; `stem_music.wav` 3,177,600 samples, 48000 Hz, 2 ch, 24-bit, peak -9.55 dBFS, 0 clipped; `stem_sfx.wav` 3,177,600 samples, 48000 Hz, 2 ch, 24-bit, peak -7.32 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.59 LU, max momentary -10.01 LUFS. Stems minus mix: -126.6 dB.
- Event onsets in `stem_sfx.wav` (65 events, tolerance 1 frame): matched 65/65 within tolerance (largest error 0.57 frame, largest lag 93 samples); blind band-flux detector resolved 56 of them, 54 within tolerance (largest error 2.96 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): zip@80, whoosh_big@131, amb_garden@146, amb_wind@508, wind_rush@823, wind_rush@1480, amb_garden@1623, thunder@1831, amb_rain@1905.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **8.39 dB** over 53.28 s of speech (400 ms windows: median 7.55, 10th percentile 1.03, 90th 12.51 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-146, 985.1-1035.9 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -67.6 dBFS, below 20 Hz -40.5 dB, above 12 kHz -45.5 dB of the total energy, centroid 813 Hz. Bands (dB of total): 0-20 Hz -40.5, 20-60 Hz -29.9, 60-300 Hz -3.7, 300-3000 Hz -3.0, 3000-8000 Hz -11.3, 8000-12000 Hz -24.3, 12000-16000 Hz -45.5, 16000-24000 Hz -68.3.
- Score landmarks: first sound at f145.97; 1 silence f0-146: -240.0 dBFS; 2 theme: onset at f145.97 (plan f146); 3 mystery: onset at f583.88 (plan f584); 4 chase: onset at f764.96 (plan f765); 5 silence f985-1036: -240.0 dBFS; 6 mystery: onset at f1035.97 (plan f1036); 7 lullaby: onset at f1392.86 (plan f1393); 8 bittersweet: onset at f1574.9 (plan f1575); 9 runup: onset at f1806.92 (plan f1807); 10 finale: onset at f1872.02 (plan f1872), button at f1975.82 (plan f1976); last 10 ms -81.4 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-146 | 7.39 | 6.76 | -0.5 |
| 2 theme | 146-584 | 7.19 | 6.48 | 0.67 |
| 3 mystery | 584-765 | 8.67 | 7.31 | 2.21 |
| 4 chase b | 771-938 | 8.24 | 7.63 | -0.06 |
| 4 chase c | 938-985 | 7.63 | 8.29 | -2.93 |
| 5 silence | 985-1036 | 15.21 | 16.08 | 9.76 |
| 6 mystery | 1036-1393 | 8.75 | 8.11 | 1.97 |
| 7 lullaby | 1393-1575 | 9.86 | 8.72 | 1.84 |
| 8 bittersweet | 1575-1807 | 9.13 | 7.34 | 3.18 |
| 9 runup | 1807-1872 | 7.76 | 3.96 | 0.37 |
| 10 finale | 1872-1986 | 8.43 | 7.89 | 2.61 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-143 | 7.39 | A cloud weighs more than a million pounds and it can't hold up one man |
| 2 | 146-295 | 7.36 | It's two on a Sunday afternoon and Gus lies in his garden staring at a |
| 3 | 298-357 | 9.46 | It looks like the softest bed in the world. |
| 4 | 361-456 | 6.35 | His wife says it's just fog and his neighbor bets he'll bounce. |
| 5 | 460-580 | 6.79 | So Gus puts on a parachute, borrows a balloon and rides up above the c |
| 6 | 584-762 | 8.67 | Up close the cloud looks solid. It holds five hundred tons of water, a |
| 7 | 765-788 | 11.22 | Gus jumps. |
| 8 | 792-861 | 9.64 | He doesn't bounce. He doesn't even slow down. |
| 9 | 865-981 | 7.2 | He falls through the whole thing in twenty-two seconds and all he sees |
| 10 | 985-1033 | 15.21 | So where are the hundred elephants? |
| 11 | 1036-1191 | 8.61 | You see, a cloud is huge. A piece the size of your fridge holds just t |
| 12 | 1195-1390 | 8.87 | The rest is air. Each droplet is so tiny that it sinks half an inch a  |
| 13 | 1393-1476 | 11.14 | Ever walked through fog? That's a cloud that sat down. |
| 14 | 1480-1571 | 8.87 | In his whole fall Gus runs into one cup of water. |
| 15 | 1575-1698 | 8.51 | Luckily, his parachute opens and he lands in his own garden, barely da |
| 16 | 1702-1869 | 9.22 | Unluckily a million of those droplets make one raindrop and by evening |
| 17 | 1872-1970 | 8.43 | Gus couldn't land on the cloud. So the cloud lands on Gus. |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-146 | wind_rush | 0.07 | +0.07 | 1 | -0.1 | -0.10 | 20.5 | 0.98 |
| 37 | whoosh | 36.9 | -0.10 | 2 | 37.1 | +0.10 | 8.2 | 1.00 |
| 80 | zip | 79.43 | -0.57 | 2 | - | - | 4.6 | 1.00 |
| 131 | whoosh_big | 130.46 | -0.54 | 1 | - | - | 4.0 | 0.98 |
| 146 | flash_hit | 145.65 | -0.35 | 2 | 146.06 | +0.06 | 9.2 | 1.00 |
| 146-302 | amb_garden | 146.05 | +0.05 | 1 | - | - | 2.8 | 1.00 |
| 175 | bird_tweet | 175.25 | +0.25 | 2 | 172.04 | -2.96 | 73.2 | 1.00 |
| 208-240 | swing_creak | 208.0 | +0.00 | 1 | 207.92 | -0.08 | 23.6 | 1.00 |
| 283 | twinkle | 283.01 | +0.01 | 2 | 282.92 | -0.08 | 999.0 | 1.00 |
| 313 | pop | 313.0 | +0.00 | 1 | 312.86 | -0.14 | 200.6 | 1.00 |
| 328 | pop | 328.0 | +0.00 | 1 | 327.86 | -0.14 | 999.0 | 1.00 |
| 343 | ding | 343.0 | +0.00 | 1 | 342.86 | -0.14 | 999.0 | 1.00 |
| 357-508 | amb_garden | 357.2 | +0.20 | 1 | 356.96 | -0.04 | 23.0 | 1.00 |
| 389 | whoosh | 389.06 | +0.06 | 2 | 389.0 | +0.00 | 10.0 | 1.00 |
| 440 | boing | 440.04 | +0.04 | 1 | 440.0 | +0.00 | 10.2 | 1.00 |
| 482 | click | 482.0 | +0.00 | 1 | 481.88 | -0.12 | 29.1 | 1.00 |
| 496 | click | 496.0 | +0.00 | 2 | 495.92 | -0.08 | 24.9 | 1.00 |
| 508-823 | amb_wind | 508.05 | +0.05 | -2 | - | - | 3.6 | 1.00 |
| 512 | flame_poof | 512.02 | +0.02 | 1 | 512.0 | +0.00 | 6.7 | 1.00 |
| 545-578 | slide_whistle_up_slowing | 545.03 | +0.03 | 1 | 543.32 | -1.68 | 14.3 | 1.00 |
| 616 | knock | 616.01 | +0.01 | 0 | 615.98 | -0.02 | 13.9 | 1.00 |
| 658 | thud | 658.0 | +0.00 | 2 | 657.86 | -0.14 | 16.9 | 1.00 |
| 728 | arrow_pop | 728.0 | +0.00 | 1 | 727.88 | -0.12 | 24.5 | 1.00 |
| 736 | arrow_pop | 736.0 | +0.00 | 1 | 735.92 | -0.08 | 24.6 | 1.00 |
| 744 | arrow_pop | 744.0 | +0.00 | 1 | 743.9 | -0.10 | 27.0 | 1.00 |
| 771 | jump_boing | 771.03 | +0.03 | 1 | 770.96 | -0.04 | 9.1 | 1.00 |
| 781-800 | slide_whistle_down | 781.02 | +0.02 | 1 | 781.04 | +0.04 | 27.2 | 1.00 |
| 800 | whoosh | 800.07 | +0.07 | 2 | 800.06 | +0.06 | 13.8 | 1.00 |
| 823-985 | wind_rush | 823.08 | +0.08 | 1 | - | - | 3.5 | 0.97 |
| 898 | pop | 898.0 | +0.00 | 1 | 897.98 | -0.02 | 9.3 | 1.00 |
| 904-938 | timer_ticks | 904.0 | +0.00 | 1 | 903.86 | -0.14 | 19.3 | 1.00 |
| 938 | timer_ding | 938.06 | +0.06 | 93 | 937.94 | -0.06 | 24.1 | 1.00 |
| 985 | record_stop | 985.0 | +0.00 | 2 | 984.92 | -0.08 | 16.2 | 1.00 |
| 985-1040 | amb_wind | 985.42 | +0.42 | 1 | 984.98 | -0.02 | 9.3 | 1.00 |
| 998 | question_blip | 998.01 | +0.01 | 1 | 997.94 | -0.06 | 31.3 | 1.00 |
| 1036 | whoosh_big | 1035.46 | -0.54 | 1 | 1035.32 | -0.68 | 41.3 | 1.00 |
| 1095 | paper_flick | 1095.0 | +0.00 | 2 | 1094.84 | -0.16 | 999.0 | 1.00 |
| 1125 | thud | 1125.0 | +0.00 | 2 | 1124.84 | -0.16 | 999.0 | 1.00 |
| 1156 | drip | 1156.0 | +0.00 | 1 | 1155.86 | -0.14 | 999.0 | 1.00 |
| 1166 | drip | 1166.0 | +0.00 | 1 | 1165.88 | -0.12 | 999.0 | 1.00 |
| 1177 | drip | 1177.0 | +0.00 | 1 | 1176.86 | -0.14 | 610.5 | 1.00 |
| 1195-1212 | door_creak | 1195.07 | +0.07 | 2 | 1194.92 | -0.08 | 73.6 | 1.00 |
| 1241 | pop | 1241.0 | +0.00 | 1 | 1240.88 | -0.12 | 999.0 | 1.00 |
| 1288-1336 | slide_whistle_down | 1288.02 | +0.02 | 1 | 1287.92 | -0.08 | 999.0 | 1.00 |
| 1342 | arrow_pop | 1342.0 | +0.00 | 1 | 1341.86 | -0.14 | 297.3 | 1.00 |
| 1383 | ting | 1383.0 | +0.00 | 2 | 1382.84 | -0.16 | 999.0 | 1.00 |
| 1389-1480 | amb_garden | 1389.02 | +0.02 | 1 | 1388.9 | -0.10 | 51.3 | 1.00 |
| 1397-1412 | footsteps | 1396.99 | -0.01 | -18 | 1396.94 | -0.06 | 999.0 | 1.00 |
| 1456 | thud | 1456.0 | +0.00 | 2 | 1455.92 | -0.08 | 14.4 | 1.00 |
| 1480-1606 | wind_rush | 1480.08 | +0.08 | 1 | - | - | 4.7 | 1.00 |
| 1541 | pop | 1541.0 | +0.00 | 1 | 1541.06 | +0.06 | 10.6 | 1.00 |
| 1555 | splash | 1555.01 | +0.00 | 1 | 1554.92 | -0.08 | 19.4 | 1.00 |
| 1606 | whoosh_big | 1605.48 | -0.52 | 1 | 1605.32 | -0.68 | 37.5 | 1.00 |
| 1623-1702 | amb_garden | 1623.14 | +0.14 | 1 | - | - | 4.8 | 1.00 |
| 1650 | thud | 1650.0 | +0.00 | 2 | 1649.9 | -0.10 | 16.9 | 1.00 |
| 1684 | drip | 1684.0 | +0.00 | 1 | 1683.92 | -0.08 | 86.5 | 1.00 |
| 1724 | twinkle | 1724.0 | +0.00 | 2 | 1723.88 | -0.12 | 999.0 | 1.00 |
| 1763 | zip | 1762.55 | -0.45 | 2 | 1762.34 | -0.66 | 815.2 | 1.00 |
| 1777 | pop | 1777.0 | +0.00 | 1 | 1776.86 | -0.14 | 999.0 | 1.00 |
| 1803-1905 | amb_garden_evening | 1803.07 | +0.07 | 1 | 1802.96 | -0.04 | 34.0 | 1.00 |
| 1831 | thunder | 1831.26 | +0.26 | -11 | - | - | 3.8 | 1.00 |
| 1897 | drip | 1897.0 | +0.00 | 1 | 1896.92 | -0.08 | 48.7 | 1.00 |
| 1905-1986 | amb_rain | 1905.03 | +0.03 | 2 | - | - | 4.7 | 1.00 |
| 1927 | pop | 1927.0 | +0.00 | 1 | 1926.92 | -0.08 | 20.8 | 1.00 |
| 1940 | splash | 1940.0 | +0.00 | 2 | 1939.94 | -0.06 | 9.2 | 1.00 |
