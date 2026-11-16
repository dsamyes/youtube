# elevator-cable-snaps - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,190,400 samples = 1994 frames at 30 fps = 66.467 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.7 LU, max momentary -9.2 LUFS, max short-term -12.8 LUFS
- Stems: voice -14.4 LUFS, music -24.1 LUFS, sfx -29.7 LUFS (master gain +6.98 dB on everything; the voice file itself is -20.5 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 7.25 dB, active (>0.1 dB) on 27.40 % of samples, >0.5 dB on 13.27 %, >3 dB on 1.579 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -14.0 LUFS
    Threshold: -24.0 LUFS
  Loudness range:
    LRA:         1.7 LU
    Threshold: -34.0 LUFS
    LRA low:   -15.0 LUFS
    LRA high:  -13.3 LUFS
  True peak:
    Peak:       -1.2 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| 1 silence | 0-122 | -14.4 | - | -24.1 | -24.1 | 9.7 | 11.9 | 5.5 |
| 2 theme | 122-416 | -14.5 | -23.2 | -31.7 | -22.8 | 8.3 | 8.0 | 3.9 |
| 3 theme | 416-547 | -13.7 | -23.1 | -31.0 | -22.6 | 8.9 | 8.7 | 5.4 |
| 4 mystery | 547-743 | -14.6 | -25.2 | -29.7 | -24.0 | 9.4 | 9.0 | 6.4 |
| 5 chase a | 743-784 | -12.8 | -23.2 | -30.6 | -22.5 | 9.8 | 10.0 | 6.8 |
| 5 chase b | 784-951 | -14.3 | -24.1 | -28.4 | -22.7 | 8.5 | 8.6 | 4.4 |
| 5 chase c | 951-973 | -16.4 | -24.8 | -25.9 | -22.4 | 6.1 | 7.5 | 1.5 |
| 6 silence | 973-1068 | -14.1 | - | -32.4 | -32.4 | 18.3 | 20.0 | 14.7 |
| 7 mystery | 1068-1258 | -14.4 | -25.5 | -32.0 | -24.8 | 10.4 | 10.7 | 6.6 |
| 8 theme | 1258-1389 | -14.1 | -23.0 | -32.6 | -22.5 | 8.4 | 7.5 | 4.7 |
| 9 mystery | 1389-1594 | -14.6 | -25.7 | -30.9 | -24.9 | 10.3 | 9.9 | 7.4 |
| 10 bittersweet | 1594-1782 | -14.7 | -25.7 | -29.0 | -24.9 | 10.2 | 10.7 | 6.9 |
| 11 runup | 1782-1880 | -13.5 | -22.8 | -32.4 | -22.3 | 8.9 | 8.2 | 3.7 |
| 12 finale | 1880-1994 | -14.0 | -22.6 | -30.5 | -22.2 | 8.2 | 8.6 | 3.9 |

## Music map (key G major, plan tempo 138 bpm, tune "hop", seed 6116)
The tune: `G- D E G- B A | A- E G F#- D | G A B- G E F# D | G-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 3 theme -9.5, 4 mystery -11.5, 5 chase a -11.0, 5 chase b -10.3, 5 chase c -9.5, 7 mystery -11.5, 8 theme -9.5, 9 mystery -11.5, 10 bittersweet -11.5, 11 runup -9.5, 12 finale -9.5. Applied section gains (dB): 1 silence -9.6, 2 theme -9.6, 3 theme -9.7, 4 mystery -10.2, 5 chase a -7.4, 5 chase b -11.9, 5 chase c -17.6, 6 silence -10.7, 7 mystery -10.7, 8 theme -9.1, 9 mystery -10.8, 10 bittersweet -13.1, 11 runup -10.9, 12 finale -12.6.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 122.0 | 4.07 | THEME: G major, swung, 146.9 bpm, 6 bars; clarinet tune, pizzicato boom-chick, brushes |
| 269.0 | 8.97 | theme bar 4: the tune lands on the home note, 'pom-pom' answer on beats 3 and 4 |
| 318.0 | 10.60 | second statement: tune doubled by marimba and glockenspiel |
| 416.0 | 13.87 | THEME: G major, swung, 164.9 bpm, 3 bars; clarinet tune, pizzicato boom-chick, brushes |
| 547.0 | 18.23 | MYSTERY: the tune at half speed in E minor (vibes), tick-tock woodblock + pizzicato, 147 bpm felt in two; soft |
| 645.0 | 21.50 | answering phrase a step higher |
| 694.0 | 23.13 | half cadence: the tick-tock slows and stops |
| 743.0 | 24.77 | CHASE OSTINATO: the tune's head as running eighths (marimba), 176 bpm and accelerating over 6 bars, climbing from G major |
| 784.0 | 26.13 | accent downbeat (bar 2): timpani + cymbal; 157 bpm, bass on every beat, xylophone doubles the ostinato |
| 951.0 | 31.70 | accent downbeat (bar 6): timpani + cymbal; 327 bpm, running bass, glock on top, soft brass swells |
| 951.0 | 31.70 | last bar: dominant seventh, 327 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 973.0 | 32.43 | (no music: silence) |
| 1068.0 | 35.60 | MYSTERY: the tune at half speed in E minor (vibes), tick-tock woodblock + pizzicato, 152 bpm felt in two; soft |
| 1163.0 | 38.77 | answering phrase a step higher |
| 1210.5 | 40.35 | half cadence: the tick-tock slows and stops |
| 1258.0 | 41.93 | THEME: G major, swung, 164.9 bpm, 3 bars; clarinet tune, pizzicato boom-chick, brushes |
| 1389.0 | 46.30 | MYSTERY: the tune at half speed in E minor (vibes), tick-tock woodblock + pizzicato, 140 bpm felt in two; soft |
| 1491.5 | 49.72 | answering phrase a step higher |
| 1542.8 | 51.42 | half cadence: the tick-tock slows and stops |
| 1594.0 | 53.13 | BITTERSWEET, sweet: the head of the tune in Eb major (music box, harp), ending on a rolled chord |
| 1687.0 | 56.23 | the same phrase again ... |
| 1711.0 | 57.03 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1782.0 | 59.40 | RUN-UP: the ostinato on the dominant seventh, 207 bpm and accelerating, 3 bars up into the next section |
| 1880.0 | 62.67 | FINALE: the tune comes home, G major, warm and a little faster (173.1 bpm): clarinet + glock + marimba, soft horns, pad |
| 1963.2 | 65.44 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 1984.0 | 66.13 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.4 LUFS integrated). Reverb by place: garden = open, hoistway = tunnel, lift = room, sky = void. Dead cuts (everything that sounded before them stops): f122, f973.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 122 | 0.000 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.6 | +0.00 |
| 2 | 4 | 40 | 0.133 | swing_creak | ropes creak in rhythm: 2 creaks at f4, 32 | -9.0 | -15.0 | -28.6 | +0.15 |
| 3 | 43 |  | 1.433 | metal_clang | metal clang: all six ropes part | -6.0 | -12.0 | -25.6 | +0.00 |
| 4 | 45 | 98 | 1.500 | wind_rush (bed) | falling rush under the hook, rising into the flash (noise band + faint whistle + flutter, follows the speed) | -8.5 | -8.5 | -22.1 | +0.00 |
| 5 | 56 |  | 1.867 | whoosh | quick whoosh (ease-out burst): cut inside | -10.0 | -16.0 | -29.6 | +0.00 |
| 6 | 62 |  | 2.067 | crowd_gasp | crowd gasp: they scream | -6.0 | -12.0 | -25.6 | +0.00 |
| 7 | 98 |  | 3.267 | thud | heavy soft thud: the car stops dead, they land | -5.0 | -11.0 | -24.6 | +0.00 |
| 8 | 104 |  | 3.467 | oof | 'oof': Gus lands | -6.0 | -12.0 | -25.6 | +0.00 |
| 9 | 107 |  | 3.567 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): into the flash | -2.0 | -8.0 | -21.6 | +0.00 |
| 10 | 122 | 273 | 4.067 | amb_room (bed) | room tone: soft air, faint hum | -32.0 | -32.0 | -45.6 | +0.00 |
| 11 | 122 |  | 4.067 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.6 | +0.00 |
| 12 | 150 | 180 | 5.000 | footsteps | 2 footsteps (hard ground): Gus steps in | -11.0 | -17.0 | -30.6 | +0.00 |
| 13 | 215 |  | 7.167 | ding | friendly two-bell 'ding': the floor indicator: twentieth floor | -7.0 | -13.0 | -26.6 | +0.00 |
| 14 | 234 |  | 7.800 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.6 | +0.10 |
| 15 | 257 |  | 8.567 | twinkle | sparkle run of five tiny bells: the neighbor waves | -9.0 | -15.0 | -28.6 | +0.00 |
| 16 | 273 | 416 | 9.100 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.6 | +0.00 |
| 17 | 273 |  | 9.100 | whoosh | quick whoosh (ease-out burst): cut to the shaft | -10.0 | -16.0 | -29.6 | +0.00 |
| 18 | 291 |  | 9.700 | blip | blip at 990 Hz: a glint runs over the six ropes | -10.0 | -16.0 | -29.6 | +0.00 |
| 19 | 326 | 350 | 10.867 | swing_creak | ropes creak in rhythm: 1 creaks at f326 | -9.0 | -15.0 | -28.6 | +0.15 |
| 20 | 360 | 372 | 12.000 | slide_whistle_down | slide whistle falling 1480 -> 392 Hz over 12 frames: five ropes go slack | -7.0 | -13.0 | -26.6 | +0.00 |
| 21 | 398 |  | 13.267 | thud | heavy soft thud: the car is packed full | -5.0 | -11.0 | -24.6 | +0.00 |
| 22 | 408 |  | 13.600 | ting | triangle 'ting' (1568 Hz): the one rope holds | -9.0 | -15.0 | -28.6 | +0.00 |
| 23 | 416 | 585 | 13.867 | amb_room (bed) | room tone: soft air, faint hum | -32.0 | -32.0 | -45.6 | +0.00 |
| 24 | 433 |  | 14.433 | ding | friendly two-bell 'ding': the neighbor has a plan | -7.0 | -13.0 | -26.6 | +0.00 |
| 25 | 490 |  | 16.333 | squeak | rubber squeak: he crouches | -8.0 | -14.0 | -27.6 | +0.00 |
| 26 | 508 |  | 16.933 | jump_boing | spring 'boing': he hops | -5.0 | -11.0 | -24.6 | +0.00 |
| 27 | 526 |  | 17.533 | thud | heavy soft thud: he lands | -9.0 | -15.0 | -28.6 | +0.00 |
| 28 | 560 |  | 18.667 | paper_flick | paper flaps + board knock: the clipboard | -11.0 | -17.0 | -30.6 | +0.00 |
| 29 | 585 |  | 19.500 | whoosh | quick whoosh (ease-out burst): cut to the diagram | -10.0 | -16.0 | -29.6 | +0.00 |
| 30 | 588 | 672 | 19.600 | slide_whistle_down | slide whistle falling 1480 -> 392 Hz over 84 frames: the tiny car falls twenty floors | -7.0 | -13.0 | -26.6 | +0.00 |
| 31 | 675 |  | 22.500 | buzzer | 'wrong' buzzer: the needle stops on 76 | -6.0 | -12.0 | -25.6 | +0.00 |
| 32 | 698 | 743 | 23.267 | amb_room (bed) | room tone: soft air, faint hum | -32.0 | -32.0 | -45.6 | +0.00 |
| 33 | 709 |  | 23.633 | jump_boing | spring 'boing': Gus's best jump | -5.0 | -11.0 | -24.6 | +0.00 |
| 34 | 723 |  | 24.100 | squeak | rubber squeak: the needle twitches to 6 | -8.0 | -14.0 | -27.6 | +0.00 |
| 35 | 735 |  | 24.500 | gulp | cartoon gulp: he gulps | -7.0 | -13.0 | -26.6 | +0.00 |
| 36 | 743 | 798 | 24.767 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.6 | +0.00 |
| 37 | 746 | 760 | 24.867 | swing_creak | ropes creak in rhythm: 1 creaks at f746 | -9.0 | -15.0 | -28.6 | +0.15 |
| 38 | 762 |  | 25.400 | ricochet_ping | cartoon ricochet 'pyeeow', small: first ropes part | -9.0 | -15.0 | -28.6 | +0.15 |
| 39 | 773 |  | 25.767 | ricochet_ping | cartoon ricochet 'pyeeow', small: more ropes part | -9.0 | -15.0 | -28.6 | +0.15 |
| 40 | 784 |  | 26.133 | metal_clang | metal clang: the last rope whips away | -6.0 | -12.0 | -25.6 | +0.00 |
| 41 | 798 | 950 | 26.600 | wind_rush (bed) | speed rush, rising (noise band + faint whistle + flutter, follows the speed) | -15.0 | -15.0 | -28.6 | +0.00 |
| 42 | 800 |  | 26.667 | impact_kick | speed-surge kick (sub thump + upward air burst): it drops | -5.0 | -11.0 | -24.6 | +0.00 |
| 43 | 824 |  | 27.467 | crowd_gasp | crowd gasp: they scream | -6.0 | -12.0 | -25.6 | +0.00 |
| 44 | 831 | 846 | 27.700 | slide_whistle_up | slide whistle rising 392 -> 1480 Hz over 15 frames: Gus floats up | -7.0 | -13.0 | -26.6 | +0.00 |
| 45 | 886 |  | 29.533 | squeak | rubber squeak: the neighbor tucks into a crouch | -8.0 | -14.0 | -27.6 | +0.00 |
| 46 | 906 | 946 | 30.200 | clock_tick | clock: tick-tock every 15 frames | -13.0 | -19.0 | -32.6 | -0.15 |
| 47 | 951 |  | 31.700 | crash | crash: crack + boom + clatter: the car stops | -3.0 | -9.0 | -22.6 | +0.00 |
| 48 | 960 |  | 32.000 | oof | 'oof': they land | -6.0 | -12.0 | -25.6 | +0.00 |
| 49 | 973 | 1068 | 32.433 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.6 | +0.00 |
| 50 | 973 |  | 32.433 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.6 | +0.00 |
| 51 | 996 | 1024 | 33.200 | swing_creak | ropes creak in rhythm: 1 creaks at f996 | -9.0 | -15.0 | -28.6 | +0.15 |
| 52 | 1038 |  | 34.600 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.6 | +0.00 |
| 53 | 1068 |  | 35.600 | whoosh | quick whoosh (ease-out burst): to the diagram | -10.0 | -16.0 | -29.6 | +0.00 |
| 54 | 1087 |  | 36.233 | pop | small bright pop: the little wheel | -8.0 | -14.0 | -27.6 | +0.00 |
| 55 | 1099 | 1158 | 36.633 | timer_ticks | egg timer: 18 tick-tocks, one every 3.5 frames, last one on f1158 | -14.0 | -20.0 | -33.6 | -0.15 |
| 56 | 1163 |  | 38.767 | power_up | power up: spin it too fast | -8.0 | -14.0 | -27.6 | +0.00 |
| 57 | 1216 |  | 40.533 | zip | 'zwip' pass-by: the weights fly out | -7.0 | -13.0 | -26.6 | +0.00 |
| 58 | 1237 |  | 41.233 | metal_clang | metal clang: they trip the lever | -6.0 | -12.0 | -25.6 | +0.00 |
| 59 | 1250 |  | 41.667 | click | click: the brake is set | -11.0 | -17.0 | -30.6 | +0.00 |
| 60 | 1258 | 1389 | 41.933 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 61 | 1281 |  | 42.700 | click | click: he takes the belt | -11.0 | -17.0 | -30.6 | +0.00 |
| 62 | 1300 | 1340 | 43.333 | timer_ticks | egg timer: 12 tick-tocks, one every 3.6 frames, last one on f1340 | -14.0 | -20.0 | -33.6 | -0.15 |
| 63 | 1347 |  | 44.900 | whoosh | quick whoosh (ease-out burst): he yanks it | -10.0 | -16.0 | -29.6 | +0.00 |
| 64 | 1367 |  | 45.567 | metal_clang | metal clang: the belt locks | -6.0 | -12.0 | -25.6 | +0.00 |
| 65 | 1374 |  | 45.800 | oof | 'ugh': his arm stops dead | -6.0 | -12.0 | -25.6 | +0.00 |
| 66 | 1389 | 1470 | 46.300 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.6 | +0.00 |
| 67 | 1402 |  | 46.733 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 68 | 1423 |  | 47.433 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 69 | 1472 |  | 49.067 | shovel_thunk | blade into the dirt: thud + grit + dull ring | -6.0 | -12.0 | -25.6 | +0.00 |
| 70 | 1497 |  | 49.900 | sizzle | sizzle dying away: sparks on the rail | -9.0 | -15.0 | -28.6 | +0.20 |
| 71 | 1539 |  | 51.300 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 72 | 1579 |  | 52.633 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.6 | +0.00 |
| 73 | 1594 | 1782 | 53.133 | amb_room (bed) | room tone: soft air, faint hum | -32.0 | -32.0 | -45.6 | +0.00 |
| 74 | 1619 |  | 53.967 | pop | small bright pop: no power | -8.0 | -14.0 | -27.6 | +0.00 |
| 75 | 1645 |  | 54.833 | pop | small bright pop: no computer | -8.0 | -14.0 | -27.6 | +0.00 |
| 76 | 1670 |  | 55.667 | pop | small bright pop: no luck | -8.0 | -14.0 | -27.6 | +0.00 |
| 77 | 1690 |  | 56.333 | gulp | cartoon gulp: unluckily | -7.0 | -13.0 | -26.6 | +0.00 |
| 78 | 1753 |  | 58.433 | oof | 'ugh': they push up on the ceiling | -6.0 | -12.0 | -25.6 | +0.00 |
| 79 | 1767 |  | 58.900 | bonk | cartoon bonk: nothing moves | -6.0 | -12.0 | -25.6 | +0.00 |
| 80 | 1782 | 1880 | 59.400 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.6 | +0.00 |
| 81 | 1798 |  | 59.933 | squeak | rubber squeak: a frayed stub wobbles | -8.0 | -14.0 | -27.6 | +0.00 |
| 82 | 1826 |  | 60.867 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 83 | 1861 |  | 62.033 | ding | friendly two-bell 'ding': he's fine | -7.0 | -13.0 | -26.6 | +0.00 |
| 84 | 1880 | 1994 | 62.667 | amb_room (bed) | room tone: soft air, faint hum | -32.0 | -32.0 | -45.6 | +0.00 |
| 85 | 1904 |  | 63.467 | beep | beep at 1318 Hz: the indicator blinks two dashes | -9.0 | -15.0 | -28.6 | +0.00 |
| 86 | 1934 |  | 64.467 | squeak | rubber squeak: the neighbor crouches again | -8.0 | -14.0 | -27.6 | +0.00 |
| 87 | 1968 |  | 65.600 | jump_boing | spring 'boing': he still wants to jump | -5.0 | -11.0 | -24.6 | +0.00 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: amb_room@122 -1.80 (snr 5.2), slide_whistle_down@588 -1.06 (snr 8.6), slide_whistle_up@831 -1.60 (snr 7.1), amb_drone@1389 -2.80 (snr 6.7), amb_room@1594 -1.82 (snr 5.1)
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): crowd_gasp@62
- Files: `mix.wav` 3,190,400 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,190,400 samples, 48000 Hz, 2 ch, 24-bit, peak -0.66 dBFS, 0 clipped; `stem_music.wav` 3,190,400 samples, 48000 Hz, 2 ch, 24-bit, peak -9.08 dBFS, 0 clipped; `stem_sfx.wav` 3,190,400 samples, 48000 Hz, 2 ch, 24-bit, peak -8.58 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.67 LU, max momentary -9.18 LUFS. Stems minus mix: -126.6 dB.
- Event onsets in `stem_sfx.wav` (87 events, tolerance 1 frame): matched 87/87 within tolerance (largest error 0.55 frame, largest lag 62 samples); blind band-flux detector resolved 79 of them, 74 within tolerance (largest error 2.8 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): wind_rush@45, crowd_gasp@62, amb_drone@273, amb_room@416, amb_room@698, wind_rush@798, amb_garden@1258, amb_room@1880.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **8.29 dB** over 52.8 s of speech (400 ms windows: median 7.35, 10th percentile 1.24, 90th 12.48 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-122, 973.1-1068 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -67.4 dBFS, below 20 Hz -41.6 dB, above 12 kHz -44.8 dB of the total energy, centroid 805 Hz. Bands (dB of total): 0-20 Hz -41.6, 20-60 Hz -28.4, 60-300 Hz -3.8, 300-3000 Hz -3.0, 3000-8000 Hz -11.3, 8000-12000 Hz -24.0, 12000-16000 Hz -44.8, 16000-24000 Hz -68.1.
- Score landmarks: first sound at f121.98; 1 silence f0-122: -240.0 dBFS; 2 theme: onset at f121.98 (plan f122); 3 theme: onset at f415.94 (plan f416); 4 mystery: onset at f546.98 (plan f547); 5 chase: onset at f742.94 (plan f743); 6 silence f973-1068: -240.0 dBFS; 7 mystery: onset at f1067.98 (plan f1068); 8 theme: onset at f1258.04 (plan f1258); 9 mystery: onset at f1388.96 (plan f1389); 10 bittersweet: onset at f1593.86 (plan f1594); 11 runup: onset at f1781.9 (plan f1782); 12 finale: onset at f1880.0 (plan f1880), button at f1983.86 (plan f1984); last 10 ms -77.0 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-122 | 9.63 | 9.0 | 4.13 |
| 2 theme | 122-416 | 6.93 | 6.43 | 0.09 |
| 3 theme | 416-547 | 7.36 | 6.04 | 1.78 |
| 4 mystery | 547-743 | 8.73 | 6.84 | 1.74 |
| 5 chase a | 743-784 | 8.92 | 9.3 | 3.28 |
| 5 chase b | 784-951 | 7.84 | 7.75 | 1.08 |
| 5 chase c | 951-973 | 6.85 | 7.47 | -0.93 |
| 6 silence | 973-1068 | 16.94 | 20.24 | 11.08 |
| 7 mystery | 1068-1258 | 8.31 | 7.52 | 1.8 |
| 8 theme | 1258-1389 | 7.59 | 6.38 | -0.19 |
| 9 mystery | 1389-1594 | 8.83 | 8.18 | 0.82 |
| 10 bittersweet | 1594-1782 | 8.72 | 8.47 | 3.26 |
| 11 runup | 1782-1880 | 8.47 | 8.62 | 1.53 |
| 12 finale | 1880-1994 | 7.48 | 7.53 | -0.36 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-121 | 9.63 | If every cable on your elevator snapped at once, you'd fall about five |
| 2 | 125-269 | 7.21 | It's Monday morning, and Gus steps into the elevator on the twentieth  |
| 3 | 273-413 | 6.64 | Above them, six steel ropes hold the car, and any one of them could ca |
| 4 | 416-544 | 7.36 | The neighbor has a plan anyway. If they ever snap, just jump at the la |
| 5 | 547-739 | 8.73 | Gus does the math. A fall from the twentieth floor ends at seventy-six |
| 6 | 743-794 | 7.36 | And right then, all six ropes snap. |
| 7 | 798-898 | 9.12 | The car drops. Gus floats. The neighbor gets ready to jump. |
| 8 | 902-969 | 7.22 | And one second later, the car just stops. |
| 9 | 973-1064 | 16.94 | But wait. Nothing holds the car up. So why did it stop? |
| 10 | 1068-1255 | 8.31 | You see, a little wheel spins as fast as the car moves. Spin it too fa |
| 11 | 1258-1385 | 7.6 | Ever yanked a seat belt? Pull it slowly, and it runs. Yank it, and it  |
| 12 | 1389-1591 | 8.82 | The brake is two steel wedges under the car. They jam against its rail |
| 13 | 1594-1683 | 8.3 | Luckily, they need no power, no computer, and no luck. |
| 14 | 1687-1779 | 9.13 | Unluckily, they only let go when somebody lifts the car. |
| 15 | 1782-1876 | 8.47 | So the cables snapped, and Gus fell five feet. He's fine. |
| 16 | 1880-1979 | 7.48 | He's just stuck between floors, with a neighbor who still wants to jum |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-122 | amb_drone | 0.04 | +0.04 | 1 | -0.1 | -0.10 | 17.5 | 0.98 |
| 4-40 | swing_creak | 4.0 | +0.00 | 1 | 3.86 | -0.14 | 35.6 | 1.00 |
| 43 | metal_clang | 43.0 | +0.00 | 1 | 42.92 | -0.08 | 17.0 | 1.00 |
| 45-98 | wind_rush | 45.06 | +0.06 | 1 | - | - | 3.3 | 1.00 |
| 56 | whoosh | 55.91 | -0.09 | 2 | 56.12 | +0.12 | 5.6 | 1.00 |
| 62 | crowd_gasp | 62.21 | +0.21 | 2 | - | - | 2.7 | 1.00 |
| 98 | thud | 98.0 | +0.00 | 2 | 97.94 | -0.06 | 11.3 | 1.00 |
| 104 | oof | 104.04 | +0.04 | 2 | 104.0 | +0.00 | 10.7 | 1.00 |
| 107 | whoosh_big | 106.45 | -0.55 | 1 | 106.46 | -0.54 | 6.3 | 0.99 |
| 122 | flash_hit | 121.65 | -0.35 | 2 | 122.0 | +0.00 | 12.0 | 1.00 |
| 122-273 | amb_room | 122.18 | +0.18 | 1 | 120.2 | -1.80 | 5.2 | 1.00 |
| 150-180 | footsteps | 150.0 | +0.01 | 1 | 149.9 | -0.10 | 17.0 | 1.00 |
| 215 | ding | 215.0 | +0.00 | 1 | 214.88 | -0.12 | 141.1 | 1.00 |
| 234 | push_whoosh | 234.0 | +0.00 | 2 | 233.9 | -0.10 | 15.3 | 1.00 |
| 257 | twinkle | 257.0 | +0.00 | 1 | 256.94 | -0.06 | 999.0 | 1.00 |
| 273 | whoosh | 272.98 | -0.02 | 2 | 273.2 | +0.20 | 8.1 | 1.00 |
| 273-416 | amb_drone | 273.03 | +0.03 | 0 | - | - | 4.9 | 1.00 |
| 291 | blip | 291.01 | +0.01 | 1 | 290.9 | -0.10 | 104.0 | 1.00 |
| 326-350 | swing_creak | 326.0 | +0.00 | 1 | 325.88 | -0.12 | 37.0 | 1.00 |
| 360-372 | slide_whistle_down | 360.02 | +0.02 | 1 | 359.96 | -0.04 | 41.6 | 1.00 |
| 398 | thud | 398.0 | +0.00 | 2 | 397.88 | -0.12 | 20.7 | 1.00 |
| 408 | ting | 408.0 | +0.00 | 2 | 407.9 | -0.10 | 370.5 | 1.00 |
| 416-585 | amb_room | 416.11 | +0.11 | 1 | - | - | 2.7 | 1.00 |
| 433 | ding | 433.0 | +0.00 | 2 | 432.92 | -0.08 | 93.8 | 1.00 |
| 490 | squeak | 490.09 | +0.09 | 2 | 490.16 | +0.16 | 14.7 | 1.00 |
| 508 | jump_boing | 508.02 | +0.02 | 1 | 507.98 | -0.02 | 15.1 | 1.00 |
| 526 | thud | 526.0 | +0.00 | 2 | 525.92 | -0.08 | 20.1 | 1.00 |
| 560 | paper_flick | 560.0 | +0.00 | 2 | 559.88 | -0.12 | 34.3 | 1.00 |
| 585 | whoosh | 585.02 | +0.02 | 2 | 585.02 | +0.02 | 11.8 | 1.00 |
| 588-672 | slide_whistle_down | 588.02 | +0.02 | 1 | 586.94 | -1.06 | 8.6 | 1.00 |
| 675 | buzzer | 675.09 | +0.09 | 0 | 674.9 | -0.10 | 29.6 | 1.00 |
| 698-743 | amb_room | 698.12 | +0.12 | 2 | - | - | 4.3 | 1.00 |
| 709 | jump_boing | 709.02 | +0.02 | 1 | 708.92 | -0.08 | 14.5 | 1.00 |
| 723 | squeak | 723.09 | +0.09 | 2 | 723.26 | +0.26 | 12.8 | 1.00 |
| 735 | gulp | 735.07 | +0.07 | -4 | 735.02 | +0.02 | 15.4 | 1.00 |
| 743-798 | amb_drone | 743.12 | +0.12 | 1 | 743.12 | +0.12 | 7.7 | 1.00 |
| 746-760 | swing_creak | 746.0 | +0.00 | 1 | 745.88 | -0.12 | 30.7 | 1.00 |
| 762 | ricochet_ping | 762.0 | +0.00 | 2 | 761.9 | -0.10 | 41.1 | 1.00 |
| 773 | ricochet_ping | 773.0 | +0.00 | 2 | 772.94 | -0.06 | 43.1 | 1.00 |
| 784 | metal_clang | 784.0 | +0.00 | 1 | 783.92 | -0.08 | 23.8 | 1.00 |
| 798-950 | wind_rush | 798.09 | +0.09 | 1 | - | - | 2.9 | 1.00 |
| 800 | impact_kick | 800.0 | +0.00 | 1 | 799.58 | -0.42 | 23.1 | 1.00 |
| 824 | crowd_gasp | 824.25 | +0.25 | 2 | 823.7 | -0.30 | 7.2 | 1.00 |
| 831-846 | slide_whistle_up | 831.03 | +0.03 | 1 | 829.4 | -1.60 | 7.1 | 1.00 |
| 886 | squeak | 886.09 | +0.09 | 2 | 886.1 | +0.10 | 8.8 | 1.00 |
| 906-946 | clock_tick | 906.0 | +0.00 | 1 | 905.9 | -0.10 | 14.8 | 1.00 |
| 951 | crash | 950.96 | -0.04 | -62 | 950.9 | -0.10 | 33.6 | 0.99 |
| 960 | oof | 960.04 | +0.04 | 2 | 959.96 | -0.04 | 17.2 | 1.00 |
| 973 | record_stop | 973.0 | +0.00 | 2 | 972.86 | -0.14 | 41.3 | 1.00 |
| 973-1068 | amb_drone | 973.09 | +0.09 | 0 | 972.92 | -0.08 | 16.3 | 1.00 |
| 996-1024 | swing_creak | 996.0 | +0.00 | 1 | 995.9 | -0.10 | 37.6 | 1.00 |
| 1038 | question_blip | 1038.01 | +0.01 | 1 | 1037.96 | -0.04 | 36.0 | 1.00 |
| 1068 | whoosh | 1067.94 | -0.06 | 2 | 1067.96 | -0.04 | 8.4 | 1.00 |
| 1087 | pop | 1087.0 | +0.00 | 1 | 1086.86 | -0.14 | 33.0 | 1.00 |
| 1099-1158 | timer_ticks | 1099.0 | +0.00 | 2 | 1098.86 | -0.14 | 56.5 | 1.00 |
| 1163 | power_up | 1163.04 | +0.04 | 1 | 1162.94 | -0.06 | 18.5 | 1.00 |
| 1216 | zip | 1215.45 | -0.55 | 1 | 1215.38 | -0.62 | 30.6 | 1.00 |
| 1237 | metal_clang | 1237.0 | +0.00 | 1 | 1236.86 | -0.14 | 139.6 | 1.00 |
| 1250 | click | 1250.0 | +0.00 | 2 | 1249.88 | -0.12 | 39.1 | 1.00 |
| 1258-1389 | amb_garden | 1258.33 | +0.33 | 1 | - | - | 4.7 | 1.00 |
| 1281 | click | 1281.0 | +0.00 | 2 | 1280.9 | -0.10 | 30.7 | 1.00 |
| 1300-1340 | timer_ticks | 1300.0 | +0.00 | 2 | 1299.86 | -0.14 | 24.2 | 1.00 |
| 1347 | whoosh | 1346.87 | -0.14 | 2 | 1346.9 | -0.10 | 8.7 | 1.00 |
| 1367 | metal_clang | 1367.0 | +0.00 | 1 | 1366.94 | -0.06 | 46.9 | 1.00 |
| 1374 | oof | 1374.06 | +0.06 | 2 | 1374.14 | +0.14 | 7.8 | 1.00 |
| 1389-1470 | amb_drone | 1389.14 | +0.14 | 1 | 1386.2 | -2.80 | 6.7 | 1.00 |
| 1402 | arrow_pop | 1402.0 | +0.00 | 1 | 1401.92 | -0.08 | 31.6 | 1.00 |
| 1423 | arrow_pop | 1423.0 | +0.00 | 1 | 1422.92 | -0.08 | 24.5 | 1.00 |
| 1472 | shovel_thunk | 1472.0 | +0.00 | 1 | 1471.88 | -0.12 | 67.9 | 1.00 |
| 1497 | sizzle | 1497.07 | +0.07 | 2 | 1496.9 | -0.10 | 124.7 | 1.00 |
| 1539 | arrow_pop | 1539.0 | +0.00 | 1 | 1538.84 | -0.16 | 115.3 | 1.00 |
| 1579 | chomp | 1579.0 | +0.00 | 2 | 1578.86 | -0.14 | 122.6 | 1.00 |
| 1594-1782 | amb_room | 1594.3 | +0.29 | 1 | 1592.18 | -1.82 | 5.1 | 1.00 |
| 1619 | pop | 1619.0 | +0.00 | 1 | 1618.88 | -0.12 | 26.4 | 1.00 |
| 1645 | pop | 1645.0 | +0.00 | 1 | 1644.92 | -0.08 | 26.6 | 1.00 |
| 1670 | pop | 1670.0 | +0.00 | 1 | 1669.88 | -0.12 | 25.6 | 1.00 |
| 1690 | gulp | 1690.06 | +0.06 | -4 | 1689.98 | -0.02 | 12.0 | 1.00 |
| 1753 | oof | 1753.04 | +0.04 | 2 | 1752.98 | -0.02 | 10.8 | 1.00 |
| 1767 | bonk | 1767.0 | +0.00 | 1 | 1766.9 | -0.10 | 25.1 | 1.00 |
| 1782-1880 | amb_drone | 1782.02 | +0.02 | 1 | 1782.14 | +0.14 | 5.2 | 1.00 |
| 1798 | squeak | 1798.09 | +0.09 | 2 | 1798.16 | +0.16 | 10.7 | 1.00 |
| 1826 | arrow_pop | 1826.0 | +0.00 | 1 | 1825.94 | -0.06 | 25.4 | 1.00 |
| 1861 | ding | 1861.0 | +0.00 | 2 | 1860.92 | -0.08 | 115.2 | 1.00 |
| 1880-1994 | amb_room | 1880.09 | +0.09 | 0 | - | - | 4.3 | 1.00 |
| 1904 | beep | 1903.98 | -0.02 | -35 | 1903.94 | -0.06 | 95.2 | 1.00 |
| 1934 | squeak | 1934.09 | +0.09 | 2 | 1934.12 | +0.12 | 14.1 | 1.00 |
| 1968 | jump_boing | 1968.03 | +0.03 | 1 | 1967.96 | -0.04 | 16.0 | 1.00 |
