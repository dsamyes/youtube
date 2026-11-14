# plane-door-midflight - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,152,000 samples = 1970 frames at 30 fps = 65.667 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.6 LU, max momentary -9.3 LUFS, max short-term -13.0 LUFS
- Stems: voice -14.3 LUFS, music -24.3 LUFS, sfx -30.7 LUFS (master gain +7.00 dB on everything; the voice file itself is -20.7 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 7.32 dB, active (>0.1 dB) on 24.44 % of samples, >0.5 dB on 11.87 %, >3 dB on 1.059 %

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
| 1 silence | 0-139 | -14.7 | - | -25.8 | -25.8 | 11.0 | 11.0 | 6.9 |
| 2 theme | 139-280 | -14.1 | -22.9 | -32.8 | -22.4 | 8.3 | 8.1 | 5.6 |
| 3 chase a | 280-399 | -13.3 | -24.1 | -32.2 | -23.5 | 10.2 | 8.8 | 5.3 |
| 3 chase b | 399-473 | -13.5 | -23.3 | -30.2 | -22.6 | 9.1 | 8.3 | 5.9 |
| 3 chase c | 473-483 | -30.1 | -32.3 | -26.5 | -25.5 | -4.5 | 6.1 | 2.1 |
| 4 silence | 483-586 | -14.4 | - | -32.8 | -32.8 | 18.4 | 21.2 | 12.6 |
| 5 mystery | 586-850 | -14.6 | -25.8 | -32.0 | -24.9 | 10.3 | 9.8 | 7.8 |
| 6 mystery | 850-1054 | -14.0 | -25.1 | -34.6 | -24.6 | 10.6 | 10.1 | 7.1 |
| 7 chase a | 1054-1091 | -15.3 | -25.1 | -35.8 | -24.8 | 9.5 | 10.4 | 8.8 |
| 7 chase b | 1091-1125 | -14.8 | -25.0 | -32.3 | -24.2 | 9.5 | 9.6 | 4.5 |
| 7 chase c | 1125-1168 | -16.6 | -25.9 | -31.3 | -24.8 | 8.2 | 8.6 | 6.3 |
| 8 theme | 1168-1399 | -14.2 | -23.6 | -29.0 | -22.8 | 8.5 | 8.6 | 5.4 |
| 9 mystery | 1399-1551 | -14.3 | -25.4 | -31.4 | -24.4 | 10.1 | 10.0 | 7.8 |
| 10 chase a | 1551-1584 | -13.1 | -22.8 | -29.5 | -22.2 | 9.1 | 10.3 | 1.8 |
| 10 chase b | 1584-1615 | -14.9 | -25.0 | -31.9 | -24.3 | 9.4 | 9.6 | 7.4 |
| 10 chase c | 1615-1644 | -17.4 | -26.7 | -34.0 | -26.0 | 8.6 | 9.1 | 5.7 |
| 11 bittersweet | 1644-1764 | -14.8 | -25.6 | -32.0 | -24.7 | 9.9 | 10.4 | 5.6 |
| 12 runup | 1764-1829 | -13.5 | -22.6 | -28.4 | -21.8 | 8.3 | 7.9 | 3.8 |
| 13 finale | 1829-1970 | -13.8 | -22.6 | -33.7 | -22.2 | 8.4 | 8.6 | 4.3 |

## Music map (key Bb major, plan tempo 144 bpm, tune "tiptoe", seed 5207)
The tune: `D F Bb- Bb C D- | Eb C G- A C Eb- | D- Bb F G- C A | Bb-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 3 chase a -11.0, 3 chase b -10.3, 3 chase c -9.5, 5 mystery -11.5, 6 mystery -11.5, 7 chase a -11.0, 7 chase b -10.3, 7 chase c -9.5, 8 theme -9.5, 9 mystery -11.5, 10 chase a -11.0, 10 chase b -10.3, 10 chase c -9.5, 11 bittersweet -11.5, 12 runup -9.5, 13 finale -9.5. Applied section gains (dB): 1 silence -9.2, 2 theme -9.2, 3 chase a -9.1, 3 chase b -10.7, 3 chase c -32.2, 4 silence -9.9, 5 mystery -9.9, 6 mystery -9.8, 7 chase a -10.5, 7 chase b -13.2, 7 chase c -17.3, 8 theme -9.9, 9 mystery -11.0, 10 chase a -8.1, 10 chase b -15.0, 10 chase c -18.7, 11 bittersweet -13.4, 12 runup -11.4, 13 finale -11.6.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 139.0 | 4.63 | THEME: Bb major, swung, 153.2 bpm, 3 bars; clarinet tune, pizzicato boom-chick, brushes |
| 280.0 | 9.33 | CHASE OSTINATO: the tune's head as running eighths (marimba), 170 bpm and accelerating over 5 bars, climbing from Bb major |
| 399.0 | 13.30 | accent downbeat (bar 4): timpani + cymbal; 97 bpm, bass on every beat, xylophone doubles the ostinato |
| 473.0 | 15.77 | accent downbeat (bar 5): timpani + cymbal; 720 bpm, running bass, glock on top, soft brass swells |
| 473.0 | 15.77 | last bar: dominant seventh, 720 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 483.0 | 16.10 | (no music: silence) |
| 586.0 | 19.53 | MYSTERY: the tune at half speed in G minor (vibes), tick-tock woodblock + pizzicato, 109 bpm felt in two; soft |
| 718.0 | 23.93 | answering phrase a step higher |
| 784.0 | 26.13 | half cadence: the tick-tock slows and stops |
| 850.0 | 28.33 | MYSTERY: the tune at half speed in G minor (vibes), tick-tock woodblock + pizzicato, 141 bpm felt in two; soft |
| 952.0 | 31.73 | answering phrase a step higher |
| 1003.0 | 33.43 | half cadence: the tick-tock slows and stops |
| 1054.0 | 35.13 | CHASE OSTINATO: the tune's head as running eighths (marimba), 197 bpm and accelerating over 3 bars, climbing from Bb major |
| 1125.0 | 37.50 | accent downbeat (bar 3): timpani + cymbal; 167 bpm, running bass, glock on top, soft brass swells |
| 1125.0 | 37.50 | last bar: dominant seventh, 167 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 1168.0 | 38.93 | THEME: Bb major, swung, 155.8 bpm, 5 bars; clarinet tune, pizzicato boom-chick, brushes |
| 1306.6 | 43.55 | theme bar 4: the tune lands on the home note, 'pom-pom' answer on beats 3 and 4 |
| 1352.8 | 45.09 | second statement: tune doubled by marimba and glockenspiel |
| 1399.0 | 46.63 | MYSTERY: the tune at half speed in G minor (vibes), tick-tock woodblock + pizzicato, 189 bpm felt in two; soft |
| 1475.0 | 49.17 | answering phrase a step higher |
| 1513.0 | 50.43 | half cadence: the tick-tock slows and stops |
| 1551.0 | 51.70 | CHASE OSTINATO: the tune's head as running eighths (marimba), 218 bpm and accelerating over 3 bars, climbing from Bb major |
| 1584.0 | 52.80 | accent downbeat (bar 2): timpani + cymbal; 233 bpm, bass on every beat, xylophone doubles the ostinato |
| 1615.0 | 53.83 | accent downbeat (bar 3): timpani + cymbal; 248 bpm, running bass, glock on top, soft brass swells |
| 1615.0 | 53.83 | last bar: dominant seventh, 248 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 1644.0 | 54.80 | BITTERSWEET, sweet: the head of the tune in F# major (music box, harp), ending on a rolled chord |
| 1693.0 | 56.43 | the same phrase again ... |
| 1709.3 | 56.98 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1764.0 | 58.80 | RUN-UP: the ostinato on the dominant seventh, 215 bpm and accelerating, 2 bars up into the next section |
| 1829.0 | 60.97 | FINALE: the tune comes home, Bb major, warm and a little faster (137.4 bpm): clarinet + glock + marimba, soft horns, pad |
| 1933.8 | 64.46 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 1960.0 | 65.33 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.3 LUFS integrated). Reverb by place: cabin = room, garden = open, sky = void. Dead cuts (everything that sounded before them stops): f139, f483.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 139 | 0.000 | rocket_rumble (bed) | engine roar (steady): low rumble + crackle | -13.0 | -13.0 | -26.7 | +0.00 |
| 2 | 5 |  | 0.167 | metal_clang | metal clang: first yank on the handle | -6.0 | -12.0 | -25.7 | +0.00 |
| 3 | 13 |  | 0.433 | oof | 'ugh': Gus strains | -6.0 | -12.0 | -25.7 | +0.00 |
| 4 | 23 |  | 0.767 | metal_clang | metal clang: second yank | -6.0 | -12.0 | -25.7 | +0.00 |
| 5 | 39 |  | 1.300 | metal_clang | metal clang: third yank | -6.0 | -12.0 | -25.7 | +0.00 |
| 6 | 48 |  | 1.600 | whoosh | quick whoosh (ease-out burst): cut to the outside | -10.0 | -16.0 | -29.7 | +0.00 |
| 7 | 106 |  | 3.533 | twinkle | sparkle run of five tiny bells: a calm glint on the fuselage: no danger | -9.0 | -15.0 | -28.7 | +0.00 |
| 8 | 124 |  | 4.133 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): into the flash | -2.0 | -8.0 | -21.7 | +0.00 |
| 9 | 139 | 483 | 4.633 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.7 | +0.00 |
| 10 | 139 |  | 4.633 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.7 | +0.00 |
| 11 | 198 |  | 6.600 | pop | small bright pop: the sleep bubble pops, he wakes | -8.0 | -14.0 | -27.7 | +0.00 |
| 12 | 212 |  | 7.067 | oof | 'oh': he yawns and stretches | -6.0 | -12.0 | -25.7 | +0.00 |
| 13 | 242 |  | 8.067 | pop | small bright pop: thought bubble with a toilet | -8.0 | -14.0 | -27.7 | +0.00 |
| 14 | 266 |  | 8.867 | click | click: his hand lands on the handle | -11.0 | -17.0 | -30.7 | +0.00 |
| 15 | 289 |  | 9.633 | crowd_gasp | crowd gasp: his wife screams (stands for a scream) | -6.0 | -12.0 | -25.7 | +0.00 |
| 16 | 331 |  | 11.033 | whoosh | quick whoosh (ease-out burst): the neighbor snatches his seat belt | -10.0 | -16.0 | -29.7 | +0.00 |
| 17 | 354 |  | 11.800 | click | click: belt pulled tight | -11.0 | -17.0 | -30.7 | +0.00 |
| 18 | 380 |  | 12.667 | oof | 'ugh': Gus pulls harder | -6.0 | -12.0 | -25.7 | +0.00 |
| 19 | 399 |  | 13.300 | ting | triangle 'ting' (1865 Hz): Nothing: one glint on the unmoved door | -9.0 | -15.0 | -28.7 | +0.00 |
| 20 | 431 |  | 14.367 | bonk | cartoon bonk: foot on the door | -6.0 | -12.0 | -25.7 | +0.00 |
| 21 | 445 |  | 14.833 | squeak | rubber squeak: slipper squeaks on the door | -8.0 | -14.0 | -27.7 | +0.00 |
| 22 | 461 | 473 | 15.367 | slide_whistle_down | slide whistle falling 1760 -> 466 Hz over 12 frames: his hands slip | -7.0 | -13.0 | -26.7 | +0.00 |
| 23 | 473 |  | 15.767 | thud | heavy soft thud: he sits down hard | -5.0 | -11.0 | -24.7 | +0.00 |
| 24 | 483 | 586 | 16.100 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.7 | +0.00 |
| 25 | 483 |  | 16.100 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.7 | +0.00 |
| 26 | 523 |  | 17.433 | pop | small bright pop: he flexes: a glint on his fist | -8.0 | -14.0 | -27.7 | +0.00 |
| 27 | 544 |  | 18.133 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.7 | +0.00 |
| 28 | 585 |  | 19.500 | whoosh | quick whoosh (ease-out burst): cut to the outside | -10.0 | -16.0 | -29.7 | +0.00 |
| 29 | 586 | 850 | 19.533 | amb_wind (bed) | wind: gusts with a wandering howl | -22.0 | -22.0 | -35.7 | +0.00 |
| 30 | 638 |  | 21.267 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -10.0 | -16.0 | -29.7 | +0.00 |
| 31 | 662 |  | 22.067 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.7 | +0.00 |
| 32 | 676 | 692 | 22.533 | slide_whistle_down | slide whistle falling 1760 -> 466 Hz over 16 frames: the needle sinks to a fifth | -7.0 | -13.0 | -26.7 | +0.00 |
| 33 | 726 |  | 24.200 | blip | blip at 990 Hz: the house mark blinks: the ground | -10.0 | -16.0 | -29.7 | +0.00 |
| 34 | 745 |  | 24.833 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.7 | +0.00 |
| 35 | 764 |  | 25.467 | squeak | rubber squeak: pump stroke one (stands for a tire pump) | -8.0 | -14.0 | -27.7 | +0.00 |
| 36 | 783 |  | 26.100 | squeak | rubber squeak: pump stroke two | -8.0 | -14.0 | -27.7 | +0.00 |
| 37 | 809 |  | 26.967 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.7 | +0.00 |
| 38 | 828 |  | 27.600 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.7 | +0.00 |
| 39 | 849 |  | 28.300 | whoosh | quick whoosh (ease-out burst): cut inside to the door | -10.0 | -16.0 | -29.7 | +0.00 |
| 40 | 850 | 1168 | 28.333 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.7 | +0.00 |
| 41 | 853 |  | 28.433 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.7 | +0.10 |
| 42 | 875 |  | 29.167 | twinkle | sparkle run of five tiny bells: one square inch lights up | -9.0 | -15.0 | -28.7 | +0.00 |
| 43 | 923 |  | 30.767 | thud | heavy soft thud: the 8 pound weight lands on the square | -8.0 | -14.0 | -27.7 | +0.00 |
| 44 | 992 |  | 33.067 | blip | blip at 2093 Hz: the thin outside air taps back, feebly | -10.0 | -16.0 | -29.7 | +0.00 |
| 45 | 1016 | 1054 | 33.867 | typing | typing: squares spreading over the door (ticks) | -13.0 | -19.0 | -32.7 | +0.10 |
| 46 | 1080 | 1104 | 36.000 | slide_whistle_up | slide whistle rising 466 -> 1760 Hz over 24 frames: the little weights rush together | -7.0 | -13.0 | -26.7 | +0.00 |
| 47 | 1125 |  | 37.500 | thud | heavy soft thud: the 20,000 pound weight slams against the door | -5.0 | -11.0 | -24.7 | +0.00 |
| 48 | 1127 |  | 37.567 | metal_clang | metal clang: iron ring of the big weight | -6.0 | -12.0 | -25.7 | +0.00 |
| 49 | 1168 | 1399 | 38.933 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.7 | +0.00 |
| 50 | 1170 |  | 39.000 | thud | heavy soft thud: car one lands on the door | -7.0 | -13.0 | -26.7 | +0.00 |
| 51 | 1181 |  | 39.367 | bonk | cartoon bonk: car two | -6.0 | -12.0 | -25.7 | +0.00 |
| 52 | 1192 |  | 39.733 | thud | heavy soft thud: car three | -8.0 | -14.0 | -27.7 | +0.00 |
| 53 | 1203 |  | 40.100 | bonk | cartoon bonk: car four | -6.0 | -12.0 | -25.7 | +0.00 |
| 54 | 1214 |  | 40.467 | car_horn | car horn, beep-beep: the top car honks | -5.0 | -11.0 | -24.7 | +0.00 |
| 55 | 1258 |  | 41.933 | pop | small bright pop: suction cup onto the helmet glass | -8.0 | -14.0 | -27.7 | +0.00 |
| 56 | 1277 |  | 42.567 | squeak | rubber squeak: she tugs, it holds | -8.0 | -14.0 | -27.7 | +0.00 |
| 57 | 1290 |  | 43.000 | squeak | rubber squeak: tugs again | -8.0 | -14.0 | -27.7 | +0.00 |
| 58 | 1312 |  | 43.733 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.7 | +0.00 |
| 59 | 1353 |  | 45.100 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.7 | +0.00 |
| 60 | 1381 |  | 46.033 | cork_pop | cork pop: the cup comes off | -3.0 | -9.0 | -22.7 | +0.00 |
| 61 | 1399 | 1451 | 46.633 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.7 | +0.00 |
| 62 | 1401 |  | 46.700 | twinkle | sparkle run of five tiny bells: the door's outline shimmers | -9.0 | -15.0 | -28.7 | +0.00 |
| 63 | 1425 |  | 47.500 | pop | small bright pop: a bathtub plug pops up beside the door | -8.0 | -14.0 | -27.7 | +0.00 |
| 64 | 1451 | 1551 | 48.367 | amb_wind (bed) | wind: gusts with a wandering howl | -22.0 | -22.0 | -35.7 | +0.00 |
| 65 | 1462 |  | 48.733 | bonk | cartoon bonk: the plug door bumps against its frame | -6.0 | -12.0 | -25.7 | +0.00 |
| 66 | 1474 |  | 49.133 | bonk | cartoon bonk: and again | -6.0 | -12.0 | -25.7 | +0.00 |
| 67 | 1506 |  | 50.200 | whoosh | quick whoosh (ease-out burst): it slides inward | -10.0 | -16.0 | -29.7 | +0.00 |
| 68 | 1529 | 1544 | 50.967 | door_creak | door creak: it turns and swings out | -9.0 | -15.0 | -28.7 | +0.00 |
| 69 | 1551 | 1644 | 51.700 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.7 | +0.00 |
| 70 | 1561 |  | 52.033 | oof | 'ugh': Gus leans into the rope | -6.0 | -12.0 | -25.7 | +0.00 |
| 71 | 1590 | 1630 | 53.000 | footsteps | 6 footsteps (soft ground): slippers scrabbling on the grass | -11.0 | -17.0 | -30.7 | +0.00 |
| 72 | 1612 |  | 53.733 | oof | 'ow': he groans | -6.0 | -12.0 | -25.7 | +0.00 |
| 73 | 1644 | 1764 | 54.800 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.7 | +0.00 |
| 74 | 1656 |  | 55.200 | twinkle | sparkle run of five tiny bells: the door gleams, untouched | -9.0 | -15.0 | -28.7 | +0.00 |
| 75 | 1691 |  | 56.367 | gulp | cartoon gulp: Unluckily | -7.0 | -13.0 | -26.7 | +0.00 |
| 76 | 1717 | 1760 | 57.233 | footsteps | 6 footsteps (hard ground): hopping from foot to foot | -11.0 | -17.0 | -30.7 | +0.00 |
| 77 | 1735 |  | 57.833 | pop | small bright pop: the toilet thought bubble is back | -8.0 | -14.0 | -27.7 | +0.00 |
| 78 | 1764 | 1829 | 58.800 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.7 | +0.00 |
| 79 | 1787 |  | 59.567 | cork_pop | cork pop: the door pops open on the ground | -3.0 | -9.0 | -22.7 | +0.00 |
| 80 | 1790 | 1805 | 59.667 | door_creak | door creak: and swings wide | -9.0 | -15.0 | -28.7 | +0.00 |
| 81 | 1812 |  | 60.400 | bird_tweet | bird chirps: peace on the ground | -11.0 | -17.0 | -30.7 | +0.20 |
| 82 | 1829 | 1970 | 60.967 | amb_drone (bed) | low breathing drone | -24.0 | -24.0 | -37.7 | +0.00 |
| 83 | 1830 | 1856 | 61.000 | footsteps | 3 footsteps (soft ground): he shuffles to the next door | -11.0 | -17.0 | -30.7 | +0.00 |
| 84 | 1877 |  | 62.567 | twinkle | sparkle run of five tiny bells: the lavatory door sparkles | -9.0 | -15.0 | -28.7 | +0.00 |
| 85 | 1916 |  | 63.867 | click | click: his hand on the knob | -11.0 | -17.0 | -30.7 | +0.00 |
| 86 | 1936 |  | 64.533 | buzzer | 'wrong' buzzer: the latch window snaps to red: taken | -6.0 | -12.0 | -25.7 | +0.00 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: amb_drone@483 -1.60 (snr 5.8), footsteps@1590 -1.78 (snr 16.4), amb_drone@1644 -1.60 (snr 6.9), amb_drone@1829 -2.46 (snr 6.2)
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): whoosh@48, push_whoosh@853, door_creak@1790
- Files: `mix.wav` 3,152,000 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,152,000 samples, 48000 Hz, 2 ch, 24-bit, peak -0.62 dBFS, 0 clipped; `stem_music.wav` 3,152,000 samples, 48000 Hz, 2 ch, 24-bit, peak -8.59 dBFS, 0 clipped; `stem_sfx.wav` 3,152,000 samples, 48000 Hz, 2 ch, 24-bit, peak -7.4 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.57 LU, max momentary -9.3 LUFS. Stems minus mix: -126.7 dB.
- Event onsets in `stem_sfx.wav` (86 events, tolerance 1 frame): matched 86/86 within tolerance (largest error 0.61 frame, largest lag 977 samples); blind band-flux detector resolved 75 of them, 71 within tolerance (largest error 2.46 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): whoosh@48, amb_drone@139, amb_wind@586, amb_drone@850, push_whoosh@853, amb_garden@1168, amb_drone@1399, amb_wind@1451, amb_garden@1551, amb_garden@1764, door_creak@1790.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **8.53 dB** over 51.77 s of speech (400 ms windows: median 7.09, 10th percentile 1.81, 90th 13.28 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-138.9, 483-585.9 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -67.7 dBFS, below 20 Hz -42.0 dB, above 12 kHz -45.5 dB of the total energy, centroid 799 Hz. Bands (dB of total): 0-20 Hz -42.0, 20-60 Hz -27.7, 60-300 Hz -3.8, 300-3000 Hz -3.0, 3000-8000 Hz -11.3, 8000-12000 Hz -24.5, 12000-16000 Hz -45.5, 16000-24000 Hz -68.2.
- Score landmarks: first sound at f138.98; 1 silence f0-139: -240.0 dBFS; 2 theme: onset at f138.98 (plan f139); 3 chase: onset at f280.04 (plan f280); 4 silence f483-586: -240.0 dBFS; 5 mystery: onset at f585.94 (plan f586); 6 mystery: onset at f849.86 (plan f850); 7 chase: onset at f1053.86 (plan f1054); 8 theme: onset at f1167.98 (plan f1168); 9 mystery: onset at f1398.98 (plan f1399); 10 chase: onset at f1550.9 (plan f1551); 11 bittersweet: onset at f1645.4 (plan f1644); 12 runup: onset at f1763.9 (plan f1764); 13 finale: onset at f1829.06 (plan f1829), button at f1959.86 (plan f1960); last 10 ms -79.7 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-139 | 11.37 | 12.48 | 4.38 |
| 2 theme | 139-280 | 7.04 | 5.24 | -1.99 |
| 3 chase a | 280-399 | 8.85 | 7.3 | 3.44 |
| 3 chase b | 399-473 | 7.91 | 5.8 | 1.66 |
| 4 silence | 483-586 | 16.78 | 18.94 | 9.13 |
| 5 mystery | 586-850 | 8.77 | 6.96 | 2.25 |
| 6 mystery | 850-1054 | 8.73 | 6.19 | 3.34 |
| 7 chase a | 1054-1091 | 9.49 | 5.92 | -2.16 |
| 7 chase b | 1091-1125 | 11.09 | 10.86 | 2.39 |
| 7 chase c | 1125-1168 | 6.44 | 6.86 | 2.94 |
| 8 theme | 1168-1399 | 7.27 | 7.04 | 0.71 |
| 9 mystery | 1399-1551 | 8.27 | 7.39 | 2.24 |
| 10 chase a | 1551-1584 | 10.39 | 10.1 | 5.09 |
| 10 chase b | 1584-1615 | 7.57 | 7.75 | 5.55 |
| 10 chase c | 1615-1644 | 7.72 | 7.79 | 1.85 |
| 11 bittersweet | 1644-1764 | 8.27 | 8.27 | 1.97 |
| 12 runup | 1764-1829 | 7.85 | 4.65 | 2.31 |
| 13 finale | 1829-1970 | 7.87 | 5.15 | 0.36 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-138 | 11.37 | Gus is trying to open a plane door seven miles up, and he's in no dang |
| 2 | 141-276 | 7.04 | It's three in the afternoon, he just woke up from a nap, and he thinks |
| 3 | 280-364 | 9.86 | His wife screams. His neighbor grabs his seat belt. |
| 4 | 368-479 | 7.5 | Gus pulls harder. Nothing. He puts a foot on the wall. Still nothing. |
| 5 | 483-582 | 16.78 | But wait. Gus isn't that weak. So what's holding the door shut? |
| 6 | 586-741 | 8.42 | You see, up here the air outside is thin. It presses a fifth as hard a |
| 7 | 745-847 | 9.3 | So the cabin is pumped up like a tire, and all that air wants out. |
| 8 | 850-1011 | 7.56 | It leans on every square inch of the door, eight pounds harder than th |
| 9 | 1014-1164 | 10.34 | And a door has a lot of square inches. Add them up, and you get almost |
| 10 | 1168-1243 | 7.44 | That is the weight of four cars, parked on the door. |
| 11 | 1247-1395 | 7.17 | Ever pull a suction cup off a window? There's no glue. It's just air p |
| 12 | 1399-1548 | 8.27 | A plane door is a plug, a bit bigger than its hole, so it has to come  |
| 13 | 1551-1641 | 9.0 | To open it, Gus would have to drag in all four cars. |
| 14 | 1644-1689 | 8.46 | Luckily, nobody can do that. |
| 15 | 1693-1826 | 7.92 | Unluckily, he still needs the bathroom, and the door only lets go on t |
| 16 | 1829-1930 | 7.42 | So he tries the next door, the one door on this plane he can open. |
| 17 | 1933-1955 | 9.87 | It's taken. |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-139 | rocket_rumble | 0.07 | +0.07 | 1 | -0.1 | -0.10 | 20.0 | 0.98 |
| 5 | metal_clang | 5.48 | +0.48 | 767 | 5.0 | +0.00 | 18.2 | 1.00 |
| 13 | oof | 13.05 | +0.05 | 1 | 13.16 | +0.16 | 5.9 | 1.00 |
| 23 | metal_clang | 23.0 | +0.00 | 2 | 23.06 | +0.06 | 12.9 | 1.00 |
| 39 | metal_clang | 39.0 | -0.00 | -1 | 39.02 | +0.02 | 9.3 | 1.00 |
| 48 | whoosh | 47.93 | -0.07 | 2 | - | - | 5.0 | 1.00 |
| 106 | twinkle | 106.0 | +0.00 | 1 | 105.92 | -0.08 | 999.0 | 1.00 |
| 124 | whoosh_big | 123.55 | -0.45 | 1 | 123.56 | -0.44 | 7.4 | 0.99 |
| 139 | flash_hit | 138.65 | -0.35 | 2 | 139.1 | +0.10 | 10.3 | 1.00 |
| 139-483 | amb_drone | 139.1 | +0.10 | 0 | - | - | 4.5 | 0.99 |
| 198 | pop | 198.0 | +0.00 | 1 | 197.9 | -0.10 | 30.3 | 1.00 |
| 212 | oof | 212.07 | +0.07 | 2 | 212.0 | +0.00 | 13.3 | 1.00 |
| 242 | pop | 242.0 | +0.00 | 1 | 241.94 | -0.06 | 25.5 | 1.00 |
| 266 | click | 266.0 | +0.00 | 2 | 265.88 | -0.12 | 42.1 | 1.00 |
| 289 | crowd_gasp | 289.09 | +0.09 | 2 | 288.92 | -0.08 | 6.7 | 1.00 |
| 331 | whoosh | 331.01 | +0.01 | 2 | 330.86 | -0.14 | 8.6 | 1.00 |
| 354 | click | 354.0 | +0.00 | 2 | 353.9 | -0.10 | 44.5 | 1.00 |
| 380 | oof | 380.05 | +0.05 | 2 | 380.0 | +0.00 | 15.8 | 1.00 |
| 399 | ting | 398.39 | -0.61 | -977 | 398.9 | -0.10 | 423.3 | 1.00 |
| 431 | bonk | 431.0 | +0.00 | 1 | 430.88 | -0.12 | 28.6 | 1.00 |
| 445 | squeak | 445.09 | +0.09 | 2 | 445.16 | +0.16 | 13.2 | 1.00 |
| 461-473 | slide_whistle_down | 461.02 | +0.02 | 1 | 460.94 | -0.06 | 44.6 | 1.00 |
| 473 | thud | 473.0 | +0.00 | 2 | 472.88 | -0.12 | 17.6 | 1.00 |
| 483 | record_stop | 483.0 | +0.00 | 2 | 482.9 | -0.10 | 31.0 | 1.00 |
| 483-586 | amb_drone | 483.01 | +0.01 | 1 | 481.4 | -1.60 | 5.8 | 1.00 |
| 523 | pop | 523.0 | +0.00 | 1 | 522.92 | -0.08 | 29.0 | 1.00 |
| 544 | question_blip | 544.01 | +0.01 | 1 | 543.92 | -0.08 | 42.9 | 1.00 |
| 585 | whoosh | 585.02 | +0.02 | 2 | 585.02 | +0.02 | 8.7 | 1.00 |
| 586-850 | amb_wind | 586.07 | +0.07 | -2 | - | - | 4.8 | 1.00 |
| 638 | decel_whoosh | 638.08 | +0.08 | 1 | 638.0 | +0.00 | 17.1 | 1.00 |
| 662 | arrow_pop | 662.0 | +0.00 | 1 | 661.94 | -0.06 | 23.4 | 1.00 |
| 676-692 | slide_whistle_down | 676.03 | +0.03 | 1 | 675.98 | -0.02 | 34.0 | 1.00 |
| 726 | blip | 725.98 | -0.02 | -47 | 725.96 | -0.04 | 51.0 | 1.00 |
| 745 | flip_blip | 745.01 | +0.01 | 1 | 744.92 | -0.08 | 100.6 | 1.00 |
| 764 | squeak | 764.09 | +0.09 | 2 | 764.12 | +0.12 | 13.7 | 1.00 |
| 783 | squeak | 783.09 | +0.09 | 2 | 783.08 | +0.08 | 13.4 | 1.00 |
| 809 | arrow_pop | 809.0 | +0.00 | 1 | 808.94 | -0.06 | 22.9 | 1.00 |
| 828 | arrow_pop | 828.0 | +0.00 | 1 | 827.9 | -0.10 | 23.3 | 1.00 |
| 849 | whoosh | 849.16 | +0.16 | 2 | 849.14 | +0.14 | 8.6 | 1.00 |
| 850-1168 | amb_drone | 850.02 | +0.02 | 1 | - | - | 2.3 | 1.00 |
| 853 | push_whoosh | 853.0 | +0.00 | 2 | - | - | 4.6 | 1.00 |
| 875 | twinkle | 875.01 | +0.01 | 1 | 874.94 | -0.06 | 999.0 | 1.00 |
| 923 | thud | 923.0 | +0.00 | 2 | 922.88 | -0.12 | 24.9 | 1.00 |
| 992 | blip | 992.05 | +0.05 | 70 | 991.94 | -0.06 | 52.7 | 1.00 |
| 1016-1054 | typing | 1016.0 | +0.00 | 1 | 1015.88 | -0.12 | 39.7 | 1.00 |
| 1080-1104 | slide_whistle_up | 1080.03 | +0.03 | 1 | 1080.02 | +0.02 | 140.9 | 1.00 |
| 1125 | thud | 1125.0 | +0.00 | 2 | 1124.9 | -0.10 | 23.4 | 1.00 |
| 1127 | metal_clang | 1127.0 | +0.00 | 0 | 1127.0 | -0.00 | 9.7 | 1.00 |
| 1168-1399 | amb_garden | 1168.18 | +0.18 | 1 | - | - | 2.8 | 1.00 |
| 1170 | thud | 1170.0 | +0.00 | 2 | 1169.9 | -0.10 | 16.7 | 1.00 |
| 1181 | bonk | 1181.0 | +0.00 | 1 | 1180.94 | -0.06 | 17.8 | 1.00 |
| 1192 | thud | 1192.0 | +0.00 | 2 | 1191.92 | -0.08 | 14.3 | 1.00 |
| 1203 | bonk | 1203.0 | +0.00 | 1 | 1202.9 | -0.10 | 19.3 | 1.00 |
| 1214 | car_horn | 1214.03 | +0.03 | 1 | 1214.06 | +0.06 | 13.7 | 1.00 |
| 1258 | pop | 1258.0 | +0.00 | 1 | 1257.92 | -0.08 | 23.2 | 1.00 |
| 1277 | squeak | 1277.09 | +0.09 | 2 | 1277.18 | +0.18 | 11.8 | 1.00 |
| 1290 | squeak | 1290.09 | +0.09 | 2 | 1290.2 | +0.20 | 12.6 | 1.00 |
| 1312 | question_blip | 1312.01 | +0.01 | 1 | 1311.98 | -0.02 | 22.2 | 1.00 |
| 1353 | arrow_pop | 1353.0 | +0.00 | 1 | 1352.96 | -0.04 | 19.7 | 1.00 |
| 1381 | cork_pop | 1381.0 | +0.00 | 1 | 1380.92 | -0.08 | 17.5 | 1.00 |
| 1399-1451 | amb_drone | 1399.25 | +0.25 | 0 | - | - | 5.0 | 1.00 |
| 1401 | twinkle | 1401.01 | +0.01 | 1 | 1400.96 | -0.04 | 999.0 | 1.00 |
| 1425 | pop | 1425.0 | +0.00 | 1 | 1424.9 | -0.10 | 28.8 | 1.00 |
| 1451-1551 | amb_wind | 1451.02 | +0.02 | -1 | - | - | 3.9 | 1.00 |
| 1462 | bonk | 1462.0 | +0.00 | 1 | 1461.92 | -0.08 | 16.0 | 1.00 |
| 1474 | bonk | 1474.0 | +0.00 | 1 | 1473.92 | -0.08 | 14.9 | 1.00 |
| 1506 | whoosh | 1505.93 | -0.07 | 2 | 1506.02 | +0.02 | 9.6 | 1.00 |
| 1529-1544 | door_creak | 1529.07 | +0.07 | 2 | 1529.0 | +0.00 | 10.7 | 1.00 |
| 1551-1644 | amb_garden | 1551.47 | +0.47 | 1 | - | - | 2.5 | 1.00 |
| 1561 | oof | 1561.04 | +0.04 | 2 | 1561.04 | +0.04 | 9.2 | 1.00 |
| 1590-1630 | footsteps | 1589.99 | -0.01 | -23 | 1588.22 | -1.78 | 16.4 | 1.00 |
| 1612 | oof | 1612.05 | +0.05 | 2 | 1612.16 | +0.16 | 7.8 | 1.00 |
| 1644-1764 | amb_drone | 1644.06 | +0.06 | 1 | 1642.4 | -1.60 | 6.9 | 1.00 |
| 1656 | twinkle | 1656.01 | +0.01 | 2 | 1655.9 | -0.10 | 999.0 | 1.00 |
| 1691 | gulp | 1691.01 | +0.01 | -3 | 1690.64 | -0.36 | 14.9 | 1.00 |
| 1717-1760 | footsteps | 1717.0 | +0.00 | 1 | 1716.92 | -0.08 | 20.4 | 1.00 |
| 1735 | pop | 1735.0 | +0.00 | 1 | 1734.92 | -0.08 | 30.7 | 1.00 |
| 1764-1829 | amb_garden | 1764.46 | +0.46 | 1 | - | - | 2.2 | 1.00 |
| 1787 | cork_pop | 1787.0 | +0.00 | 1 | 1786.88 | -0.12 | 15.9 | 1.00 |
| 1790-1805 | door_creak | 1790.07 | +0.07 | 2 | - | - | 4.5 | 1.00 |
| 1812 | bird_tweet | 1812.27 | +0.27 | 2 | 1812.14 | +0.14 | 22.7 | 1.00 |
| 1829-1970 | amb_drone | 1829.08 | +0.08 | 1 | 1826.54 | -2.46 | 6.2 | 1.00 |
| 1830-1856 | footsteps | 1829.99 | -0.01 | -19 | 1829.66 | -0.34 | 11.8 | 1.00 |
| 1877 | twinkle | 1877.01 | +0.01 | 1 | 1876.94 | -0.06 | 999.0 | 1.00 |
| 1916 | click | 1916.0 | +0.00 | 2 | 1915.88 | -0.12 | 45.8 | 1.00 |
| 1936 | buzzer | 1936.05 | +0.05 | 0 | 1935.98 | -0.02 | 6.5 | 1.00 |
