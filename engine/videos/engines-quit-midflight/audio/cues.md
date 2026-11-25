# engines-quit-midflight - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,241,600 samples = 2026 frames at 30 fps = 67.533 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.4 LU, max momentary -9.7 LUFS, max short-term -12.8 LUFS
- Stems: voice -14.3 LUFS, music -24.6 LUFS, sfx -29.0 LUFS (master gain +7.34 dB on everything; the voice file itself is -20.9 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 7.51 dB, active (>0.1 dB) on 25.71 % of samples, >0.5 dB on 12.90 %, >3 dB on 1.365 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -14.0 LUFS
    Threshold: -24.1 LUFS
  Loudness range:
    LRA:         1.4 LU
    Threshold: -34.1 LUFS
    LRA low:   -14.8 LUFS
    LRA high:  -13.4 LUFS
  True peak:
    Peak:       -1.2 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| 1 silence | 0-197 | -14.2 | - | -23.7 | -23.7 | 9.6 | 10.3 | 3.0 |
| 2 theme | 197-294 | -14.3 | -22.5 | -34.8 | -22.2 | 8.0 | 8.2 | 2.1 |
| 3 silence | 294-371 | -13.6 | - | -30.4 | -30.4 | 16.7 | 16.4 | 12.6 |
| 4 chase a | 371-413 | -13.2 | -24.2 | -32.2 | -23.8 | 10.6 | 10.1 | 9.2 |
| 4 chase b | 413-477 | -14.5 | -23.8 | -30.0 | -23.1 | 8.6 | 8.8 | 5.3 |
| 4 chase c | 477-537 | -13.9 | -23.2 | -28.3 | -22.8 | 8.9 | 8.2 | 4.8 |
| 5 silence | 537-607 | -13.6 | - | -29.9 | -29.9 | 16.3 | 16.3 | 12.2 |
| 6 mystery | 607-755 | -14.5 | -25.9 | -30.2 | -25.0 | 10.5 | 11.0 | 7.4 |
| 7 waltz | 755-871 | -13.8 | -24.0 | -32.9 | -23.5 | 9.7 | 10.0 | 4.5 |
| 8 mystery | 871-1169 | -14.0 | -25.1 | -31.2 | -24.5 | 10.5 | 10.1 | 7.1 |
| 9 theme | 1169-1311 | -14.4 | -23.5 | -30.1 | -22.9 | 8.5 | 8.4 | 4.3 |
| 10 lullaby | 1311-1472 | -14.5 | -25.7 | -30.6 | -24.5 | 9.9 | 9.7 | 7.1 |
| 11 bittersweet | 1472-1709 | -14.4 | -25.5 | -30.2 | -24.4 | 10.0 | 9.9 | 6.6 |
| 12 mystery | 1709-1874 | -14.7 | -25.7 | -32.8 | -24.9 | 10.2 | 9.4 | 7.2 |
| 13 finale | 1874-2026 | -14.1 | -23.4 | -32.5 | -23.0 | 8.9 | 8.7 | 5.7 |

## Music map (key G major, plan tempo 124 bpm, tune "stroll", seed 2511)
The tune: `D B D G- E D- | E C E A- G F#- | G B D'- B G E F# | G-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 4 chase a -11.0, 4 chase b -10.3, 4 chase c -9.5, 6 mystery -11.5, 7 waltz -11.0, 8 mystery -11.5, 9 theme -9.5, 10 lullaby -11.5, 11 bittersweet -11.5, 12 mystery -11.5, 13 finale -9.5. Applied section gains (dB): 1 silence -11.2, 2 theme -11.2, 3 silence -10.0, 4 chase a -10.0, 4 chase b -11.4, 4 chase c -14.6, 5 silence -10.8, 6 mystery -10.8, 7 waltz -11.7, 8 mystery -10.0, 9 theme -9.6, 10 lullaby -12.7, 11 bittersweet -9.5, 12 mystery -12.0, 13 finale -13.1.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 197.0 | 6.57 | THEME: G major, swung, 148.5 bpm, 2 bars; clarinet tune, pizzicato boom-chick, brushes |
| 269.8 | 8.99 | stop chord (dominant seventh): the band leaves the next two beats to the sound effects, vibes ring |
| 294.0 | 9.80 | (no music: silence) |
| 371.0 | 12.37 | CHASE OSTINATO: the tune's head as running eighths (marimba), 171 bpm and accelerating over 3 bars, climbing from G major |
| 413.0 | 13.77 | accent downbeat (bar 2): timpani + cymbal; 113 bpm, bass on every beat, xylophone doubles the ostinato |
| 477.0 | 15.90 | last bar: dominant seventh, 120 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 537.0 | 17.90 | (no music: silence) |
| 607.0 | 20.23 | MYSTERY: the tune at half speed in E minor (vibes), tick-tock woodblock + pizzicato, 97 bpm felt in two; soft |
| 681.0 | 22.70 | half cadence: the tick-tock slows and stops |
| 755.0 | 25.17 | WALTZ: music box in G major, 190 bpm, pick-up on f758, downbeats at f772, f801, low point f829 |
| 800.6 | 26.69 | the tune steps down do-la-fa into |
| 829.0 | 27.63 | the low point (low home note); then the arpeggio climbs, slower and slower, to the rest |
| 861.0 | 28.70 | the rest: the high home note rings, everything else waits |
| 871.0 | 29.03 | MYSTERY: the tune at half speed in E minor (vibes), tick-tock woodblock + pizzicato, 97 bpm felt in two; soft |
| 1020.0 | 34.00 | answering phrase a step higher |
| 1094.5 | 36.48 | half cadence: the tick-tock slows and stops |
| 1169.0 | 38.97 | THEME: G major, swung, 101.4 bpm, 2 bars; clarinet tune, pizzicato boom-chick, brushes |
| 1311.0 | 43.70 | LULLABY: the tune rocking in 6/8, Eb major (the home note is its third), music box + harp + warm pad, 67 dotted-quarters a minute |
| 1418.3 | 47.28 | last bar climbs to an unresolved second (a rising slide whistle can aim for the same note) |
| 1472.0 | 49.07 | BITTERSWEET, sweet: the head of the tune in Eb major (music box, harp), ending on a rolled chord |
| 1622.0 | 54.07 | the same phrase again ... |
| 1646.0 | 54.87 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1709.0 | 56.97 | MYSTERY: the tune at half speed in E minor (vibes), tick-tock woodblock + pizzicato, 175 bpm felt in two; soft |
| 1791.5 | 59.72 | answering phrase a step higher |
| 1832.8 | 61.09 | half cadence: the tick-tock slows and stops |
| 1874.0 | 62.47 | FINALE: the tune comes home, G major, warm and a little faster (126.8 bpm): clarinet + glock + marimba, soft horns, pad |
| 1987.6 | 66.25 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 2016.0 | 67.20 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.3 LUFS integrated). Reverb by place: cabin = room, ocean = open, sky = void. Dead cuts (everything that sounded before them stops): f197, f537.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 197 | 0.000 | wind_rush (bed) | falling rush under the hook, rising into the flash (noise band + faint whistle + flutter, follows the speed) | -8.5 | -8.5 | -22.1 | +0.00 |
| 2 | 5 |  | 0.167 | flame_poof | 'fwoomp' + flutter + crackle: the engine coughs black smoke | -6.0 | -12.0 | -25.6 | +0.20 |
| 3 | 27 |  | 0.900 | power_down | power down: both engines quit | -8.0 | -14.0 | -27.6 | +0.00 |
| 4 | 86 |  | 2.867 | whoosh | quick whoosh (ease-out burst): the lens jumps back | -10.0 | -16.0 | -29.6 | +0.00 |
| 5 | 96 |  | 3.200 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 6 | 157 |  | 5.233 | power_down | power down: the movie stops | -10.0 | -16.0 | -29.6 | +0.00 |
| 7 | 181 |  | 6.033 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): into the flash | -2.0 | -8.0 | -21.6 | +0.00 |
| 8 | 197 | 241 | 6.567 | amb_wind (bed) | wind: gusts with a wandering howl | -22.0 | -22.0 | -35.6 | +0.00 |
| 9 | 197 |  | 6.567 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.6 | +0.00 |
| 10 | 204 |  | 6.800 | twinkle | sparkle run of five tiny bells: afternoon sun glints | -9.0 | -15.0 | -28.6 | +0.00 |
| 11 | 241 | 294 | 8.033 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.6 | +0.00 |
| 12 | 294 | 326 | 9.800 | rocket_rumble (bed) | engine roar (fade): low rumble + crackle | -16.0 | -16.0 | -29.6 | +0.00 |
| 13 | 311 |  | 10.367 | power_down | power down: it all goes quiet | -8.0 | -14.0 | -27.6 | +0.00 |
| 14 | 329 | 537 | 10.967 | amb_room (bed) | room tone: soft air, faint hum | -32.0 | -32.0 | -45.6 | +0.00 |
| 15 | 347 |  | 11.567 | click | click: the screen goes black | -11.0 | -17.0 | -30.6 | +0.00 |
| 16 | 352 |  | 11.733 | gulp | cartoon gulp: Gus's face in the black glass | -7.0 | -13.0 | -26.6 | +0.00 |
| 17 | 384 |  | 12.800 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.6 | +0.10 |
| 18 | 413 |  | 13.767 | crowd_gasp | crowd gasp: Gus yells | -6.0 | -12.0 | -25.6 | +0.00 |
| 19 | 428 |  | 14.267 | pop | small bright pop: thought bubble: a rock | -8.0 | -14.0 | -27.6 | +0.00 |
| 20 | 440 | 455 | 14.667 | slide_whistle_down | slide whistle falling 1480 -> 392 Hz over 15 frames: the rock drops | -7.0 | -13.0 | -26.6 | +0.00 |
| 21 | 500 |  | 16.667 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.6 | +0.00 |
| 22 | 537 | 607 | 17.900 | amb_wind (bed) | wind: gusts with a wandering howl | -22.0 | -22.0 | -35.6 | +0.00 |
| 23 | 537 |  | 17.900 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.6 | +0.00 |
| 24 | 565 |  | 18.833 | buzzer | 'wrong' buzzer: red cross over the fall arrow | -6.0 | -12.0 | -25.6 | +0.00 |
| 25 | 586 |  | 19.533 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.6 | +0.00 |
| 26 | 640 |  | 21.333 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 27 | 659 |  | 21.967 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.6 | +0.00 |
| 28 | 681 |  | 22.700 | pop | small bright pop: first lift arrow under the wing | -8.0 | -14.0 | -27.6 | +0.00 |
| 29 | 689 |  | 22.967 | pop | small bright pop: second lift arrow | -8.0 | -14.0 | -27.6 | +0.00 |
| 30 | 713 |  | 23.767 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.6 | +0.10 |
| 31 | 735 |  | 24.500 | zip | 'zwip' pass-by: the plane nudges ahead | -8.0 | -14.0 | -27.6 | +0.00 |
| 32 | 755 | 871 | 25.167 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 33 | 760 |  | 25.333 | whoosh | quick whoosh (ease-out burst): Gus rolls off down the hill | -10.0 | -16.0 | -29.6 | +0.00 |
| 34 | 772 | 806 | 25.733 | timer_ticks | egg timer: 11 tick-tocks, one every 3.4 frames, last one on f806 | -16.0 | -22.0 | -35.6 | -0.15 |
| 35 | 815 |  | 27.167 | pop | small bright pop: feet off the pedals | -8.0 | -14.0 | -27.6 | +0.00 |
| 36 | 826 | 866 | 27.533 | timer_ticks | egg timer: 12 tick-tocks, one every 3.6 frames, last one on f866 | -15.0 | -21.0 | -34.6 | -0.15 |
| 37 | 845 |  | 28.167 | zip | 'zwip' pass-by: rolling on | -7.0 | -13.0 | -26.6 | +0.00 |
| 38 | 871 |  | 29.033 | whoosh | quick whoosh (ease-out burst): the airliner on the hill | -10.0 | -16.0 | -29.6 | +0.00 |
| 39 | 916 | 958 | 30.533 | slide_whistle_down | slide whistle falling 1480 -> 392 Hz over 42 frames: it rolls down the hill | -7.0 | -13.0 | -26.6 | +0.00 |
| 40 | 944 |  | 31.467 | twinkle | sparkle run of five tiny bells: the hill turns to air | -9.0 | -15.0 | -28.6 | +0.00 |
| 41 | 986 | 1002 | 32.867 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -10.0 | -16.0 | -29.6 | +0.00 |
| 42 | 1030 |  | 34.333 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 43 | 1044 |  | 34.800 | blip | blip at 990 Hz: it sinks one mile | -10.0 | -16.0 | -29.6 | +0.00 |
| 44 | 1065 | 1093 | 35.500 | timer_ticks | egg timer: 9 tick-tocks, one every 3.5 frames, last one on f1093 | -14.0 | -20.0 | -33.6 | -0.15 |
| 45 | 1081 |  | 36.033 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 46 | 1120 |  | 37.333 | whoosh | quick whoosh (ease-out burst): the ramp | -10.0 | -16.0 | -29.6 | +0.00 |
| 47 | 1142 |  | 38.067 | pop | small bright pop: wheelchair sign | -8.0 | -14.0 | -27.6 | +0.00 |
| 48 | 1157 |  | 38.567 | ding | friendly two-bell 'ding': flatter than the ramp | -7.0 | -13.0 | -26.6 | +0.00 |
| 49 | 1177 |  | 39.233 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 50 | 1209 | 1262 | 40.300 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -10.0 | -16.0 | -29.6 | +0.00 |
| 51 | 1232 |  | 41.067 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 52 | 1268 |  | 42.267 | pop | small bright pop: the clock | -8.0 | -14.0 | -27.6 | +0.00 |
| 53 | 1274 | 1294 | 42.467 | timer_ticks | egg timer: 7 tick-tocks, one every 3.3 frames, last one on f1294 | -14.0 | -20.0 | -33.6 | -0.15 |
| 54 | 1296 |  | 43.200 | timer_ding | kitchen-timer bell, rings about 1 s: twenty minutes | -4.0 | -10.0 | -23.6 | -0.15 |
| 55 | 1311 | 1472 | 43.700 | amb_ocean_night (bed) | night ocean: slow swells, foam, water lapping on the boat, timber creaks | -21.0 | -21.0 | -34.6 | +0.00 |
| 56 | 1320 |  | 44.000 | pop | small bright pop: fuel gauge | -8.0 | -14.0 | -27.6 | +0.00 |
| 57 | 1343 | 1356 | 44.767 | alarm | alarm (beep): out of fuel | -12.0 | -18.0 | -31.6 | +0.00 |
| 58 | 1357 |  | 45.233 | power_down | power down: the engines die | -8.0 | -14.0 | -27.6 | +0.00 |
| 59 | 1373 |  | 45.767 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 60 | 1412 |  | 47.067 | twinkle | sparkle run of five tiny bells: the island's runway lights | -9.0 | -15.0 | -28.6 | +0.00 |
| 61 | 1436 |  | 47.867 | thud | heavy soft thud: touchdown | -5.0 | -11.0 | -24.6 | +0.00 |
| 62 | 1449 | 1470 | 48.300 | crowd_cheer | crowd cheer: they all lived | -8.0 | -14.0 | -27.6 | +0.00 |
| 63 | 1472 | 1622 | 49.067 | amb_wind (bed) | wind: gusts with a wandering howl | -22.0 | -22.0 | -35.6 | +0.00 |
| 64 | 1499 |  | 49.967 | click | click: the hatch flips open | -11.0 | -17.0 | -30.6 | +0.00 |
| 65 | 1510 |  | 50.333 | cork_pop | cork pop: the little propeller drops out | -3.0 | -9.0 | -22.6 | +0.00 |
| 66 | 1544 |  | 51.467 | power_up | power up: it spins up in the wind | -8.0 | -14.0 | -27.6 | +0.00 |
| 67 | 1583 |  | 52.767 | zip | 'zwip' pass-by: power runs to the nose | -8.0 | -14.0 | -27.6 | +0.00 |
| 68 | 1598 |  | 53.267 | ding | friendly two-bell 'ding': the controls light up | -7.0 | -13.0 | -26.6 | +0.00 |
| 69 | 1622 | 1709 | 54.067 | amb_room (bed) | room tone: soft air, faint hum | -32.0 | -32.0 | -45.6 | +0.00 |
| 70 | 1622 |  | 54.067 | gulp | cartoon gulp: Unluckily | -7.0 | -13.0 | -26.6 | +0.00 |
| 71 | 1670 |  | 55.667 | click | click: he pokes the screen | -11.0 | -17.0 | -30.6 | +0.00 |
| 72 | 1682 |  | 56.067 | click | click: again | -11.0 | -17.0 | -30.6 | +0.00 |
| 73 | 1690 |  | 56.333 | buzzer | 'wrong' buzzer: no power for the screens | -6.0 | -12.0 | -25.6 | +0.00 |
| 74 | 1709 | 1952 | 56.967 | amb_wind (bed) | wind: gusts with a wandering howl | -22.0 | -22.0 | -35.6 | +0.00 |
| 75 | 1722 |  | 57.400 | pop | small bright pop: lightbulb | -8.0 | -14.0 | -27.6 | +0.00 |
| 76 | 1791 | 1812 | 59.700 | door_creak | door creak: the throttle levers come back | -9.0 | -15.0 | -28.6 | +0.00 |
| 77 | 1827 |  | 60.900 | power_down | power down: engines to idle | -8.0 | -14.0 | -27.6 | +0.00 |
| 78 | 1840 |  | 61.333 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 79 | 1893 | 1946 | 63.100 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -10.0 | -16.0 | -29.6 | +0.00 |
| 80 | 1929 |  | 64.300 | twinkle | sparkle run of five tiny bells: home | -9.0 | -15.0 | -28.6 | +0.00 |
| 81 | 1952 | 2026 | 65.067 | amb_room (bed) | room tone: soft air, faint hum | -32.0 | -32.0 | -45.6 | +0.00 |
| 82 | 1958 |  | 65.267 | oof | 'ugh': Gus sighs | -6.0 | -12.0 | -25.6 | +0.00 |
| 83 | 1993 |  | 66.433 | click | click: one more tap on the dead screen | -11.0 | -17.0 | -30.6 | +0.00 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: twinkle@944 -1.92 (snr 999.0), arrow_pop@1081 -2.12 (snr 32.3), twinkle@1412 -1.20 (snr 999.0), gulp@1622 -2.28 (snr 8.7), buzzer@1690 -1.40 (snr 7.5)
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): flame_poof@5, whoosh@86, power_down@157, whoosh_big@181, buzzer@565, crowd_cheer@1449
- Files: `mix.wav` 3,241,600 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,241,600 samples, 48000 Hz, 2 ch, 24-bit, peak -0.54 dBFS, 0 clipped; `stem_music.wav` 3,241,600 samples, 48000 Hz, 2 ch, 24-bit, peak -7.87 dBFS, 0 clipped; `stem_sfx.wav` 3,241,600 samples, 48000 Hz, 2 ch, 24-bit, peak -6.03 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.36 LU, max momentary -9.7 LUFS. Stems minus mix: -126.7 dB.
- Event onsets in `stem_sfx.wav` (83 events, tolerance 1 frame): matched 83/83 within tolerance (largest error 0.72 frame, largest lag 93 samples); blind band-flux detector resolved 70 of them, 65 within tolerance (largest error 2.28 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): flame_poof@5, whoosh@86, power_down@157, whoosh_big@181, amb_wind@197, amb_drone@241, rocket_rumble@294, amb_room@329, buzzer@565, crowd_cheer@1449, amb_wind@1472, amb_wind@1709, amb_room@1952.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **8.43 dB** over 54.55 s of speech (400 ms windows: median 7.16, 10th percentile 1.8, 90th 13.09 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-197, 294-370.9, 537-606.9 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -67.7 dBFS, below 20 Hz -40.2 dB, above 12 kHz -45.4 dB of the total energy, centroid 811 Hz. Bands (dB of total): 0-20 Hz -40.2, 20-60 Hz -30.5, 60-300 Hz -3.6, 300-3000 Hz -3.2, 3000-8000 Hz -11.1, 8000-12000 Hz -24.1, 12000-16000 Hz -45.4, 16000-24000 Hz -68.1.
- Score landmarks: first sound at f196.98; 1 silence f0-197: -240.0 dBFS; 2 theme: onset at f196.98 (plan f197); 3 silence f294-371: -240.0 dBFS; 4 chase: onset at f370.97 (plan f371); 5 silence f537-607: -240.0 dBFS; 6 mystery: onset at f606.91 (plan f607); 7 waltz: onset at f755.24 (plan f755); 8 mystery: onset at f870.86 (plan f871); 9 theme: onset at f1168.94 (plan f1169); 10 lullaby: onset at f1310.96 (plan f1311); 11 bittersweet: onset at f1471.94 (plan f1472); 12 mystery: onset at f1708.88 (plan f1709); 13 finale: onset at f1874.0 (plan f1874), button at f2015.84 (plan f2016); last 10 ms -74.4 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-197 | 7.57 | 6.76 | -3.45 |
| 2 theme | 197-294 | 6.37 | 5.06 | -1.36 |
| 3 silence | 294-371 | 19.21 | 17.59 | 12.04 |
| 4 chase a | 371-413 | 8.29 | 8.96 | -2.14 |
| 4 chase b | 413-477 | 8.72 | 8.94 | 5.46 |
| 4 chase c | 477-537 | 8.23 | 4.19 | -1.86 |
| 5 silence | 537-607 | 16.01 | 16.31 | 8.67 |
| 6 mystery | 607-755 | 7.95 | 6.31 | 2.89 |
| 7 waltz | 755-871 | 8.73 | 8.24 | 1.79 |
| 8 mystery | 871-1169 | 8.38 | 6.05 | 2.91 |
| 9 theme | 1169-1311 | 6.72 | 5.21 | -0.77 |
| 10 lullaby | 1311-1472 | 8.69 | 7.47 | 2.61 |
| 11 bittersweet | 1472-1709 | 8.81 | 7.08 | 2.29 |
| 12 mystery | 1709-1874 | 8.38 | 6.34 | 2.88 |
| 13 finale | 1874-2026 | 7.45 | 7.26 | -0.81 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-193 | 7.57 | Both engines just quit on the plane Gus is on, seven miles up, and the |
| 2 | 197-290 | 6.37 | It's three in the afternoon, and Gus is halfway through a movie. |
| 3 | 294-410 | 12.92 | Then it all goes quiet and the screen goes black. His neighbor grabs h |
| 4 | 413-533 | 8.53 | We'll drop like a rock, yells Gus, but his wife just eats her sandwich |
| 5 | 537-604 | 16.01 | But wait. The plane isn't dropping. Why not? |
| 6 | 607-751 | 7.95 | You see, the engines never held the plane up. The wings do that, and e |
| 7 | 755-867 | 8.73 | Ever coast down a hill on a bike? You stop pedaling, and you keep roll |
| 8 | 871-966 | 8.45 | A plane does the same. It rolls down a hill made of air. |
| 9 | 969-1116 | 7.9 | And that hill is not steep. For each mile it sinks the plane slides fi |
| 10 | 1120-1166 | 9.57 | That's flatter than a wheelchair ramp. |
| 11 | 1169-1308 | 6.72 | So from seven miles up it glides over a hundred miles, for almost twen |
| 12 | 1311-1468 | 8.69 | A jet once ran out of fuel and glided seventy-five miles to an island, |
| 13 | 1472-1619 | 8.77 | Luckily, a little propeller drops from the belly and spins in the wind |
| 14 | 1622-1705 | 8.88 | Unluckily, it's too small to run the movie screens. |
| 15 | 1709-1870 | 8.37 | And here's the thing. On a normal flight the pilots pull the engines b |
| 16 | 1874-2011 | 7.45 | Gus has been gliding home his whole life. He just never knew it till t |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-197 | wind_rush | 0.03 | +0.03 | 1 | -0.1 | -0.10 | 20.0 | 0.98 |
| 5 | flame_poof | 5.01 | +0.01 | 1 | - | - | 2.8 | 1.00 |
| 27 | power_down | 27.04 | +0.04 | 1 | 27.08 | +0.08 | 12.7 | 1.00 |
| 86 | whoosh | 85.96 | -0.04 | 2 | - | - | 4.8 | 1.00 |
| 96 | arrow_pop | 96.0 | +0.00 | 1 | 95.96 | -0.04 | 10.0 | 1.00 |
| 157 | power_down | 157.04 | +0.04 | 1 | - | - | 3.8 | 1.00 |
| 181 | whoosh_big | 180.47 | -0.53 | 1 | - | - | 3.8 | 0.99 |
| 197 | flash_hit | 196.65 | -0.35 | 2 | 197.18 | +0.18 | 10.1 | 1.00 |
| 197-241 | amb_wind | 197.03 | +0.03 | -1 | - | - | 3.0 | 1.00 |
| 204 | twinkle | 204.01 | +0.01 | 1 | 204.02 | +0.02 | 999.0 | 1.00 |
| 241-294 | amb_drone | 241.17 | +0.17 | 0 | - | - | 4.0 | 1.00 |
| 294-326 | rocket_rumble | 294.13 | +0.13 | 1 | - | - | 4.9 | 1.00 |
| 311 | power_down | 311.04 | +0.04 | 1 | 310.76 | -0.24 | 10.7 | 1.00 |
| 329-537 | amb_room | 329.17 | +0.17 | 1 | - | - | 2.2 | 0.99 |
| 347 | click | 347.0 | +0.00 | 2 | 346.88 | -0.12 | 37.6 | 1.00 |
| 352 | gulp | 352.01 | +0.01 | -4 | 352.04 | +0.04 | 11.3 | 1.00 |
| 384 | push_whoosh | 384.0 | +0.00 | 2 | 383.96 | -0.04 | 11.9 | 1.00 |
| 413 | crowd_gasp | 413.14 | +0.14 | 2 | 413.06 | +0.06 | 8.3 | 1.00 |
| 428 | pop | 428.0 | +0.00 | 1 | 427.94 | -0.06 | 24.3 | 1.00 |
| 440-455 | slide_whistle_down | 440.02 | +0.02 | 1 | 439.94 | -0.06 | 38.2 | 1.00 |
| 500 | chomp | 500.0 | +0.00 | 2 | 499.88 | -0.12 | 23.1 | 1.00 |
| 537 | record_stop | 537.0 | +0.00 | 2 | 536.84 | -0.16 | 26.4 | 1.00 |
| 537-607 | amb_wind | 537.14 | +0.14 | 0 | 536.9 | -0.10 | 8.5 | 1.00 |
| 565 | buzzer | 565.01 | +0.01 | 0 | - | - | 4.6 | 1.00 |
| 586 | question_blip | 586.01 | +0.01 | 1 | 585.98 | -0.02 | 40.4 | 1.00 |
| 640 | arrow_pop | 640.0 | +0.00 | 1 | 639.86 | -0.14 | 78.8 | 1.00 |
| 659 | flip_blip | 659.0 | +0.00 | 1 | 658.88 | -0.12 | 768.4 | 1.00 |
| 681 | pop | 681.0 | +0.00 | 1 | 680.9 | -0.10 | 43.3 | 1.00 |
| 689 | pop | 689.0 | +0.00 | 1 | 688.94 | -0.06 | 28.1 | 1.00 |
| 713 | push_whoosh | 713.0 | +0.01 | 2 | 712.88 | -0.12 | 62.0 | 1.00 |
| 735 | zip | 734.51 | -0.49 | 2 | 734.6 | -0.40 | 21.2 | 1.00 |
| 755-871 | amb_garden | 755.18 | +0.18 | 1 | 755.0 | -0.00 | 10.8 | 1.00 |
| 760 | whoosh | 759.88 | -0.12 | 2 | 760.04 | +0.04 | 6.3 | 1.00 |
| 772-806 | timer_ticks | 772.0 | +0.00 | 2 | 771.92 | -0.08 | 22.0 | 1.00 |
| 815 | pop | 815.0 | +0.00 | 1 | 814.94 | -0.06 | 18.6 | 1.00 |
| 826-866 | timer_ticks | 826.0 | +0.00 | 2 | 825.86 | -0.14 | 26.6 | 1.00 |
| 845 | zip | 844.46 | -0.54 | 1 | 844.1 | -0.90 | 17.2 | 1.00 |
| 871 | whoosh | 870.92 | -0.08 | 2 | 871.1 | +0.10 | 7.9 | 1.00 |
| 916-958 | slide_whistle_down | 916.02 | +0.02 | 1 | 915.92 | -0.08 | 119.9 | 1.00 |
| 944 | twinkle | 944.0 | +0.00 | 1 | 942.08 | -1.92 | 999.0 | 1.00 |
| 986-1002 | decel_whoosh | 986.08 | +0.08 | 1 | 985.94 | -0.06 | 51.6 | 1.00 |
| 1030 | arrow_pop | 1030.0 | +0.00 | 1 | 1029.86 | -0.14 | 86.3 | 1.00 |
| 1044 | blip | 1044.0 | +0.00 | 1 | 1043.9 | -0.10 | 229.1 | 1.00 |
| 1065-1093 | timer_ticks | 1065.0 | +0.00 | 2 | 1064.84 | -0.16 | 117.0 | 1.00 |
| 1081 | arrow_pop | 1081.0 | +0.00 | 1 | 1078.88 | -2.12 | 32.3 | 1.00 |
| 1120 | whoosh | 1120.08 | +0.08 | 2 | 1119.68 | -0.32 | 16.6 | 1.00 |
| 1142 | pop | 1142.0 | +0.00 | 1 | 1141.88 | -0.12 | 47.2 | 1.00 |
| 1157 | ding | 1157.0 | +0.00 | 1 | 1156.88 | -0.12 | 344.8 | 1.00 |
| 1177 | arrow_pop | 1177.0 | +0.00 | 1 | 1176.92 | -0.08 | 40.3 | 1.00 |
| 1209-1262 | decel_whoosh | 1209.06 | +0.06 | 1 | 1208.96 | -0.04 | 42.4 | 1.00 |
| 1232 | arrow_pop | 1232.0 | +0.00 | 1 | 1231.94 | -0.06 | 17.9 | 1.00 |
| 1268 | pop | 1268.0 | +0.00 | 1 | 1267.88 | -0.12 | 59.2 | 1.00 |
| 1274-1294 | timer_ticks | 1274.0 | +0.00 | 2 | 1273.88 | -0.12 | 58.0 | 1.00 |
| 1296 | timer_ding | 1296.06 | +0.06 | 93 | 1295.9 | -0.10 | 41.7 | 1.00 |
| 1311-1472 | amb_ocean_night | 1311.11 | +0.11 | 1 | 1311.02 | +0.02 | 9.0 | 1.00 |
| 1320 | pop | 1320.0 | +0.00 | 1 | 1319.96 | -0.04 | 22.3 | 1.00 |
| 1343-1356 | alarm | 1343.03 | +0.03 | 26 | 1342.94 | -0.06 | 65.0 | 1.00 |
| 1357 | power_down | 1357.04 | +0.04 | 1 | 1357.04 | +0.04 | 19.4 | 1.00 |
| 1373 | arrow_pop | 1373.0 | +0.00 | 1 | 1373.0 | +0.00 | 17.0 | 1.00 |
| 1412 | twinkle | 1412.0 | +0.00 | 2 | 1410.8 | -1.20 | 999.0 | 1.00 |
| 1436 | thud | 1436.0 | +0.00 | 2 | 1435.94 | -0.06 | 14.1 | 1.00 |
| 1449-1470 | crowd_cheer | 1449.15 | +0.15 | 1 | - | - | 2.6 | 1.00 |
| 1472-1622 | amb_wind | 1472.73 | +0.72 | -2 | - | - | 3.3 | 1.00 |
| 1499 | click | 1499.0 | +0.00 | 2 | 1498.88 | -0.12 | 35.3 | 1.00 |
| 1510 | cork_pop | 1510.0 | +0.00 | 1 | 1509.92 | -0.08 | 17.4 | 1.00 |
| 1544 | power_up | 1544.04 | +0.04 | 1 | 1544.24 | +0.24 | 5.3 | 1.00 |
| 1583 | zip | 1582.53 | -0.47 | 2 | 1582.64 | -0.36 | 13.1 | 1.00 |
| 1598 | ding | 1598.0 | +0.00 | 1 | 1597.94 | -0.06 | 157.2 | 1.00 |
| 1622-1709 | amb_room | 1622.04 | +0.04 | 2 | 1622.0 | -0.00 | 6.2 | 1.00 |
| 1622 | gulp | 1622.01 | +0.01 | -3 | 1619.72 | -2.28 | 8.7 | 1.00 |
| 1670 | click | 1670.0 | +0.00 | 2 | 1669.88 | -0.12 | 39.4 | 1.00 |
| 1682 | click | 1682.0 | +0.00 | 1 | 1681.88 | -0.12 | 41.8 | 1.00 |
| 1690 | buzzer | 1690.02 | +0.02 | 0 | 1688.6 | -1.40 | 7.5 | 1.00 |
| 1709-1952 | amb_wind | 1709.04 | +0.04 | -1 | - | - | 4.2 | 1.00 |
| 1722 | pop | 1722.0 | +0.00 | 1 | 1721.9 | -0.10 | 18.3 | 1.00 |
| 1791-1812 | door_creak | 1791.11 | +0.11 | 2 | 1791.02 | +0.02 | 11.2 | 1.00 |
| 1827 | power_down | 1827.04 | +0.04 | 1 | 1826.96 | -0.04 | 24.4 | 1.00 |
| 1840 | arrow_pop | 1840.0 | +0.00 | 1 | 1839.92 | -0.08 | 16.0 | 1.00 |
| 1893-1946 | decel_whoosh | 1893.06 | +0.06 | 1 | 1893.02 | +0.02 | 13.2 | 1.00 |
| 1929 | twinkle | 1929.01 | +0.01 | 1 | 1928.9 | -0.10 | 999.0 | 1.00 |
| 1952-2026 | amb_room | 1952.02 | +0.02 | 1 | - | - | 3.9 | 1.00 |
| 1958 | oof | 1958.08 | +0.08 | 2 | 1958.0 | +0.00 | 12.1 | 1.00 |
| 1993 | click | 1993.0 | +0.00 | 2 | 1992.86 | -0.14 | 35.6 | 1.00 |
