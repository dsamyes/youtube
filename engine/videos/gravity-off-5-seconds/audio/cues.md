# gravity-off-5-seconds - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,275,200 samples = 2047 frames at 30 fps = 68.233 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.5 LU, max momentary -9.4 LUFS, max short-term -12.9 LUFS
- Stems: voice -14.4 LUFS, music -24.6 LUFS, sfx -29.0 LUFS (master gain +6.55 dB on everything; the voice file itself is -20.1 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 7.31 dB, active (>0.1 dB) on 25.17 % of samples, >0.5 dB on 13.26 %, >3 dB on 2.010 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -14.0 LUFS
    Threshold: -24.1 LUFS
  Loudness range:
    LRA:         1.5 LU
    Threshold: -34.1 LUFS
    LRA low:   -14.8 LUFS
    LRA high:  -13.3 LUFS
  True peak:
    Peak:       -1.2 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| 1 silence | 0-161 | -14.2 | - | -23.9 | -23.9 | 9.6 | 11.1 | 2.5 |
| 2 theme | 161-308 | -13.9 | -22.7 | -32.8 | -22.3 | 8.4 | 8.5 | 5.4 |
| 3 silence | 308-331 | -15.2 | - | -31.7 | -31.7 | 16.5 | 15.1 | 12.7 |
| 4 lullaby | 331-592 | -14.7 | -26.0 | -31.5 | -25.0 | 10.3 | 10.2 | 6.6 |
| 5 waltz | 592-794 | -14.5 | -25.0 | -33.0 | -24.4 | 9.9 | 9.6 | 7.1 |
| 6 chase a | 794-838 | -13.6 | -23.1 | -36.5 | -22.9 | 9.3 | 8.1 | 5.3 |
| 6 chase b | 838-883 | -15.3 | -23.3 | -29.4 | -22.3 | 7.0 | 7.8 | 5.2 |
| 6 chase c | 883-966 | -13.9 | -23.0 | -32.4 | -22.5 | 8.6 | 7.6 | 5.1 |
| 7 silence | 966-976 | -31.2 | -44.5 | -24.6 | -24.5 | -6.7 | 3.1 | 0.0 |
| 8 mystery | 976-1242 | -14.0 | -25.0 | -32.2 | -24.4 | 10.4 | 10.8 | 6.1 |
| 9 chase a | 1242-1335 | -15.0 | -25.6 | -29.6 | -24.2 | 9.2 | 8.5 | 5.1 |
| 9 chase b | 1335-1377 | -12.4 | -21.7 | -37.1 | -21.6 | 9.2 | 7.7 | 5.8 |
| 9 chase c | 1377-1411 | -17.1 | -26.3 | -31.8 | -26.0 | 8.9 | 7.8 | 6.2 |
| 10 waltz | 1411-1555 | -14.4 | -25.0 | -30.4 | -24.2 | 9.8 | 9.8 | 4.6 |
| 11 lullaby | 1555-1677 | -13.5 | -24.2 | -29.3 | -23.0 | 9.6 | 8.7 | 4.8 |
| 12 bittersweet | 1677-1869 | -14.7 | -26.0 | -30.9 | -25.0 | 10.2 | 10.4 | 6.7 |
| 13 finale | 1869-2047 | -14.5 | -23.4 | -29.3 | -22.6 | 8.2 | 8.3 | 5.8 |

## Music map (key G major, plan tempo 126 bpm, tune "hop", seed 2311)
The tune: `G- D E G- B A | A- E G F#- D | G A B- G E F# D | G-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 4 lullaby -11.5, 5 waltz -11.0, 6 chase a -11.0, 6 chase b -10.3, 6 chase c -9.5, 8 mystery -11.5, 9 chase a -11.0, 9 chase b -10.3, 9 chase c -9.5, 10 waltz -11.0, 11 lullaby -11.5, 12 bittersweet -11.5, 13 finale -9.5. Applied section gains (dB): 1 silence -8.9, 2 theme -8.9, 3 silence -10.4, 4 lullaby -10.4, 5 waltz -10.9, 6 chase a -7.2, 6 chase b -9.8, 6 chase c -13.2, 7 silence -10.0, 8 mystery -10.0, 9 chase a -10.7, 9 chase b -9.3, 9 chase c -18.5, 10 waltz -10.3, 11 lullaby -8.2, 12 bittersweet -9.9, 13 finale -11.8.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 161.0 | 5.37 | THEME: G major, swung, 146.9 bpm, 3 bars; clarinet tune, pizzicato boom-chick, brushes |
| 283.5 | 9.45 | stop chord (dominant seventh): the band leaves the next two beats to the sound effects, vibes ring |
| 308.0 | 10.27 | (no music: silence) |
| 331.0 | 11.03 | LULLABY: the tune rocking in 6/8, Eb major (the home note is its third), music box + harp + warm pad, 55 dotted-quarters a minute |
| 526.8 | 17.56 | last bar climbs to an unresolved second (a rising slide whistle can aim for the same note) |
| 592.0 | 19.73 | WALTZ: music box in G major, 194 bpm, pick-up on f595, downbeats at f609, f637, f664, f692, low point f720 |
| 692.2 | 23.07 | the tune steps down do-la-fa into |
| 720.0 | 24.00 | the low point (low home note); then the arpeggio climbs, slower and slower, to the rest |
| 784.0 | 26.13 | the rest: the high home note rings, everything else waits |
| 794.0 | 26.47 | CHASE OSTINATO: the tune's head as running eighths (marimba), 164 bpm and accelerating over 4 bars, climbing from G major |
| 838.0 | 27.93 | accent downbeat (bar 2): timpani + cymbal; 159 bpm, bass on every beat, xylophone doubles the ostinato |
| 926.0 | 30.87 | last bar: dominant seventh, 180 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 966.0 | 32.20 | (no music: silence) |
| 976.0 | 32.53 | MYSTERY: the tune at half speed in E minor (vibes), tick-tock woodblock + pizzicato, 108 bpm felt in two; soft |
| 1109.0 | 36.97 | answering phrase a step higher |
| 1175.5 | 39.18 | half cadence: the tick-tock slows and stops |
| 1242.0 | 41.40 | CHASE OSTINATO: the tune's head as running eighths (marimba), 150 bpm and accelerating over 4 bars, climbing from G major |
| 1377.0 | 45.90 | accent downbeat (bar 4): timpani + cymbal; 212 bpm, running bass, glock on top, soft brass swells |
| 1377.0 | 45.90 | last bar: dominant seventh, 212 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 1411.0 | 47.03 | WALTZ: music box in G major, 153 bpm, pick-up on f1414, downbeats at f1432, f1467, low point f1502 |
| 1466.8 | 48.89 | the tune steps down do-la-fa into |
| 1502.0 | 50.07 | the low point (low home note); then the arpeggio climbs, slower and slower, to the rest |
| 1545.0 | 51.50 | the rest: the high home note rings, everything else waits |
| 1555.0 | 51.83 | LULLABY: the tune rocking in 6/8, Eb major (the home note is its third), music box + harp + warm pad, 59 dotted-quarters a minute |
| 1616.0 | 53.87 | last bar climbs to an unresolved second (a rising slide whistle can aim for the same note) |
| 1677.0 | 55.90 | BITTERSWEET, sweet: the head of the tune in Eb major (music box, harp), ending on a rolled chord |
| 1805.0 | 60.17 | the same phrase again ... |
| 1825.0 | 60.83 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1869.0 | 62.30 | FINALE: the tune comes home, G major, warm and a little faster (150.0 bpm): clarinet + glock + marimba, soft horns, pad |
| 2013.0 | 67.10 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 2037.0 | 67.90 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.4 LUFS integrated). Reverb by place: garden = open, sky = void. Dead cuts (everything that sounded before them stops): f161, f966.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 161 | 0.000 | wind_rush (bed) | falling rush under the hook, rising into the flash (noise band + faint whistle + flutter, follows the speed) | -8.5 | -8.5 | -22.1 | +0.00 |
| 2 | 146 |  | 4.867 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): rush before the flash | -2.0 | -8.0 | -21.6 | +0.00 |
| 3 | 161 | 911 | 5.367 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 4 | 161 |  | 5.367 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.6 | +0.00 |
| 5 | 176 |  | 5.867 | bird_tweet | bird chirps: a sparrow | -11.0 | -17.0 | -30.6 | +0.20 |
| 6 | 228 |  | 7.600 | whoosh | quick whoosh (ease-out burst): he flips the pancake | -10.0 | -16.0 | -29.6 | +0.00 |
| 7 | 244 |  | 8.133 | splat | wet splat: slap + squelch + glops + thud (it slaps back into the pan) | -11.0 | -17.0 | -30.6 | -0.10 |
| 8 | 258 |  | 8.600 | sizzle | sizzle dying away: the pan sizzles | -12.0 | -18.0 | -31.6 | +0.20 |
| 9 | 284 |  | 9.467 | pop | small bright pop: a stopwatch pops in | -8.0 | -14.0 | -27.6 | +0.00 |
| 10 | 295 |  | 9.833 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 11 | 308 |  | 10.267 | click | click: the stopwatch starts: gravity is off | -11.0 | -17.0 | -30.6 | +0.00 |
| 12 | 310 |  | 10.333 | twinkle | sparkle run of five tiny bells: a shimmer runs over the lawn | -9.0 | -15.0 | -28.6 | +0.00 |
| 13 | 347 |  | 11.567 | whoosh | quick whoosh (ease-out burst): he flips again | -10.0 | -16.0 | -29.6 | +0.00 |
| 14 | 351 | 400 | 11.700 | slide_whistle_up | slide whistle rising 311 -> 1175 Hz over 49 frames: the pancake keeps going up | -9.0 | -15.0 | -28.6 | +0.00 |
| 15 | 374 |  | 12.467 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 16 | 412 |  | 13.733 | gulp | cartoon gulp: Gus stares after it | -7.0 | -13.0 | -26.6 | +0.00 |
| 17 | 446 |  | 14.867 | oof | 'oh': the neighbor yells | -6.0 | -12.0 | -25.6 | +0.00 |
| 18 | 469 |  | 15.633 | pop | small bright pop: a spinning globe pops in | -8.0 | -14.0 | -27.6 | +0.00 |
| 19 | 495 |  | 16.500 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 20 | 556 |  | 18.533 | zip | 'zwip' pass-by: an arrow up: flung into space | -7.0 | -13.0 | -26.6 | +0.00 |
| 21 | 562 |  | 18.733 | knock | 1 knocks on wood: he grabs his fence | -9.0 | -15.0 | -28.6 | +0.00 |
| 22 | 610 |  | 20.333 | gulp | cartoon gulp: his wife takes a sip | -11.0 | -17.0 | -30.6 | +0.00 |
| 23 | 647 | 700 | 21.567 | door_creak | door creak: the chair creaks as the ground sinks away | -11.0 | -17.0 | -30.6 | +0.00 |
| 24 | 688 |  | 22.933 | pop | small bright pop: a ruler under the chair leg | -8.0 | -14.0 | -27.6 | +0.00 |
| 25 | 698 |  | 23.267 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 26 | 739 |  | 24.633 | ting | triangle 'ting' (1568 Hz): that's all: a glint on her cup | -9.0 | -15.0 | -28.6 | +0.00 |
| 27 | 762 |  | 25.400 | blip | blip at 990 Hz: one finger up: don't move | -10.0 | -16.0 | -29.6 | +0.00 |
| 28 | 830 |  | 27.667 | squeak | rubber squeak: Gus crouches | -8.0 | -14.0 | -27.6 | +0.00 |
| 29 | 838 |  | 27.933 | jump_boing | spring 'boing': he hops | -5.0 | -11.0 | -24.6 | +0.00 |
| 30 | 840 | 859 | 28.000 | slide_whistle_up | slide whistle rising 392 -> 1480 Hz over 19 frames: and does not come down | -7.0 | -13.0 | -26.6 | +0.00 |
| 31 | 862 |  | 28.733 | jump_boing | spring 'boing': an ordinary hop | -8.0 | -14.0 | -27.6 | +0.00 |
| 32 | 880 |  | 29.333 | thud | heavy soft thud: and lands | -10.0 | -16.0 | -29.6 | +0.00 |
| 33 | 883 |  | 29.433 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 34 | 911 | 966 | 30.367 | wind_rush (bed) | speed rush, rising (noise band + faint whistle + flutter, follows the speed) | -17.0 | -17.0 | -30.6 | +0.00 |
| 35 | 914 |  | 30.467 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.6 | +0.00 |
| 36 | 966 |  | 32.200 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.6 | +0.00 |
| 37 | 983 |  | 32.767 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 38 | 1003 |  | 33.433 | squeak | rubber squeak: a brake | -8.0 | -14.0 | -27.6 | +0.00 |
| 39 | 1033 |  | 34.433 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.6 | +0.10 |
| 40 | 1062 | 1085 | 35.400 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -10.0 | -16.0 | -29.6 | +0.00 |
| 41 | 1087 |  | 36.233 | ting | triangle 'ting' (1568 Hz): it stops | -9.0 | -15.0 | -28.6 | +0.00 |
| 42 | 1118 |  | 37.267 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.6 | +0.00 |
| 43 | 1137 |  | 37.900 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.6 | +0.10 |
| 44 | 1166 |  | 38.867 | blip | blip at 990 Hz: a post passes | -10.0 | -16.0 | -29.6 | +0.00 |
| 45 | 1186 |  | 39.533 | blip | blip at 990 Hz: a post passes | -10.0 | -16.0 | -29.6 | +0.00 |
| 46 | 1206 |  | 40.200 | blip | blip at 990 Hz: a post passes | -10.0 | -16.0 | -29.6 | +0.00 |
| 47 | 1226 |  | 40.867 | blip | blip at 990 Hz: a post passes, same beat | -10.0 | -16.0 | -29.6 | +0.00 |
| 48 | 1238 | 1341 | 41.267 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 49 | 1247 |  | 41.567 | jump_boing | spring 'boing': Gus leaves the lawn | -5.0 | -11.0 | -24.6 | +0.00 |
| 50 | 1251 | 1330 | 41.700 | slide_whistle_up | slide whistle rising 392 -> 1480 Hz over 79 frames: he rises at a steady speed | -10.0 | -16.0 | -29.6 | +0.00 |
| 51 | 1278 |  | 42.600 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 52 | 1310 |  | 43.667 | ding | friendly two-bell 'ding': he keeps it all | -10.0 | -16.0 | -29.6 | +0.00 |
| 53 | 1345 | 1377 | 44.833 | timer_ticks | egg timer: 10 tick-tocks, one every 3.6 frames, last one on f1377 | -14.0 | -20.0 | -33.6 | -0.15 |
| 54 | 1377 |  | 45.900 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 55 | 1412 |  | 47.067 | twinkle | sparkle run of five tiny bells: a glint on the pancake | -11.0 | -17.0 | -30.6 | +0.00 |
| 56 | 1434 |  | 47.800 | pop | small bright pop: a stopwatch by the pancake | -8.0 | -14.0 | -27.6 | +0.00 |
| 57 | 1446 |  | 48.200 | click | click: one second ahead | -11.0 | -17.0 | -30.6 | +0.00 |
| 58 | 1461 |  | 48.700 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 59 | 1466 |  | 48.867 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 60 | 1515 |  | 50.500 | pop | small bright pop: the bracket with 8 | -8.0 | -14.0 | -27.6 | +0.00 |
| 61 | 1531 |  | 51.033 | squeak | rubber squeak: he stretches | -8.0 | -14.0 | -27.6 | +0.00 |
| 62 | 1541 |  | 51.367 | oof | 'ugh': out of reach | -9.0 | -15.0 | -28.6 | +0.00 |
| 63 | 1551 | 1602 | 51.700 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 64 | 1560 |  | 52.000 | twinkle | sparkle run of five tiny bells: gravity comes back: a shimmer over the lawn | -9.0 | -15.0 | -28.6 | +0.00 |
| 65 | 1579 |  | 52.633 | timer_ding | kitchen-timer bell, rings about 1 s: five seconds are up | -4.0 | -10.0 | -23.6 | -0.15 |
| 66 | 1590 |  | 53.000 | thud | heavy soft thud: the chair drops ten inches | -8.0 | -14.0 | -27.6 | +0.00 |
| 67 | 1609 | 1639 | 53.633 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -10.0 | -16.0 | -29.6 | +0.00 |
| 68 | 1641 |  | 54.700 | ting | triangle 'ting' (1245 Hz): the top | -9.0 | -15.0 | -28.6 | +0.00 |
| 69 | 1648 |  | 54.933 | gulp | cartoon gulp: he looks down | -7.0 | -13.0 | -26.6 | +0.00 |
| 70 | 1660 | 1677 | 55.333 | slide_whistle_down | slide whistle falling 1175 -> 311 Hz over 17 frames: and starts down | -7.0 | -13.0 | -26.6 | +0.00 |
| 71 | 1700 |  | 56.667 | pop | small bright pop: a diving tower pops up | -8.0 | -14.0 | -27.6 | +0.00 |
| 72 | 1719 |  | 57.300 | ding | friendly two-bell 'ding': exactly the same height | -7.0 | -13.0 | -26.6 | +0.00 |
| 73 | 1761 | 1805 | 58.700 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 74 | 1787 |  | 59.567 | twinkle | sparkle run of five tiny bells: the neighbor has a pool | -9.0 | -15.0 | -28.6 | +0.00 |
| 75 | 1805 | 1869 | 60.167 | wind_rush (bed) | speed rush, rising (noise band + faint whistle + flutter, follows the speed) | -14.0 | -14.0 | -27.6 | +0.00 |
| 76 | 1821 |  | 60.700 | oof | 'oh': no diver | -8.0 | -14.0 | -27.6 | +0.00 |
| 77 | 1869 | 2047 | 62.300 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 78 | 1879 |  | 62.633 | splash | big splash: thump, slap, bubble cloud, spray: he hits the water | -3.0 | -9.0 | -22.6 | +0.00 |
| 79 | 1892 |  | 63.067 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 80 | 1938 |  | 64.600 | cork_pop | cork pop + a few drips: his fishbowl bobs up | -7.0 | -13.0 | -26.6 | +0.00 |
| 81 | 1962 |  | 65.400 | drip | water drop: dripping | -10.0 | -16.0 | -29.6 | +0.00 |
| 82 | 1990 | 2017 | 66.333 | slide_whistle_down | slide whistle falling 1480 -> 392 Hz over 27 frames: the pancake comes down too | -9.0 | -15.0 | -28.6 | +0.00 |
| 83 | 2017 |  | 67.233 | splat | wet splat: slap + squelch + glops + thud (right on Gus) | -4.0 | -10.0 | -23.6 | -0.10 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: gulp@610 -1.70 (snr 6.9), amb_garden@1551 +1.40 (snr 5.4), arrow_pop@1892 -1.38 (snr 9.1)
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): whoosh_big@146, oof@1821
- Files: `mix.wav` 3,275,200 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,275,200 samples, 48000 Hz, 2 ch, 24-bit, peak -0.58 dBFS, 0 clipped; `stem_music.wav` 3,275,200 samples, 48000 Hz, 2 ch, 24-bit, peak -7.06 dBFS, 0 clipped; `stem_sfx.wav` 3,275,200 samples, 48000 Hz, 2 ch, 24-bit, peak -7.88 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.53 LU, max momentary -9.42 LUFS. Stems minus mix: -126.5 dB.
- Event onsets in `stem_sfx.wav` (83 events, tolerance 1 frame): matched 83/83 within tolerance (largest error 0.51 frame, largest lag 93 samples); blind band-flux detector resolved 77 of them, 74 within tolerance (largest error 1.7 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): whoosh_big@146, amb_garden@161, wind_rush@911, wind_rush@1805, oof@1821, amb_garden@1869.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **8.32 dB** over 54.7 s of speech (400 ms windows: median 7.52, 10th percentile 1.11, 90th 11.69 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-161, 308-330.9 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -67.6 dBFS, below 20 Hz -39.9 dB, above 12 kHz -45.2 dB of the total energy, centroid 808 Hz. Bands (dB of total): 0-20 Hz -39.9, 20-60 Hz -30.5, 60-300 Hz -3.7, 300-3000 Hz -3.0, 3000-8000 Hz -11.3, 8000-12000 Hz -24.3, 12000-16000 Hz -45.2, 16000-24000 Hz -68.3.
- Score landmarks: first sound at f160.92; 1 silence f0-161: -240.0 dBFS; 2 theme: onset at f160.92 (plan f161); 3 silence f308-331: -240.0 dBFS; 4 lullaby: onset at f330.89 (plan f331); 5 waltz: onset at f594.92 (plan f592); 6 chase: onset at f793.88 (plan f794); 7 silence f966-976: -240.0 dBFS; 8 mystery: onset at f975.5 (plan f976); 9 chase: onset at f1241.96 (plan f1242); 10 waltz: onset at f1413.98 (plan f1411); 11 lullaby: onset at f1554.92 (plan f1555); 12 bittersweet: onset at f1676.96 (plan f1677); 13 finale: onset at f1869.02 (plan f1869), button at f2036.84 (plan f2037); last 10 ms -79.8 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-161 | 7.4 | 8.88 | -1.93 |
| 2 theme | 161-308 | 7.27 | 6.93 | 1.53 |
| 3 silence | 308-331 | 20.28 | 16.68 | 9.01 |
| 4 lullaby | 331-592 | 9.28 | 7.76 | 2.99 |
| 5 waltz | 592-794 | 8.14 | 7.75 | 1.32 |
| 6 chase a | 794-838 | 8.39 | 4.69 | 0.38 |
| 6 chase b | 838-883 | 7.99 | 7.19 | 2.44 |
| 6 chase c | 883-966 | 7.33 | 5.4 | 1.34 |
| 8 mystery | 976-1242 | 8.84 | 7.63 | -0.82 |
| 9 chase a | 1242-1335 | 7.83 | 5.74 | -0.79 |
| 9 chase b | 1335-1377 | 8.35 | 6.97 | -0.22 |
| 9 chase c | 1377-1411 | 8.33 | 5.61 | 0.51 |
| 10 waltz | 1411-1555 | 8.46 | 7.01 | -0.22 |
| 11 lullaby | 1555-1677 | 8.76 | 7.89 | 2.76 |
| 12 bittersweet | 1677-1869 | 8.8 | 7.93 | 1.63 |
| 13 finale | 1869-2047 | 8.16 | 7.57 | 2.02 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-157 | 7.4 | For five seconds gravity lets go of the garden, and one small hop puts |
| 2 | 161-276 | 7.39 | It's ten on a Sunday morning and Gus is flipping a pancake in his gard |
| 3 | 280-431 | 8.7 | Then gravity switches off. The pancake leaves the pan at eight feet a  |
| 4 | 434-588 | 9.62 | His neighbor yells that the Earth spins at eight hundred miles an hour |
| 5 | 592-754 | 8.04 | His wife sits still. In five seconds the spinning ground sinks ten inc |
| 6 | 758-855 | 7.82 | Don't move, she says. But Gus wants his pancake, so he hops. |
| 7 | 859-972 | 7.77 | That hop is good for one foot. So why is he sailing past his chimney? |
| 8 | 976-1101 | 9.22 | You see, gravity is a brake. Roll a ball up a hill and the hill eats i |
| 9 | 1105-1239 | 8.42 | Take the hill away and the ball rolls on across the floor, as fast as  |
| 10 | 1242-1407 | 8.08 | Gus leaves the lawn at eight feet a second and keeps it all. Four seco |
| 11 | 1411-1552 | 8.46 | The pancake left a second sooner at the same speed, so it stays eight  |
| 12 | 1555-1673 | 8.76 | Then gravity comes back. Gus coasts up one more foot and starts down. |
| 13 | 1677-1801 | 9.39 | Luckily, that's the height of an Olympic diving tower, and the neighbo |
| 14 | 1805-1932 | 8.12 | Unluckily, Gus is no diver. He hits the water at thirty miles an hour. |
| 15 | 1935-2031 | 7.98 | A moment later the pancake comes down too, right on Gus. |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-161 | wind_rush | 0.08 | +0.08 | 1 | -0.1 | -0.10 | 19.4 | 0.97 |
| 146 | whoosh_big | 145.53 | -0.47 | 1 | - | - | 3.5 | 0.99 |
| 161 | flash_hit | 160.65 | -0.35 | 2 | 161.18 | +0.18 | 8.2 | 1.00 |
| 161-911 | amb_garden | 161.09 | +0.09 | 1 | - | - | 2.8 | 1.00 |
| 176 | bird_tweet | 176.22 | +0.22 | 2 | 176.54 | +0.54 | 26.4 | 1.00 |
| 228 | whoosh | 227.96 | -0.04 | 2 | 227.96 | -0.04 | 8.2 | 1.00 |
| 244 | splat | 244.0 | +0.00 | 1 | 243.92 | -0.08 | 12.5 | 1.00 |
| 258 | sizzle | 258.07 | +0.07 | 2 | 258.02 | +0.02 | 27.7 | 1.00 |
| 284 | pop | 284.0 | +0.00 | 1 | 283.94 | -0.06 | 24.0 | 1.00 |
| 295 | arrow_pop | 295.0 | +0.00 | 1 | 294.92 | -0.08 | 23.4 | 1.00 |
| 308 | click | 308.0 | +0.00 | 2 | 307.88 | -0.12 | 35.5 | 1.00 |
| 310 | twinkle | 310.01 | +0.01 | 2 | 309.98 | -0.02 | 999.0 | 1.00 |
| 347 | whoosh | 347.03 | +0.03 | 2 | 347.06 | +0.06 | 11.4 | 1.00 |
| 351-400 | slide_whistle_up | 351.02 | +0.02 | 1 | 350.9 | -0.10 | 8.2 | 1.00 |
| 374 | arrow_pop | 374.0 | +0.00 | 1 | 373.94 | -0.06 | 20.6 | 1.00 |
| 412 | gulp | 412.01 | +0.01 | -4 | 411.98 | -0.02 | 11.4 | 1.00 |
| 446 | oof | 446.05 | +0.05 | 2 | 446.06 | +0.06 | 7.2 | 1.00 |
| 469 | pop | 469.0 | +0.00 | 1 | 468.92 | -0.08 | 18.0 | 1.00 |
| 495 | arrow_pop | 495.0 | +0.00 | 1 | 494.96 | -0.04 | 20.8 | 1.00 |
| 556 | zip | 555.49 | -0.51 | 1 | 555.56 | -0.44 | 9.0 | 1.00 |
| 562 | knock | 562.0 | +0.00 | 0 | 561.92 | -0.08 | 11.4 | 1.00 |
| 610 | gulp | 610.01 | +0.01 | -5 | 608.3 | -1.70 | 6.9 | 1.00 |
| 647-700 | door_creak | 647.1 | +0.10 | 2 | 647.06 | +0.06 | 6.9 | 1.00 |
| 688 | pop | 688.0 | +0.00 | 1 | 688.04 | +0.04 | 12.3 | 1.00 |
| 698 | arrow_pop | 698.0 | +0.00 | 1 | 697.94 | -0.06 | 18.4 | 1.00 |
| 739 | ting | 739.0 | +0.00 | 2 | 738.92 | -0.08 | 380.9 | 1.00 |
| 762 | blip | 762.01 | +0.01 | 1 | 761.96 | -0.04 | 53.4 | 1.00 |
| 830 | squeak | 830.09 | +0.09 | 2 | 830.3 | +0.30 | 12.5 | 1.00 |
| 838 | jump_boing | 838.01 | +0.01 | 1 | 838.04 | +0.04 | 12.1 | 1.00 |
| 840-859 | slide_whistle_up | 840.02 | +0.02 | 1 | 840.08 | +0.08 | 6.8 | 1.00 |
| 862 | jump_boing | 862.03 | +0.03 | 1 | 861.98 | -0.02 | 12.6 | 1.00 |
| 880 | thud | 880.0 | +0.00 | 2 | 879.92 | -0.08 | 16.8 | 1.00 |
| 883 | arrow_pop | 883.0 | +0.00 | 1 | 882.98 | -0.02 | 20.6 | 1.00 |
| 911-966 | wind_rush | 911.33 | +0.33 | 1 | - | - | 2.7 | 0.93 |
| 914 | question_blip | 914.01 | +0.01 | 1 | 913.94 | -0.06 | 22.5 | 1.00 |
| 966 | record_stop | 966.0 | +0.00 | 2 | 965.9 | -0.10 | 18.6 | 1.00 |
| 983 | arrow_pop | 983.0 | +0.00 | 1 | 982.88 | -0.12 | 38.4 | 1.00 |
| 1003 | squeak | 1003.09 | +0.09 | 2 | 1002.98 | -0.02 | 24.4 | 1.00 |
| 1033 | push_whoosh | 1033.01 | +0.01 | 2 | 1032.86 | -0.14 | 52.6 | 1.00 |
| 1062-1085 | decel_whoosh | 1062.05 | +0.05 | 1 | 1061.96 | -0.04 | 34.0 | 1.00 |
| 1087 | ting | 1087.0 | +0.00 | 2 | 1086.86 | -0.14 | 999.0 | 1.00 |
| 1118 | flip_blip | 1118.01 | +0.01 | 1 | 1117.88 | -0.12 | 999.0 | 1.00 |
| 1137 | push_whoosh | 1137.0 | +0.00 | 2 | 1136.9 | -0.10 | 48.9 | 1.00 |
| 1166 | blip | 1165.98 | -0.02 | -47 | 1165.88 | -0.12 | 201.5 | 1.00 |
| 1186 | blip | 1186.01 | +0.01 | 1 | 1185.92 | -0.08 | 501.1 | 1.00 |
| 1206 | blip | 1206.04 | +0.04 | 50 | 1205.9 | -0.10 | 508.2 | 1.00 |
| 1226 | blip | 1226.0 | +0.00 | 1 | 1225.94 | -0.06 | 229.8 | 1.00 |
| 1238-1341 | amb_garden | 1238.07 | +0.07 | 2 | 1237.94 | -0.06 | 34.9 | 1.00 |
| 1247 | jump_boing | 1247.01 | +0.01 | 1 | 1247.0 | -0.00 | 16.4 | 1.00 |
| 1251-1330 | slide_whistle_up | 1251.03 | +0.03 | 1 | 1251.2 | +0.20 | 24.5 | 1.00 |
| 1278 | arrow_pop | 1278.0 | +0.00 | 1 | 1278.02 | +0.02 | 23.4 | 1.00 |
| 1310 | ding | 1310.0 | +0.00 | 1 | 1309.94 | -0.06 | 107.8 | 1.00 |
| 1345-1377 | timer_ticks | 1345.0 | +0.00 | 1 | 1344.86 | -0.14 | 36.3 | 1.00 |
| 1377 | arrow_pop | 1377.0 | +0.00 | 1 | 1376.84 | -0.16 | 36.7 | 1.00 |
| 1412 | twinkle | 1412.0 | +0.00 | 1 | 1411.88 | -0.12 | 999.0 | 1.00 |
| 1434 | pop | 1434.0 | +0.00 | 1 | 1433.84 | -0.16 | 100.3 | 1.00 |
| 1446 | click | 1446.0 | +0.00 | 2 | 1445.84 | -0.16 | 96.3 | 1.00 |
| 1461 | arrow_pop | 1461.0 | +0.00 | 1 | 1460.9 | -0.10 | 36.4 | 1.00 |
| 1466 | arrow_pop | 1466.0 | +0.00 | 1 | 1465.94 | -0.06 | 15.8 | 1.00 |
| 1515 | pop | 1515.0 | +0.00 | 1 | 1514.84 | -0.16 | 100.3 | 1.00 |
| 1531 | squeak | 1531.09 | +0.09 | 2 | 1531.04 | +0.04 | 27.2 | 1.00 |
| 1541 | oof | 1541.09 | +0.09 | 2 | 1540.94 | -0.06 | 33.5 | 1.00 |
| 1551-1602 | amb_garden | 1551.1 | +0.10 | 1 | 1552.4 | +1.40 | 5.4 | 1.00 |
| 1560 | twinkle | 1560.01 | +0.01 | 2 | 1559.9 | -0.10 | 999.0 | 1.00 |
| 1579 | timer_ding | 1579.06 | +0.06 | 93 | 1578.92 | -0.08 | 117.6 | 1.00 |
| 1590 | thud | 1590.0 | +0.00 | 2 | 1589.9 | -0.10 | 13.2 | 1.00 |
| 1609-1639 | decel_whoosh | 1609.03 | +0.03 | 1 | 1608.98 | -0.02 | 20.2 | 1.00 |
| 1641 | ting | 1641.0 | +0.00 | 2 | 1640.84 | -0.16 | 580.2 | 1.00 |
| 1648 | gulp | 1648.01 | +0.01 | -5 | 1647.86 | -0.14 | 28.8 | 1.00 |
| 1660-1677 | slide_whistle_down | 1660.02 | +0.02 | 1 | 1660.04 | +0.04 | 999.0 | 1.00 |
| 1700 | pop | 1700.0 | +0.00 | 1 | 1699.88 | -0.12 | 61.7 | 1.00 |
| 1719 | ding | 1719.0 | +0.00 | 1 | 1718.9 | -0.10 | 999.0 | 1.00 |
| 1761-1805 | amb_garden | 1761.09 | +0.09 | 1 | 1760.96 | -0.04 | 77.7 | 1.00 |
| 1787 | twinkle | 1787.0 | +0.00 | 2 | 1786.94 | -0.06 | 999.0 | 1.00 |
| 1805-1869 | wind_rush | 1805.09 | +0.09 | 1 | - | - | 4.3 | 1.00 |
| 1821 | oof | 1821.04 | +0.04 | 2 | - | - | 3.6 | 1.00 |
| 1869-2047 | amb_garden | 1869.04 | +0.04 | 1 | - | - | 2.3 | 1.00 |
| 1879 | splash | 1879.0 | +0.00 | 2 | 1878.98 | -0.02 | 9.2 | 1.00 |
| 1892 | arrow_pop | 1892.0 | +0.00 | 2 | 1890.62 | -1.38 | 9.1 | 1.00 |
| 1938 | cork_pop | 1938.0 | +0.00 | 1 | 1937.9 | -0.10 | 15.3 | 1.00 |
| 1962 | drip | 1962.0 | +0.00 | 1 | 1961.9 | -0.10 | 41.0 | 1.00 |
| 1990-2017 | slide_whistle_down | 1990.02 | +0.02 | 1 | 1989.98 | -0.02 | 32.4 | 1.00 |
| 2017 | splat | 2017.0 | +0.00 | 1 | 2016.92 | -0.08 | 14.7 | 1.00 |
