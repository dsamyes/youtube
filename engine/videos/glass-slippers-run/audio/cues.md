# glass-slippers-run - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,163,200 samples = 1977 frames at 30 fps = 65.900 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.5 LU, max momentary -9.8 LUFS, max short-term -12.5 LUFS
- Stems: voice -14.3 LUFS, music -24.3 LUFS, sfx -28.5 LUFS (master gain +5.96 dB on everything; the voice file itself is -19.5 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 6.58 dB, active (>0.1 dB) on 23.37 % of samples, >0.5 dB on 12.57 %, >3 dB on 1.491 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -14.0 LUFS
    Threshold: -24.1 LUFS
  Loudness range:
    LRA:         1.5 LU
    Threshold: -34.0 LUFS
    LRA low:   -14.7 LUFS
    LRA high:  -13.2 LUFS
  True peak:
    Peak:       -1.2 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| 1 silence | 0-158 | -14.8 | - | -23.2 | -23.2 | 8.4 | 9.2 | 2.7 |
| 2 theme | 158-375 | -14.2 | -23.2 | -31.7 | -22.6 | 8.5 | 8.0 | 4.3 |
| 3 chase a | 375-418 | -13.1 | -23.3 | -31.4 | -22.7 | 9.6 | 9.8 | 6.0 |
| 3 chase b | 418-492 | -15.4 | -25.3 | -29.2 | -23.9 | 8.6 | 8.6 | 6.5 |
| 3 chase c | 492-509 | -17.6 | -25.9 | -31.0 | -24.7 | 7.1 | 7.8 | 2.9 |
| 4 silence | 509-648 | -13.8 | - | -29.7 | -29.7 | 15.9 | 16.9 | 11.5 |
| 5 mystery | 648-941 | -14.3 | -25.2 | -29.3 | -24.2 | 9.9 | 9.6 | 4.7 |
| 6 runup | 941-1013 | -13.2 | -22.2 | -28.7 | -21.2 | 8.0 | 8.5 | 2.9 |
| 7 mystery | 1013-1328 | -14.2 | -25.1 | -30.5 | -24.3 | 10.0 | 9.6 | 6.7 |
| 8 theme | 1328-1467 | -14.5 | -23.5 | -30.8 | -22.9 | 8.4 | 8.1 | 4.5 |
| 9 mystery | 1467-1624 | -14.4 | -25.1 | -30.7 | -24.5 | 10.0 | 9.6 | 5.2 |
| 10 bittersweet | 1624-1743 | -14.3 | -25.1 | -31.8 | -24.4 | 10.1 | 11.0 | 7.1 |
| 11 silence | 1743-1828 | -13.7 | -47.2 | -29.1 | -29.1 | 15.3 | 19.0 | 13.7 |
| 12 finale | 1828-1977 | -14.4 | -23.3 | -31.0 | -22.8 | 8.4 | 8.2 | 6.1 |

## Music map (key D major, plan tempo 138 bpm, tune "hop", seed 7411)
The tune: `D- A B D- F# E | E- B D Db- A | D E F#- D B Db A | D-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 3 chase a -11.0, 3 chase b -10.3, 3 chase c -9.5, 5 mystery -11.5, 6 runup -9.5, 7 mystery -11.5, 8 theme -9.5, 9 mystery -11.5, 10 bittersweet -11.5, 12 finale -9.5. Applied section gains (dB): 1 silence -9.1, 2 theme -9.1, 3 chase a -7.8, 3 chase b -11.5, 3 chase c -19.2, 4 silence -8.8, 5 mystery -8.8, 6 runup -10.9, 7 mystery -9.8, 8 theme -9.3, 9 mystery -9.9, 10 bittersweet -14.0, 11 silence -12.7, 12 finale -12.7.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 158.0 | 5.27 | THEME: D major, swung, 132.7 bpm, 4 bars; clarinet tune, pizzicato boom-chick, brushes |
| 347.9 | 11.60 | stop chord (dominant seventh): the band leaves the next two beats to the sound effects, vibes ring |
| 375.0 | 12.50 | CHASE OSTINATO: the tune's head as running eighths (marimba), 167 bpm and accelerating over 3 bars, climbing from D major |
| 418.0 | 13.93 | accent downbeat (bar 2): timpani + cymbal; 97 bpm, bass on every beat, xylophone doubles the ostinato |
| 492.0 | 16.40 | accent downbeat (bar 3): timpani + cymbal; 424 bpm, running bass, glock on top, soft brass swells |
| 492.0 | 16.40 | last bar: dominant seventh, 424 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 509.0 | 16.97 | (no music: silence) |
| 648.0 | 21.60 | MYSTERY: the tune at half speed in B minor (vibes), tick-tock woodblock + pizzicato, 98 bpm felt in two; soft |
| 794.5 | 26.48 | answering phrase a step higher |
| 867.8 | 28.93 | half cadence: the tick-tock slows and stops |
| 941.0 | 31.37 | RUN-UP: the ostinato on the dominant seventh, 194 bpm and accelerating, 2 bars up into the next section |
| 1013.0 | 33.77 | MYSTERY: the tune at half speed in B minor (vibes), tick-tock woodblock + pizzicato, 183 bpm felt in two; soft |
| 1249.2 | 41.64 | answering phrase a step higher |
| 1288.6 | 42.95 | half cadence: the tick-tock slows and stops |
| 1328.0 | 44.27 | THEME: D major, swung, 155.4 bpm, 3 bars; clarinet tune, pizzicato boom-chick, brushes |
| 1467.0 | 48.90 | MYSTERY: the tune at half speed in B minor (vibes), tick-tock woodblock + pizzicato, 183 bpm felt in two; soft |
| 1545.5 | 51.52 | answering phrase a step higher |
| 1584.8 | 52.83 | half cadence: the tick-tock slows and stops |
| 1624.0 | 54.13 | BITTERSWEET, sweet: the head of the tune in Bb major (music box, harp), ending on a rolled chord |
| 1691.0 | 56.37 | the same phrase again ... |
| 1707.2 | 56.91 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1743.0 | 58.10 | (no music: silence, the ring before it is choked) |
| 1828.0 | 60.93 | FINALE: the tune comes home, D major, warm and a little faster (181.3 bpm): clarinet + glock + marimba, soft horns, pad |
| 1947.1 | 64.90 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 1967.0 | 65.57 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.3 LUFS integrated). Reverb by place: garden = open, park = open, sky = void. Dead cuts (everything that sounded before them stops): f158, f509.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 158 | 0.000 | wind_rush (bed) | falling rush under the hook, rising into the flash (noise band + faint whistle + flutter, follows the speed) | -8.5 | -8.5 | -22.1 | +0.00 |
| 2 | 6 |  | 0.200 | thud | heavy soft thud: first elephant lands in the slipper | -5.0 | -11.0 | -24.6 | +0.00 |
| 3 | 30 |  | 1.000 | thud | heavy soft thud: second elephant lands on the first | -5.0 | -11.0 | -24.6 | +0.00 |
| 4 | 45 |  | 1.500 | ting | triangle 'ting' (1175 Hz): the slipper glints: it holds | -9.0 | -15.0 | -28.6 | +0.00 |
| 5 | 70 |  | 2.333 | squeak | rubber squeak: the tower wobbles | -8.0 | -14.0 | -27.6 | +0.00 |
| 6 | 115 | 130 | 3.833 | footsteps | 2 footsteps (soft ground): Gus runs at the lens | -11.0 | -17.0 | -30.6 | +0.00 |
| 7 | 130 |  | 4.333 | glass_pop | glass pops: small pop + glass tink + tiny shards | -6.0 | -12.0 | -25.6 | +0.00 |
| 8 | 143 |  | 4.767 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): into the flash | -2.0 | -8.0 | -21.6 | +0.00 |
| 9 | 158 | 509 | 5.267 | amb_night (bed) | night air: crickets over a faint breeze | -27.0 | -27.0 | -40.6 | +0.00 |
| 10 | 158 |  | 5.267 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.6 | +0.00 |
| 11 | 176 |  | 5.867 | bell | big bell (523 Hz): the clock: eleven at night | -10.0 | -16.0 | -29.6 | +0.00 |
| 12 | 214 | 234 | 7.133 | crowd_cheer | crowd cheer: party | -11.0 | -17.0 | -30.6 | +0.00 |
| 13 | 243 | 255 | 8.100 | slide_whistle_up | slide whistle rising 294 -> 1109 Hz over 12 frames: Gus puts a foot forward | -7.0 | -13.0 | -26.6 | +0.00 |
| 14 | 261 |  | 8.700 | twinkle | sparkle run of five tiny bells: the slippers sparkle on 'Cinderella' | -9.0 | -15.0 | -28.6 | +0.00 |
| 15 | 294 |  | 9.800 | whoosh | quick whoosh (ease-out burst): wife's hand over her eyes | -10.0 | -16.0 | -29.6 | +0.00 |
| 16 | 313 |  | 10.433 | pop | small bright pop: thought bubble with a slipper | -8.0 | -14.0 | -27.6 | +0.00 |
| 17 | 339 |  | 11.300 | glass_pop | glass pops: small pop + glass tink + tiny shards | -6.0 | -12.0 | -25.6 | +0.00 |
| 18 | 357 |  | 11.900 | gulp | cartoon gulp: she gulps | -7.0 | -13.0 | -26.6 | +0.00 |
| 19 | 378 | 390 | 12.600 | slide_whistle_up | slide whistle rising 294 -> 1109 Hz over 12 frames: Gus stands up | -7.0 | -13.0 | -26.6 | +0.00 |
| 20 | 403 |  | 13.433 | ting | triangle 'ting' (1175 Hz): nothing: glint | -9.0 | -15.0 | -28.6 | +0.00 |
| 21 | 418 |  | 13.933 | jump_boing | spring 'boing': he hops | -5.0 | -11.0 | -24.6 | +0.00 |
| 22 | 430 |  | 14.333 | thud | heavy soft thud: lands | -8.0 | -14.0 | -27.6 | +0.00 |
| 23 | 436 |  | 14.533 | ting | triangle 'ting' (1760 Hz): nothing: glint | -9.0 | -15.0 | -28.6 | +0.00 |
| 24 | 454 | 490 | 15.133 | footsteps | 4 footsteps (hard ground): dancing on the floor | -11.0 | -17.0 | -30.6 | +0.00 |
| 25 | 460 |  | 15.333 | pop | small bright pop: music note | -11.0 | -17.0 | -30.6 | +0.00 |
| 26 | 474 |  | 15.800 | pop | small bright pop: music note | -11.0 | -17.0 | -30.6 | +0.00 |
| 27 | 492 |  | 16.400 | ting | triangle 'ting' (2093 Hz): still nothing: glint | -9.0 | -15.0 | -28.6 | +0.00 |
| 28 | 509 | 648 | 16.967 | amb_cricket (bed) | awkward quiet: faint breeze and ONE cricket | -33.0 | -33.0 | -46.6 | +0.00 |
| 29 | 509 |  | 16.967 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.6 | +0.00 |
| 30 | 515 |  | 17.167 | cricket | the one cricket (3-pulse chirps, about 1.6 per second) | -15.0 | -21.0 | -34.6 | +0.35 |
| 31 | 531 | 553 | 17.700 | slide_whistle_down | slide whistle falling 1109 -> 294 Hz over 22 frames: the cup falls | -7.0 | -13.0 | -26.6 | +0.00 |
| 32 | 553 |  | 18.433 | glass_pop | glass pops: small pop + glass tink + tiny shards | -4.0 | -10.0 | -23.6 | +0.00 |
| 33 | 591 |  | 19.700 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.6 | +0.00 |
| 34 | 618 |  | 20.600 | squeak | rubber squeak: he wiggles a foot | -8.0 | -14.0 | -27.6 | +0.00 |
| 35 | 648 |  | 21.600 | whoosh | quick whoosh (ease-out burst): to the diagram | -10.0 | -16.0 | -29.6 | +0.00 |
| 36 | 676 |  | 22.533 | metal_clang | metal clang: weight lands on the glass cube | -6.0 | -12.0 | -25.6 | +0.00 |
| 37 | 690 |  | 23.000 | twinkle | sparkle run of five tiny bells: the glass holds | -9.0 | -15.0 | -28.6 | +0.00 |
| 38 | 742 |  | 24.733 | metal_clang | metal clang: weight lands on the concrete | -6.0 | -12.0 | -25.6 | +0.00 |
| 39 | 763 |  | 25.433 | crash | crash: crack + boom + clatter: the concrete crumbles | -3.0 | -9.0 | -22.6 | +0.00 |
| 40 | 793 |  | 26.433 | pop | small bright pop: glass cube pops in | -8.0 | -14.0 | -27.6 | +0.00 |
| 41 | 821 |  | 27.367 | pop | small bright pop: sugar cube pops in | -8.0 | -14.0 | -27.6 | +0.00 |
| 42 | 846 | 860 | 28.200 | slide_whistle_down | slide whistle falling 1109 -> 294 Hz over 14 frames: the ten-ton weight falls | -7.0 | -13.0 | -26.6 | +0.00 |
| 43 | 860 |  | 28.667 | thud | heavy soft thud: ten tons land on the cube | -3.0 | -9.0 | -22.6 | +0.00 |
| 44 | 868 |  | 28.933 | ting | triangle 'ting' (1175 Hz): the cube holds | -9.0 | -15.0 | -28.6 | +0.00 |
| 45 | 889 |  | 29.633 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): glide back to the elephants | -6.0 | -12.0 | -25.6 | +0.00 |
| 46 | 924 |  | 30.800 | twinkle | sparkle run of five tiny bells: the heel glints | -9.0 | -15.0 | -28.6 | +0.00 |
| 47 | 941 |  | 31.367 | whoosh | quick whoosh (ease-out burst): cut to the clock | -10.0 | -16.0 | -29.6 | +0.00 |
| 48 | 953 |  | 31.767 | click | click: the hand jumps to twelve | -11.0 | -17.0 | -30.6 | +0.00 |
| 49 | 964 |  | 32.133 | bell | big bell (392 Hz): the clock strikes twelve | -6.0 | -12.0 | -25.6 | +0.00 |
| 50 | 984 |  | 32.800 | gulp | cartoon gulp: Gus gasps | -7.0 | -13.0 | -26.6 | +0.00 |
| 51 | 992 |  | 33.067 | whoosh | quick whoosh (ease-out burst): he bolts | -10.0 | -16.0 | -29.6 | +0.00 |
| 52 | 994 | 1012 | 33.133 | footsteps | 3 footsteps (hard ground): running | -11.0 | -17.0 | -30.6 | +0.00 |
| 53 | 1036 |  | 34.533 | thud | heavy soft thud: the foot lands | -5.0 | -11.0 | -24.6 | +0.00 |
| 54 | 1050 |  | 35.000 | pop | small bright pop: one Gus of weight | -8.0 | -14.0 | -27.6 | +0.00 |
| 55 | 1058 |  | 35.267 | pop | small bright pop: two | -8.0 | -14.0 | -27.6 | +0.00 |
| 56 | 1066 |  | 35.533 | pop | small bright pop: and a half | -8.0 | -14.0 | -27.6 | +0.00 |
| 57 | 1109 | 1121 | 36.967 | door_creak | door creak: the foot tips onto the heel edge | -9.0 | -15.0 | -28.6 | +0.00 |
| 58 | 1121 |  | 37.367 | ricochet_ping | cartoon ricochet 'pyeeow', small: spark at the heel tip | -9.0 | -15.0 | -28.6 | +0.15 |
| 59 | 1137 |  | 37.900 | whoosh | quick whoosh (ease-out burst): to the heel | -10.0 | -16.0 | -29.6 | +0.00 |
| 60 | 1148 | 1170 | 38.267 | door_creak | door creak: the heel bends | -9.0 | -15.0 | -28.6 | +0.00 |
| 61 | 1195 |  | 39.833 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 62 | 1231 |  | 41.033 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 63 | 1262 |  | 42.067 | pop | small bright pop: two bars pop in | -8.0 | -14.0 | -27.6 | +0.00 |
| 64 | 1283 | 1305 | 42.767 | timer_ticks | egg timer: 7 tick-tocks, one every 3.7 frames, last one on f1305 | -14.0 | -20.0 | -33.6 | -0.15 |
| 65 | 1311 |  | 43.700 | glass_pop | glass pops: small pop + glass tink + tiny shards | -6.0 | -12.0 | -25.6 | +0.00 |
| 66 | 1317 |  | 43.900 | thud | heavy soft thud: its weight drops | -8.0 | -14.0 | -27.6 | +0.00 |
| 67 | 1328 | 1467 | 44.267 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 68 | 1342 |  | 44.733 | paper_flick | paper flaps + board knock: pulls at the bag | -11.0 | -17.0 | -30.6 | +0.00 |
| 69 | 1356 |  | 45.200 | oof | 'ugh': strains | -6.0 | -12.0 | -25.6 | +0.00 |
| 70 | 1372 |  | 45.733 | paper_flick | paper flaps + board knock: pulls again | -11.0 | -17.0 | -30.6 | +0.00 |
| 71 | 1405 |  | 46.833 | squeak | rubber squeak: the bag only stretches | -8.0 | -14.0 | -27.6 | +0.00 |
| 72 | 1429 |  | 47.633 | twinkle | sparkle run of five tiny bells: glint on the notch | -9.0 | -15.0 | -28.6 | +0.00 |
| 73 | 1446 |  | 48.200 | zip | 'zwip' pass-by: the bag rips open | -7.0 | -13.0 | -26.6 | +0.00 |
| 74 | 1458 |  | 48.600 | ding | friendly two-bell 'ding': the bag is open: he laughs | -7.0 | -13.0 | -26.6 | +0.00 |
| 75 | 1467 |  | 48.900 | whoosh | quick whoosh (ease-out burst): to the glass bar | -10.0 | -16.0 | -29.6 | +0.00 |
| 76 | 1492 | 1500 | 49.733 | slide_whistle_up | slide whistle rising 294 -> 1109 Hz over 8 frames: the magnifying glass slides in | -10.0 | -16.0 | -29.6 | +0.00 |
| 77 | 1502 |  | 50.067 | twinkle | sparkle run of five tiny bells: tiny scratches glint | -9.0 | -15.0 | -28.6 | +0.00 |
| 78 | 1558 |  | 51.933 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 79 | 1590 |  | 53.000 | zip | 'zwip' pass-by: the crack runs | -8.0 | -14.0 | -27.6 | +0.00 |
| 80 | 1610 |  | 53.667 | glass_pop | glass pops: small pop + glass tink + tiny shards | -6.0 | -12.0 | -25.6 | +0.00 |
| 81 | 1624 |  | 54.133 | pop | small bright pop: a new bar | -8.0 | -14.0 | -27.6 | +0.00 |
| 82 | 1637 |  | 54.567 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.6 | +0.10 |
| 83 | 1677 |  | 55.900 | ding | friendly two-bell 'ding': the scratch is held shut | -7.0 | -13.0 | -26.6 | +0.00 |
| 84 | 1691 | 1977 | 56.367 | amb_night (bed) | night air: crickets over a faint breeze | -27.0 | -27.0 | -40.6 | +0.00 |
| 85 | 1693 | 1740 | 56.433 | footsteps | 8 footsteps (soft ground): Gus runs | -11.0 | -17.0 | -30.6 | +0.00 |
| 86 | 1710 |  | 57.000 | oof | 'oh': panting | -9.0 | -15.0 | -28.6 | +0.00 |
| 87 | 1742 |  | 58.067 | glass_pop | glass pops: small pop + glass tink + tiny shards | -3.0 | -9.0 | -22.6 | +0.00 |
| 88 | 1750 |  | 58.333 | oof | 'ow': he tips | -6.0 | -12.0 | -25.6 | +0.00 |
| 89 | 1762 | 1775 | 58.733 | slide_whistle_down | slide whistle falling 1760 -> 466 Hz over 13 frames: the heel flies off | -10.0 | -16.0 | -29.6 | +0.00 |
| 90 | 1775 |  | 59.167 | drip | water drop: it lands in the grass | -10.0 | -16.0 | -29.6 | +0.00 |
| 91 | 1839 |  | 61.300 | jump_boing | spring 'boing': hop | -5.0 | -11.0 | -24.6 | +0.00 |
| 92 | 1857 |  | 61.900 | squeak | rubber squeak: hop | -8.0 | -14.0 | -27.6 | +0.00 |
| 93 | 1875 |  | 62.500 | jump_boing | spring 'boing': hop | -7.0 | -13.0 | -26.6 | +0.00 |
| 94 | 1906 |  | 63.533 | pop | small bright pop: the neighbor picks up the slipper | -8.0 | -14.0 | -27.6 | +0.00 |
| 95 | 1934 |  | 64.467 | twinkle | sparkle run of five tiny bells: the slipper sparkles | -9.0 | -15.0 | -28.6 | +0.00 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: slide_whistle_up@243 -1.78 (snr 8.8), slide_whistle_up@378 -2.98 (snr 10.5), oof@1710 -2.08 (snr 11.1)
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): whoosh_big@143
- Files: `mix.wav` 3,163,200 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,163,200 samples, 48000 Hz, 2 ch, 24-bit, peak -0.13 dBFS, 0 clipped; `stem_music.wav` 3,163,200 samples, 48000 Hz, 2 ch, 24-bit, peak -7.16 dBFS, 0 clipped; `stem_sfx.wav` 3,163,200 samples, 48000 Hz, 2 ch, 24-bit, peak -4.23 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.5 LU, max momentary -9.8 LUFS. Stems minus mix: -126.6 dB.
- Event onsets in `stem_sfx.wav` (94 events, tolerance 1 frame): matched 94/94 within tolerance (largest error 0.64 frame, largest lag 870 samples); blind band-flux detector resolved 91 of them, 88 within tolerance (largest error 2.98 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): whoosh_big@143, amb_night@158, amb_garden@1328.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **8.69 dB** over 53.08 s of speech (400 ms windows: median 7.66, 10th percentile 0.93, 90th 14.35 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-157.9, 509.1-647.8, 1745.4-1827.9 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -67.9 dBFS, below 20 Hz -40.8 dB, above 12 kHz -45.4 dB of the total energy, centroid 853 Hz. Bands (dB of total): 0-20 Hz -40.8, 20-60 Hz -27.7, 60-300 Hz -3.7, 300-3000 Hz -3.1, 3000-8000 Hz -10.7, 8000-12000 Hz -24.5, 12000-16000 Hz -45.4, 16000-24000 Hz -68.0.
- Score landmarks: first sound at f157.96; 1 silence f0-158: -240.0 dBFS; 2 theme: onset at f157.96 (plan f158); 3 chase: onset at f374.9 (plan f375); 4 silence f509-648: -240.0 dBFS; 5 mystery: onset at f647.87 (plan f648); 6 runup: onset at f940.88 (plan f941); 7 mystery: onset at f1013.0 (plan f1013); 8 theme: onset at f1327.94 (plan f1328); 9 mystery: onset at f1466.96 (plan f1467); 10 bittersweet: onset at f1623.92 (plan f1624); 11 silence f1743-1828: -240.0 dBFS; 12 finale: onset at f1827.99 (plan f1828), button at f1966.88 (plan f1967); last 10 ms -74.3 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-158 | 6.77 | 7.11 | 0.02 |
| 2 theme | 158-375 | 7.24 | 6.18 | -0.69 |
| 3 chase a | 375-418 | 11.19 | 9.99 | 6.99 |
| 3 chase b | 418-492 | 7.81 | 7.2 | 3.68 |
| 3 chase c | 492-509 | 4.77 | 6.52 | 3.85 |
| 4 silence | 509-648 | 17.01 | 16.49 | 14.33 |
| 5 mystery | 648-941 | 8.64 | 6.12 | -0.04 |
| 6 runup | 941-1013 | 7.45 | 7.36 | 2.44 |
| 7 mystery | 1013-1328 | 9.0 | 7.87 | 1.16 |
| 8 theme | 1328-1467 | 7.54 | 6.17 | -1.79 |
| 9 mystery | 1467-1624 | 8.97 | 6.32 | 0.89 |
| 10 bittersweet | 1624-1743 | 7.94 | 7.95 | 1.26 |
| 11 silence | 1743-1828 | 18.08 | 18.01 | 13.01 |
| 12 finale | 1828-1977 | 8.53 | 7.28 | 2.42 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-154 | 6.77 | Gus is wearing glass slippers strong enough to hold up two elephants,  |
| 2 | 158-281 | 7.52 | It's eleven at night at the neighbor's costume party, and Gus came as  |
| 3 | 285-372 | 6.88 | His wife can't look. Glass shoes? He'll go right through them. |
| 4 | 375-505 | 8.99 | Gus stands up. Nothing. He hops. Nothing. He dances with the neighbor. |
| 5 | 509-644 | 17.01 | But wait. A dropped cup breaks on the floor. So why not a shoe with Gu |
| 6 | 648-780 | 9.15 | You see, glass loves a squeeze. Press on it and it pushes back harder  |
| 7 | 783-937 | 8.23 | A glass cube smaller than a sugar cube can carry ten tons. That's two  |
| 8 | 941-1010 | 7.45 | Then the clock strikes twelve, and Gus runs. |
| 9 | 1013-1133 | 8.62 | Now every step lands with two and a half times his weight, and it land |
| 10 | 1137-1247 | 9.55 | So the heel bends. One side gets squeezed and the other gets stretched |
| 11 | 1251-1325 | 8.81 | And stretched glass is twenty-five times weaker. |
| 12 | 1328-1463 | 7.54 | Ever try to rip open a bag of chips? It won't tear until you find the  |
| 13 | 1467-1621 | 8.97 | Glass is covered in tiny scratches too small to see. Pull on one and i |
| 14 | 1624-1687 | 6.41 | Luckily, a squeeze holds every scratch shut. |
| 15 | 1691-1740 | 10.32 | Unluckily, Gus is in a hurry. |
| 16 | 1743-1824 | 18.08 | Snap. One heel is gone, three steps from the gate. |
| 17 | 1828-1962 | 8.53 | So Gus hops home in one glass slipper, which is exactly how the story  |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-158 | wind_rush | 0.05 | +0.05 | 1 | -0.1 | -0.10 | 19.9 | 0.97 |
| 6 | thud | 6.0 | +0.00 | 2 | 5.84 | -0.16 | 15.7 | 1.00 |
| 30 | thud | 30.0 | +0.00 | 2 | 29.9 | -0.10 | 13.3 | 1.00 |
| 45 | ting | 45.0 | +0.00 | 1 | 44.9 | -0.10 | 65.9 | 1.00 |
| 70 | squeak | 70.09 | +0.09 | 2 | 70.64 | +0.64 | 7.6 | 1.00 |
| 115-130 | footsteps | 114.98 | -0.02 | -24 | 114.86 | -0.14 | 24.2 | 1.00 |
| 130 | glass_pop | 130.0 | +0.00 | 2 | 129.92 | -0.08 | 11.5 | 1.00 |
| 143 | whoosh_big | 142.47 | -0.53 | 1 | - | - | 3.5 | 0.98 |
| 158 | flash_hit | 157.65 | -0.35 | 2 | 158.24 | +0.24 | 9.4 | 1.00 |
| 158-509 | amb_night | 158.13 | +0.13 | 1 | - | - | 3.2 | 0.99 |
| 176 | bell | 176.0 | +0.00 | 1 | 175.94 | -0.06 | 30.5 | 1.00 |
| 214-234 | crowd_cheer | 214.64 | +0.64 | 2 | 214.64 | +0.64 | 5.6 | 1.00 |
| 243-255 | slide_whistle_up | 243.02 | +0.02 | 1 | 241.22 | -1.78 | 8.8 | 1.00 |
| 261 | twinkle | 261.01 | +0.01 | 2 | 260.9 | -0.10 | 53.8 | 1.00 |
| 294 | whoosh | 293.89 | -0.11 | 2 | 294.08 | +0.08 | 8.4 | 1.00 |
| 313 | pop | 313.0 | +0.00 | 1 | 312.92 | -0.08 | 25.3 | 1.00 |
| 339 | glass_pop | 339.0 | +0.00 | 2 | 338.9 | -0.10 | 29.6 | 1.00 |
| 357 | gulp | 357.02 | +0.02 | -4 | 356.96 | -0.04 | 11.7 | 1.00 |
| 378-390 | slide_whistle_up | 378.02 | +0.02 | 1 | 375.02 | -2.98 | 10.5 | 1.00 |
| 403 | ting | 403.0 | +0.00 | 2 | 402.92 | -0.08 | 90.3 | 1.00 |
| 418 | jump_boing | 418.0 | +0.00 | 1 | 417.98 | -0.02 | 11.4 | 1.00 |
| 430 | thud | 430.0 | +0.00 | 2 | 429.92 | -0.08 | 14.7 | 1.00 |
| 436 | ting | 436.0 | +0.00 | 2 | 435.92 | -0.08 | 157.8 | 1.00 |
| 454-490 | footsteps | 454.0 | +0.00 | 1 | 453.92 | -0.08 | 10.3 | 1.00 |
| 460 | pop | 460.0 | +0.00 | 1 | 459.98 | -0.02 | 22.5 | 1.00 |
| 474 | pop | 474.0 | +0.00 | 1 | 473.9 | -0.10 | 51.4 | 1.00 |
| 492 | ting | 491.46 | -0.54 | -870 | 491.9 | -0.10 | 169.7 | 0.72 |
| 509 | record_stop | 509.0 | +0.00 | 2 | 508.88 | -0.12 | 22.1 | 1.00 |
| 509-648 | amb_cricket | 509.07 | +0.07 | 1 | 508.94 | -0.06 | 9.7 | 1.00 |
| 531-553 | slide_whistle_down | 531.02 | +0.02 | 1 | 530.96 | -0.04 | 41.1 | 1.00 |
| 553 | glass_pop | 553.0 | +0.00 | 2 | 552.86 | -0.14 | 31.6 | 1.00 |
| 591 | question_blip | 591.01 | +0.01 | 1 | 590.96 | -0.04 | 29.0 | 1.00 |
| 618 | squeak | 618.09 | +0.09 | 2 | 618.08 | +0.08 | 13.0 | 1.00 |
| 648 | whoosh | 648.0 | +0.00 | 2 | 647.96 | -0.04 | 11.0 | 1.00 |
| 676 | metal_clang | 676.0 | +0.00 | 1 | 675.86 | -0.14 | 143.8 | 1.00 |
| 690 | twinkle | 690.01 | +0.01 | 2 | 689.9 | -0.10 | 999.0 | 1.00 |
| 742 | metal_clang | 742.0 | +0.00 | 1 | 741.86 | -0.14 | 999.0 | 1.00 |
| 763 | crash | 762.96 | -0.05 | -72 | 762.86 | -0.14 | 85.2 | 1.00 |
| 793 | pop | 793.0 | +0.00 | 1 | 792.86 | -0.14 | 32.7 | 1.00 |
| 821 | pop | 821.0 | +0.00 | 1 | 820.88 | -0.12 | 58.8 | 1.00 |
| 846-860 | slide_whistle_down | 846.02 | +0.02 | 1 | 845.9 | -0.10 | 175.2 | 1.00 |
| 860 | thud | 860.0 | +0.00 | 2 | 859.88 | -0.12 | 37.1 | 1.00 |
| 868 | ting | 868.0 | +0.00 | 1 | 867.92 | -0.08 | 465.8 | 1.00 |
| 889 | whoosh_big | 888.46 | -0.54 | 1 | 888.32 | -0.68 | 45.0 | 1.00 |
| 924 | twinkle | 924.01 | +0.01 | 2 | 923.9 | -0.10 | 290.2 | 1.00 |
| 941 | whoosh | 940.95 | -0.05 | 2 | 940.7 | -0.30 | 23.0 | 1.00 |
| 953 | click | 953.0 | +0.00 | 2 | 952.88 | -0.12 | 170.9 | 1.00 |
| 964 | bell | 964.01 | +0.01 | 0 | 963.86 | -0.14 | 68.8 | 1.00 |
| 984 | gulp | 984.02 | +0.02 | -2 | 984.14 | +0.14 | 35.7 | 1.00 |
| 992 | whoosh | 991.98 | -0.02 | 2 | 991.7 | -0.30 | 120.0 | 1.00 |
| 994-1012 | footsteps | 994.01 | +0.01 | 0 | 994.04 | +0.04 | 71.4 | 1.00 |
| 1036 | thud | 1036.0 | +0.00 | 2 | 1035.86 | -0.14 | 53.3 | 1.00 |
| 1050 | pop | 1050.0 | +0.00 | 1 | 1049.9 | -0.10 | 54.6 | 1.00 |
| 1058 | pop | 1058.0 | +0.00 | 1 | 1057.88 | -0.12 | 55.7 | 1.00 |
| 1066 | pop | 1066.0 | +0.00 | 2 | 1065.92 | -0.08 | 47.9 | 1.00 |
| 1109-1121 | door_creak | 1109.06 | +0.06 | 2 | 1108.94 | -0.06 | 59.5 | 1.00 |
| 1121 | ricochet_ping | 1121.0 | +0.00 | 2 | 1120.94 | -0.06 | 56.5 | 1.00 |
| 1137 | whoosh | 1137.03 | +0.03 | 2 | 1136.96 | -0.04 | 10.4 | 1.00 |
| 1148-1170 | door_creak | 1148.06 | +0.06 | 2 | 1148.06 | +0.06 | 7.7 | 1.00 |
| 1195 | arrow_pop | 1195.0 | +0.00 | 1 | 1194.86 | -0.14 | 65.0 | 1.00 |
| 1231 | arrow_pop | 1231.0 | +0.00 | 1 | 1230.86 | -0.14 | 68.7 | 1.00 |
| 1262 | pop | 1262.0 | +0.00 | 1 | 1261.88 | -0.12 | 65.7 | 1.00 |
| 1283-1305 | timer_ticks | 1283.0 | +0.00 | 2 | 1282.88 | -0.12 | 90.3 | 1.00 |
| 1311 | glass_pop | 1311.0 | +0.00 | 2 | 1310.9 | -0.10 | 39.1 | 1.00 |
| 1317 | thud | 1317.0 | +0.00 | 2 | 1316.9 | -0.10 | 22.6 | 1.00 |
| 1328-1467 | amb_garden | 1328.15 | +0.15 | 1 | - | - | 2.8 | 1.00 |
| 1342 | paper_flick | 1342.0 | +0.00 | 2 | 1341.92 | -0.08 | 22.9 | 1.00 |
| 1356 | oof | 1356.04 | +0.04 | 2 | 1356.14 | +0.14 | 7.4 | 1.00 |
| 1372 | paper_flick | 1372.0 | +0.00 | 2 | 1371.92 | -0.08 | 27.7 | 1.00 |
| 1405 | squeak | 1405.09 | +0.09 | 2 | 1405.16 | +0.16 | 12.1 | 1.00 |
| 1429 | twinkle | 1429.01 | +0.01 | 2 | 1428.92 | -0.08 | 54.2 | 1.00 |
| 1446 | zip | 1445.55 | -0.45 | 1 | 1445.72 | -0.28 | 10.9 | 1.00 |
| 1458 | ding | 1458.0 | +0.00 | 1 | 1457.9 | -0.10 | 202.9 | 1.00 |
| 1467 | whoosh | 1466.93 | -0.07 | 2 | 1467.26 | +0.26 | 6.8 | 1.00 |
| 1492-1500 | slide_whistle_up | 1492.02 | +0.02 | 1 | 1491.92 | -0.08 | 30.7 | 1.00 |
| 1502 | twinkle | 1502.0 | +0.00 | 2 | 1501.88 | -0.12 | 533.6 | 1.00 |
| 1558 | arrow_pop | 1558.0 | +0.00 | 1 | 1557.86 | -0.14 | 527.1 | 1.00 |
| 1590 | zip | 1589.53 | -0.47 | 2 | 1589.48 | -0.52 | 27.1 | 1.00 |
| 1610 | glass_pop | 1610.0 | +0.00 | 2 | 1609.88 | -0.12 | 58.1 | 1.00 |
| 1624 | pop | 1624.0 | +0.00 | 1 | 1623.86 | -0.14 | 30.7 | 1.00 |
| 1637 | push_whoosh | 1637.0 | +0.00 | 2 | 1636.88 | -0.12 | 32.7 | 1.00 |
| 1677 | ding | 1677.0 | +0.00 | 1 | 1676.84 | -0.16 | 499.2 | 1.00 |
| 1691-1977 | amb_night | 1691.36 | +0.36 | 1 | 1691.06 | +0.06 | 18.9 | 1.00 |
| 1693-1740 | footsteps | 1692.99 | -0.01 | -26 | 1692.92 | -0.08 | 248.1 | 1.00 |
| 1710 | oof | 1710.05 | +0.05 | 2 | 1707.92 | -2.08 | 11.1 | 1.00 |
| 1742 | glass_pop | 1742.0 | +0.00 | 2 | 1741.88 | -0.12 | 33.7 | 1.00 |
| 1750 | oof | 1750.05 | +0.05 | 2 | 1750.04 | +0.04 | 9.6 | 1.00 |
| 1762-1775 | slide_whistle_down | 1762.02 | +0.02 | 1 | 1761.98 | -0.02 | 33.1 | 1.00 |
| 1775 | drip | 1775.0 | +0.00 | 1 | 1774.88 | -0.12 | 38.6 | 1.00 |
| 1839 | jump_boing | 1839.01 | +0.01 | 1 | 1839.02 | +0.02 | 12.2 | 1.00 |
| 1857 | squeak | 1857.09 | +0.09 | 2 | 1857.08 | +0.08 | 14.1 | 1.00 |
| 1875 | jump_boing | 1875.01 | +0.01 | 1 | 1875.02 | +0.02 | 12.2 | 1.00 |
| 1906 | pop | 1906.0 | +0.00 | 1 | 1905.92 | -0.08 | 31.2 | 1.00 |
| 1934 | twinkle | 1934.0 | +0.00 | 2 | 1933.94 | -0.06 | 61.4 | 1.00 |
