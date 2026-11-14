# hole-through-earth - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,096,000 samples = 1935 frames at 30 fps = 64.500 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.3 LU, max momentary -9.4 LUFS, max short-term -12.9 LUFS
- Stems: voice -14.3 LUFS, music -24.3 LUFS, sfx -29.2 LUFS (master gain +5.73 dB on everything; the voice file itself is -19.3 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 6.11 dB, active (>0.1 dB) on 25.78 % of samples, >0.5 dB on 13.12 %, >3 dB on 1.459 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -14.0 LUFS
    Threshold: -24.1 LUFS
  Loudness range:
    LRA:         1.3 LU
    Threshold: -34.0 LUFS
    LRA low:   -14.7 LUFS
    LRA high:  -13.4 LUFS
  True peak:
    Peak:       -1.2 dBFS
```

## Voice on top: per-section loudness (LUFS, integrated per stem, at mix gain)
bed = music + sfx. margin = voice - bed (integrated over the section). speech median / p10 = median and 10th percentile of the 400 ms momentary margin (voice - bed) over windows centred on spoken words.

| section | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| 1 silence | 0-118 | -14.2 | - | -23.9 | -23.9 | 9.7 | 9.1 | 4.8 |
| 2 theme | 118-448 | -14.1 | -23.3 | -31.7 | -22.8 | 8.6 | 8.5 | 4.6 |
| 3 chase a | 448-633 | -14.2 | -25.0 | -33.9 | -24.5 | 10.3 | 10.6 | 7.1 |
| 3 chase b | 633-743 | -14.9 | -24.9 | -29.3 | -23.5 | 8.6 | 8.8 | 5.8 |
| 3 chase c | 743-861 | -14.2 | -23.8 | -27.6 | -22.3 | 8.1 | 7.7 | 4.3 |
| 4 silence | 861-915 | -13.1 | - | -30.4 | -30.4 | 17.3 | 18.9 | 12.6 |
| 5 mystery | 915-1123 | -14.3 | -25.5 | -32.2 | -25.2 | 10.8 | 10.8 | 6.6 |
| 6 waltz | 1123-1268 | -14.1 | -24.2 | -32.7 | -23.8 | 9.6 | 9.0 | 6.5 |
| 7 lullaby | 1268-1442 | -14.5 | -25.2 | -31.6 | -24.4 | 9.9 | 9.9 | 7.2 |
| 8 silence | 1442-1465 | -15.0 | -43.6 | -31.2 | -31.2 | 16.2 | 16.1 | 8.7 |
| 9 bittersweet | 1465-1614 | -14.2 | -25.0 | -32.8 | -24.3 | 10.1 | 9.9 | 7.6 |
| 10 runup | 1614-1707 | -14.2 | -23.4 | -31.0 | -22.7 | 8.6 | 8.8 | 3.7 |
| 11 finale | 1707-1935 | -14.5 | -23.8 | -29.6 | -22.9 | 8.4 | 8.2 | 5.7 |

## Music map (key F major, plan tempo 131 bpm, tune "stroll", seed 3811)
The tune: `C A C F- D C- | D Bb D G- F E- | F A C'- A F D E | F-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 3 chase a -11.0, 3 chase b -10.3, 3 chase c -9.5, 5 mystery -11.5, 6 waltz -11.0, 7 lullaby -11.5, 9 bittersweet -11.5, 10 runup -9.5, 11 finale -9.5. Applied section gains (dB): 1 silence -8.1, 2 theme -8.1, 3 chase a -7.4, 3 chase b -11.7, 3 chase c -13.0, 4 silence -9.4, 5 mystery -9.4, 6 waltz -8.8, 7 lullaby -9.6, 8 silence -8.8, 9 bittersweet -8.8, 10 runup -9.7, 11 finale -11.0.

Rides (music only, dB): f232-262 -2.0, f824-858 -2.5, f1700-1716 -2.5, f1876-1921 -3.0 - a line stays on top of a busy bar, the band blooms again after it.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 118.0 | 3.93 | THEME: F major, swung, 130.9 bpm, 6 bars; clarinet tune, pizzicato boom-chick, brushes |
| 283.0 | 9.43 | theme bar 4: the tune lands on the home note, 'pom-pom' answer on beats 3 and 4 |
| 338.0 | 11.27 | second statement: tune doubled by marimba and glockenspiel |
| 420.5 | 14.02 | stop chord (dominant seventh): the band leaves the next two beats to the sound effects, vibes ring |
| 448.0 | 14.93 | CHASE OSTINATO: the tune's head as running eighths (marimba), 142 bpm and accelerating over 11 bars, climbing from F major |
| 633.0 | 21.10 | accent downbeat (bar 5): timpani + cymbal; 184 bpm, bass on every beat, xylophone doubles the ostinato |
| 743.0 | 24.77 | accent downbeat (bar 8): timpani + cymbal; 222 bpm, running bass, glock on top, soft brass swells |
| 834.3 | 27.81 | last bar: dominant seventh, 269 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 861.0 | 28.70 | (no music: silence) |
| 915.0 | 30.50 | MYSTERY: the tune at half speed in D minor (vibes), tick-tock woodblock + pizzicato, 138 bpm felt in two; soft |
| 1019.0 | 33.97 | answering phrase a step higher |
| 1071.0 | 35.70 | half cadence: the tick-tock slows and stops |
| 1123.0 | 37.43 | WALTZ: music box in F major, 152 bpm, pick-up on f1126, downbeats at f1144, f1179, low point f1215 |
| 1179.4 | 39.31 | the tune steps down do-la-fa into |
| 1215.0 | 40.50 | the low point (low home note); then the arpeggio climbs, slower and slower, to the rest |
| 1258.0 | 41.93 | the rest: the high home note rings, everything else waits |
| 1268.0 | 42.27 | LULLABY: the tune rocking in 6/8, Db major (the home note is its third), music box + harp + warm pad, 62 dotted-quarters a minute |
| 1384.0 | 46.13 | last bar climbs to an unresolved second (a rising slide whistle can aim for the same note) |
| 1442.0 | 48.07 | (no music: silence, the ring before it is choked) |
| 1465.0 | 48.83 | BITTERSWEET, sweet: the head of the tune in Db major (music box, harp), ending on a rolled chord |
| 1537.0 | 51.23 | the same phrase again ... |
| 1561.0 | 52.03 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1614.0 | 53.80 | RUN-UP: the ostinato on the dominant seventh, 218 bpm and accelerating, 3 bars up into the next section |
| 1707.0 | 56.90 | FINALE: the tune comes home, F major, warm and a little faster (148.6 bpm): clarinet + glock + marimba, soft horns, pad |
| 1900.8 | 63.36 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 1925.0 | 64.17 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.3 LUFS integrated). Reverb by place: earth = void, garden = open, ocean = open, park = open, shaft = tunnel. Dead cuts (everything that sounded before them stops): f118, f861.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 118 | 0.000 | wind_rush (bed) | falling rush under the hook, rising into the flash (noise band + faint whistle + flutter, follows the speed) | -8.5 | -8.5 | -22.1 | +0.00 |
| 2 | 103 |  | 3.433 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): camera tilts down the tunnel | -2.0 | -8.0 | -21.6 | +0.00 |
| 3 | 118 | 229 | 3.933 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 4 | 118 |  | 3.933 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.6 | +0.00 |
| 5 | 181 |  | 6.033 | shovel_thunk | blade into the dirt: thud + grit + dull ring | -6.0 | -12.0 | -25.6 | +0.00 |
| 6 | 229 |  | 7.633 | whoosh | quick whoosh (ease-out burst): cut to Earth cutaway | -10.0 | -16.0 | -29.6 | +0.00 |
| 7 | 247 |  | 8.233 | pop | small bright pop: tunnel punches through, flag pops | -8.0 | -14.0 | -27.6 | +0.00 |
| 8 | 264 | 448 | 8.800 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 9 | 287 |  | 9.567 | flame_poof | 'fwoomp' + flutter + crackle: sausage ignites | -6.0 | -12.0 | -25.6 | +0.20 |
| 10 | 305 |  | 10.167 | sizzle | sizzle dying away: burnt crisp | -9.0 | -15.0 | -28.6 | +0.20 |
| 11 | 351 |  | 11.700 | splat | wet splat: slap + squelch + glops + thud (pancake hits the lawn) | -4.0 | -10.0 | -23.6 | -0.10 |
| 12 | 412 |  | 13.733 | paper_flick | paper flaps + board knock: clipboard up | -11.0 | -17.0 | -30.6 | +0.00 |
| 13 | 429 |  | 14.300 | jump_boing | spring 'boing': Gus hops in | -5.0 | -11.0 | -24.6 | +0.00 |
| 14 | 431 | 448 | 14.367 | slide_whistle_down | slide whistle falling 1319 -> 349 Hz over 17 frames: falling away | -7.0 | -13.0 | -26.6 | +0.00 |
| 15 | 448 | 861 | 14.933 | wind_rush (bed) | rush: pitch and level rise to f743, then hold (noise band + faint whistle + flutter, follows the speed) | -16.0 | -16.0 | -29.6 | +0.00 |
| 16 | 504 |  | 16.800 | twinkle | sparkle run of five tiny bells: feather drifts in | -9.0 | -15.0 | -28.6 | +0.00 |
| 17 | 564 |  | 18.800 | zip | 'zwip' pass-by: Gus overtakes the bullet | -7.0 | -13.0 | -26.6 | +0.00 |
| 18 | 581 |  | 19.367 | ricochet_ping | cartoon ricochet 'pyeeow', small: little wave at the bullet | -9.0 | -15.0 | -28.6 | +0.15 |
| 19 | 633 |  | 21.100 | impact_kick | speed-surge kick (sub thump + upward air burst): 'shoots': speed surge | -5.0 | -11.0 | -24.6 | +0.00 |
| 20 | 654 |  | 21.800 | zip | 'zwip' pass-by: streak through the core (Earth cutaway insert) | -8.0 | -14.0 | -27.6 | +0.00 |
| 21 | 727 |  | 24.233 | impact_kick | speed-surge kick (sub thump + upward air burst): 'hour' | -5.0 | -11.0 | -24.6 | +0.00 |
| 22 | 765 |  | 25.500 | sizzle | sizzle dying away: 'hot' | -10.0 | -16.0 | -29.6 | +0.20 |
| 23 | 801 |  | 26.700 | glass_pop | glass pops: small pop + glass tink + tiny shards | -6.0 | -12.0 | -25.6 | +0.00 |
| 24 | 836 |  | 27.867 | ding | friendly two-bell 'ding': thumbs-up | -7.0 | -13.0 | -26.6 | +0.00 |
| 25 | 861 | 915 | 28.700 | amb_garden (bed) | awkward quiet: faint breeze and ONE cricket | -33.0 | -33.0 | -46.6 | +0.00 |
| 26 | 861 |  | 28.700 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.6 | +0.00 |
| 27 | 867 |  | 28.900 | cricket | the one cricket (3-pulse chirps, about 1.6 per second) | -15.0 | -21.0 | -34.6 | +0.35 |
| 28 | 897 |  | 29.900 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.6 | +0.00 |
| 29 | 950 |  | 31.667 | arrow_pop | card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 30 | 1022 |  | 34.067 | flip_blip | flip: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.6 | +0.00 |
| 31 | 1091 | 1115 | 36.367 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -10.0 | -16.0 | -29.6 | +0.00 |
| 32 | 1126 |  | 37.533 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.6 | +0.10 |
| 33 | 1130 | 1260 | 37.667 | swing_creak | ropes creak in rhythm: 5 creaks at f1130, 1144, 1179, 1215, 1236 | -9.0 | -15.0 | -28.6 | +0.15 |
| 34 | 1197 |  | 39.900 | push_whoosh | push: hands on the back + jingle + soft whoosh | -9.0 | -15.0 | -28.6 | +0.10 |
| 35 | 1215 |  | 40.500 | whoosh | quick whoosh (ease-out burst): swing fastest at the bottom | -10.0 | -16.0 | -29.6 | +0.00 |
| 36 | 1258 |  | 41.933 | ting | triangle 'ting' (1397 Hz): swing stops at the top | -9.0 | -15.0 | -28.6 | +0.00 |
| 37 | 1268 | 1614 | 42.267 | amb_ocean_night (bed) | night ocean: slow swells, foam, water lapping on the boat, timber creaks | -21.0 | -21.0 | -34.6 | +0.00 |
| 38 | 1342 |  | 44.733 | cork_pop | cork pop + a few drips: Gus pops out of the pipe | -3.0 | -9.0 | -22.6 | +0.00 |
| 39 | 1344 | 1440 | 44.800 | slide_whistle_up_slowing | slide whistle rising 415 -> 1245 Hz, slower and slower, fading to nothing by f1440 | -9.0 | -15.0 | -28.6 | +0.00 |
| 40 | 1442 |  | 48.067 | ting | triangle 'ting' (1245 Hz): he stops dead; music holds its breath | -9.0 | -15.0 | -28.6 | +0.00 |
| 41 | 1482 |  | 49.400 | twinkle | sparkle run of five tiny bells: friendly wave | -9.0 | -15.0 | -28.6 | +0.00 |
| 42 | 1560 |  | 52.000 | gulp | cartoon gulp: smile drops | -7.0 | -13.0 | -26.6 | +0.00 |
| 43 | 1598 | 1614 | 53.267 | slide_whistle_down | slide whistle falling 1109 -> 262 Hz over 16 frames: drops back into the pipe | -7.0 | -13.0 | -26.6 | +0.00 |
| 44 | 1614 | 1707 | 53.800 | wind_rush (bed) | rush up to top speed and down again (noise band + faint whistle + flutter, follows the speed) | -15.5 | -15.5 | -29.1 | +0.00 |
| 45 | 1707 | 1935 | 56.900 | amb_garden_evening (bed) | evening garden: soft breeze, blackbird phrases, crickets | -25.0 | -25.0 | -38.6 | +0.00 |
| 46 | 1711 |  | 57.033 | cork_pop | cork pop: pops up in his own garden | -3.0 | -9.0 | -22.6 | +0.00 |
| 47 | 1737 |  | 57.900 | ting | triangle 'ting' (1397 Hz): hangs at the top | -9.0 | -15.0 | -28.6 | +0.00 |
| 48 | 1766 | 1782 | 58.867 | slide_whistle_down | slide whistle falling 1319 -> 349 Hz over 16 frames: drops again | -7.0 | -13.0 | -26.6 | +0.00 |
| 49 | 1790 | 1832 | 59.667 | timer_ticks | egg timer: 13 tick-tocks, one every 3.5 frames, last one on f1832 | -14.0 | -20.0 | -33.6 | -0.15 |
| 50 | 1834 |  | 61.133 | cork_pop | cork pop: back again | -3.0 | -9.0 | -22.6 | +0.00 |
| 51 | 1834 |  | 61.133 | timer_ding | kitchen-timer bell, rings about 1 s: the timer rings exactly as he arrives | -4.0 | -10.0 | -23.6 | -0.15 |
| 52 | 1855 |  | 61.833 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.6 | +0.00 |
| 53 | 1877 | 1893 | 62.567 | slide_whistle_down | slide whistle falling 1319 -> 349 Hz over 16 frames: and gone | -7.0 | -13.0 | -26.6 | +0.00 |
| 54 | 1905 |  | 63.500 | flame_poof | 'fwoomp' + flutter + crackle: neighbor's sausage catches fire again | -9.0 | -15.0 | -28.6 | +0.20 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: these events do not stand out in the SFX stem (a louder sound covers their start): flame_poof@287
- Files: `mix.wav` 3,096,000 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,096,000 samples, 48000 Hz, 2 ch, 24-bit, peak -0.48 dBFS, 0 clipped; `stem_music.wav` 3,096,000 samples, 48000 Hz, 2 ch, 24-bit, peak -8.73 dBFS, 0 clipped; `stem_sfx.wav` 3,096,000 samples, 48000 Hz, 2 ch, 24-bit, peak -7.44 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.32 LU, max momentary -9.44 LUFS. Stems minus mix: -126.5 dB.
- Event onsets in `stem_sfx.wav` (53 events, tolerance 1 frame): matched 53/53 within tolerance (largest error 0.54 frame, largest lag 93 samples); blind band-flux detector resolved 48 of them, 48 within tolerance (largest error 0.56 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): amb_garden@118, flame_poof@287, wind_rush@448, wind_rush@1614, amb_garden_evening@1707.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **8.3 dB** over 52.13 s of speech (400 ms windows: median 7.09, 10th percentile 2.3, 90th 12.67 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-117.9, 861-915, 1444.7-1464.4 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -67.6 dBFS, below 20 Hz -40.3 dB, above 12 kHz -45.2 dB of the total energy, centroid 840 Hz. Bands (dB of total): 0-20 Hz -40.3, 20-60 Hz -29.5, 60-300 Hz -3.9, 300-3000 Hz -2.9, 3000-8000 Hz -11.0, 8000-12000 Hz -24.0, 12000-16000 Hz -45.2, 16000-24000 Hz -68.4.
- Score landmarks: first sound at f117.99; 1 silence f0-118: -240.0 dBFS; 2 theme: onset at f117.99 (plan f118); 3 chase: onset at f447.92 (plan f448); 4 silence f861-915: -240.0 dBFS; 5 mystery: onset at f914.98 (plan f915); 6 waltz: onset at f1123.28 (plan f1123); 7 lullaby: onset at f1267.88 (plan f1268); 8 silence f1442-1465: -240.0 dBFS; 9 bittersweet: onset at f1464.49 (plan f1465); 10 runup: onset at f1613.9 (plan f1614); 11 finale: onset at f1707.02 (plan f1707), button at f1924.88 (plan f1925); last 10 ms -78.0 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-118 | 8.42 | 7.03 | 3.07 |
| 2 theme | 118-448 | 7.4 | 6.54 | 1.39 |
| 3 chase a | 448-633 | 9.83 | 9.51 | 5.92 |
| 3 chase b | 633-743 | 6.6 | 6.37 | 2.05 |
| 3 chase c | 743-861 | 8.3 | 6.93 | 2.47 |
| 4 silence | 861-915 | 17.18 | 16.91 | 8.86 |
| 5 mystery | 915-1123 | 8.88 | 6.74 | 1.89 |
| 6 waltz | 1123-1268 | 7.49 | 6.3 | 1.56 |
| 7 lullaby | 1268-1442 | 8.81 | 6.44 | 4.28 |
| 8 silence | 1442-1465 | 17.2 | 10.9 | 2.81 |
| 9 bittersweet | 1465-1614 | 9.05 | 8.09 | 3.74 |
| 10 runup | 1614-1707 | 8.0 | 5.86 | 1.27 |
| 11 finale | 1707-1935 | 7.5 | 6.1 | 1.33 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-120 | 8.42 | If you jumped into a hole through the middle of the Earth, you would n |
| 2 | 123-260 | 8.6 | It's Sunday morning, and Gus has just dug a hole in his garden, straig |
| 3 | 264-316 | 7.62 | His neighbor says he'll burn to a crisp. |
| 4 | 319-389 | 7.15 | His wife says he'll go splat on the other side. |
| 5 | 393-444 | 5.72 | Gus says he did the math, and jumps. |
| 6 | 448-533 | 10.96 | He's pumped out all the air, so nothing slows him down. |
| 7 | 537-594 | 8.77 | Two minutes in, he's outrunning a bullet. |
| 8 | 598-740 | 7.0 | Nineteen minutes in, he shoots through the center of the Earth at twen |
| 9 | 743-857 | 8.3 | The walls are as hot as the surface of the Sun. It's a very good tunne |
| 10 | 861-911 | 17.18 | But wait. Why doesn't he go splat? |
| 11 | 915-1119 | 8.88 | You see, gravity only pulls Gus toward the middle. So the moment he pa |
| 12 | 1123-1264 | 7.49 | Ever pushed a kid on a swing? All the speed it gains going down, it sp |
| 13 | 1268-1461 | 9.13 | So thirty-eight minutes after he jumped, Gus pops up in the middle of  |
| 14 | 1465-1533 | 8.81 | Luckily, he stops for exactly one moment. |
| 15 | 1537-1611 | 9.29 | Unluckily, he stops for exactly one moment. |
| 16 | 1614-1749 | 7.66 | Then down he goes again, and thirty-eight minutes later, he's back in  |
| 17 | 1753-1920 | 7.63 | So Gus never did hit the bottom. He just comes home for one second, ev |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-118 | wind_rush | 0.07 | +0.07 | 1 | -0.1 | -0.10 | 20.0 | 0.97 |
| 103 | whoosh_big | 102.49 | -0.51 | 1 | 102.5 | -0.50 | 5.0 | 0.99 |
| 118 | flash_hit | 117.65 | -0.35 | 2 | 118.16 | +0.16 | 8.2 | 1.00 |
| 118-229 | amb_garden | 118.13 | +0.13 | 1 | - | - | 2.7 | 1.00 |
| 181 | shovel_thunk | 181.0 | +0.00 | 2 | 180.92 | -0.08 | 16.9 | 1.00 |
| 229 | whoosh | 229.0 | +0.00 | 2 | 229.16 | +0.16 | 9.5 | 1.00 |
| 247 | pop | 247.0 | +0.00 | 1 | 246.92 | -0.08 | 26.8 | 1.00 |
| 264-448 | amb_garden | 264.14 | +0.14 | 1 | 263.96 | -0.04 | 9.8 | 1.00 |
| 287 | flame_poof | 287.02 | +0.02 | 1 | - | - | 4.6 | 1.00 |
| 305 | sizzle | 305.1 | +0.10 | 2 | 305.0 | +0.00 | 28.3 | 1.00 |
| 351 | splat | 351.0 | +0.00 | 2 | 350.9 | -0.10 | 18.6 | 1.00 |
| 412 | paper_flick | 412.0 | +0.00 | 2 | 411.92 | -0.08 | 26.3 | 1.00 |
| 429 | jump_boing | 429.01 | +0.01 | 1 | 429.02 | +0.02 | 11.5 | 1.00 |
| 431-448 | slide_whistle_down | 431.02 | +0.02 | 1 | 431.12 | +0.12 | 8.1 | 1.00 |
| 448-861 | wind_rush | 448.1 | +0.10 | 1 | - | - | 3.8 | 0.99 |
| 504 | twinkle | 504.01 | +0.01 | 2 | 503.9 | -0.10 | 999.0 | 1.00 |
| 564 | zip | 563.46 | -0.54 | 1 | 563.6 | -0.40 | 14.6 | 1.00 |
| 581 | ricochet_ping | 581.0 | +0.00 | 2 | 580.88 | -0.12 | 80.9 | 1.00 |
| 633 | impact_kick | 632.97 | -0.03 | -56 | 632.9 | -0.10 | 28.8 | 1.00 |
| 654 | zip | 653.49 | -0.51 | 2 | 653.78 | -0.22 | 10.8 | 1.00 |
| 727 | impact_kick | 727.0 | +0.00 | 1 | 726.44 | -0.56 | 25.0 | 1.00 |
| 765 | sizzle | 765.11 | +0.11 | 2 | 765.02 | +0.02 | 10.9 | 1.00 |
| 801 | glass_pop | 801.0 | +0.00 | 2 | 800.9 | -0.10 | 12.8 | 1.00 |
| 836 | ding | 836.0 | +0.00 | 1 | 836.0 | -0.00 | 16.3 | 0.99 |
| 861 | record_stop | 861.0 | +0.00 | 2 | 860.9 | -0.10 | 15.7 | 1.00 |
| 861-915 | amb_garden | 861.02 | +0.02 | 2 | 860.9 | -0.10 | 9.8 | 1.00 |
| 897 | question_blip | 897.01 | +0.01 | 1 | 896.96 | -0.04 | 32.4 | 1.00 |
| 950 | arrow_pop | 950.0 | +0.00 | 1 | 949.88 | -0.12 | 999.0 | 1.00 |
| 1022 | flip_blip | 1022.01 | +0.00 | 1 | 1021.88 | -0.12 | 999.0 | 1.00 |
| 1091-1115 | decel_whoosh | 1091.09 | +0.09 | 1 | 1090.94 | -0.06 | 189.8 | 1.00 |
| 1126 | push_whoosh | 1126.0 | +0.00 | 2 | 1125.92 | -0.08 | 28.2 | 1.00 |
| 1130-1260 | swing_creak | 1130.0 | +0.00 | 1 | 1130.0 | +0.00 | 8.3 | 1.00 |
| 1197 | push_whoosh | 1197.0 | +0.00 | 2 | 1196.9 | -0.10 | 53.3 | 1.00 |
| 1215 | whoosh | 1214.84 | -0.16 | 2 | 1214.84 | -0.16 | 43.2 | 1.00 |
| 1258 | ting | 1258.0 | +0.00 | 2 | 1257.86 | -0.14 | 999.0 | 1.00 |
| 1268-1614 | amb_ocean_night | 1268.16 | +0.16 | 2 | 1268.06 | +0.06 | 11.4 | 1.00 |
| 1342 | cork_pop | 1342.0 | +0.00 | 1 | 1342.04 | +0.04 | 10.1 | 1.00 |
| 1344-1440 | slide_whistle_up_slowing | 1344.03 | +0.03 | 1 | 1344.2 | +0.20 | 6.3 | 1.00 |
| 1442 | ting | 1442.0 | +0.00 | 2 | 1441.94 | -0.06 | 39.6 | 1.00 |
| 1482 | twinkle | 1482.0 | +0.00 | 2 | 1482.02 | +0.02 | 999.0 | 1.00 |
| 1560 | gulp | 1560.08 | +0.08 | -4 | 1560.02 | +0.02 | 9.9 | 1.00 |
| 1598-1614 | slide_whistle_down | 1598.02 | +0.02 | 1 | 1598.06 | +0.06 | 13.0 | 1.00 |
| 1614-1707 | wind_rush | 1614.06 | +0.06 | 1 | - | - | 3.8 | 1.00 |
| 1707-1935 | amb_garden_evening | 1707.44 | +0.44 | 1 | - | - | 3.1 | 1.00 |
| 1711 | cork_pop | 1711.0 | +0.00 | 1 | 1710.86 | -0.14 | 17.3 | 1.00 |
| 1737 | ting | 1737.0 | +0.00 | 2 | 1736.9 | -0.10 | 270.9 | 1.00 |
| 1766-1782 | slide_whistle_down | 1766.02 | +0.02 | 1 | 1766.0 | +0.00 | 36.4 | 1.00 |
| 1790-1832 | timer_ticks | 1790.0 | +0.00 | 2 | 1789.88 | -0.12 | 23.2 | 1.00 |
| 1834 | cork_pop | 1834.0 | +0.00 | 1 | 1833.92 | -0.08 | 19.6 | 1.00 |
| 1834 | timer_ding | 1834.06 | +0.06 | 93 | 1833.92 | -0.08 | 69.8 | 1.00 |
| 1855 | chomp | 1855.0 | +0.00 | 2 | 1854.92 | -0.08 | 17.6 | 1.00 |
| 1877-1893 | slide_whistle_down | 1877.03 | +0.03 | 1 | 1876.94 | -0.06 | 36.3 | 1.00 |
| 1905 | flame_poof | 1905.02 | +0.02 | 1 | 1905.08 | +0.08 | 5.3 | 1.00 |
