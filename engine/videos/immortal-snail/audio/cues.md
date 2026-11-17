# immortal-snail - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,033,600 samples = 1896 frames at 30 fps = 63.200 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.5 LU, max momentary -8.9 LUFS, max short-term -12.8 LUFS
- Stems: voice -14.4 LUFS, music -24.3 LUFS, sfx -29.4 LUFS (master gain +6.74 dB on everything; the voice file itself is -20.4 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 7.24 dB, active (>0.1 dB) on 20.90 % of samples, >0.5 dB on 11.13 %, >3 dB on 1.912 %

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
| 1 silence | 0-103 | -14.2 | - | -23.2 | -23.2 | 9.1 | 9.8 | 3.9 |
| 2 theme | 103-546 | -14.1 | -23.3 | -31.1 | -22.7 | 8.6 | 8.5 | 4.7 |
| 3 chase a | 546-642 | -14.3 | -24.9 | -34.3 | -24.4 | 10.1 | 9.6 | 6.7 |
| 3 chase b | 642-757 | -14.6 | -24.2 | -32.4 | -23.6 | 9.0 | 8.7 | 4.0 |
| 3 chase c | 757-852 | -14.3 | -23.1 | -29.3 | -22.2 | 7.9 | 8.1 | 4.7 |
| 4 silence | 852-899 | -12.9 | - | -28.6 | -28.6 | 15.7 | 16.7 | 11.6 |
| 5 mystery | 899-1198 | -14.4 | -25.3 | -30.6 | -24.4 | 9.9 | 9.9 | 4.9 |
| 6 lullaby | 1198-1432 | -14.3 | -25.6 | -32.2 | -25.0 | 10.7 | 10.8 | 5.2 |
| 7 bittersweet | 1432-1712 | -14.5 | -25.3 | -30.3 | -24.2 | 9.7 | 9.9 | 5.9 |
| 8 finale | 1712-1896 | -14.3 | -23.1 | -32.0 | -22.6 | 8.2 | 8.0 | 3.5 |

## Music map (key G major, plan tempo 132 bpm, tune "tiptoe", seed 5117)
The tune: `B D G- G A B- | C A E- F# A C- | B- G D E- A F# | G-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 3 chase a -11.0, 3 chase b -10.3, 3 chase c -9.5, 5 mystery -11.5, 6 lullaby -11.5, 7 bittersweet -11.5, 8 finale -9.5. Applied section gains (dB): 1 silence -9.6, 2 theme -9.6, 3 chase a -9.8, 3 chase b -10.9, 3 chase c -14.6, 4 silence -9.3, 5 mystery -9.3, 6 lullaby -11.1, 7 bittersweet -8.6, 8 finale -12.0.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 103.0 | 3.43 | THEME: G major, swung, 130.0 bpm, 8 bars; clarinet tune, pizzicato boom-chick, brushes |
| 269.1 | 8.97 | theme bar 4: the tune lands on the home note, 'pom-pom' answer on beats 3 and 4 |
| 324.5 | 10.82 | second statement: tune doubled by marimba and glockenspiel |
| 518.3 | 17.28 | stop chord (dominant seventh): the band leaves the next two beats to the sound effects, vibes ring |
| 546.0 | 18.20 | CHASE OSTINATO: the tune's head as running eighths (marimba), 145 bpm and accelerating over 7 bars, climbing from G major |
| 642.0 | 21.40 | accent downbeat (bar 3): timpani + cymbal; 121 bpm, bass on every beat, xylophone doubles the ostinato |
| 757.0 | 25.23 | accent downbeat (bar 5): timpani + cymbal; 214 bpm, running bass, glock on top, soft brass swells |
| 822.3 | 27.41 | last bar: dominant seventh, 243 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 852.0 | 28.40 | (no music: silence) |
| 899.0 | 29.97 | MYSTERY: the tune at half speed in E minor (vibes), tick-tock woodblock + pizzicato, 96 bpm felt in two; soft |
| 1048.5 | 34.95 | answering phrase a step higher |
| 1123.2 | 37.44 | half cadence: the tick-tock slows and stops |
| 1198.0 | 39.93 | LULLABY: the tune rocking in 6/8, Eb major (the home note is its third), music box + harp + warm pad, 62 dotted-quarters a minute |
| 1373.5 | 45.78 | last bar climbs to an unresolved second (a rising slide whistle can aim for the same note) |
| 1432.0 | 47.73 | BITTERSWEET, sweet: the head of the tune in Eb major (music box, harp), ending on a rolled chord |
| 1635.0 | 54.50 | the same phrase again ... |
| 1659.0 | 55.30 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1712.0 | 57.07 | FINALE: the tune comes home, G major, warm and a little faster (144.8 bpm): clarinet + glock + marimba, soft horns, pad |
| 1861.1 | 62.04 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 1886.0 | 62.87 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.4 LUFS integrated). Reverb by place: beach = open, garden = open, sky = void. Dead cuts (everything that sounded before them stops): f103, f852.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 103 | 0.000 | wind_rush (bed) | falling rush under the hook, rising into the flash (noise band + faint whistle + flutter, follows the speed) | -8.5 | -8.5 | -22.2 | +0.00 |
| 2 | 2 | 50 | 0.067 | footsteps | 9 footsteps (soft ground): Gus runs at the lens | -11.0 | -17.0 | -30.7 | +0.00 |
| 3 | 13 |  | 0.433 | twinkle | sparkle run of five tiny bells: the sack sparkles on 'billion' | -9.0 | -15.0 | -28.7 | +0.00 |
| 4 | 56 |  | 1.867 | squeak | rubber squeak: the snail, close | -8.0 | -14.0 | -27.7 | +0.00 |
| 5 | 84 |  | 2.800 | ting | triangle 'ting' (1568 Hz): glint on the shell on 'snail' | -9.0 | -15.0 | -28.7 | +0.00 |
| 6 | 88 |  | 2.933 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): into the flash | -2.0 | -8.0 | -21.7 | +0.00 |
| 7 | 103 | 852 | 3.433 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.7 | +0.00 |
| 8 | 103 |  | 3.433 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.7 | +0.00 |
| 9 | 110 |  | 3.667 | bird_tweet | bird chirps: nine in the morning | -11.0 | -17.0 | -30.7 | +0.20 |
| 10 | 166 |  | 5.533 | paper_flick | paper flaps + board knock: the deal | -11.0 | -17.0 | -30.7 | +0.00 |
| 11 | 212 |  | 7.067 | twinkle | sparkle run of five tiny bells: the sack sparkles on 'money' | -9.0 | -15.0 | -28.7 | +0.00 |
| 12 | 233 |  | 7.767 | whoosh | quick whoosh (ease-out burst): cut to the snail | -10.0 | -16.0 | -29.7 | +0.00 |
| 13 | 252 | 262 | 8.400 | slide_whistle_down | slide whistle falling 1480 -> 392 Hz over 10 frames: the weight falls | -7.0 | -13.0 | -26.7 | +0.00 |
| 14 | 262 |  | 8.733 | metal_clang | metal clang: the weight lands on the snail | -6.0 | -12.0 | -25.7 | +0.00 |
| 15 | 278 |  | 9.267 | boing | spring 'boing': the snail pops up and flips it off | -5.0 | -11.0 | -24.7 | +0.00 |
| 16 | 300 |  | 10.000 | ting | triangle 'ting' (1568 Hz): glint on 'forever' | -9.0 | -15.0 | -28.7 | +0.00 |
| 17 | 322 |  | 10.733 | squeak | rubber squeak: an eye stalk stretches toward his slipper | -8.0 | -14.0 | -27.7 | +0.00 |
| 18 | 329 |  | 10.967 | jump_boing | spring 'boing': Gus jumps back on 'touch' | -5.0 | -11.0 | -24.7 | +0.00 |
| 19 | 341 |  | 11.367 | thud | heavy soft thud: lands | -8.0 | -14.0 | -27.7 | +0.00 |
| 20 | 350 |  | 11.667 | buzzer | 'wrong' buzzer: red cross: game over | -6.0 | -12.0 | -25.7 | +0.00 |
| 21 | 383 | 396 | 12.767 | crowd_cheer | crowd cheer: his wife laughs (nearest: a small crowd's hurrah, soft) | -11.0 | -17.0 | -30.7 | +0.00 |
| 22 | 398 |  | 13.267 | whoosh | quick whoosh (ease-out burst): she points at it | -10.0 | -16.0 | -29.7 | +0.00 |
| 23 | 412 |  | 13.733 | squeak | rubber squeak: she giggles on | -8.0 | -14.0 | -27.7 | +0.00 |
| 24 | 433 | 452 | 14.433 | footsteps | 2 footsteps (soft ground): the neighbor walks in | -11.0 | -17.0 | -30.7 | +0.00 |
| 25 | 452 | 460 | 15.067 | slide_whistle_up | slide whistle rising 392 -> 1480 Hz over 8 frames: one big step over the snail | -7.0 | -13.0 | -26.7 | +0.00 |
| 26 | 468 |  | 15.600 | thud | heavy soft thud: his foot comes down past it | -8.0 | -14.0 | -27.7 | +0.00 |
| 27 | 484 |  | 16.133 | whoosh | quick whoosh (ease-out burst): thumb over the shoulder: just walk away | -10.0 | -16.0 | -29.7 | +0.00 |
| 28 | 519 |  | 17.300 | ding | friendly two-bell 'ding': Gus's thumbs-up: they've got a point | -7.0 | -13.0 | -26.7 | +0.00 |
| 29 | 546 |  | 18.200 | whoosh | quick whoosh (ease-out burst): to the diagram | -10.0 | -16.0 | -29.7 | +0.00 |
| 30 | 563 |  | 18.767 | pop | small bright pop: the racing snail starts | -8.0 | -14.0 | -27.7 | +0.00 |
| 31 | 597 | 640 | 19.900 | timer_ticks | egg timer: 13 tick-tocks, one every 3.6 frames, last one on f640 | -14.0 | -20.0 | -33.7 | -0.15 |
| 32 | 642 |  | 21.400 | timer_ding | kitchen-timer bell, rings about 1 s: thirteen inches: the flag | -4.0 | -10.0 | -23.7 | -0.15 |
| 33 | 674 | 686 | 22.467 | footsteps | 2 footsteps (soft ground): one single step | -11.0 | -17.0 | -30.7 | +0.00 |
| 34 | 703 |  | 23.433 | pop | small bright pop: a stopwatch pops over the snail | -8.0 | -14.0 | -27.7 | +0.00 |
| 35 | 717 | 755 | 23.900 | timer_ticks | egg timer: 12 tick-tocks, one every 3.5 frames, last one on f755 | -14.0 | -20.0 | -33.7 | -0.15 |
| 36 | 757 |  | 25.233 | timer_ding | kitchen-timer bell, rings about 1 s: the snail has caught up | -4.0 | -10.0 | -23.7 | -0.15 |
| 37 | 765 |  | 25.500 | zip | 'zwip' pass-by: tiny Gus shoots across | -7.0 | -13.0 | -26.7 | +0.00 |
| 38 | 787 |  | 26.233 | zip | 'zwip' pass-by: again | -7.0 | -13.0 | -26.7 | +0.00 |
| 39 | 805 |  | 26.833 | zip | 'zwip' pass-by: again | -8.0 | -14.0 | -27.7 | +0.00 |
| 40 | 816 |  | 27.200 | zip | 'zwip' pass-by: again | -7.0 | -13.0 | -26.7 | +0.00 |
| 41 | 834 |  | 27.800 | squeak | rubber squeak: the snail strains | -8.0 | -14.0 | -27.7 | +0.00 |
| 42 | 852 | 899 | 28.400 | amb_cricket (bed) | awkward quiet: faint breeze and ONE cricket | -33.0 | -33.0 | -46.7 | +0.00 |
| 43 | 852 |  | 28.400 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.7 | +0.00 |
| 44 | 856 |  | 28.533 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.7 | +0.00 |
| 45 | 858 |  | 28.600 | cricket | the one cricket (3-pulse chirps, about 1.6 per second) | -15.0 | -21.0 | -34.7 | +0.35 |
| 46 | 880 |  | 29.333 | gulp | cartoon gulp: he gulps | -7.0 | -13.0 | -26.7 | +0.00 |
| 47 | 899 | 974 | 29.967 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.7 | +0.00 |
| 48 | 901 | 920 | 30.033 | footsteps | 2 footsteps (soft ground): Gus strides | -11.0 | -17.0 | -30.7 | +0.00 |
| 49 | 920 | 934 | 30.667 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -10.0 | -16.0 | -29.7 | +0.00 |
| 50 | 946 |  | 31.533 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.7 | +0.00 |
| 51 | 960 |  | 32.000 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.7 | +0.00 |
| 52 | 974 | 1036 | 32.467 | amb_night (bed) | night air: crickets over a faint breeze | -27.0 | -27.0 | -40.7 | +0.00 |
| 53 | 974 |  | 32.467 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.7 | +0.00 |
| 54 | 1014 |  | 33.800 | ting | triangle 'ting' (1568 Hz): glint on 'never' | -9.0 | -15.0 | -28.7 | +0.00 |
| 55 | 1036 |  | 34.533 | whoosh | quick whoosh (ease-out burst): to the tap | -10.0 | -16.0 | -29.7 | +0.00 |
| 56 | 1047 |  | 34.900 | drip | water drop: a drop lands | -10.0 | -16.0 | -29.7 | +0.00 |
| 57 | 1067 |  | 35.567 | drip | water drop: a drop lands | -10.0 | -16.0 | -29.7 | +0.00 |
| 58 | 1088 |  | 36.267 | drip | water drop: one drop is nothing | -10.0 | -16.0 | -29.7 | +0.00 |
| 59 | 1119 |  | 37.300 | blip | blip at 1047 Hz: day one | -10.0 | -16.0 | -29.7 | +0.00 |
| 60 | 1119 | 1177 | 37.300 | bubbling (bed) | bubbling liquid | -24.0 | -24.0 | -37.7 | +0.00 |
| 61 | 1129 |  | 37.633 | blip | blip at 1319 Hz: day three | -10.0 | -16.0 | -29.7 | +0.00 |
| 62 | 1139 |  | 37.967 | blip | blip at 1568 Hz: day five | -10.0 | -16.0 | -29.7 | +0.00 |
| 63 | 1149 |  | 38.300 | blip | blip at 2093 Hz: day seven | -10.0 | -16.0 | -29.7 | +0.00 |
| 64 | 1177 |  | 39.233 | splash | plop + bubbles: over the brim | -5.0 | -11.0 | -24.7 | +0.00 |
| 65 | 1186 |  | 39.533 | squeak | rubber squeak: the rubber duck | -8.0 | -14.0 | -27.7 | +0.00 |
| 66 | 1198 | 1314 | 39.933 | amb_night (bed) | night air: crickets over a faint breeze | -27.0 | -27.0 | -40.7 | +0.00 |
| 67 | 1204 | 1258 | 40.133 | clock_tick | clock: tick-tock every 15 frames | -13.0 | -19.0 | -32.7 | -0.15 |
| 68 | 1267 |  | 42.233 | pop | small bright pop: the tape and its tag: 87 | -8.0 | -14.0 | -27.7 | +0.00 |
| 69 | 1295 |  | 43.167 | ting | triangle 'ting' (1245 Hz): closer | -9.0 | -15.0 | -28.7 | +0.00 |
| 70 | 1314 |  | 43.800 | whoosh | quick whoosh (ease-out burst): to the road | -10.0 | -16.0 | -29.7 | +0.00 |
| 71 | 1320 |  | 44.000 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.7 | +0.00 |
| 72 | 1364 |  | 45.467 | blip | blip at 990 Hz: the sun sets: a day | -10.0 | -16.0 | -29.7 | +0.00 |
| 73 | 1386 |  | 46.200 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.7 | +0.00 |
| 74 | 1418 |  | 47.267 | ting | triangle 'ting' (1245 Hz): glint on 'year' | -9.0 | -15.0 | -28.7 | +0.00 |
| 75 | 1432 | 1527 | 47.733 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.7 | +0.00 |
| 76 | 1436 | 1508 | 47.867 | footsteps | 6 footsteps (soft ground): Gus strolls | -11.0 | -17.0 | -30.7 | +0.00 |
| 77 | 1461 |  | 48.700 | pop | small bright pop: he whistles: a note floats up | -11.0 | -17.0 | -30.7 | +0.00 |
| 78 | 1489 | 1511 | 49.633 | timer_ticks | egg timer: 7 tick-tocks, one every 3.7 frames, last one on f1511 | -14.0 | -20.0 | -33.7 | -0.15 |
| 79 | 1513 |  | 50.433 | timer_ding | kitchen-timer bell, rings about 1 s: a whole day won back | -4.0 | -10.0 | -23.7 | -0.15 |
| 80 | 1527 | 1612 | 50.900 | rocket_rumble (bed) | engine roar (fade): low rumble + crackle | -17.0 | -17.0 | -30.7 | +0.00 |
| 81 | 1535 |  | 51.167 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): the airliner passes | -2.0 | -8.0 | -21.7 | +0.00 |
| 82 | 1586 |  | 52.867 | pop | small bright pop: the hourglass sign: 64 | -8.0 | -14.0 | -27.7 | +0.00 |
| 83 | 1635 | 1712 | 54.500 | rocket_rumble (bed) | engine roar (steady): low rumble + crackle | -20.0 | -20.0 | -33.7 | +0.00 |
| 84 | 1656 |  | 55.200 | pop | small bright pop: the bubble: the suitcase in the hold | -8.0 | -14.0 | -27.7 | +0.00 |
| 85 | 1687 |  | 56.233 | ricochet_ping | cartoon ricochet 'pyeeow', small: the snail winks | -9.0 | -15.0 | -28.7 | +0.15 |
| 86 | 1698 |  | 56.600 | ting | triangle 'ting' (1245 Hz): glint on 'ride' | -9.0 | -15.0 | -28.7 | +0.00 |
| 87 | 1712 | 1896 | 57.067 | amb_ocean_night (bed) | night ocean: slow swells, foam, water lapping on the boat, timber creaks | -21.0 | -21.0 | -34.7 | +0.00 |
| 88 | 1724 |  | 57.467 | thud | heavy soft thud: Gus lands on the sand | -5.0 | -11.0 | -24.7 | +0.00 |
| 89 | 1761 |  | 58.700 | twinkle | sparkle run of five tiny bells: the sack sparkles | -9.0 | -15.0 | -28.7 | +0.00 |
| 90 | 1804 |  | 60.133 | ting | triangle 'ting' (1568 Hz): the suitcase glints | -9.0 | -15.0 | -28.7 | +0.00 |
| 91 | 1838 | 1856 | 61.267 | slide_whistle_up_slowing | slide whistle rising 587 -> 1568 Hz, slower and slower, fading to nothing by f1856 | -9.0 | -15.0 | -28.7 | +0.00 |
| 92 | 1866 |  | 62.200 | ricochet_ping | cartoon ricochet 'pyeeow', small: the snail, on the last word | -9.0 | -15.0 | -28.7 | +0.15 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: footsteps@433 -2.84 (snr 26.9), footsteps@674 -2.70 (snr 17.5), gulp@880 -2.66 (snr 11.2)
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): whoosh_big@88, crowd_cheer@383
- Files: `mix.wav` 3,033,600 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,033,600 samples, 48000 Hz, 2 ch, 24-bit, peak -0.52 dBFS, 0 clipped; `stem_music.wav` 3,033,600 samples, 48000 Hz, 2 ch, 24-bit, peak -10.59 dBFS, 0 clipped; `stem_sfx.wav` 3,033,600 samples, 48000 Hz, 2 ch, 24-bit, peak -9.0 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.02 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.47 LU, max momentary -8.88 LUFS. Stems minus mix: -126.5 dB.
- Event onsets in `stem_sfx.wav` (91 events, tolerance 1 frame): matched 91/91 within tolerance (largest error 0.56 frame, largest lag 93 samples); blind band-flux detector resolved 84 of them, 81 within tolerance (largest error 2.84 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): whoosh_big@88, amb_garden@103, crowd_cheer@383, amb_garden@899, amb_night@974, rocket_rumble@1527, amb_ocean_night@1712.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **7.97 dB** over 51.07 s of speech (400 ms windows: median 7.18, 10th percentile -0.11, 90th 12.7 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-102.9, 852-899 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -68.0 dBFS, below 20 Hz -40.0 dB, above 12 kHz -44.7 dB of the total energy, centroid 826 Hz. Bands (dB of total): 0-20 Hz -40.0, 20-60 Hz -29.9, 60-300 Hz -3.6, 300-3000 Hz -3.2, 3000-8000 Hz -11.1, 8000-12000 Hz -24.1, 12000-16000 Hz -44.7, 16000-24000 Hz -68.2.
- Score landmarks: first sound at f102.92; 1 silence f0-103: -240.0 dBFS; 2 theme: onset at f102.92 (plan f103); 3 chase: onset at f545.9 (plan f546); 4 silence f852-899: -240.0 dBFS; 5 mystery: onset at f898.98 (plan f899); 6 lullaby: onset at f1197.92 (plan f1198); 7 bittersweet: onset at f1431.92 (plan f1432); 8 finale: onset at f1712.0 (plan f1712), button at f1885.82 (plan f1886); last 10 ms -78.0 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-103 | 7.39 | 7.0 | -3.52 |
| 2 theme | 103-546 | 7.09 | 5.97 | -0.57 |
| 3 chase a | 546-642 | 7.77 | 7.39 | 1.95 |
| 3 chase b | 642-757 | 6.85 | 6.08 | -1.77 |
| 3 chase c | 757-852 | 6.9 | 5.79 | -0.05 |
| 4 silence | 852-899 | 15.9 | 17.44 | 12.76 |
| 5 mystery | 899-1198 | 8.3 | 7.2 | -0.47 |
| 6 lullaby | 1198-1432 | 9.59 | 9.36 | 1.65 |
| 7 bittersweet | 1432-1712 | 9.29 | 9.02 | 2.26 |
| 8 finale | 1712-1896 | 6.96 | 5.58 | -1.51 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-99 | 7.39 | Gus has a billion dollars, and he's running away from a snail. |
| 2 | 103-195 | 7.52 | It's nine in the morning in the garden, and the deal is simple. |
| 3 | 198-370 | 7.13 | He keeps the money. But a snail that can't die will follow him forever |
| 4 | 373-506 | 5.9 | His wife laughs. It's a snail. His neighbor steps right over it. Just  |
| 5 | 509-657 | 8.01 | And they've got a point. The fastest snail ever timed took two minutes |
| 6 | 660-760 | 7.77 | Gus takes one step and the snail needs four minutes to catch up. |
| 7 | 764-848 | 6.92 | He walks almost five hundred times faster than it crawls. |
| 8 | 852-896 | 15.9 | So why can't Gus sleep at night? |
| 9 | 899-1032 | 7.91 | You see, Gus has to stop. He eats. He naps. He sleeps. The snail never |
| 10 | 1036-1194 | 8.64 | It's like a dripping tap. One drop is nothing, but leave it for a week |
| 11 | 1198-1311 | 10.14 | Every night Gus sleeps, the snail gets eighty-seven yards closer. |
| 12 | 1314-1428 | 9.1 | That's two hundred and sixty yards a day, and fifty-four miles a year. |
| 13 | 1432-1523 | 7.68 | Luckily, Gus can win a whole day back with a three-minute walk. |
| 14 | 1527-1632 | 12.99 | And one flight across the ocean puts sixty-four years between them. |
| 15 | 1635-1709 | 8.31 | Unluckily, snails are very good at hitching a ride. |
| 16 | 1712-1881 | 6.96 | So Gus lands on a sunny beach with a billion dollars, one suitcase, an |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-103 | wind_rush | 0.07 | +0.07 | 1 | -0.1 | -0.10 | 17.9 | 0.96 |
| 2-50 | footsteps | 1.98 | -0.02 | -33 | 1.94 | -0.06 | 36.8 | 1.00 |
| 13 | twinkle | 13.0 | +0.00 | 2 | 13.04 | +0.04 | 999.0 | 1.00 |
| 56 | squeak | 56.09 | +0.09 | 2 | 56.18 | +0.18 | 6.8 | 1.00 |
| 84 | ting | 84.0 | +0.00 | 2 | 83.9 | -0.10 | 37.9 | 0.77 |
| 88 | whoosh_big | 87.6 | -0.40 | 1 | - | - | 3.5 | 0.98 |
| 103 | flash_hit | 102.65 | -0.35 | 2 | 103.22 | +0.22 | 9.3 | 1.00 |
| 103-852 | amb_garden | 103.09 | +0.09 | 1 | - | - | 2.7 | 0.99 |
| 110 | bird_tweet | 110.28 | +0.28 | 2 | 110.36 | +0.36 | 999.0 | 1.00 |
| 166 | paper_flick | 166.0 | +0.00 | 2 | 165.92 | -0.08 | 25.4 | 1.00 |
| 212 | twinkle | 212.01 | +0.01 | 2 | 211.94 | -0.06 | 999.0 | 1.00 |
| 233 | whoosh | 233.0 | +0.00 | 2 | 233.06 | +0.06 | 9.1 | 1.00 |
| 252-262 | slide_whistle_down | 252.02 | +0.02 | 1 | 251.96 | -0.04 | 41.5 | 1.00 |
| 262 | metal_clang | 262.0 | +0.00 | 1 | 261.92 | -0.08 | 22.8 | 1.00 |
| 278 | boing | 278.01 | +0.01 | 1 | 278.0 | +0.00 | 11.8 | 1.00 |
| 300 | ting | 300.0 | +0.00 | 2 | 299.9 | -0.10 | 320.0 | 1.00 |
| 322 | squeak | 322.09 | +0.09 | 2 | 322.1 | +0.10 | 14.5 | 1.00 |
| 329 | jump_boing | 329.02 | +0.02 | 1 | 329.0 | +0.00 | 11.2 | 1.00 |
| 341 | thud | 341.0 | +0.00 | 2 | 340.94 | -0.06 | 13.7 | 1.00 |
| 350 | buzzer | 350.08 | +0.08 | 0 | 350.06 | +0.06 | 8.9 | 1.00 |
| 383-396 | crowd_cheer | 383.37 | +0.37 | 1 | - | - | 3.3 | 1.00 |
| 398 | whoosh | 398.04 | +0.04 | 2 | 398.42 | +0.42 | 6.2 | 1.00 |
| 412 | squeak | 412.09 | +0.09 | 2 | 412.22 | +0.22 | 12.9 | 1.00 |
| 433-452 | footsteps | 432.98 | -0.02 | -37 | 430.16 | -2.84 | 26.9 | 1.00 |
| 452-460 | slide_whistle_up | 452.03 | +0.03 | 1 | 452.0 | +0.00 | 14.2 | 1.00 |
| 468 | thud | 468.0 | +0.00 | 2 | 467.9 | -0.10 | 16.6 | 1.00 |
| 484 | whoosh | 483.98 | -0.02 | 2 | 483.98 | -0.02 | 7.7 | 1.00 |
| 519 | ding | 519.0 | +0.00 | 1 | 518.9 | -0.10 | 103.9 | 1.00 |
| 546 | whoosh | 546.07 | +0.07 | 2 | 546.26 | +0.26 | 8.8 | 1.00 |
| 563 | pop | 563.0 | +0.00 | 1 | 562.94 | -0.06 | 19.4 | 1.00 |
| 597-640 | timer_ticks | 597.0 | +0.00 | 2 | 596.9 | -0.10 | 30.5 | 1.00 |
| 642 | timer_ding | 642.0 | +0.00 | 1 | 641.9 | -0.10 | 48.5 | 1.00 |
| 674-686 | footsteps | 673.99 | -0.01 | -24 | 671.3 | -2.70 | 17.5 | 1.00 |
| 703 | pop | 703.0 | +0.00 | 1 | 702.92 | -0.08 | 21.4 | 1.00 |
| 717-755 | timer_ticks | 717.0 | +0.00 | 2 | 716.9 | -0.10 | 27.7 | 1.00 |
| 757 | timer_ding | 757.06 | +0.06 | 93 | 756.92 | -0.08 | 72.4 | 1.00 |
| 765 | zip | 764.44 | -0.56 | 1 | 764.6 | -0.40 | 7.3 | 1.00 |
| 787 | zip | 786.53 | -0.47 | 2 | 786.56 | -0.44 | 9.7 | 1.00 |
| 805 | zip | 804.53 | -0.47 | 2 | 804.56 | -0.44 | 10.5 | 1.00 |
| 816 | zip | 815.45 | -0.55 | 1 | 815.9 | -0.10 | 9.1 | 1.00 |
| 834 | squeak | 834.09 | +0.09 | 2 | 834.14 | +0.14 | 12.2 | 1.00 |
| 852 | record_stop | 852.0 | +0.00 | 2 | 851.9 | -0.10 | 21.9 | 1.00 |
| 852-899 | amb_cricket | 852.09 | +0.09 | 0 | 851.96 | -0.04 | 8.6 | 1.00 |
| 856 | question_blip | 856.01 | +0.01 | 1 | 856.04 | +0.04 | 8.1 | 1.00 |
| 880 | gulp | 880.01 | +0.01 | -4 | 877.34 | -2.66 | 11.2 | 1.00 |
| 899-974 | amb_garden | 899.12 | +0.12 | 1 | - | - | 2.8 | 1.00 |
| 901-920 | footsteps | 900.99 | -0.01 | -28 | 900.2 | -0.80 | 21.6 | 1.00 |
| 920-934 | decel_whoosh | 920.08 | +0.08 | 1 | 920.0 | -0.00 | 15.1 | 1.00 |
| 946 | chomp | 946.0 | +0.00 | 2 | 945.86 | -0.14 | 15.0 | 1.00 |
| 960 | flip_blip | 960.01 | +0.01 | 1 | 959.96 | -0.04 | 93.0 | 1.00 |
| 974 | flip_blip | 974.01 | +0.01 | 1 | 973.94 | -0.06 | 109.9 | 1.00 |
| 974-1036 | amb_night | 974.1 | +0.10 | 1 | - | - | 3.5 | 1.00 |
| 1014 | ting | 1014.0 | +0.00 | 2 | 1013.9 | -0.10 | 164.4 | 1.00 |
| 1036 | whoosh | 1036.04 | +0.04 | 2 | 1036.04 | +0.04 | 8.7 | 1.00 |
| 1047 | drip | 1047.0 | +0.00 | 1 | 1046.96 | -0.04 | 27.2 | 1.00 |
| 1067 | drip | 1067.0 | +0.00 | 1 | 1066.88 | -0.12 | 49.1 | 1.00 |
| 1088 | drip | 1088.0 | +0.00 | 1 | 1087.88 | -0.12 | 52.5 | 1.00 |
| 1119 | blip | 1119.0 | +0.00 | 1 | 1118.9 | -0.10 | 100.0 | 1.00 |
| 1119-1177 | bubbling | 1119.01 | +0.01 | 1 | 1118.9 | -0.10 | 95.5 | 1.00 |
| 1129 | blip | 1128.98 | -0.02 | -35 | 1128.92 | -0.08 | 221.0 | 1.00 |
| 1139 | blip | 1139.02 | +0.02 | 32 | 1138.88 | -0.12 | 205.1 | 1.00 |
| 1149 | blip | 1149.03 | +0.03 | 47 | 1148.9 | -0.10 | 124.9 | 1.00 |
| 1177 | splash | 1177.0 | +0.00 | 1 | 1176.92 | -0.08 | 19.8 | 1.00 |
| 1186 | squeak | 1186.09 | +0.09 | 2 | 1185.08 | -0.92 | 11.5 | 1.00 |
| 1198-1314 | amb_night | 1198.13 | +0.13 | 1 | 1198.1 | +0.10 | 5.5 | 1.00 |
| 1204-1258 | clock_tick | 1204.0 | +0.00 | 1 | 1203.92 | -0.08 | 19.7 | 1.00 |
| 1267 | pop | 1267.0 | +0.00 | 1 | 1266.92 | -0.08 | 23.6 | 1.00 |
| 1295 | ting | 1295.0 | +0.00 | 2 | 1294.88 | -0.12 | 82.7 | 1.00 |
| 1314 | whoosh | 1313.93 | -0.07 | 2 | 1313.9 | -0.10 | 6.8 | 1.00 |
| 1320 | arrow_pop | 1320.0 | +0.00 | 1 | 1319.96 | -0.04 | 11.8 | 1.00 |
| 1364 | blip | 1364.01 | +0.00 | 1 | 1363.88 | -0.12 | 408.6 | 1.00 |
| 1386 | arrow_pop | 1386.0 | +0.00 | 1 | 1385.84 | -0.16 | 83.8 | 1.00 |
| 1418 | ting | 1418.0 | +0.00 | 2 | 1417.88 | -0.12 | 519.1 | 1.00 |
| 1432-1527 | amb_garden | 1432.09 | +0.09 | 1 | 1431.98 | -0.02 | 25.7 | 1.00 |
| 1436-1508 | footsteps | 1435.99 | -0.01 | -24 | 1435.28 | -0.72 | 376.8 | 1.00 |
| 1461 | pop | 1461.0 | +0.00 | 1 | 1460.96 | -0.04 | 21.2 | 1.00 |
| 1489-1511 | timer_ticks | 1489.0 | +0.00 | 2 | 1488.92 | -0.08 | 20.5 | 1.00 |
| 1513 | timer_ding | 1513.06 | +0.06 | 93 | 1512.92 | -0.08 | 32.4 | 1.00 |
| 1527-1612 | rocket_rumble | 1527.26 | +0.26 | 1 | - | - | 3.6 | 1.00 |
| 1535 | whoosh_big | 1534.45 | -0.55 | 1 | 1534.46 | -0.54 | 7.8 | 1.00 |
| 1586 | pop | 1586.0 | +0.00 | 1 | 1585.94 | -0.06 | 18.9 | 1.00 |
| 1635-1712 | rocket_rumble | 1635.08 | +0.08 | 1 | 1634.96 | -0.04 | 25.0 | 1.00 |
| 1656 | pop | 1656.0 | +0.00 | 1 | 1655.96 | -0.04 | 20.7 | 1.00 |
| 1687 | ricochet_ping | 1687.0 | +0.00 | 2 | 1686.92 | -0.08 | 37.5 | 1.00 |
| 1698 | ting | 1698.0 | +0.00 | 2 | 1697.96 | -0.04 | 34.7 | 1.00 |
| 1712-1896 | amb_ocean_night | 1712.07 | +0.07 | 2 | - | - | 3.1 | 1.00 |
| 1724 | thud | 1724.0 | +0.00 | 2 | 1723.94 | -0.06 | 13.2 | 1.00 |
| 1761 | twinkle | 1761.01 | +0.01 | 2 | 1760.96 | -0.04 | 999.0 | 1.00 |
| 1804 | ting | 1804.0 | +0.00 | 2 | 1803.98 | -0.02 | 48.2 | 1.00 |
| 1838-1856 | slide_whistle_up_slowing | 1838.02 | +0.02 | 1 | 1838.06 | +0.06 | 9.7 | 1.00 |
| 1866 | ricochet_ping | 1866.0 | +0.00 | 2 | 1865.9 | -0.10 | 31.0 | 1.00 |
