# friction-off-5-seconds - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,232,000 samples = 2020 frames at 30 fps = 67.333 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.5 LU, max momentary -9.4 LUFS, max short-term -12.7 LUFS
- Stems: voice -14.4 LUFS, music -24.2 LUFS, sfx -29.6 LUFS (master gain +7.15 dB on everything; the voice file itself is -20.7 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 7.63 dB, active (>0.1 dB) on 24.71 % of samples, >0.5 dB on 12.32 %, >3 dB on 1.511 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -14.0 LUFS
    Threshold: -24.1 LUFS
  Loudness range:
    LRA:         1.5 LU
    Threshold: -34.0 LUFS
    LRA low:   -14.8 LUFS
    LRA high:  -13.2 LUFS
  True peak:
    Peak:       -1.2 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| 1 silence | 0-165 | -14.6 | -66.0 | -23.8 | -23.8 | 9.1 | 9.8 | 3.1 |
| 2 theme | 165-572 | -14.2 | -23.2 | -32.4 | -22.8 | 8.6 | 8.9 | 4.4 |
| 3 silence | 572-590 | -19.6 | -59.1 | -30.1 | -30.1 | 10.5 | 11.6 | 10.5 |
| 4 chase a | 590-736 | -14.4 | -25.2 | -31.7 | -24.5 | 10.1 | 10.0 | 6.5 |
| 4 chase b | 736-857 | -14.2 | -24.4 | -30.3 | -24.0 | 9.8 | 9.0 | 5.2 |
| 4 chase c | 857-889 | -15.1 | -24.4 | -32.9 | -23.8 | 8.7 | 8.3 | 6.5 |
| 5 chase a | 889-947 | -13.2 | -24.0 | -38.5 | -23.8 | 10.7 | 10.0 | 6.6 |
| 5 chase b | 947-1002 | -12.9 | -22.6 | -35.3 | -22.3 | 9.5 | 9.1 | 1.6 |
| 5 chase c | 1002-1053 | -13.9 | -23.1 | -30.4 | -22.3 | 8.4 | 8.7 | 2.7 |
| 6 silence | 1053-1087 | -12.6 | - | -29.3 | -29.3 | 16.8 | 19.4 | 11.4 |
| 7 mystery | 1087-1305 | -14.5 | -25.4 | -32.6 | -24.8 | 10.3 | 9.3 | 6.5 |
| 8 waltz | 1305-1456 | -14.6 | -24.8 | -33.4 | -24.2 | 9.6 | 9.7 | 5.0 |
| 9 mystery | 1456-1535 | -13.5 | -24.9 | -33.7 | -24.2 | 10.7 | 10.0 | 6.3 |
| 10 chase a | 1535-1589 | -13.9 | -24.1 | -30.2 | -23.0 | 9.2 | 9.1 | 7.6 |
| 10 chase b | 1589-1640 | -16.8 | -26.9 | -29.0 | -24.8 | 8.1 | 7.9 | 3.7 |
| 10 chase c | 1640-1660 | -15.1 | -24.1 | -26.4 | -22.0 | 7.0 | 7.9 | 3.3 |
| 11 bittersweet | 1660-1840 | -14.2 | -25.2 | -30.1 | -24.1 | 9.9 | 9.5 | 6.2 |
| 12 runup | 1840-1916 | -14.2 | -22.5 | -33.9 | -22.3 | 8.0 | 7.7 | 2.9 |
| 13 finale | 1916-2020 | -14.2 | -23.5 | -31.9 | -22.9 | 8.7 | 8.3 | 3.0 |

## Music map (key A major, plan tempo 128 bpm, tune "tiptoe", seed 1120)
The tune: `Db E A- A B Db- | D B F#- Ab B D- | Db- A E F#- B Ab | A-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 4 chase a -11.0, 4 chase b -10.3, 4 chase c -9.5, 5 chase a -11.0, 5 chase b -10.3, 5 chase c -9.5, 7 mystery -11.5, 8 waltz -11.0, 9 mystery -11.5, 10 chase a -11.0, 10 chase b -10.3, 10 chase c -9.5, 11 bittersweet -11.5, 12 runup -9.5, 13 finale -9.5. Applied section gains (dB): 1 silence -9.6, 2 theme -9.6, 3 silence -9.8, 4 chase a -9.8, 4 chase b -13.3, 4 chase c -16.7, 5 chase a -9.2, 5 chase b -10.5, 5 chase c -14.0, 6 silence -11.0, 7 mystery -11.0, 8 waltz -11.6, 9 mystery -11.6, 10 chase a -8.2, 10 chase b -14.7, 10 chase c -17.3, 11 bittersweet -9.6, 12 runup -11.7, 13 finale -13.7.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 165.0 | 5.50 | THEME: A major, swung, 123.8 bpm, 7 bars; clarinet tune, pizzicato boom-chick, brushes |
| 339.4 | 11.31 | theme bar 4: the tune lands on the home note, 'pom-pom' answer on beats 3 and 4 |
| 397.6 | 13.25 | second statement: tune doubled by marimba and glockenspiel |
| 542.9 | 18.10 | stop chord (dominant seventh): the band leaves the next two beats to the sound effects, vibes ring |
| 572.0 | 19.07 | (no music: silence) |
| 590.0 | 19.67 | CHASE OSTINATO: the tune's head as running eighths (marimba), 139 bpm and accelerating over 7 bars, climbing from A major |
| 857.0 | 28.57 | accent downbeat (bar 7): timpani + cymbal; 225 bpm, running bass, glock on top, soft brass swells |
| 857.0 | 28.57 | last bar: dominant seventh, 225 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 889.0 | 29.63 | CHASE OSTINATO: the tune's head as running eighths (marimba), 124 bpm and accelerating over 3 bars, climbing from A major |
| 947.2 | 31.57 | accent downbeat (bar 2): timpani + cymbal; 132 bpm, bass on every beat, xylophone doubles the ostinato |
| 1001.8 | 33.39 | accent downbeat (bar 3): timpani + cymbal; 141 bpm, running bass, glock on top, soft brass swells |
| 1001.8 | 33.39 | last bar: dominant seventh, 141 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 1053.0 | 35.10 | (no music: silence) |
| 1087.0 | 36.23 | MYSTERY: the tune at half speed in F# minor (vibes), tick-tock woodblock + pizzicato, 132 bpm felt in two; soft |
| 1196.0 | 39.87 | answering phrase a step higher |
| 1250.5 | 41.68 | half cadence: the tick-tock slows and stops |
| 1305.0 | 43.50 | WALTZ: music box in A major, 138 bpm, pick-up on f1309, downbeats at f1329, f1368, low point f1407 |
| 1367.8 | 45.59 | the tune steps down do-la-fa into |
| 1407.0 | 46.90 | the low point (low home note); then the arpeggio climbs, slower and slower, to the rest |
| 1443.0 | 48.10 | the rest: the high home note rings, everything else waits |
| 1456.0 | 48.53 | MYSTERY: the tune at half speed in F# minor (vibes), tick-tock woodblock + pizzicato, 182 bpm felt in two; soft |
| 1495.5 | 49.85 | half cadence: the tick-tock slows and stops |
| 1535.0 | 51.17 | CHASE OSTINATO: the tune's head as running eighths (marimba), 133 bpm and accelerating over 3 bars, climbing from A major |
| 1640.0 | 54.67 | accent downbeat (bar 3): timpani + cymbal; 360 bpm, running bass, glock on top, soft brass swells |
| 1640.0 | 54.67 | last bar: dominant seventh, 360 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 1660.0 | 55.33 | BITTERSWEET, sweet: the head of the tune in F major (music box, harp), ending on a rolled chord |
| 1705.0 | 56.83 | the same phrase again ... |
| 1720.0 | 57.33 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1840.0 | 61.33 | RUN-UP: the ostinato on the dominant seventh, 184 bpm and accelerating, 2 bars up into the next section |
| 1916.0 | 63.87 | FINALE: the tune comes home, A major, warm and a little faster (191.5 bpm): clarinet + glock + marimba, soft horns, pad |
| 1991.2 | 66.37 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 2010.0 | 67.00 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.4 LUFS integrated). Reverb by place: garden = open, sky = void. Dead cuts (everything that sounded before them stops): f165, f1053.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 165 | 0.000 | wind_rush (bed) | falling rush under the hook, rising into the flash (noise band + faint whistle + flutter, follows the speed) | -8.5 | -8.5 | -22.1 | +0.00 |
| 2 | 113 |  | 3.767 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 3 | 150 |  | 5.000 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): rush before the flash | -2.0 | -8.0 | -21.6 | +0.00 |
| 4 | 165 | 590 | 5.500 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 5 | 165 |  | 5.500 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.6 | +0.00 |
| 6 | 190 |  | 6.333 | bird_tweet | bird chirps: a sparrow | -11.0 | -17.0 | -30.6 | +0.20 |
| 7 | 235 |  | 7.833 | oof | 'ugh': Gus shoves the pot | -6.0 | -12.0 | -25.6 | +0.00 |
| 8 | 238 | 252 | 7.933 | door_creak | door creak: the pot scrapes over the ground | -9.0 | -15.0 | -28.6 | +0.00 |
| 9 | 276 |  | 9.200 | oof | 'oof': he shoves again | -6.0 | -12.0 | -25.6 | +0.00 |
| 10 | 279 | 293 | 9.300 | door_creak | door creak: it scrapes a little further | -9.0 | -15.0 | -28.6 | +0.00 |
| 11 | 312 | 326 | 10.400 | door_creak | door creak: it scrapes | -9.0 | -15.0 | -28.6 | +0.00 |
| 12 | 329 |  | 10.967 | bonk | cartoon bonk: it sticks dead | -6.0 | -12.0 | -25.6 | +0.00 |
| 13 | 365 |  | 12.167 | whoosh | quick whoosh (ease-out burst): he jabs a finger at the lawn | -10.0 | -16.0 | -29.6 | +0.00 |
| 14 | 439 |  | 14.633 | gulp | cartoon gulp: his wife takes a sip | -11.0 | -17.0 | -30.6 | +0.00 |
| 15 | 499 |  | 16.633 | ding | friendly two-bell 'ding': the neighbor's thumbs-up | -7.0 | -13.0 | -26.6 | +0.00 |
| 16 | 525 |  | 17.500 | pop | small bright pop: a stopwatch pops in | -8.0 | -14.0 | -27.6 | +0.00 |
| 17 | 536 |  | 17.867 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 18 | 572 |  | 19.067 | click | click: the stopwatch starts | -11.0 | -17.0 | -30.6 | +0.00 |
| 19 | 574 |  | 19.133 | twinkle | sparkle run of five tiny bells: the wish: a shimmer runs over the lawn | -9.0 | -15.0 | -28.6 | +0.00 |
| 20 | 590 | 889 | 19.667 | amb_cricket (bed) | garden air: light breeze, sparrows | -33.0 | -33.0 | -46.6 | +0.00 |
| 21 | 597 |  | 19.900 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.6 | +0.10 |
| 22 | 601 |  | 20.033 | zip | 'zwip' pass-by: the pot glides away like a puck | -8.0 | -14.0 | -27.6 | +0.00 |
| 23 | 620 |  | 20.667 | ding | friendly two-bell 'ding': arms up: it works | -10.0 | -16.0 | -29.6 | +0.00 |
| 24 | 668 | 740 | 22.267 | footsteps | 13 footsteps (soft ground): his legs run, he does not move | -13.0 | -19.0 | -32.6 | +0.00 |
| 25 | 694 |  | 23.133 | squeak | rubber squeak: his slippers find no grip | -8.0 | -14.0 | -27.6 | +0.00 |
| 26 | 720 |  | 24.000 | squeak | rubber squeak: still none | -8.0 | -14.0 | -27.6 | +0.00 |
| 27 | 764 | 780 | 25.467 | slide_whistle_down | slide whistle falling 1661 -> 440 Hz over 16 frames: the cup slips through her fingers | -7.0 | -13.0 | -26.6 | +0.00 |
| 28 | 782 |  | 26.067 | thud | heavy soft thud: it lands in the grass | -11.0 | -17.0 | -30.6 | +0.00 |
| 29 | 841 | 857 | 28.033 | slide_whistle_down | slide whistle falling 784 -> 440 Hz over 16 frames: the ladder slides down the wall | -7.0 | -13.0 | -26.6 | +0.00 |
| 30 | 857 |  | 28.567 | crash | crash: crack + boom + clatter: and lies flat | -6.0 | -12.0 | -25.6 | +0.00 |
| 31 | 892 | 1053 | 29.733 | wind_rush (bed) | speed rush, rising (noise band + faint whistle + flutter, follows the speed) | -19.0 | -19.0 | -32.6 | +0.00 |
| 32 | 1019 |  | 33.967 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.6 | +0.00 |
| 33 | 1053 |  | 35.100 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.6 | +0.00 |
| 34 | 1085 |  | 36.167 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.6 | +0.00 |
| 35 | 1131 |  | 37.700 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 36 | 1163 |  | 38.767 | pop | small bright pop: a rain cloud | -8.0 | -14.0 | -27.6 | +0.00 |
| 37 | 1165 | 1220 | 38.833 | amb_rain (bed) | rain: hiss and patter | -27.0 | -27.0 | -40.6 | +0.00 |
| 38 | 1181 |  | 39.367 | drip | water drop: rain runs down the slope | -10.0 | -16.0 | -29.6 | +0.00 |
| 39 | 1192 |  | 39.733 | drip | water drop: another drop | -10.0 | -16.0 | -29.6 | +0.00 |
| 40 | 1203 |  | 40.100 | drip | water drop: away from the house | -10.0 | -16.0 | -29.6 | +0.00 |
| 41 | 1216 | 1305 | 40.533 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 42 | 1231 |  | 41.033 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 43 | 1258 |  | 41.933 | thud | heavy soft thud: a nine-pound weight | -9.0 | -15.0 | -28.6 | +0.00 |
| 44 | 1281 |  | 42.700 | twinkle | sparkle run of five tiny bells: he whistles, all day long | -13.0 | -19.0 | -32.6 | +0.00 |
| 45 | 1309 |  | 43.633 | whoosh | quick whoosh (ease-out burst): the upper brush comes down | -10.0 | -16.0 | -29.6 | +0.00 |
| 46 | 1323 |  | 44.100 | click | click: the bristles mesh | -11.0 | -17.0 | -30.6 | +0.00 |
| 47 | 1338 |  | 44.600 | squeak | rubber squeak: it will not slide | -8.0 | -14.0 | -27.6 | +0.00 |
| 48 | 1356 | 1535 | 45.200 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 49 | 1362 |  | 45.400 | pop | small bright pop: a magnifying glass | -8.0 | -14.0 | -27.6 | +0.00 |
| 50 | 1441 |  | 48.033 | click | click: the teeth lock | -8.0 | -14.0 | -27.6 | +0.00 |
| 51 | 1443 |  | 48.100 | ting | triangle 'ting' (1760 Hz): a glint | -9.0 | -15.0 | -28.6 | +0.00 |
| 52 | 1463 |  | 48.767 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.6 | +0.00 |
| 53 | 1488 |  | 49.600 | zip | 'zwip' pass-by: the smooth sole slides off | -10.0 | -16.0 | -29.6 | +0.00 |
| 54 | 1535 | 1650 | 51.167 | wind_rush (bed) | speed rush, rising (noise band + faint whistle + flutter, follows the speed) | -17.0 | -17.0 | -30.6 | +0.00 |
| 55 | 1537 |  | 51.233 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 56 | 1546 |  | 51.533 | pop | small bright pop: a feather over the cup | -8.0 | -14.0 | -27.6 | +0.00 |
| 57 | 1560 |  | 52.000 | pop | small bright pop: the stopwatch | -8.0 | -14.0 | -27.6 | +0.00 |
| 58 | 1565 | 1640 | 52.167 | timer_ticks | egg timer: 22 tick-tocks, one every 3.6 frames, last one on f1640 | -14.0 | -20.0 | -33.6 | -0.15 |
| 59 | 1607 |  | 53.567 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 60 | 1640 |  | 54.667 | timer_ding | kitchen-timer bell, rings about 1 s: five seconds are up | -4.0 | -10.0 | -23.6 | -0.15 |
| 61 | 1656 | 2020 | 55.200 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 62 | 1671 |  | 55.700 | twinkle | sparkle run of five tiny bells: friction comes back | -9.0 | -15.0 | -28.6 | +0.00 |
| 63 | 1692 |  | 56.400 | shovel_thunk | blade into the dirt: thud + grit + dull ring | -6.0 | -12.0 | -25.6 | +0.00 |
| 64 | 1721 |  | 57.367 | squeak | rubber squeak: his feet stop dead | -8.0 | -14.0 | -27.6 | +0.00 |
| 65 | 1738 |  | 57.933 | whoosh | quick whoosh (ease-out burst): the rest of him keeps going | -10.0 | -16.0 | -29.6 | +0.00 |
| 66 | 1765 | 1795 | 58.833 | slide_whistle_down | slide whistle falling 1319 -> 349 Hz over 30 frames: he sails across the lawn | -7.0 | -13.0 | -26.6 | +0.00 |
| 67 | 1795 |  | 59.833 | thud | heavy soft thud: belly flop | -5.0 | -11.0 | -24.6 | +0.00 |
| 68 | 1798 |  | 59.933 | oof | 'oof': oof | -6.0 | -12.0 | -25.6 | +0.00 |
| 69 | 1812 |  | 60.400 | bird_tweet | bird chirps: stars and birds over his helmet | -11.0 | -17.0 | -30.6 | +0.20 |
| 70 | 1860 |  | 62.000 | whoosh | quick whoosh (ease-out burst): the lens sweeps along the lawn | -10.0 | -16.0 | -29.6 | +0.00 |
| 71 | 1880 |  | 62.667 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 72 | 1922 | 1938 | 64.067 | door_creak | door creak: he drags the pot back | -9.0 | -15.0 | -28.6 | +0.00 |
| 73 | 1945 | 1961 | 64.833 | door_creak | door creak: scrape | -9.0 | -15.0 | -28.6 | +0.00 |
| 74 | 1972 | 1986 | 65.733 | door_creak | door creak: scrape | -9.0 | -15.0 | -28.6 | +0.00 |
| 75 | 1993 |  | 66.433 | ding | friendly two-bell 'ding': thumbs-up: never complains again | -7.0 | -13.0 | -26.6 | +0.00 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: gulp@439 -2.60 (snr 7.6), footsteps@668 -1.26 (snr 13.2), squeak@720 -1.96 (snr 12.2), question_blip@1019 -1.68 (snr 9.0), arrow_pop@1607 -2.76 (snr 10.1), shovel_thunk@1692 -1.78 (snr 18.3)
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): whoosh_big@150, door_creak@238, door_creak@279
- Files: `mix.wav` 3,232,000 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,232,000 samples, 48000 Hz, 2 ch, 24-bit, peak -0.46 dBFS, 0 clipped; `stem_music.wav` 3,232,000 samples, 48000 Hz, 2 ch, 24-bit, peak -8.99 dBFS, 0 clipped; `stem_sfx.wav` 3,232,000 samples, 48000 Hz, 2 ch, 24-bit, peak -7.66 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.54 LU, max momentary -9.37 LUFS. Stems minus mix: -126.6 dB.
- Event onsets in `stem_sfx.wav` (75 events, tolerance 1 frame): matched 75/75 within tolerance (largest error 0.53 frame, largest lag 101 samples); blind band-flux detector resolved 68 of them, 62 within tolerance (largest error 2.76 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): whoosh_big@150, amb_garden@165, door_creak@238, door_creak@279, amb_cricket@590, amb_garden@1216, wind_rush@1535.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **8.15 dB** over 54.47 s of speech (400 ms windows: median 7.34, 10th percentile 0.68, 90th 12.4 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-165, 572-589.9, 1053-1086.9 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: 1064.7-1085.
- Spectrum of the mix: DC -67.5 dBFS, below 20 Hz -39.9 dB, above 12 kHz -45.3 dB of the total energy, centroid 817 Hz. Bands (dB of total): 0-20 Hz -39.9, 20-60 Hz -29.0, 60-300 Hz -3.9, 300-3000 Hz -2.9, 3000-8000 Hz -11.2, 8000-12000 Hz -24.4, 12000-16000 Hz -45.3, 16000-24000 Hz -68.2.
- Score landmarks: first sound at f164.98; 1 silence f0-165: -240.0 dBFS; 2 theme: onset at f164.98 (plan f165); 3 silence f572-590: -240.0 dBFS; 4 chase: onset at f589.96 (plan f590); 5 chase: onset at f889.1 (plan f889); 6 silence f1053-1087: -240.0 dBFS; 7 mystery: onset at f1086.97 (plan f1087); 8 waltz: onset at f1305.2 (plan f1305); 9 mystery: onset at f1455.86 (plan f1456); 10 chase: onset at f1534.94 (plan f1535); 11 bittersweet: onset at f1657.52 (plan f1660); 12 runup: onset at f1839.92 (plan f1840); 13 finale: onset at f1916.0 (plan f1916), button at f2009.84 (plan f2010); last 10 ms -83.6 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-165 | 6.83 | 7.16 | -2.9 |
| 2 theme | 165-572 | 7.25 | 6.53 | 1.02 |
| 3 silence | 572-590 | 12.78 | 12.85 | 9.46 |
| 4 chase a | 590-736 | 8.97 | 7.76 | 2.95 |
| 4 chase b | 736-857 | 7.18 | 7.72 | 1.28 |
| 4 chase c | 857-889 | 10.15 | 9.06 | 4.73 |
| 5 chase a | 889-947 | 9.52 | 8.62 | 2.81 |
| 5 chase b | 947-1002 | 8.8 | 7.38 | -1.47 |
| 5 chase c | 1002-1053 | 8.35 | 7.93 | -0.57 |
| 6 silence | 1053-1087 | 19.46 | 20.96 | 3.07 |
| 7 mystery | 1087-1305 | 8.35 | 6.38 | 2.5 |
| 8 waltz | 1305-1456 | 8.15 | 7.05 | 1.81 |
| 9 mystery | 1456-1535 | 9.07 | 6.42 | 1.68 |
| 10 chase a | 1535-1589 | 8.88 | 7.62 | 1.25 |
| 10 chase b | 1589-1640 | 5.78 | 4.41 | -0.72 |
| 10 chase c | 1640-1660 | 4.02 | 3.96 | -8.03 |
| 11 bittersweet | 1660-1840 | 9.54 | 8.31 | -0.6 |
| 12 runup | 1840-1916 | 7.14 | 5.99 | -0.63 |
| 13 finale | 1916-2020 | 8.17 | 8.34 | 0.31 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-161 | 6.83 | For five seconds nothing on Earth can grip anything, and Gus slides tw |
| 2 | 165-305 | 7.23 | It's nine on a Sunday morning and Gus is shoving a heavy flowerpot acr |
| 3 | 309-408 | 7.86 | It scrapes and sticks and he wishes friction would just go away. |
| 4 | 412-518 | 6.41 | His wife says he'd miss it. His neighbor says life would be a breeze. |
| 5 | 522-586 | 8.24 | Then for five seconds Gus gets his wish. |
| 6 | 590-740 | 8.88 | The pot glides off like a puck on ice. But his feet can't push, so he  |
| 7 | 743-885 | 7.88 | His wife's cup slips right through her fingers and the neighbor's ladd |
| 8 | 889-976 | 8.48 | Then the whole garden starts to drift, all the same way. |
| 9 | 980-1051 | 9.5 | But the lawn looks flat. So what's pulling them? |
| 10 | 1055-1217 | 9.5 | You see, no lawn is flat. Builders tilt it half an inch a foot so rain |
| 11 | 1220-1301 | 8.42 | That slope tugs at Gus with nine pounds all day long. |
| 12 | 1305-1452 | 8.15 | Ever pressed two brushes together? Up close his feet and the grass are |
| 13 | 1456-1657 | 8.23 | Take that away and nine pounds is plenty. Heavy or light, everything s |
| 14 | 1660-1701 | 8.43 | Luckily, friction comes back. |
| 15 | 1705-1837 | 10.11 | Unluckily it grabs his feet and the rest of Gus keeps going at a joggi |
| 16 | 1840-1912 | 7.14 | And his pot? It stops twenty feet too far. |
| 17 | 1916-2005 | 8.17 | Gus drags it all the way back and never complains again. |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-165 | wind_rush | 0.08 | +0.08 | 1 | -0.1 | -0.10 | 18.3 | 0.97 |
| 113 | arrow_pop | 113.0 | +0.00 | 1 | 113.0 | +0.00 | 6.3 | 1.00 |
| 150 | whoosh_big | 149.48 | -0.52 | 1 | - | - | 4.5 | 0.99 |
| 165 | flash_hit | 164.65 | -0.35 | 2 | 165.2 | +0.20 | 7.4 | 1.00 |
| 165-590 | amb_garden | 165.09 | +0.09 | 1 | - | - | 3.1 | 1.00 |
| 190 | bird_tweet | 190.21 | +0.21 | 2 | 189.32 | -0.68 | 29.8 | 1.00 |
| 235 | oof | 235.08 | +0.08 | 2 | 235.04 | +0.04 | 9.4 | 1.00 |
| 238-252 | door_creak | 238.09 | +0.09 | 2 | - | - | 1.6 | 1.00 |
| 276 | oof | 276.07 | +0.07 | 2 | 276.02 | +0.02 | 7.4 | 1.00 |
| 279-293 | door_creak | 279.08 | +0.08 | 2 | - | - | 1.9 | 1.00 |
| 312-326 | door_creak | 312.07 | +0.07 | 2 | 312.02 | +0.02 | 10.1 | 1.00 |
| 329 | bonk | 329.0 | +0.00 | 1 | 328.88 | -0.12 | 16.2 | 1.00 |
| 365 | whoosh | 364.93 | -0.07 | 2 | 365.0 | +0.00 | 6.8 | 1.00 |
| 439 | gulp | 439.01 | +0.01 | -5 | 436.4 | -2.60 | 7.6 | 1.00 |
| 499 | ding | 499.0 | +0.00 | 1 | 498.92 | -0.08 | 104.1 | 1.00 |
| 525 | pop | 525.0 | +0.00 | 1 | 524.96 | -0.04 | 21.1 | 1.00 |
| 536 | arrow_pop | 536.0 | +0.00 | 1 | 535.94 | -0.06 | 27.8 | 1.00 |
| 572 | click | 572.0 | +0.00 | 2 | 571.88 | -0.12 | 34.3 | 1.00 |
| 574 | twinkle | 574.0 | +0.01 | 2 | 573.92 | -0.08 | 48.5 | 1.00 |
| 590-889 | amb_cricket | 590.09 | +0.09 | 1 | - | - | 2.9 | 1.00 |
| 597 | push_whoosh | 597.01 | +0.01 | 2 | 596.96 | -0.04 | 11.1 | 1.00 |
| 601 | zip | 600.52 | -0.48 | 2 | 601.16 | +0.16 | 9.3 | 1.00 |
| 620 | ding | 620.0 | +0.00 | 1 | 619.94 | -0.06 | 204.9 | 1.00 |
| 668-740 | footsteps | 667.99 | -0.01 | -23 | 666.74 | -1.26 | 13.2 | 1.00 |
| 694 | squeak | 694.09 | +0.09 | 2 | 693.08 | -0.92 | 10.8 | 1.00 |
| 720 | squeak | 720.09 | +0.09 | 2 | 718.04 | -1.96 | 12.2 | 1.00 |
| 764-780 | slide_whistle_down | 764.02 | +0.02 | 1 | 763.94 | -0.06 | 999.0 | 1.00 |
| 782 | thud | 782.0 | +0.00 | 2 | 781.88 | -0.12 | 17.2 | 1.00 |
| 841-857 | slide_whistle_down | 841.02 | +0.02 | 1 | 840.98 | -0.02 | 39.7 | 1.00 |
| 857 | crash | 856.94 | -0.06 | -101 | 856.88 | -0.12 | 15.5 | 1.00 |
| 892-1053 | wind_rush | 892.06 | +0.06 | 1 | 891.98 | -0.02 | 12.1 | 0.97 |
| 1019 | question_blip | 1019.01 | +0.01 | 1 | 1017.32 | -1.68 | 9.0 | 1.00 |
| 1053 | record_stop | 1053.0 | +0.00 | 2 | 1052.9 | -0.10 | 22.2 | 1.00 |
| 1085 | flip_blip | 1085.01 | +0.01 | 1 | 1084.88 | -0.12 | 999.0 | 1.00 |
| 1131 | arrow_pop | 1131.0 | +0.00 | 1 | 1130.9 | -0.10 | 69.9 | 1.00 |
| 1163 | pop | 1163.0 | +0.00 | 1 | 1162.88 | -0.12 | 64.2 | 1.00 |
| 1165-1220 | amb_rain | 1165.11 | +0.11 | 2 | 1164.08 | -0.92 | 12.7 | 1.00 |
| 1181 | drip | 1181.0 | +0.00 | 1 | 1180.88 | -0.12 | 38.8 | 1.00 |
| 1192 | drip | 1192.0 | +0.00 | 1 | 1191.92 | -0.08 | 40.1 | 1.00 |
| 1203 | drip | 1203.0 | +0.00 | 1 | 1202.9 | -0.10 | 37.3 | 1.00 |
| 1216-1305 | amb_garden | 1216.07 | +0.07 | 1 | - | - | 3.6 | 1.00 |
| 1231 | arrow_pop | 1231.0 | +0.00 | 1 | 1230.98 | -0.02 | 18.0 | 1.00 |
| 1258 | thud | 1258.0 | +0.00 | 2 | 1257.92 | -0.08 | 13.4 | 1.00 |
| 1281 | twinkle | 1281.01 | +0.01 | 2 | 1280.96 | -0.04 | 42.7 | 1.00 |
| 1309 | whoosh | 1308.93 | -0.07 | 2 | 1308.98 | -0.02 | 9.9 | 1.00 |
| 1323 | click | 1323.0 | +0.00 | 2 | 1322.9 | -0.10 | 29.1 | 1.00 |
| 1338 | squeak | 1338.09 | +0.09 | 2 | 1338.08 | +0.08 | 16.5 | 1.00 |
| 1356-1535 | amb_garden | 1356.05 | +0.05 | 1 | 1355.96 | -0.04 | 17.4 | 1.00 |
| 1362 | pop | 1362.0 | +0.00 | 1 | 1361.96 | -0.04 | 22.4 | 1.00 |
| 1441 | click | 1441.0 | +0.00 | 2 | 1440.86 | -0.14 | 35.8 | 1.00 |
| 1443 | ting | 1443.0 | +0.00 | 2 | 1442.9 | -0.10 | 100.1 | 1.00 |
| 1463 | flip_blip | 1463.01 | +0.01 | 1 | 1463.0 | +0.00 | 81.3 | 1.00 |
| 1488 | zip | 1487.47 | -0.53 | 2 | 1487.84 | -0.16 | 11.8 | 1.00 |
| 1535-1650 | wind_rush | 1535.12 | +0.12 | 1 | - | - | 4.9 | 1.00 |
| 1537 | arrow_pop | 1537.0 | +0.00 | 1 | 1536.86 | -0.14 | 22.4 | 1.00 |
| 1546 | pop | 1546.0 | +0.00 | 1 | 1545.86 | -0.14 | 35.2 | 1.00 |
| 1560 | pop | 1560.0 | +0.00 | 1 | 1559.9 | -0.10 | 13.7 | 1.00 |
| 1565-1640 | timer_ticks | 1565.0 | +0.00 | 1 | 1564.88 | -0.12 | 30.5 | 1.00 |
| 1607 | arrow_pop | 1607.0 | +0.00 | 1 | 1604.24 | -2.76 | 10.1 | 1.00 |
| 1640 | timer_ding | 1640.0 | +0.00 | 1 | 1639.94 | -0.06 | 36.1 | 1.00 |
| 1656-2020 | amb_garden | 1656.1 | +0.09 | 1 | 1656.02 | +0.02 | 8.9 | 1.00 |
| 1671 | twinkle | 1671.01 | +0.01 | 2 | 1670.96 | -0.04 | 119.8 | 1.00 |
| 1692 | shovel_thunk | 1692.0 | +0.00 | 1 | 1690.22 | -1.78 | 18.3 | 1.00 |
| 1721 | squeak | 1721.09 | +0.09 | 2 | 1721.12 | +0.12 | 12.1 | 1.00 |
| 1738 | whoosh | 1737.9 | -0.10 | 2 | 1738.04 | +0.04 | 6.6 | 1.00 |
| 1765-1795 | slide_whistle_down | 1765.02 | +0.02 | 1 | 1764.98 | -0.02 | 48.8 | 1.00 |
| 1795 | thud | 1795.0 | +0.00 | 2 | 1794.92 | -0.08 | 16.2 | 1.00 |
| 1798 | oof | 1798.06 | +0.06 | 2 | 1798.1 | +0.10 | 5.6 | 1.00 |
| 1812 | bird_tweet | 1812.27 | +0.27 | 2 | 1812.14 | +0.14 | 29.2 | 1.00 |
| 1860 | whoosh | 1860.07 | +0.07 | 2 | 1860.14 | +0.14 | 8.8 | 1.00 |
| 1880 | arrow_pop | 1880.0 | +0.00 | 1 | 1879.94 | -0.06 | 21.3 | 1.00 |
| 1922-1938 | door_creak | 1922.06 | +0.06 | 2 | 1922.06 | +0.06 | 7.8 | 1.00 |
| 1945-1961 | door_creak | 1945.07 | +0.07 | 2 | 1945.04 | +0.04 | 8.2 | 1.00 |
| 1972-1986 | door_creak | 1972.06 | +0.06 | 2 | 1972.04 | +0.04 | 5.8 | 1.00 |
| 1993 | ding | 1993.0 | +0.00 | 1 | 1992.92 | -0.08 | 123.4 | 1.00 |
