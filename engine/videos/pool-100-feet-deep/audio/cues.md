# pool-100-feet-deep - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,228,800 samples = 2018 frames at 30 fps = 67.267 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.4 LU, max momentary -9.7 LUFS, max short-term -13.0 LUFS
- Stems: voice -14.3 LUFS, music -24.4 LUFS, sfx -29.4 LUFS (master gain +7.43 dB on everything; the voice file itself is -21.0 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 7.49 dB, active (>0.1 dB) on 26.66 % of samples, >0.5 dB on 13.89 %, >3 dB on 1.658 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -14.0 LUFS
    Threshold: -24.1 LUFS
  Loudness range:
    LRA:         1.4 LU
    Threshold: -34.0 LUFS
    LRA low:   -14.7 LUFS
    LRA high:  -13.3 LUFS
  True peak:
    Peak:       -1.2 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| 1 silence | 0-135 | -14.3 | -64.9 | -23.2 | -23.2 | 8.9 | 8.5 | 4.8 |
| 2 theme | 135-544 | -14.4 | -23.3 | -32.8 | -22.8 | 8.5 | 8.5 | 4.2 |
| 3 chase a | 544-628 | -13.5 | -23.9 | -34.0 | -23.5 | 10.0 | 10.3 | 4.4 |
| 3 chase b | 628-787 | -14.6 | -24.6 | -33.5 | -24.1 | 9.5 | 9.7 | 6.5 |
| 3 chase c | 787-822 | -13.9 | -22.9 | -27.8 | -21.6 | 7.7 | 6.8 | 5.2 |
| 4 lullaby | 822-1023 | -14.3 | -25.4 | -32.4 | -24.6 | 10.3 | 10.8 | 6.5 |
| 5 silence | 1023-1113 | -13.9 | -45.3 | -31.2 | -31.2 | 17.3 | 19.0 | 13.8 |
| 6 mystery | 1113-1376 | -14.3 | -25.4 | -30.0 | -24.2 | 9.9 | 9.7 | 5.8 |
| 7 waltz | 1376-1519 | -14.8 | -25.1 | -30.7 | -24.4 | 9.6 | 9.9 | 5.2 |
| 8 chase a | 1519-1572 | -13.3 | -23.3 | -32.0 | -22.8 | 9.6 | 8.8 | 3.0 |
| 8 chase b | 1572-1684 | -14.5 | -24.4 | -32.8 | -23.8 | 9.3 | 9.3 | 5.2 |
| 8 chase c | 1684-1722 | -15.0 | -24.2 | -30.5 | -23.4 | 8.4 | 8.9 | 5.4 |
| 9 bittersweet | 1722-1915 | -14.3 | -25.0 | -29.7 | -24.0 | 9.7 | 9.3 | 5.3 |
| 10 finale | 1915-2018 | -14.8 | -23.8 | -33.9 | -23.4 | 8.6 | 8.9 | 5.9 |

## Music map (key D major, plan tempo 134 bpm, tune "tiptoe", seed 2811)
The tune: `F# A D- D E F#- | G E B- Db E G- | F#- D A B- E Db | D-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 3 chase a -11.0, 3 chase b -10.3, 3 chase c -9.5, 4 lullaby -11.5, 6 mystery -11.5, 7 waltz -11.0, 8 chase a -11.0, 8 chase b -10.3, 8 chase c -9.5, 9 bittersweet -11.5, 10 finale -9.5. Applied section gains (dB): 1 silence -10.5, 2 theme -10.5, 3 chase a -9.8, 3 chase b -13.4, 3 chase c -15.0, 4 lullaby -12.1, 5 silence -11.0, 6 mystery -11.0, 7 waltz -11.3, 8 chase a -8.9, 8 chase b -13.0, 8 chase c -15.8, 9 bittersweet -8.7, 10 finale -14.2.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 135.0 | 4.50 | THEME: D major, swung, 140.8 bpm, 8 bars; clarinet tune, pizzicato boom-chick, brushes |
| 288.4 | 9.61 | theme bar 4: the tune lands on the home note, 'pom-pom' answer on beats 3 and 4 |
| 339.5 | 11.32 | second statement: tune doubled by marimba and glockenspiel |
| 518.4 | 17.28 | stop chord (dominant seventh): the band leaves the next two beats to the sound effects, vibes ring |
| 544.0 | 18.13 | CHASE OSTINATO: the tune's head as running eighths (marimba), 166 bpm and accelerating over 7 bars, climbing from D major |
| 628.0 | 20.93 | accent downbeat (bar 3): timpani + cymbal; 165 bpm, bass on every beat, xylophone doubles the ostinato |
| 787.0 | 26.23 | accent downbeat (bar 7): timpani + cymbal; 206 bpm, running bass, glock on top, soft brass swells |
| 787.0 | 26.23 | last bar: dominant seventh, 206 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 822.0 | 27.40 | LULLABY: the tune rocking in 6/8, Bb major (the home note is its third), music box + harp + warm pad, 72 dotted-quarters a minute |
| 972.7 | 32.42 | last bar climbs to an unresolved second (a rising slide whistle can aim for the same note) |
| 1023.0 | 34.10 | (no music: silence, the ring before it is choked) |
| 1113.0 | 37.10 | MYSTERY: the tune at half speed in B minor (vibes), tick-tock woodblock + pizzicato, 110 bpm felt in two; soft |
| 1244.5 | 41.48 | answering phrase a step higher |
| 1310.2 | 43.67 | half cadence: the tick-tock slows and stops |
| 1376.0 | 45.87 | WALTZ: music box in D major, 153 bpm, pick-up on f1379, downbeats at f1397, f1432, low point f1467 |
| 1431.8 | 47.73 | the tune steps down do-la-fa into |
| 1467.0 | 48.90 | the low point (low home note); then the arpeggio climbs, slower and slower, to the rest |
| 1509.0 | 50.30 | the rest: the high home note rings, everything else waits |
| 1519.0 | 50.63 | CHASE OSTINATO: the tune's head as running eighths (marimba), 136 bpm and accelerating over 5 bars, climbing from D major |
| 1572.0 | 52.40 | accent downbeat (bar 2): timpani + cymbal; 181 bpm, bass on every beat, xylophone doubles the ostinato |
| 1684.0 | 56.13 | accent downbeat (bar 5): timpani + cymbal; 189 bpm, running bass, glock on top, soft brass swells |
| 1684.0 | 56.13 | last bar: dominant seventh, 189 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 1722.0 | 57.40 | BITTERSWEET, sweet: the head of the tune in Bb major (music box, harp), ending on a rolled chord |
| 1864.0 | 62.13 | the same phrase again ... |
| 1879.9 | 62.66 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1915.0 | 63.83 | FINALE: the tune comes home, D major, warm and a little faster (193.5 bpm): clarinet + glock + marimba, soft horns, pad |
| 1989.4 | 66.31 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 2008.0 | 66.93 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.3 LUFS integrated). Reverb by place: board = void, deep = open, garden = open, street = open. Dead cuts (everything that sounded before them stops): f135, f1023.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 135 | 0.000 | bubbling (bed) | bubbling liquid | -22.0 | -22.0 | -35.5 | +0.00 |
| 2 | 0 | 135 | 0.000 | wind_rush (bed) | falling rush under the hook, rising into the flash (noise band + faint whistle + flutter, follows the speed) | -8.5 | -8.5 | -22.0 | +0.00 |
| 3 | 30 |  | 1.000 | squeak | rubber squeak: the ball dents | -8.0 | -14.0 | -27.5 | +0.00 |
| 4 | 78 |  | 2.600 | squeak | rubber squeak: the ball crumples | -8.0 | -14.0 | -27.5 | +0.00 |
| 5 | 93 |  | 3.100 | pop | small bright pop: a basketball pops in beside it | -8.0 | -14.0 | -27.5 | +0.00 |
| 6 | 116 |  | 3.867 | thud | heavy soft thud: the barbell lands on the floor | -5.0 | -11.0 | -24.5 | +0.00 |
| 7 | 120 |  | 4.000 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): before the flash | -2.0 | -8.0 | -21.5 | +0.00 |
| 8 | 135 | 240 | 4.500 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.5 | +0.00 |
| 9 | 135 |  | 4.500 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.5 | +0.00 |
| 10 | 150 |  | 5.000 | bird_tweet | bird chirps: morning | -11.0 | -17.0 | -30.5 | +0.20 |
| 11 | 187 |  | 6.233 | pop | small bright pop: Gus points down into the pool | -8.0 | -14.0 | -27.5 | +0.00 |
| 12 | 240 | 293 | 8.000 | bubbling (bed) | bubbling liquid | -22.0 | -22.0 | -35.5 | +0.00 |
| 13 | 240 |  | 8.000 | whoosh | quick whoosh (ease-out burst): the lens dives | -10.0 | -16.0 | -29.5 | +0.00 |
| 14 | 277 |  | 9.233 | ting | triangle 'ting' (1175 Hz): the 100 mark at the floor | -9.0 | -15.0 | -28.5 | +0.00 |
| 15 | 293 | 345 | 9.767 | car_pass | car passing left to right: dump trucks roll past | -6.0 | -12.0 | -25.5 | +0.00 |
| 16 | 324 |  | 10.800 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.5 | +0.00 |
| 17 | 346 |  | 11.533 | car_horn | car horn, beep-beep: the front truck honks | -9.0 | -15.0 | -28.5 | +0.00 |
| 18 | 370 | 822 | 12.333 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.5 | +0.00 |
| 19 | 375 |  | 12.500 | paper_flick | paper flaps + board knock: the calendar pops in | -11.0 | -17.0 | -30.5 | +0.00 |
| 20 | 377 | 446 | 12.567 | amb_river (bed) | running water: flow, babble, sloshes | -26.0 | -26.0 | -39.5 | +0.00 |
| 21 | 399 | 440 | 13.300 | clock_tick | clock: tick-tock every 15 frames | -13.0 | -19.0 | -32.5 | -0.15 |
| 22 | 419 |  | 13.967 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.5 | +0.00 |
| 23 | 457 |  | 15.233 | oof | 'oh': the neighbor laughs | -6.0 | -12.0 | -25.5 | +0.00 |
| 24 | 519 |  | 17.300 | whoosh | quick whoosh (ease-out burst): he waves it off | -10.0 | -16.0 | -29.5 | +0.00 |
| 25 | 571 |  | 19.033 | pop | small bright pop: Gus holds up the beach ball | -8.0 | -14.0 | -27.5 | +0.00 |
| 26 | 612 |  | 20.400 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.5 | +0.10 |
| 27 | 628 |  | 20.933 | cork_pop | cork pop + a few drips: the ball jumps back up | -3.0 | -9.0 | -22.5 | +0.00 |
| 28 | 663 |  | 22.100 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.5 | +0.00 |
| 29 | 683 |  | 22.767 | pop | small bright pop: tag 60 | -8.0 | -14.0 | -27.5 | +0.00 |
| 30 | 718 |  | 23.933 | click | click: he knots the rope | -11.0 | -17.0 | -30.5 | +0.00 |
| 31 | 759 |  | 25.300 | metal_clang | metal clang: he pats the barbell | -10.0 | -16.0 | -29.5 | +0.00 |
| 32 | 787 |  | 26.233 | splash | big splash: thump, slap, bubble cloud, spray: barbell and ball go under | -3.0 | -9.0 | -22.5 | +0.00 |
| 33 | 800 | 822 | 26.667 | swing_creak | ropes creak in rhythm: 1 creaks at f800 | -9.0 | -15.0 | -28.5 | +0.15 |
| 34 | 822 | 1023 | 27.400 | bubbling (bed) | bubbling liquid | -22.0 | -22.0 | -35.5 | +0.00 |
| 35 | 823 |  | 27.433 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.5 | +0.00 |
| 36 | 864 |  | 28.800 | squeak | rubber squeak: the ball is half | -8.0 | -14.0 | -27.5 | +0.00 |
| 37 | 884 |  | 29.467 | whoosh | quick whoosh (ease-out burst): down again, fast | -10.0 | -16.0 | -29.5 | +0.00 |
| 38 | 912 |  | 30.400 | thud | heavy soft thud: the barbell touches down at 100 | -5.0 | -11.0 | -24.5 | +0.00 |
| 39 | 928 |  | 30.933 | squeak | rubber squeak: a quarter | -8.0 | -14.0 | -27.5 | +0.00 |
| 40 | 996 |  | 33.200 | pop | small bright pop: the basketball | -8.0 | -14.0 | -27.5 | +0.00 |
| 41 | 1023 | 1307 | 34.100 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.5 | +0.00 |
| 42 | 1023 |  | 34.100 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.5 | +0.00 |
| 43 | 1029 |  | 34.300 | cricket | the one cricket (3-pulse chirps, about 1.6 per second) | -15.0 | -21.0 | -34.5 | +0.35 |
| 44 | 1043 |  | 34.767 | blip | blip at 990 Hz: he looks at his empty hands | -10.0 | -16.0 | -29.5 | +0.00 |
| 45 | 1081 |  | 36.033 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.5 | +0.00 |
| 46 | 1118 |  | 37.267 | drip | water drop: the bucket comes out of the water | -10.0 | -16.0 | -29.5 | +0.00 |
| 47 | 1140 |  | 38.000 | thud | heavy soft thud: the bucket drags his arm down | -8.0 | -14.0 | -27.5 | +0.00 |
| 48 | 1146 |  | 38.200 | splash | plop + bubbles: water slops out | -5.0 | -11.0 | -24.5 | +0.00 |
| 49 | 1185 |  | 39.500 | pop | small bright pop: a pancake lands on the stack | -8.0 | -14.0 | -27.5 | +0.00 |
| 50 | 1196 |  | 39.867 | pop | small bright pop: a pancake lands on the stack | -8.0 | -14.0 | -27.5 | +0.00 |
| 51 | 1207 |  | 40.233 | pop | small bright pop: a pancake lands on the stack | -8.0 | -14.0 | -27.5 | +0.00 |
| 52 | 1218 |  | 40.600 | pop | small bright pop: a pancake lands on the stack | -8.0 | -14.0 | -27.5 | +0.00 |
| 53 | 1241 |  | 41.367 | blip | blip at 784 Hz: one more pancake on top | -10.0 | -16.0 | -29.5 | +0.00 |
| 54 | 1253 |  | 41.767 | blip | blip at 659 Hz: one more pancake on top | -10.0 | -16.0 | -29.5 | +0.00 |
| 55 | 1263 |  | 42.100 | blip | blip at 523 Hz: one more pancake on top | -10.0 | -16.0 | -29.5 | +0.00 |
| 56 | 1285 |  | 42.833 | splat | wet splat: slap + squelch + glops + thud (the bottom pancake is squashed) | -8.0 | -14.0 | -27.5 | -0.10 |
| 57 | 1307 | 1376 | 43.567 | bubbling (bed) | bubbling liquid | -22.0 | -22.0 | -35.5 | +0.00 |
| 58 | 1312 |  | 43.733 | thud | heavy soft thud: a slab of water drops on the ball | -9.0 | -15.0 | -28.5 | +0.00 |
| 59 | 1326 |  | 44.200 | thud | heavy soft thud: a slab of water drops on the ball | -9.0 | -15.0 | -28.5 | +0.00 |
| 60 | 1342 |  | 44.733 | thud | heavy soft thud: a slab of water drops on the ball | -9.0 | -15.0 | -28.5 | +0.00 |
| 61 | 1354 |  | 45.133 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.5 | +0.00 |
| 62 | 1378 |  | 45.933 | thud | heavy soft thud: the block of water lands in the pan | -8.0 | -14.0 | -27.5 | +0.00 |
| 63 | 1381 |  | 46.033 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.5 | +0.00 |
| 64 | 1436 |  | 47.867 | whoosh | quick whoosh (ease-out burst): the column of air lands in the other pan | -10.0 | -16.0 | -29.5 | +0.00 |
| 65 | 1452 |  | 48.400 | ding | friendly two-bell 'ding': the scale is level | -7.0 | -13.0 | -26.5 | +0.00 |
| 66 | 1478 |  | 49.267 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): up the column to space | -6.0 | -12.0 | -25.5 | +0.00 |
| 67 | 1499 |  | 49.967 | twinkle | sparkle run of five tiny bells: stars | -9.0 | -15.0 | -28.5 | +0.00 |
| 68 | 1519 | 1790 | 50.633 | bubbling (bed) | bubbling liquid | -22.0 | -22.0 | -35.5 | +0.00 |
| 69 | 1552 |  | 51.733 | blip | blip at 1047 Hz: count the skies | -10.0 | -16.0 | -29.5 | +0.00 |
| 70 | 1558 |  | 51.933 | blip | blip at 1175 Hz: count the skies | -10.0 | -16.0 | -29.5 | +0.00 |
| 71 | 1565 |  | 52.167 | blip | blip at 1319 Hz: count the skies | -10.0 | -16.0 | -29.5 | +0.00 |
| 72 | 1572 |  | 52.400 | ding | friendly two-bell 'ding': four | -7.0 | -13.0 | -26.5 | +0.00 |
| 73 | 1609 |  | 53.633 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.5 | +0.00 |
| 74 | 1636 |  | 54.533 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.5 | +0.00 |
| 75 | 1684 |  | 56.133 | thud | heavy soft thud: three tons land on the tile | -3.0 | -9.0 | -22.5 | +0.00 |
| 76 | 1687 |  | 56.233 | metal_clang | metal clang: the iron weight rings | -9.0 | -15.0 | -28.5 | +0.00 |
| 77 | 1735 | 1785 | 57.833 | slide_whistle_up | slide whistle rising 466 -> 1760 Hz over 50 frames: the ball comes up and grows | -7.0 | -13.0 | -26.5 | +0.00 |
| 78 | 1790 | 2018 | 59.667 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.5 | +0.00 |
| 79 | 1797 | 1830 | 59.900 | swing_creak | ropes creak in rhythm: 1 creaks at f1797 | -9.0 | -15.0 | -28.5 | +0.15 |
| 80 | 1833 |  | 61.100 | cork_pop | cork pop + a few drips: the ball bursts out, full size | -3.0 | -9.0 | -22.5 | +0.00 |
| 81 | 1852 |  | 61.733 | ding | friendly two-bell 'ding': thumbs up | -7.0 | -13.0 | -26.5 | +0.00 |
| 82 | 1878 |  | 62.600 | gulp | cartoon gulp: Gus gulps | -7.0 | -13.0 | -26.5 | +0.00 |
| 83 | 1915 |  | 63.833 | splash | plop + bubbles: he paddles on the top step | -5.0 | -11.0 | -24.5 | +0.00 |
| 84 | 1945 |  | 64.833 | squeak | rubber squeak: the duck ring | -8.0 | -14.0 | -27.5 | +0.00 |
| 85 | 1991 |  | 66.367 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.5 | +0.00 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: ting@277 -2.00 (snr 153.0), whoosh@884 -1.26 (snr 12.6), squeak@928 -1.70 (snr 27.3), pop@996 -2.98 (snr 18.6), arrow_pop@1354 -2.42 (snr 22.0), slide_whistle_up@1735 -1.16 (snr 44.6)
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): whoosh_big@120
- Files: `mix.wav` 3,228,800 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,228,800 samples, 48000 Hz, 2 ch, 24-bit, peak -0.16 dBFS, 0 clipped; `stem_music.wav` 3,228,800 samples, 48000 Hz, 2 ch, 24-bit, peak -8.73 dBFS, 0 clipped; `stem_sfx.wav` 3,228,800 samples, 48000 Hz, 2 ch, 24-bit, peak -7.29 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.37 LU, max momentary -9.75 LUFS. Stems minus mix: -126.6 dB.
- Event onsets in `stem_sfx.wav` (84 events, tolerance 1 frame): matched 84/84 within tolerance (largest error 0.55 frame, largest lag 42 samples); blind band-flux detector resolved 79 of them, 73 within tolerance (largest error 2.98 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): whoosh_big@120, amb_garden@135, bubbling@240, bubbling@1307, amb_garden@1790.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **8.6 dB** over 53.11 s of speech (400 ms windows: median 7.39, 10th percentile 0.84, 90th 13.24 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-135, 1025.7-1113 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -67.6 dBFS, below 20 Hz -40.4 dB, above 12 kHz -45.0 dB of the total energy, centroid 807 Hz. Bands (dB of total): 0-20 Hz -40.4, 20-60 Hz -27.7, 60-300 Hz -3.8, 300-3000 Hz -3.0, 3000-8000 Hz -11.2, 8000-12000 Hz -24.3, 12000-16000 Hz -45.0, 16000-24000 Hz -68.3.
- Score landmarks: first sound at f134.98; 1 silence f0-135: -240.0 dBFS; 2 theme: onset at f134.98 (plan f135); 3 chase: onset at f543.92 (plan f544); 4 lullaby: onset at f822.38 (plan f822); 5 silence f1023-1113: -240.0 dBFS; 6 mystery: onset at f1112.98 (plan f1113); 7 waltz: onset at f1376.3 (plan f1376); 8 chase: onset at f1518.92 (plan f1519); 9 bittersweet: onset at f1721.96 (plan f1722); 10 finale: onset at f1915.04 (plan f1915), button at f2007.92 (plan f2008); last 10 ms -81.2 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-135 | 7.33 | 6.13 | 1.85 |
| 2 theme | 135-544 | 7.28 | 5.93 | -1.88 |
| 3 chase a | 544-628 | 9.76 | 7.35 | 1.44 |
| 3 chase b | 628-787 | 8.09 | 6.47 | 2.68 |
| 3 chase c | 787-822 | 8.43 | 7.14 | 2.56 |
| 4 lullaby | 822-1023 | 9.64 | 8.1 | 4.04 |
| 5 silence | 1023-1113 | 16.75 | 19.94 | 12.82 |
| 6 mystery | 1113-1376 | 9.36 | 7.39 | 1.23 |
| 7 waltz | 1376-1519 | 8.52 | 7.2 | 2.42 |
| 8 chase a | 1519-1572 | 9.46 | 8.11 | 3.39 |
| 8 chase b | 1572-1684 | 9.14 | 8.47 | 4.55 |
| 8 chase c | 1684-1722 | 6.68 | 6.37 | 1.65 |
| 9 bittersweet | 1722-1915 | 8.38 | 7.74 | 0.69 |
| 10 finale | 1915-2018 | 8.46 | 6.33 | 1.95 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-132 | 7.33 | Gus dug a pool so deep that a beach ball shrinks to a basketball at th |
| 2 | 135-289 | 7.85 | It's Saturday morning, and Gus wants the deepest pool on his street: a |
| 3 | 293-442 | 6.91 | The dirt fills almost two hundred dump trucks, and the garden hose run |
| 4 | 446-540 | 7.09 | His neighbor laughs. Deep water, he says, is just more water. |
| 5 | 544-712 | 9.56 | So Gus tests it with a beach ball. It won't go under: full of air, it  |
| 6 | 716-819 | 7.47 | He ties it to a hundred-pound barbell and lowers it on a rope. |
| 7 | 822-1019 | 9.64 | At thirty-four feet, the ball is half its size. At a hundred, a quarte |
| 8 | 1023-1110 | 16.75 | But wait. Nobody is touching it. So what makes it shrink? |
| 9 | 1113-1304 | 9.12 | You see, water is heavy. Think of the bottom pancake in a tall stack:  |
| 10 | 1307-1372 | 9.97 | Down there, the ball is the bottom pancake. |
| 11 | 1376-1515 | 8.52 | Thirty-four feet of water weigh as much as all the air above your head |
| 12 | 1519-1597 | 8.87 | So at a hundred feet, the ball carries four skies. |
| 13 | 1601-1718 | 8.92 | And every floor tile, one foot wide, holds up three tons of water. |
| 14 | 1722-1861 | 8.45 | Luckily, squeezed air isn't lost. Gus pulls the rope, and the ball gro |
| 15 | 1864-1908 | 7.91 | Unluckily, Gus can't swim. |
| 16 | 1911-2003 | 8.63 | So of his hundred feet of pool, he uses the top two. |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-135 | wind_rush | 0.07 | +0.07 | 1 | -0.1 | -0.10 | 19.5 | 0.97 |
| 0-135 | bubbling | 0.03 | +0.03 | 1 | -0.1 | -0.10 | 20.6 | 0.98 |
| 30 | squeak | 30.09 | +0.09 | 2 | 30.02 | +0.02 | 8.2 | 1.00 |
| 78 | squeak | 78.08 | +0.08 | 2 | 78.14 | +0.14 | 6.0 | 1.00 |
| 93 | pop | 93.0 | +0.00 | 2 | 92.96 | -0.04 | 5.1 | 1.00 |
| 116 | thud | 116.0 | +0.00 | 2 | 115.94 | -0.06 | 9.3 | 1.00 |
| 120 | whoosh_big | 119.45 | -0.55 | 1 | - | - | 4.2 | 0.98 |
| 135 | flash_hit | 134.65 | -0.35 | 2 | 135.02 | +0.02 | 8.3 | 1.00 |
| 135-240 | amb_garden | 135.04 | +0.04 | 1 | - | - | 3.7 | 1.00 |
| 150 | bird_tweet | 150.27 | +0.27 | 2 | 150.2 | +0.20 | 24.5 | 1.00 |
| 187 | pop | 187.0 | +0.00 | 1 | 186.92 | -0.08 | 21.1 | 1.00 |
| 240 | whoosh | 240.0 | +0.00 | 2 | 239.96 | -0.04 | 7.3 | 1.00 |
| 240-293 | bubbling | 240.04 | +0.04 | 1 | - | - | 4.1 | 1.00 |
| 277 | ting | 277.0 | +0.00 | 2 | 275.0 | -2.00 | 153.0 | 1.00 |
| 293-345 | car_pass | 293.05 | +0.05 | 1 | 292.82 | -0.18 | 6.0 | 1.00 |
| 324 | arrow_pop | 324.0 | +0.00 | 1 | 324.02 | +0.02 | 11.3 | 1.00 |
| 346 | car_horn | 346.03 | +0.03 | 1 | 345.92 | -0.08 | 47.5 | 1.00 |
| 370-822 | amb_garden | 370.27 | +0.27 | 1 | 369.98 | -0.02 | 7.9 | 1.00 |
| 375 | paper_flick | 375.0 | +0.00 | 2 | 374.9 | -0.10 | 54.6 | 1.00 |
| 377-446 | amb_river | 377.05 | +0.05 | 1 | 376.76 | -0.24 | 11.0 | 1.00 |
| 399-440 | clock_tick | 399.0 | +0.00 | 1 | 398.9 | -0.10 | 16.6 | 1.00 |
| 419 | flip_blip | 419.01 | +0.01 | 1 | 418.94 | -0.06 | 61.1 | 1.00 |
| 457 | oof | 457.04 | +0.04 | 2 | 457.16 | +0.16 | 7.1 | 1.00 |
| 519 | whoosh | 518.9 | -0.10 | 2 | 518.96 | -0.04 | 7.8 | 1.00 |
| 571 | pop | 571.0 | +0.00 | 1 | 570.92 | -0.08 | 20.4 | 1.00 |
| 612 | push_whoosh | 612.01 | +0.01 | 2 | 611.96 | -0.04 | 9.0 | 1.00 |
| 628 | cork_pop | 628.0 | +0.00 | 1 | 627.92 | -0.08 | 15.5 | 1.00 |
| 663 | arrow_pop | 663.0 | +0.00 | 1 | 662.96 | -0.04 | 19.7 | 1.00 |
| 683 | pop | 683.0 | +0.00 | 1 | 682.94 | -0.06 | 20.3 | 1.00 |
| 718 | click | 718.0 | +0.00 | 2 | 717.92 | -0.08 | 23.7 | 1.00 |
| 759 | metal_clang | 759.0 | +0.00 | 1 | 758.96 | -0.04 | 15.0 | 1.00 |
| 787 | splash | 787.0 | +0.00 | 2 | 786.92 | -0.08 | 12.4 | 1.00 |
| 800-822 | swing_creak | 800.0 | +0.00 | 2 | 799.94 | -0.06 | 12.1 | 1.00 |
| 822-1023 | bubbling | 822.25 | +0.25 | 1 | 821.24 | -0.76 | 5.3 | 0.99 |
| 823 | arrow_pop | 823.0 | +0.00 | 1 | 822.98 | -0.02 | 14.8 | 1.00 |
| 864 | squeak | 864.09 | +0.09 | 2 | 863.66 | -0.34 | 13.1 | 1.00 |
| 884 | whoosh | 883.91 | -0.09 | 2 | 882.74 | -1.26 | 12.6 | 1.00 |
| 912 | thud | 912.0 | +0.00 | 2 | 911.84 | -0.16 | 21.2 | 1.00 |
| 928 | squeak | 928.09 | +0.09 | 2 | 926.3 | -1.70 | 27.3 | 1.00 |
| 996 | pop | 996.0 | +0.00 | 1 | 993.02 | -2.98 | 18.6 | 1.00 |
| 1023 | record_stop | 1023.0 | +0.00 | 2 | 1022.9 | -0.10 | 23.7 | 1.00 |
| 1023-1307 | amb_garden | 1023.18 | +0.18 | 1 | 1022.9 | -0.10 | 8.5 | 1.00 |
| 1043 | blip | 1043.01 | +0.01 | 1 | 1042.94 | -0.06 | 56.7 | 1.00 |
| 1081 | question_blip | 1081.01 | +0.01 | 1 | 1080.98 | -0.02 | 22.0 | 1.00 |
| 1118 | drip | 1118.0 | +0.00 | 1 | 1117.88 | -0.12 | 40.7 | 1.00 |
| 1140 | thud | 1140.0 | +0.00 | 2 | 1139.9 | -0.10 | 12.3 | 1.00 |
| 1146 | splash | 1146.0 | +0.00 | 1 | 1145.96 | -0.04 | 11.6 | 1.00 |
| 1185 | pop | 1185.0 | +0.00 | 1 | 1184.9 | -0.10 | 22.9 | 1.00 |
| 1196 | pop | 1196.0 | +0.00 | 1 | 1195.94 | -0.06 | 24.9 | 1.00 |
| 1207 | pop | 1207.0 | +0.00 | 1 | 1206.92 | -0.08 | 30.3 | 1.00 |
| 1218 | pop | 1218.0 | +0.00 | 1 | 1217.9 | -0.10 | 28.3 | 1.00 |
| 1241 | blip | 1241.01 | +0.01 | 1 | 1241.0 | +0.00 | 29.2 | 1.00 |
| 1253 | blip | 1253.0 | +0.00 | 2 | 1252.94 | -0.06 | 22.7 | 1.00 |
| 1263 | blip | 1263.0 | +0.00 | 2 | 1263.02 | +0.02 | 18.3 | 1.00 |
| 1285 | splat | 1285.0 | +0.00 | 1 | 1284.92 | -0.08 | 14.2 | 1.00 |
| 1307-1376 | bubbling | 1307.15 | +0.15 | 1 | - | - | 4.0 | 1.00 |
| 1312 | thud | 1312.0 | +0.00 | 2 | 1311.92 | -0.08 | 18.9 | 1.00 |
| 1326 | thud | 1326.0 | +0.00 | 2 | 1325.9 | -0.10 | 18.8 | 1.00 |
| 1342 | thud | 1342.0 | +0.00 | 2 | 1341.86 | -0.14 | 25.5 | 1.00 |
| 1354 | arrow_pop | 1354.0 | +0.00 | 1 | 1351.58 | -2.42 | 22.0 | 1.00 |
| 1378 | thud | 1378.0 | +0.00 | 2 | 1377.86 | -0.14 | 17.6 | 1.00 |
| 1381 | arrow_pop | 1381.0 | +0.00 | 1 | 1380.98 | -0.02 | 19.7 | 1.00 |
| 1436 | whoosh | 1435.96 | -0.04 | 2 | 1435.7 | -0.30 | 57.0 | 1.00 |
| 1452 | ding | 1452.0 | +0.00 | 1 | 1451.9 | -0.10 | 999.0 | 1.00 |
| 1478 | whoosh_big | 1477.5 | -0.50 | 1 | 1477.34 | -0.66 | 45.7 | 1.00 |
| 1499 | twinkle | 1499.01 | +0.01 | 2 | 1498.88 | -0.12 | 999.0 | 1.00 |
| 1519-1790 | bubbling | 1519.32 | +0.32 | 1 | 1518.92 | -0.08 | 10.6 | 1.00 |
| 1552 | blip | 1552.01 | +0.01 | 1 | 1551.86 | -0.14 | 43.5 | 1.00 |
| 1558 | blip | 1558.03 | +0.03 | 42 | 1557.98 | -0.02 | 146.8 | 1.00 |
| 1565 | blip | 1565.0 | +0.00 | 1 | 1564.46 | -0.54 | 98.0 | 1.00 |
| 1572 | ding | 1572.0 | +0.00 | 1 | 1571.9 | -0.10 | 142.3 | 1.00 |
| 1609 | flip_blip | 1609.01 | +0.01 | 1 | 1608.92 | -0.08 | 156.5 | 1.00 |
| 1636 | arrow_pop | 1636.0 | +0.00 | 1 | 1635.86 | -0.14 | 34.1 | 1.00 |
| 1684 | thud | 1684.0 | +0.00 | 2 | 1683.86 | -0.14 | 28.0 | 1.00 |
| 1687 | metal_clang | 1687.0 | +0.00 | 0 | 1687.04 | +0.04 | 6.1 | 1.00 |
| 1735-1785 | slide_whistle_up | 1735.02 | +0.02 | 1 | 1733.84 | -1.16 | 44.6 | 1.00 |
| 1790-2018 | amb_garden | 1790.27 | +0.27 | 1 | - | - | 2.9 | 1.00 |
| 1797-1830 | swing_creak | 1797.0 | +0.00 | 1 | 1796.9 | -0.10 | 20.6 | 1.00 |
| 1833 | cork_pop | 1833.0 | +0.00 | 1 | 1832.9 | -0.10 | 16.7 | 1.00 |
| 1852 | ding | 1852.0 | +0.00 | 1 | 1851.92 | -0.08 | 135.2 | 1.00 |
| 1878 | gulp | 1878.07 | +0.07 | -4 | 1878.02 | +0.02 | 9.7 | 1.00 |
| 1915 | splash | 1915.0 | +0.00 | 1 | 1914.98 | -0.02 | 10.0 | 1.00 |
| 1945 | squeak | 1945.09 | +0.09 | 2 | 1945.16 | +0.16 | 10.4 | 1.00 |
| 1991 | arrow_pop | 1991.0 | +0.00 | 1 | 1990.94 | -0.06 | 21.7 | 1.00 |
