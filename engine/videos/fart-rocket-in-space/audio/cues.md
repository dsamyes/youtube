# fart-rocket-in-space - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,116,800 samples = 1948 frames at 30 fps = 64.933 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.2 LU, max momentary -9.7 LUFS, max short-term -12.8 LUFS
- Stems: voice -14.3 LUFS, music -24.0 LUFS, sfx -30.9 LUFS (master gain +7.25 dB on everything; the voice file itself is -20.6 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 7.90 dB, active (>0.1 dB) on 27.90 % of samples, >0.5 dB on 14.31 %, >3 dB on 2.228 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -14.0 LUFS
    Threshold: -24.0 LUFS
  Loudness range:
    LRA:         1.2 LU
    Threshold: -34.0 LUFS
    LRA low:   -14.6 LUFS
    LRA high:  -13.4 LUFS
  True peak:
    Peak:       -1.2 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| 1 silence | 0-153 | -14.4 | -65.3 | -28.4 | -28.4 | 14.0 | 15.7 | 8.8 |
| 2 theme | 153-516 | -14.3 | -23.3 | -33.1 | -22.8 | 8.5 | 9.1 | 4.8 |
| 3 chase a | 516-594 | -14.1 | -24.9 | -30.8 | -24.0 | 9.9 | 9.8 | 7.6 |
| 3 chase b | 594-779 | -14.1 | -23.8 | -32.2 | -23.2 | 9.1 | 9.6 | 3.3 |
| 3 chase c | 779-889 | -14.8 | -23.9 | -31.1 | -23.2 | 8.4 | 7.5 | 5.0 |
| 4 silence | 889-954 | -14.1 | - | -26.6 | -26.6 | 12.4 | 15.7 | 7.4 |
| 5 mystery | 954-1147 | -14.5 | -25.4 | -31.2 | -24.5 | 10.0 | 10.1 | 4.8 |
| 6 waltz | 1147-1270 | -13.9 | -24.1 | -30.8 | -23.4 | 9.6 | 9.1 | 5.1 |
| 7 mystery | 1270-1468 | -14.5 | -25.1 | -30.0 | -24.3 | 9.8 | 10.2 | 4.8 |
| 8 runup | 1468-1543 | -13.8 | -23.0 | -28.2 | -22.1 | 8.2 | 8.8 | 3.2 |
| 9 theme | 1543-1678 | -14.5 | -23.9 | -31.9 | -23.3 | 8.7 | 9.0 | 6.4 |
| 10 bittersweet | 1678-1828 | -14.1 | -24.5 | -30.2 | -23.7 | 9.6 | 9.0 | 6.0 |
| 11 finale | 1828-1948 | -13.8 | -22.7 | -35.2 | -22.4 | 8.6 | 8.3 | 4.9 |

## Music map (key Eb major, plan tempo 124 bpm, tune "tiptoe", seed 4217)
The tune: `G Bb Eb- Eb F G- | Ab F C- D F Ab- | G- Eb Bb C- F D | Eb-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 3 chase a -11.0, 3 chase b -10.3, 3 chase c -9.5, 5 mystery -11.5, 6 waltz -11.0, 7 mystery -11.5, 8 runup -9.5, 9 theme -9.5, 10 bittersweet -11.5, 11 finale -9.5. Applied section gains (dB): 1 silence -9.8, 2 theme -9.8, 3 chase a -10.0, 3 chase b -11.0, 3 chase c -15.3, 4 silence -10.4, 5 mystery -10.4, 6 waltz -11.7, 7 mystery -10.3, 8 runup -11.2, 9 theme -9.8, 10 bittersweet -10.2, 11 finale -12.5.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 153.0 | 5.10 | THEME: Eb major, swung, 119.0 bpm, 6 bars; clarinet tune, pizzicato boom-chick, brushes |
| 334.5 | 11.15 | theme bar 4: the tune lands on the home note, 'pom-pom' answer on beats 3 and 4 |
| 395.0 | 13.17 | second statement: tune doubled by marimba and glockenspiel |
| 485.8 | 16.19 | stop chord (dominant seventh): the band leaves the next two beats to the sound effects, vibes ring |
| 516.0 | 17.20 | CHASE OSTINATO: the tune's head as running eighths (marimba), 179 bpm and accelerating over 9 bars, climbing from Eb major |
| 594.0 | 19.80 | accent downbeat (bar 3): timpani + cymbal; 142 bpm, bass on every beat, xylophone doubles the ostinato |
| 854.5 | 28.48 | last bar: dominant seventh, 209 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 889.0 | 29.63 | (no music: silence) |
| 954.0 | 31.80 | MYSTERY: the tune at half speed in C minor (vibes), tick-tock woodblock + pizzicato, 149 bpm felt in two; soft |
| 1050.5 | 35.02 | answering phrase a step higher |
| 1098.8 | 36.62 | half cadence: the tick-tock slows and stops |
| 1147.0 | 38.23 | WALTZ: music box in Eb major, 180 bpm, pick-up on f1150, downbeats at f1165, f1195, low point f1225 |
| 1195.0 | 39.83 | the tune steps down do-la-fa into |
| 1225.0 | 40.83 | the low point (low home note); then the arpeggio climbs, slower and slower, to the rest |
| 1260.0 | 42.00 | the rest: the high home note rings, everything else waits |
| 1270.0 | 42.33 | MYSTERY: the tune at half speed in C minor (vibes), tick-tock woodblock + pizzicato, 145 bpm felt in two; soft |
| 1369.0 | 45.63 | answering phrase a step higher |
| 1418.5 | 47.28 | half cadence: the tick-tock slows and stops |
| 1468.0 | 48.93 | RUN-UP: the ostinato on the dominant seventh, 186 bpm and accelerating, 2 bars up into the next section |
| 1543.0 | 51.43 | THEME: Eb major, swung, 106.7 bpm, 2 bars; clarinet tune, pizzicato boom-chick, brushes |
| 1678.0 | 55.93 | BITTERSWEET, sweet: the head of the tune in B major (music box, harp), ending on a rolled chord |
| 1775.0 | 59.17 | the same phrase again ... |
| 1791.6 | 59.72 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1828.0 | 60.93 | FINALE: the tune comes home, Eb major, warm and a little faster (163.6 bpm): clarinet + glock + marimba, soft horns, pad |
| 1916.0 | 63.87 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 1938.0 | 64.60 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.3 LUFS integrated). Reverb by place: board = void, garden = open, space = void, street = open. Dead cuts (everything that sounded before them stops): f153, f889.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 153 | 0.000 | amb_drone (bed) | low breathing drone | -16.0 | -16.0 | -29.4 | +0.00 |
| 2 | 1 |  | 0.033 | whoosh | quick whoosh (ease-out burst): Gus tumbles | -10.0 | -16.0 | -29.4 | +0.00 |
| 3 | 46 |  | 1.533 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -10.0 | -16.0 | -29.4 | +0.00 |
| 4 | 62 |  | 2.067 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.4 | +0.00 |
| 5 | 112 |  | 3.733 | pop | small bright pop: thought bubble: a rocket | -8.0 | -14.0 | -27.4 | +0.00 |
| 6 | 136 |  | 4.533 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): into the flash | -2.0 | -8.0 | -21.4 | +0.00 |
| 7 | 140 |  | 4.667 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.4 | +0.00 |
| 8 | 153 | 516 | 5.100 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.4 | +0.00 |
| 9 | 153 |  | 5.100 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.4 | +0.00 |
| 10 | 198 |  | 6.600 | twinkle | sparkle run of five tiny bells: glint on the ocean | -9.0 | -15.0 | -28.4 | +0.00 |
| 11 | 281 |  | 9.367 | click | click: the hook slips out of the ring | -11.0 | -17.0 | -30.4 | +0.00 |
| 12 | 288 | 300 | 9.600 | slide_whistle_up_slowing | slide whistle rising 466 -> 1245 Hz, slower and slower, fading to nothing by f300 | -9.0 | -15.0 | -28.4 | +0.00 |
| 13 | 300 |  | 10.000 | whoosh | quick whoosh (ease-out burst): he kicks | -10.0 | -16.0 | -29.4 | +0.00 |
| 14 | 313 |  | 10.433 | whoosh | quick whoosh (ease-out burst): he swims | -10.0 | -16.0 | -29.4 | +0.00 |
| 15 | 329 |  | 10.967 | ting | triangle 'ting' (1245 Hz): nothing | -9.0 | -15.0 | -28.4 | +0.00 |
| 16 | 344 |  | 11.467 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -10.0 | -16.0 | -29.4 | +0.00 |
| 17 | 384 |  | 12.800 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.4 | +0.10 |
| 18 | 417 |  | 13.900 | beep | beep at 1318 Hz: radio | -9.0 | -15.0 | -28.4 | +0.00 |
| 19 | 437 |  | 14.567 | whoosh | quick whoosh (ease-out burst): her throwing move | -10.0 | -16.0 | -29.4 | +0.00 |
| 20 | 471 |  | 15.700 | beep | beep at 1319 Hz: radio again | -9.0 | -15.0 | -28.4 | +0.00 |
| 21 | 498 |  | 16.600 | slide_whistle_down | slide whistle falling 1175 -> 311 Hz over 16 frames: the neighbor waves him goodbye | -7.0 | -13.0 | -26.4 | +0.00 |
| 22 | 516 | 570 | 17.200 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.4 | +0.00 |
| 23 | 534 |  | 17.800 | pop | small bright pop: the can of beans goes up | -8.0 | -14.0 | -27.4 | +0.00 |
| 24 | 548 |  | 18.267 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.4 | +0.00 |
| 25 | 570 | 889 | 19.000 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.4 | +0.00 |
| 26 | 570 |  | 19.000 | whoosh | quick whoosh (ease-out burst): he swings round | -10.0 | -16.0 | -29.4 | +0.00 |
| 27 | 594 |  | 19.800 | squeak | rubber squeak: the fart (a rubber squeak is the nearest sound in the vocabulary) | -8.0 | -14.0 | -27.4 | +0.00 |
| 28 | 597 |  | 19.900 | flame_poof | 'fwoomp' + flutter + crackle: the puff | -10.0 | -16.0 | -29.4 | +0.20 |
| 29 | 664 |  | 22.133 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.4 | +0.00 |
| 30 | 680 |  | 22.667 | ding | friendly two-bell 'ding': thumbs-up | -7.0 | -13.0 | -26.4 | +0.00 |
| 31 | 696 |  | 23.200 | whoosh | quick whoosh (ease-out burst): hero pose | -10.0 | -16.0 | -29.4 | +0.00 |
| 32 | 709 |  | 23.633 | ting | triangle 'ting' (1245 Hz): sparkle: moving | -9.0 | -15.0 | -28.4 | +0.00 |
| 33 | 732 |  | 24.400 | pop | small bright pop: the magnifying glass | -8.0 | -14.0 | -27.4 | +0.00 |
| 34 | 737 | 762 | 24.567 | timer_ticks | egg timer: 8 tick-tocks, one every 3.6 frames, last one on f762 | -14.0 | -20.0 | -33.4 | -0.15 |
| 35 | 790 |  | 26.333 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.4 | +0.00 |
| 36 | 804 |  | 26.800 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.4 | +0.00 |
| 37 | 818 |  | 27.267 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.4 | +0.00 |
| 38 | 844 | 876 | 28.133 | alarm | alarm (beep): air gauge warning | -15.0 | -21.0 | -34.4 | +0.00 |
| 39 | 862 |  | 28.733 | gulp | cartoon gulp: he gulps | -7.0 | -13.0 | -26.4 | +0.00 |
| 40 | 889 | 994 | 29.633 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.4 | +0.00 |
| 41 | 889 |  | 29.633 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.4 | +0.00 |
| 42 | 893 |  | 29.767 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.4 | +0.00 |
| 43 | 906 |  | 30.200 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): a real rocket roars past | -2.0 | -8.0 | -21.4 | +0.00 |
| 44 | 976 |  | 32.533 | power_down | power down: he droops | -8.0 | -14.0 | -27.4 | +0.00 |
| 45 | 994 | 1083 | 33.133 | rocket_rumble (bed) | engine roar (steady): low rumble + crackle | -20.0 | -20.0 | -33.4 | +0.00 |
| 46 | 1019 |  | 33.967 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.4 | +0.00 |
| 47 | 1036 |  | 34.533 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.4 | +0.00 |
| 48 | 1100 |  | 36.667 | thud | heavy soft thud: the weight drops in | -5.0 | -11.0 | -24.4 | +0.00 |
| 49 | 1116 |  | 37.200 | blip | blip at 990 Hz: multiplication cross | -10.0 | -16.0 | -29.4 | +0.00 |
| 50 | 1121 |  | 37.367 | zip | 'zwip' pass-by: the speed needle sweeps | -7.0 | -13.0 | -26.4 | +0.00 |
| 51 | 1147 | 1270 | 38.233 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.4 | +0.00 |
| 52 | 1161 |  | 38.700 | knock | 2 knocks on wood: the skateboard clacks | -7.0 | -13.0 | -26.4 | +0.00 |
| 53 | 1184 |  | 39.467 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.4 | +0.10 |
| 54 | 1203 |  | 40.100 | thud | heavy soft thud: the backpack lands | -5.0 | -11.0 | -24.4 | +0.00 |
| 55 | 1235 |  | 41.167 | whoosh | quick whoosh (ease-out burst): he rolls away | -10.0 | -16.0 | -29.4 | +0.00 |
| 56 | 1287 |  | 42.900 | pop | small bright pop: the puff lands on the scale | -8.0 | -14.0 | -27.4 | +0.00 |
| 57 | 1303 |  | 43.433 | beep | beep at 1318 Hz: the scale reads 0.1 | -9.0 | -15.0 | -28.4 | +0.00 |
| 58 | 1343 | 1373 | 44.767 | timer_ticks | egg timer: 10 tick-tocks, one every 3.3 frames, last one on f1373 | -14.0 | -20.0 | -33.4 | -0.15 |
| 59 | 1394 |  | 46.467 | thud | heavy soft thud: Gus lands on the big scale | -5.0 | -11.0 | -24.4 | +0.00 |
| 60 | 1418 |  | 47.267 | boing | spring 'boing': the dial spins | -5.0 | -11.0 | -24.4 | +0.00 |
| 61 | 1448 |  | 48.267 | timer_ding | kitchen-timer bell, rings about 1 s: 460 | -4.0 | -10.0 | -23.4 | -0.15 |
| 62 | 1468 | 1775 | 48.933 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.4 | +0.00 |
| 63 | 1487 |  | 49.567 | cork_pop | cork pop: the slipper comes off | -3.0 | -9.0 | -22.4 | +0.00 |
| 64 | 1500 |  | 50.000 | whoosh | quick whoosh (ease-out burst): wind-up | -10.0 | -16.0 | -29.4 | +0.00 |
| 65 | 1509 |  | 50.300 | impact_kick | speed-surge kick (sub thump + upward air burst): the throw | -5.0 | -11.0 | -24.4 | +0.00 |
| 66 | 1543 |  | 51.433 | zip | 'zwip' pass-by: the slipper flies | -7.0 | -13.0 | -26.4 | +0.00 |
| 67 | 1548 |  | 51.600 | pop | small bright pop: half a pound | -8.0 | -14.0 | -27.4 | +0.00 |
| 68 | 1563 |  | 52.100 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.4 | +0.00 |
| 69 | 1611 |  | 53.700 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): Gus is really moving now | -6.0 | -12.0 | -25.4 | +0.00 |
| 70 | 1625 |  | 54.167 | ding | friendly two-bell 'ding': the sum | -7.0 | -13.0 | -26.4 | +0.00 |
| 71 | 1687 |  | 56.233 | timer_ding | kitchen-timer bell, rings about 1 s: five minutes | -4.0 | -10.0 | -23.4 | -0.15 |
| 72 | 1745 |  | 58.167 | whoosh | quick whoosh (ease-out burst): in through the hatch | -10.0 | -16.0 | -29.4 | +0.00 |
| 73 | 1764 |  | 58.800 | door_slam | door slam: the hatch shuts | -4.0 | -10.0 | -23.4 | +0.00 |
| 74 | 1775 | 1948 | 59.167 | amb_room (bed) | room tone: soft air, faint hum | -28.0 | -28.0 | -41.4 | +0.00 |
| 75 | 1810 |  | 60.333 | click | click: airtight | -11.0 | -17.0 | -30.4 | +0.00 |
| 76 | 1834 | 1900 | 61.133 | bubbling (bed) | bubbling liquid | -26.0 | -26.0 | -39.4 | +0.00 |
| 77 | 1856 |  | 61.867 | gulp | cartoon gulp: his smile dies | -7.0 | -13.0 | -26.4 | +0.00 |
| 78 | 1921 |  | 64.033 | squeak | rubber squeak: cross-eyed in the fog | -11.0 | -17.0 | -30.4 | +0.00 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: flip_blip@140 -1.50 (snr 12.7), amb_drone@570 -1.96 (snr 9.0), knock@1161 -2.56 (snr 14.1), gulp@1856 -2.88 (snr 8.7)
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): flame_poof@597
- Files: `mix.wav` 3,116,800 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,116,800 samples, 48000 Hz, 2 ch, 24-bit, peak -0.65 dBFS, 0 clipped; `stem_music.wav` 3,116,800 samples, 48000 Hz, 2 ch, 24-bit, peak -7.43 dBFS, 0 clipped; `stem_sfx.wav` 3,116,800 samples, 48000 Hz, 2 ch, 24-bit, peak -8.23 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.25 LU, max momentary -9.71 LUFS. Stems minus mix: -126.6 dB.
- Event onsets in `stem_sfx.wav` (78 events, tolerance 1 frame): matched 78/78 within tolerance (largest error 0.56 frame, largest lag 93 samples); blind band-flux detector resolved 72 of them, 68 within tolerance (largest error 2.88 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): amb_drone@153, amb_garden@516, flame_poof@597, rocket_rumble@994, amb_room@1775, bubbling@1834.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **8.45 dB** over 52.31 s of speech (400 ms windows: median 7.29, 10th percentile 1.77, 90th 14.41 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-153, 889.1-953.9 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -68.0 dBFS, below 20 Hz -42.7 dB, above 12 kHz -45.3 dB of the total energy, centroid 799 Hz. Bands (dB of total): 0-20 Hz -42.7, 20-60 Hz -27.3, 60-300 Hz -3.7, 300-3000 Hz -3.1, 3000-8000 Hz -11.2, 8000-12000 Hz -24.5, 12000-16000 Hz -45.3, 16000-24000 Hz -68.1.
- Score landmarks: first sound at f152.98; 1 silence f0-153: -240.0 dBFS; 2 theme: onset at f152.98 (plan f153); 3 chase: onset at f515.9 (plan f516); 4 silence f889-954: -240.0 dBFS; 5 mystery: onset at f953.97 (plan f954); 6 waltz: onset at f1147.28 (plan f1147); 7 mystery: onset at f1269.86 (plan f1270); 8 runup: onset at f1467.86 (plan f1468); 9 theme: onset at f1542.98 (plan f1543); 10 bittersweet: onset at f1677.92 (plan f1678); 11 finale: onset at f1828.04 (plan f1828), button at f1937.9 (plan f1938); last 10 ms -78.7 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-153 | 14.8 | 16.42 | 7.66 |
| 2 theme | 153-516 | 7.09 | 7.04 | 0.75 |
| 3 chase a | 516-594 | 9.64 | 8.65 | 2.91 |
| 3 chase b | 594-779 | 8.9 | 7.57 | 2.46 |
| 3 chase c | 779-889 | 7.31 | 3.9 | -0.52 |
| 4 silence | 889-954 | 15.29 | 21.45 | 9.36 |
| 5 mystery | 954-1147 | 8.4 | 7.29 | 2.2 |
| 6 waltz | 1147-1270 | 8.13 | 6.63 | 1.36 |
| 7 mystery | 1270-1468 | 8.25 | 5.89 | 2.75 |
| 8 runup | 1468-1543 | 7.79 | 6.25 | 3.62 |
| 9 theme | 1543-1678 | 6.53 | 5.38 | 2.97 |
| 10 bittersweet | 1678-1828 | 8.78 | 7.01 | 3.33 |
| 11 finale | 1828-1948 | 8.8 | 5.77 | 1.57 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-152 | 14.8 | Gus is stuck floating in space, ten feet from his ship, and the only r |
| 2 | 155-296 | 7.27 | It's two in the afternoon, high above the ocean, and his safety rope j |
| 3 | 300-403 | 9.48 | He kicks. He swims. Nothing. In space, there's nothing to push on. |
| 4 | 407-512 | 5.47 | His wife radios, throw something! His neighbor says he's a goner. |
| 5 | 516-613 | 8.85 | Gus says he had beans for lunch, turns around, and fires. |
| 6 | 617-689 | 10.64 | Let's be kind and say it all shoots straight out the back. |
| 7 | 693-763 | 8.06 | Now Gus is moving. One hair's width a minute. |
| 8 | 766-885 | 7.77 | At that pace, ten feet takes over three weeks. He has air for eight ho |
| 9 | 889-990 | 12.45 | But wait. Rockets run on gas too. So why is his so weak? |
| 10 | 994-1143 | 8.12 | You see, a rocket moves by throwing stuff away. What counts is how muc |
| 11 | 1147-1266 | 8.13 | Ever stood on a skateboard and thrown a heavy backpack? You roll the o |
| 12 | 1270-1384 | 8.04 | A fart is a tenth of a gram of gas, leaving at ten feet a second. |
| 13 | 1387-1464 | 8.52 | Gus and his suit weigh four hundred sixty pounds. |
| 14 | 1468-1539 | 7.79 | So he pulls off a slipper, and throws it, hard. |
| 15 | 1543-1675 | 6.53 | Half a pound at twenty miles an hour. That's six thousand times the pu |
| 16 | 1678-1772 | 9.83 | Luckily, five minutes later, Gus floats in through the hatch. |
| 17 | 1775-1825 | 7.17 | Unluckily, a spacesuit is airtight. |
| 18 | 1828-1933 | 8.8 | So the fart never left. It rode home with him, inside the helmet. |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-153 | amb_drone | 0.05 | +0.05 | 1 | -0.1 | -0.10 | 36.6 | 0.99 |
| 1 | whoosh | 0.94 | -0.06 | 2 | 0.98 | -0.02 | 7.1 | 1.00 |
| 46 | decel_whoosh | 46.03 | +0.03 | 1 | 46.1 | +0.10 | 8.9 | 1.00 |
| 62 | arrow_pop | 62.0 | +0.00 | 1 | 62.0 | -0.00 | 17.8 | 1.00 |
| 112 | pop | 112.0 | +0.00 | 1 | 111.98 | -0.02 | 18.9 | 1.00 |
| 136 | whoosh_big | 135.46 | -0.54 | 1 | 135.44 | -0.56 | 11.0 | 0.99 |
| 140 | flip_blip | 140.0 | +0.00 | 1 | 138.5 | -1.50 | 12.7 | 1.00 |
| 153 | flash_hit | 152.65 | -0.35 | 2 | 153.08 | +0.08 | 9.8 | 1.00 |
| 153-516 | amb_drone | 153.04 | +0.04 | 0 | - | - | 4.7 | 1.00 |
| 198 | twinkle | 198.0 | +0.00 | 1 | 197.66 | -0.34 | 999.0 | 1.00 |
| 281 | click | 281.0 | +0.00 | 1 | 280.88 | -0.12 | 40.2 | 1.00 |
| 288-300 | slide_whistle_up_slowing | 288.02 | +0.02 | 1 | 288.02 | +0.02 | 27.2 | 1.00 |
| 300 | whoosh | 299.96 | -0.04 | 2 | 300.14 | +0.14 | 6.9 | 1.00 |
| 313 | whoosh | 313.02 | +0.02 | 2 | 313.22 | +0.22 | 9.8 | 1.00 |
| 329 | ting | 329.0 | +0.00 | 2 | 328.94 | -0.06 | 60.0 | 1.00 |
| 344 | decel_whoosh | 344.08 | +0.08 | 1 | 344.06 | +0.06 | 12.7 | 1.00 |
| 384 | push_whoosh | 384.0 | +0.00 | 2 | 383.96 | -0.04 | 11.8 | 1.00 |
| 417 | beep | 416.98 | -0.02 | -35 | 416.96 | -0.04 | 84.8 | 1.00 |
| 437 | whoosh | 436.99 | -0.01 | 2 | 437.0 | +0.00 | 7.5 | 1.00 |
| 471 | beep | 470.98 | -0.02 | -35 | 470.96 | -0.04 | 98.5 | 1.00 |
| 498 | slide_whistle_down | 498.02 | +0.02 | 1 | 497.96 | -0.04 | 999.0 | 1.00 |
| 516-570 | amb_garden | 516.14 | +0.14 | 1 | - | - | 4.4 | 1.00 |
| 534 | pop | 534.0 | +0.00 | 1 | 533.9 | -0.10 | 18.5 | 1.00 |
| 548 | chomp | 548.0 | +0.00 | 2 | 547.88 | -0.12 | 16.2 | 1.00 |
| 570-889 | amb_drone | 570.11 | +0.10 | 1 | 568.04 | -1.96 | 9.0 | 0.99 |
| 570 | whoosh | 569.93 | -0.07 | 2 | 570.2 | +0.20 | 8.4 | 1.00 |
| 594 | squeak | 594.09 | +0.09 | 2 | 594.2 | +0.20 | 10.8 | 1.00 |
| 597 | flame_poof | 597.02 | +0.02 | 1 | - | - | 4.8 | 1.00 |
| 664 | arrow_pop | 664.0 | +0.00 | 1 | 663.92 | -0.08 | 26.6 | 1.00 |
| 680 | ding | 680.0 | +0.00 | 1 | 679.94 | -0.06 | 79.5 | 1.00 |
| 696 | whoosh | 695.96 | -0.04 | 2 | 696.32 | +0.32 | 7.8 | 1.00 |
| 709 | ting | 709.0 | +0.00 | 2 | 708.92 | -0.08 | 89.9 | 1.00 |
| 732 | pop | 732.0 | +0.00 | 1 | 731.96 | -0.04 | 26.5 | 1.00 |
| 737-762 | timer_ticks | 737.0 | +0.00 | 2 | 736.88 | -0.12 | 27.0 | 1.00 |
| 790 | flip_blip | 790.01 | +0.01 | 1 | 789.92 | -0.08 | 110.1 | 1.00 |
| 804 | flip_blip | 804.01 | +0.01 | 1 | 803.96 | -0.04 | 107.0 | 1.00 |
| 818 | flip_blip | 818.01 | +0.01 | 1 | 817.94 | -0.06 | 125.1 | 1.00 |
| 844-876 | alarm | 844.03 | +0.03 | 26 | 843.98 | -0.02 | 84.5 | 1.00 |
| 862 | gulp | 862.04 | +0.04 | -4 | 862.1 | +0.10 | 11.2 | 1.00 |
| 889 | record_stop | 889.0 | +0.00 | 2 | 888.92 | -0.08 | 21.3 | 1.00 |
| 889-994 | amb_drone | 889.05 | +0.06 | 1 | 889.04 | +0.04 | 8.0 | 1.00 |
| 893 | question_blip | 893.01 | +0.01 | 1 | 893.12 | +0.12 | 7.7 | 1.00 |
| 906 | whoosh_big | 905.46 | -0.54 | 1 | 905.36 | -0.64 | 12.8 | 1.00 |
| 976 | power_down | 976.04 | +0.04 | 1 | 975.98 | -0.02 | 21.9 | 1.00 |
| 994-1083 | rocket_rumble | 994.27 | +0.27 | 1 | - | - | 3.1 | 1.00 |
| 1019 | arrow_pop | 1019.0 | +0.00 | 1 | 1018.46 | -0.54 | 16.3 | 1.00 |
| 1036 | arrow_pop | 1036.0 | +0.00 | 1 | 1035.98 | -0.02 | 17.8 | 1.00 |
| 1100 | thud | 1100.0 | +0.00 | 2 | 1099.82 | -0.18 | 50.1 | 1.00 |
| 1116 | blip | 1116.0 | +0.00 | 1 | 1115.9 | -0.10 | 999.0 | 1.00 |
| 1121 | zip | 1120.46 | -0.54 | 1 | 1120.76 | -0.24 | 17.2 | 1.00 |
| 1147-1270 | amb_garden | 1147.16 | +0.16 | 1 | 1146.92 | -0.08 | 8.6 | 1.00 |
| 1161 | knock | 1161.0 | +0.00 | 0 | 1158.44 | -2.56 | 14.1 | 1.00 |
| 1184 | push_whoosh | 1184.0 | +0.00 | 2 | 1183.94 | -0.06 | 9.7 | 1.00 |
| 1203 | thud | 1203.0 | +0.00 | 2 | 1202.9 | -0.10 | 17.8 | 1.00 |
| 1235 | whoosh | 1235.0 | -0.00 | 2 | 1235.0 | +0.00 | 9.6 | 1.00 |
| 1287 | pop | 1287.0 | +0.00 | 1 | 1286.84 | -0.16 | 70.3 | 1.00 |
| 1303 | beep | 1302.98 | -0.02 | -35 | 1302.92 | -0.08 | 999.0 | 1.00 |
| 1343-1373 | timer_ticks | 1343.0 | +0.00 | 2 | 1342.88 | -0.12 | 698.3 | 1.00 |
| 1394 | thud | 1394.0 | +0.00 | 2 | 1393.82 | -0.18 | 51.8 | 1.00 |
| 1418 | boing | 1418.02 | +0.02 | 1 | 1417.94 | -0.06 | 28.6 | 1.00 |
| 1448 | timer_ding | 1448.0 | +0.00 | 1 | 1447.88 | -0.12 | 219.6 | 1.00 |
| 1468-1775 | amb_drone | 1468.22 | +0.22 | 0 | 1467.98 | -0.02 | 15.5 | 1.00 |
| 1487 | cork_pop | 1487.0 | +0.00 | 1 | 1486.88 | -0.12 | 35.2 | 1.00 |
| 1500 | whoosh | 1499.99 | -0.01 | 2 | 1500.02 | +0.02 | 7.8 | 1.00 |
| 1509 | impact_kick | 1509.0 | +0.00 | 1 | 1508.96 | -0.04 | 12.7 | 1.00 |
| 1543 | zip | 1542.45 | -0.55 | 1 | 1542.74 | -0.26 | 9.8 | 1.00 |
| 1548 | pop | 1548.0 | +0.00 | 1 | 1548.02 | +0.02 | 12.5 | 1.00 |
| 1563 | arrow_pop | 1563.0 | +0.00 | 1 | 1562.96 | -0.04 | 24.2 | 1.00 |
| 1611 | whoosh_big | 1610.44 | -0.56 | 1 | 1610.42 | -0.58 | 16.2 | 1.00 |
| 1625 | ding | 1625.0 | +0.00 | 1 | 1624.94 | -0.06 | 124.1 | 1.00 |
| 1687 | timer_ding | 1687.06 | +0.06 | 93 | 1686.92 | -0.08 | 66.7 | 1.00 |
| 1745 | whoosh | 1745.0 | -0.00 | 2 | 1744.94 | -0.06 | 8.1 | 1.00 |
| 1764 | door_slam | 1764.0 | +0.00 | 1 | 1763.9 | -0.10 | 21.2 | 1.00 |
| 1775-1948 | amb_room | 1775.14 | +0.14 | 1 | - | - | 3.6 | 1.00 |
| 1810 | click | 1810.0 | +0.00 | 2 | 1809.86 | -0.14 | 30.5 | 1.00 |
| 1834-1900 | bubbling | 1834.02 | +0.02 | 1 | - | - | 3.7 | 1.00 |
| 1856 | gulp | 1856.01 | +0.01 | -4 | 1853.12 | -2.88 | 8.7 | 1.00 |
| 1921 | squeak | 1921.09 | +0.09 | 2 | 1921.16 | +0.16 | 12.0 | 1.00 |
