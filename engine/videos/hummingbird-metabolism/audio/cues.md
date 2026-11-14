# hummingbird-metabolism - soundtrack cue sheet

Written by `engine/toon/audio/build.py` from `shots.json`, `voice/` and `audio/score.json`; do not edit, rebuild. All sound is original and synthesized in numpy/scipy (no samples). The manual is `engine/toon/audio/README.md`.
Voice = `voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,201,600 samples = 2001 frames at 30 fps = 66.700 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (the verification block at the end is written by the checks) |
| `verify.json` | every measurement and the result of every check, as data |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.2 LU, max momentary -9.5 LUFS, max short-term -12.8 LUFS
- Stems: voice -14.4 LUFS, music -24.2 LUFS, sfx -30.1 LUFS (master gain +8.84 dB on everything; the voice file itself is -22.2 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 9.10 dB, active (>0.1 dB) on 26.40 % of samples, >0.5 dB on 13.53 %, >3 dB on 2.298 %

ffmpeg ebur128 cross-check:
```
Summary:
  Integrated loudness:
    I:         -14.0 LUFS
    Threshold: -24.1 LUFS
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
| 1 silence | 0-131 | -14.3 | - | -28.2 | -28.2 | 13.8 | 15.0 | 8.5 |
| 2 theme | 131-380 | -14.2 | -22.9 | -30.4 | -22.3 | 8.1 | 7.9 | 4.3 |
| 3 chase a | 380-470 | -13.8 | -24.4 | -29.6 | -23.5 | 9.7 | 7.1 | 5.4 |
| 3 chase b | 470-654 | -14.8 | -24.2 | -30.0 | -23.3 | 8.5 | 9.0 | 2.7 |
| 3 chase c | 654-826 | -14.4 | -23.0 | -32.3 | -22.5 | 8.1 | 7.8 | 3.6 |
| 4 silence | 826-892 | -13.2 | -60.4 | -31.1 | -31.1 | 18.0 | 19.1 | 11.8 |
| 5 mystery | 892-1049 | -14.3 | -24.7 | -30.3 | -24.0 | 9.6 | 9.8 | 2.8 |
| 6 waltz | 1049-1213 | -14.1 | -24.8 | -33.7 | -24.6 | 10.4 | 10.1 | 6.9 |
| 7 mystery | 1213-1559 | -14.3 | -24.9 | -31.3 | -24.4 | 10.1 | 9.6 | 6.6 |
| 8 bittersweet | 1559-1765 | -14.1 | -25.1 | -28.6 | -23.7 | 9.7 | 10.6 | 7.2 |
| 9 lullaby | 1765-1877 | -14.6 | -25.2 | -31.7 | -24.3 | 9.7 | 9.7 | 5.5 |
| 10 finale | 1877-2001 | -13.7 | -22.5 | -32.3 | -22.1 | 8.4 | 8.6 | 4.8 |

## Music map (key G major, plan tempo 128 bpm, tune "hop", seed 4127)
The tune: `G- D E G- B A | A- E G F#- D | G A B- G E F# D | G-`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): 2 theme -9.5, 3 chase a -11.0, 3 chase b -10.3, 3 chase c -9.5, 5 mystery -11.5, 6 waltz -11.0, 7 mystery -11.5, 8 bittersweet -11.5, 9 lullaby -11.5, 10 finale -9.5. Applied section gains (dB): 1 silence -10.1, 2 theme -10.1, 3 chase a -10.9, 3 chase b -12.5, 3 chase c -15.6, 4 silence -10.9, 5 mystery -10.9, 6 waltz -13.0, 7 mystery -12.1, 8 bittersweet -11.5, 9 lullaby -13.8, 10 finale -13.9.

| frame | time s | music |
|---|---|---|
| 0.0 | 0.00 | (no music: silence) |
| 131.0 | 4.37 | THEME: G major, swung, 115.7 bpm, 4 bars; clarinet tune, pizzicato boom-chick, brushes |
| 317.8 | 10.59 | theme bar 4: the tune lands on the home note, 'pom-pom' answer on beats 3 and 4 |
| 380.0 | 12.67 | CHASE OSTINATO: the tune's head as running eighths (marimba), 155 bpm and accelerating over 12 bars, climbing from G major |
| 470.0 | 15.67 | accent downbeat (bar 3): timpani + cymbal; 143 bpm, bass on every beat, xylophone doubles the ostinato |
| 654.0 | 21.80 | accent downbeat (bar 7): timpani + cymbal; 216 bpm, running bass, glock on top, soft brass swells |
| 801.7 | 26.72 | last bar: dominant seventh, 296 bpm, everything climbs (clarinet run, timpani eighths); it ends unresolved |
| 826.0 | 27.53 | (no music: silence) |
| 892.0 | 29.73 | MYSTERY: the tune at half speed in E minor (vibes), tick-tock woodblock + pizzicato, 92 bpm felt in two; soft |
| 970.5 | 32.35 | half cadence: the tick-tock slows and stops |
| 1049.0 | 34.97 | WALTZ: music box in G major, 150 bpm, pick-up on f1051, downbeats at f1069, f1105, low point f1141 |
| 1105.0 | 36.83 | the tune steps down do-la-fa into |
| 1141.0 | 38.03 | the low point (low home note); then the arpeggio climbs, slower and slower, to the rest |
| 1204.0 | 40.13 | the rest: the high home note rings, everything else waits |
| 1213.0 | 40.43 | MYSTERY: the tune at half speed in E minor (vibes), tick-tock woodblock + pizzicato, 166 bpm felt in two; soft |
| 1472.5 | 49.08 | answering phrase a step higher |
| 1515.8 | 50.52 | half cadence: the tick-tock slows and stops |
| 1559.0 | 51.97 | BITTERSWEET, sweet: the head of the tune in Eb major (music box, harp), ending on a rolled chord |
| 1683.0 | 56.10 | the same phrase again ... |
| 1707.0 | 56.90 | ... but it droops: four steps down with a soft sad trombone, landing on the dominant (the way home) |
| 1765.0 | 58.83 | LULLABY: the tune rocking in 6/8, Eb major (the home note is its third), music box + harp + warm pad, 64 dotted-quarters a minute |
| 1821.0 | 60.70 | last bar climbs to an unresolved second (a rising slide whistle can aim for the same note) |
| 1877.0 | 62.57 | FINALE: the tune comes home, G major, warm and a little faster (162.2 bpm): clarinet + glock + marimba, soft horns, pad |
| 1965.8 | 65.53 | tag: tutti home chord ('ta-da'), one low pizzicato dominant ... |
| 1988.0 | 66.27 | BUTTON: final home chord (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive -6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.4 LUFS integrated). Reverb by place: garden = open, ocean = open, park = open. Dead cuts (everything that sounded before them stops): f131, f826.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 131 | 0.000 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.4 | +0.00 |
| 2 | 17 |  | 0.567 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.4 | +0.00 |
| 3 | 40 |  | 1.333 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.4 | +0.00 |
| 4 | 62 |  | 2.067 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.4 | +0.00 |
| 5 | 84 |  | 2.800 | sizzle | sizzle dying away: steam starts to leak from his collar | -9.0 | -15.0 | -28.4 | +0.20 |
| 6 | 116 |  | 3.867 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): push in on his eyes | -2.0 | -8.0 | -21.4 | +0.00 |
| 7 | 131 | 243 | 4.367 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.4 | +0.00 |
| 8 | 131 |  | 4.367 | flash_hit | white flash: bright airy burst + soft low whoomp; whatever sounded before is cut here | -5.0 | -11.0 | -24.4 | +0.00 |
| 9 | 150 |  | 5.000 | zip | 'zwip' pass-by: the hummingbird zips in | -8.0 | -14.0 | -27.4 | +0.00 |
| 10 | 174 |  | 5.800 | pop | small bright pop: sleep bubble pops, he wakes | -8.0 | -14.0 | -27.4 | +0.00 |
| 11 | 194 |  | 6.467 | twinkle | sparkle run of five tiny bells: the bird taps the glass: 'metabolism' | -9.0 | -15.0 | -28.4 | +0.00 |
| 12 | 222 |  | 7.400 | zip | 'zwip' pass-by: the bird darts off | -8.0 | -14.0 | -27.4 | +0.00 |
| 13 | 243 | 380 | 8.100 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.4 | +0.00 |
| 14 | 302 |  | 10.067 | flame_poof | 'fwoomp' + flutter + crackle: afterburner on 'burns' | -4.0 | -10.0 | -23.4 | +0.20 |
| 15 | 322 | 366 | 10.733 | slide_whistle_down | slide whistle falling 1480 -> 392 Hz over 44 frames: the nectar drains | -7.0 | -13.0 | -26.4 | +0.00 |
| 16 | 380 | 826 | 12.667 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.4 | +0.00 |
| 17 | 409 | 466 | 13.633 | slide_whistle_up | slide whistle rising 392 -> 1480 Hz over 57 frames: the burger tower grows | -7.0 | -13.0 | -26.4 | +0.00 |
| 18 | 470 |  | 15.667 | thud | heavy soft thud: last burger lands on 'day' | -5.0 | -11.0 | -24.4 | +0.00 |
| 19 | 478 |  | 15.933 | gulp | cartoon gulp: Gus looks up | -7.0 | -13.0 | -26.4 | +0.00 |
| 20 | 495 |  | 16.500 | whoosh | quick whoosh (ease-out burst): first pancake flipped | -10.0 | -16.0 | -29.4 | +0.00 |
| 21 | 507 |  | 16.900 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.4 | +0.00 |
| 22 | 527 |  | 17.567 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.4 | +0.00 |
| 23 | 547 |  | 18.233 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.4 | +0.00 |
| 24 | 558 |  | 18.600 | ting | triangle 'ting' (1568 Hz): the pan is empty: 'Gone.' | -9.0 | -15.0 | -28.4 | +0.00 |
| 25 | 601 |  | 20.033 | ricochet_ping | cartoon ricochet 'pyeeow', small: the neighbor points and laughs | -9.0 | -15.0 | -28.4 | +0.15 |
| 26 | 654 |  | 21.800 | cork_pop | cork pop: Gus pops up behind the fence, the sausage is gone | -3.0 | -9.0 | -22.4 | +0.00 |
| 27 | 676 |  | 22.533 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.4 | +0.00 |
| 28 | 698 |  | 23.267 | gulp | cartoon gulp: the neighbor sees the empty grill | -7.0 | -13.0 | -26.4 | +0.00 |
| 29 | 725 | 768 | 24.167 | typing | typing: stands for the heart ticking twenty times a second | -13.0 | -19.0 | -32.4 | +0.10 |
| 30 | 805 |  | 26.833 | power_up | power up: 'that's a hum': the bird hums in | -8.0 | -14.0 | -27.4 | +0.00 |
| 31 | 826 | 892 | 27.533 | amb_cricket (bed) | awkward quiet: faint breeze and ONE cricket | -33.0 | -33.0 | -46.4 | +0.00 |
| 32 | 826 |  | 27.533 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.4 | +0.00 |
| 33 | 832 |  | 27.733 | cricket | the one cricket (3-pulse chirps, about 1.6 per second) | -15.0 | -21.0 | -34.4 | +0.35 |
| 34 | 862 |  | 28.733 | sizzle | sizzle dying away: the helmet steams up | -9.0 | -15.0 | -28.4 | +0.20 |
| 35 | 885 |  | 29.500 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.4 | +0.00 |
| 36 | 892 | 1559 | 29.733 | amb_garden (bed) | garden air: light breeze, sparrows | -28.0 | -28.0 | -41.4 | +0.00 |
| 37 | 941 |  | 31.367 | flame_poof | 'fwoomp' + flutter + crackle: the burger turns into a flame: 'into heat' | -3.0 | -9.0 | -22.4 | +0.20 |
| 38 | 1000 |  | 33.333 | pop | small bright pop: two heaters pop in | -8.0 | -14.0 | -27.4 | +0.00 |
| 39 | 1014 |  | 33.800 | pop | small bright pop: two more | -8.0 | -14.0 | -27.4 | +0.00 |
| 40 | 1031 |  | 34.367 | power_up | power up: the heaters glow | -8.0 | -14.0 | -27.4 | +0.00 |
| 41 | 1049 |  | 34.967 | whoosh | quick whoosh (ease-out burst): cut to the table | -10.0 | -16.0 | -29.4 | +0.00 |
| 42 | 1076 |  | 35.867 | sizzle | sizzle dying away: the fry steams | -9.0 | -15.0 | -28.4 | +0.20 |
| 43 | 1098 |  | 36.600 | ting | triangle 'ting' (1568 Hz): the fry is cold | -9.0 | -15.0 | -28.4 | +0.00 |
| 44 | 1130 |  | 37.667 | whoosh | quick whoosh (ease-out burst): glide to the potato | -10.0 | -16.0 | -29.4 | +0.00 |
| 45 | 1160 |  | 38.667 | sizzle | sizzle dying away: the potato steams on | -9.0 | -15.0 | -28.4 | +0.20 |
| 46 | 1250 |  | 41.667 | twinkle | sparkle run of five tiny bells: 'skin': the outlines light up | -9.0 | -15.0 | -28.4 | +0.00 |
| 47 | 1296 |  | 43.200 | zip | 'zwip' pass-by: cut to the bird | -8.0 | -14.0 | -27.4 | +0.00 |
| 48 | 1400 | 1430 | 46.667 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -10.0 | -16.0 | -29.4 | +0.00 |
| 49 | 1426 |  | 47.533 | twinkle | sparkle run of five tiny bells: cool and content | -9.0 | -15.0 | -28.4 | +0.00 |
| 50 | 1459 |  | 48.633 | pop | small bright pop: a pat of butter lands on his helmet | -8.0 | -14.0 | -27.4 | +0.00 |
| 51 | 1471 |  | 49.033 | sizzle | sizzle dying away: it melts | -9.0 | -15.0 | -28.4 | +0.20 |
| 52 | 1499 | 1548 | 49.967 | slide_whistle_up | slide whistle rising 392 -> 1480 Hz over 49 frames: the thermometer climbs | -7.0 | -13.0 | -26.4 | +0.00 |
| 53 | 1550 |  | 51.667 | glass_pop | glass pops: small pop + glass tink + tiny shards | -6.0 | -12.0 | -25.4 | +0.00 |
| 54 | 1559 | 1765 | 51.967 | amb_ocean_night (bed) | night ocean: slow swells, foam, water lapping on the boat, timber creaks | -21.0 | -21.0 | -34.4 | +0.00 |
| 55 | 1561 | 1589 | 52.033 | slide_whistle_down | slide whistle falling 1175 -> 311 Hz over 28 frames: Gus drops out of the sky | -7.0 | -13.0 | -26.4 | +0.00 |
| 56 | 1589 |  | 52.967 | splash | big splash: thump, slap, bubble cloud, spray: cannonball on 'sea' | -3.0 | -9.0 | -22.4 | +0.00 |
| 57 | 1600 |  | 53.333 | sizzle | sizzle dying away: steam cloud as he cools | -9.0 | -15.0 | -28.4 | +0.20 |
| 58 | 1622 |  | 54.067 | cork_pop | cork pop + a few drips: he surfaces | -3.0 | -9.0 | -22.4 | +0.00 |
| 59 | 1652 |  | 55.067 | twinkle | sparkle run of five tiny bells: bliss | -9.0 | -15.0 | -28.4 | +0.00 |
| 60 | 1703 |  | 56.767 | gulp | cartoon gulp: the smile drops | -7.0 | -13.0 | -26.4 | +0.00 |
| 61 | 1717 | 1745 | 57.233 | bubbling (bed) | bubbling liquid | -22.0 | -22.0 | -35.4 | +0.00 |
| 62 | 1748 |  | 58.267 | pop | small bright pop: thought bubble with a hamburger | -8.0 | -14.0 | -27.4 | +0.00 |
| 63 | 1765 | 2001 | 58.833 | amb_ocean_night (bed) | night ocean: slow swells, foam, water lapping on the boat, timber creaks | -21.0 | -21.0 | -34.4 | +0.00 |
| 64 | 1772 |  | 59.067 | zip | 'zwip' pass-by: the hummingbird flies in | -8.0 | -14.0 | -27.4 | +0.00 |
| 65 | 1779 |  | 59.300 | question_blip | '?': two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.4 | +0.00 |
| 66 | 1811 |  | 60.367 | bird_tweet | bird chirps: 'a hummingbird' | -11.0 | -17.0 | -30.4 | +0.20 |
| 67 | 1861 | 1877 | 62.033 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -7.0 | -13.0 | -26.4 | +0.00 |
| 68 | 1919 |  | 63.967 | power_down | power down: 'shuts off': eyes close | -8.0 | -14.0 | -27.4 | +0.00 |
| 69 | 1967 |  | 65.567 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.4 | +0.00 |

## Verification (measured from the written WAV files; nobody listened)
- **Result: all checks passed**
  - note: the blind onset detector hears these events early or late, usually because a louder sound starts within 3 frames of them: slide_whistle_up@409 -1.34 (snr 15.2), gulp@478 -2.60 (snr 8.0)
- Files: `mix.wav` 3,201,600 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,201,600 samples, 48000 Hz, 2 ch, 24-bit, peak -0.75 dBFS, 0 clipped; `stem_music.wav` 3,201,600 samples, 48000 Hz, 2 ch, 24-bit, peak -8.52 dBFS, 0 clipped; `stem_sfx.wav` 3,201,600 samples, 48000 Hz, 2 ch, 24-bit, peak -5.37 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.25 LU, max momentary -9.47 LUFS. Stems minus mix: -126.6 dB.
- Event onsets in `stem_sfx.wav` (68 events, tolerance 1 frame): matched 68/68 within tolerance (largest error 0.56 frame, largest lag 4 samples); blind band-flux detector resolved 61 of them, 59 within tolerance (largest error 2.6 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): amb_garden@131, amb_garden@243, amb_garden@380, amb_garden@892, amb_ocean_night@1559, bubbling@1717, amb_ocean_night@1765.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **8.42 dB** over 53.83 s of speech (400 ms windows: median 7.3, 10th percentile 1.07, 90th 13.03 dB). Minimum 6 dB overall, 4 dB per section.
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-131, 826-891.9 (intended: the 'silence' sections); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -67.8 dBFS, below 20 Hz -40.5 dB, above 12 kHz -44.9 dB of the total energy, centroid 802 Hz. Bands (dB of total): 0-20 Hz -40.5, 20-60 Hz -31.1, 60-300 Hz -3.8, 300-3000 Hz -3.0, 3000-8000 Hz -11.3, 8000-12000 Hz -24.2, 12000-16000 Hz -44.9, 16000-24000 Hz -68.1.
- Score landmarks: first sound at f130.93; 1 silence f0-131: -240.0 dBFS; 2 theme: onset at f130.93 (plan f131); 3 chase: onset at f380.0 (plan f380); 4 silence f826-892: -240.0 dBFS; 5 mystery: onset at f891.96 (plan f892); 6 waltz: onset at f1049.24 (plan f1049); 7 mystery: onset at f1212.92 (plan f1213); 8 bittersweet: onset at f1559.0 (plan f1559); 9 lullaby: onset at f1764.98 (plan f1765); 10 finale: onset at f1877.0 (plan f1877), button at f1987.88 (plan f1988); last 10 ms -79.5 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| 1 silence | 0-131 | 15.63 | 20.63 | 9.37 |
| 2 theme | 131-380 | 6.74 | 5.43 | -0.17 |
| 3 chase a | 380-470 | 7.1 | 5.15 | 2.39 |
| 3 chase b | 470-654 | 8.39 | 7.52 | -0.48 |
| 3 chase c | 654-826 | 7.16 | 7.09 | 1.05 |
| 4 silence | 826-892 | 19.42 | 21.44 | 5.75 |
| 5 mystery | 892-1049 | 7.87 | 5.19 | -2.98 |
| 6 waltz | 1049-1213 | 9.42 | 7.06 | 2.23 |
| 7 mystery | 1213-1559 | 8.37 | 5.75 | 0.62 |
| 8 bittersweet | 1559-1765 | 9.17 | 9.41 | 2.79 |
| 9 lullaby | 1765-1877 | 8.72 | 7.95 | 4.1 |
| 10 finale | 1877-2001 | 7.69 | 5.97 | 1.19 |

### Voice minus bed per narration line (speech band, while speaking)
| line | frames | level difference dB | text |
|---|---|---|---|
| 1 | 0-129 | 15.63 | Gus has to eat a burger every three minutes, and that's not even his b |
| 2 | 133-241 | 6.67 | At seven this morning he woke up with the metabolism of a hummingbird. |
| 3 | 245-378 | 6.81 | Gram for gram, that tiny bird burns fuel fifty times as fast as he doe |
| 4 | 382-480 | 6.69 | At his size, that's a hundred and twenty thousand calories a day. |
| 5 | 484-572 | 9.83 | His wife flips pancakes as fast as she can. Gone. |
| 6 | 575-710 | 7.44 | His neighbor laughs that no one eats that much and loses every sausage |
| 7 | 713-824 | 7.18 | His heart beats twenty times a second. That's not a pulse, that's a hu |
| 8 | 828-890 | 19.42 | But wait. Why is his helmet steaming up? |
| 9 | 894-1048 | 7.87 | You see, all that food turns into heat, and Gus now puts out as much a |
| 10 | 1051-1212 | 9.42 | Ever notice a french fry goes cold in minutes, but a baked potato stay |
| 11 | 1215-1439 | 8.57 | Small things have more skin for their size. Pound for pound, the bird  |
| 12 | 1443-1557 | 7.98 | Gus is the baked potato. He heats up more than a degree every minute. |
| 13 | 1561-1679 | 9.44 | Luckily, he lives by the sea, and water pulls heat out far faster than |
| 14 | 1683-1764 | 8.75 | Unluckily, it's now been four minutes since he last ate. |
| 15 | 1767-1876 | 8.72 | And the funny part? Even a hummingbird can't afford to live like one. |
| 16 | 1879-1987 | 7.69 | On cold nights it almost shuts off, just to make it to breakfast. |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved). alive = share of the event's energy that sounds before the next dead cut or the end of the film.

| frame | event | matched onset | err | lag samples | blind onset | err | snr | alive |
|---|---|---|---|---|---|---|---|---|
| 0-131 | amb_garden | 0.03 | +0.03 | 1 | -0.04 | -0.04 | 15.0 | 0.99 |
| 17 | chomp | 17.0 | +0.00 | 2 | 16.88 | -0.12 | 15.6 | 1.00 |
| 40 | chomp | 40.0 | +0.00 | 2 | 39.92 | -0.08 | 18.9 | 1.00 |
| 62 | chomp | 62.0 | +0.00 | 2 | 61.88 | -0.12 | 18.4 | 1.00 |
| 84 | sizzle | 84.04 | +0.04 | 2 | 83.96 | -0.04 | 26.9 | 1.00 |
| 116 | whoosh_big | 115.5 | -0.50 | 1 | 115.4 | -0.60 | 14.1 | 0.99 |
| 131 | flash_hit | 130.65 | -0.35 | 2 | 131.0 | +0.00 | 11.2 | 1.00 |
| 131-243 | amb_garden | 131.03 | +0.03 | 2 | - | - | 4.2 | 1.00 |
| 150 | zip | 149.54 | -0.46 | 2 | 149.78 | -0.22 | 8.0 | 1.00 |
| 174 | pop | 174.0 | +0.00 | 1 | 173.96 | -0.04 | 20.2 | 1.00 |
| 194 | twinkle | 194.01 | +0.01 | 2 | 193.94 | -0.06 | 999.0 | 1.00 |
| 222 | zip | 221.44 | -0.56 | 2 | 221.6 | -0.40 | 8.7 | 1.00 |
| 243-380 | amb_garden | 243.32 | +0.32 | 1 | - | - | 2.7 | 1.00 |
| 302 | flame_poof | 302.05 | +0.05 | 1 | 302.0 | +0.00 | 5.1 | 1.00 |
| 322-366 | slide_whistle_down | 322.02 | +0.02 | 1 | 321.98 | -0.02 | 27.8 | 1.00 |
| 380-826 | amb_garden | 380.09 | +0.09 | 1 | - | - | 2.5 | 0.99 |
| 409-466 | slide_whistle_up | 409.03 | +0.03 | 1 | 407.66 | -1.34 | 15.2 | 1.00 |
| 470 | thud | 470.0 | +0.00 | 2 | 469.88 | -0.12 | 16.6 | 1.00 |
| 478 | gulp | 478.01 | +0.01 | -4 | 475.4 | -2.60 | 8.0 | 1.00 |
| 495 | whoosh | 495.02 | +0.02 | 2 | 495.2 | +0.20 | 8.7 | 1.00 |
| 507 | chomp | 507.0 | +0.00 | 2 | 506.9 | -0.10 | 16.4 | 1.00 |
| 527 | chomp | 527.0 | +0.00 | 2 | 526.88 | -0.12 | 17.8 | 1.00 |
| 547 | chomp | 547.0 | +0.00 | 2 | 546.92 | -0.08 | 17.1 | 1.00 |
| 558 | ting | 558.0 | +0.00 | 2 | 557.9 | -0.10 | 226.0 | 1.00 |
| 601 | ricochet_ping | 601.0 | +0.00 | 2 | 600.92 | -0.08 | 42.9 | 1.00 |
| 654 | cork_pop | 654.0 | +0.00 | 1 | 653.9 | -0.10 | 13.1 | 1.00 |
| 676 | chomp | 676.0 | +0.00 | 2 | 675.92 | -0.08 | 17.4 | 1.00 |
| 698 | gulp | 698.08 | +0.08 | -4 | 698.0 | +0.00 | 12.6 | 1.00 |
| 725-768 | typing | 725.0 | +0.00 | 1 | 724.88 | -0.12 | 20.4 | 1.00 |
| 805 | power_up | 805.04 | +0.04 | 1 | 805.04 | +0.04 | 7.7 | 1.00 |
| 826 | record_stop | 826.0 | +0.00 | 2 | 825.92 | -0.08 | 20.3 | 1.00 |
| 826-892 | amb_cricket | 826.12 | +0.12 | 2 | 825.92 | -0.08 | 9.8 | 1.00 |
| 862 | sizzle | 862.09 | +0.09 | 2 | 861.98 | -0.02 | 22.1 | 1.00 |
| 885 | question_blip | 885.01 | +0.01 | 1 | 884.96 | -0.04 | 28.3 | 1.00 |
| 892-1559 | amb_garden | 892.07 | +0.07 | 1 | - | - | 3.2 | 1.00 |
| 941 | flame_poof | 941.01 | +0.01 | 1 | 940.94 | -0.06 | 5.3 | 1.00 |
| 1000 | pop | 1000.0 | +0.00 | 1 | 999.92 | -0.08 | 21.6 | 1.00 |
| 1014 | pop | 1014.0 | +0.00 | 1 | 1013.9 | -0.10 | 20.7 | 1.00 |
| 1031 | power_up | 1031.04 | +0.04 | 1 | 1031.06 | +0.06 | 6.9 | 1.00 |
| 1049 | whoosh | 1048.99 | -0.01 | 2 | 1049.0 | +0.00 | 6.0 | 1.00 |
| 1076 | sizzle | 1076.06 | +0.06 | 2 | 1076.0 | +0.00 | 34.4 | 1.00 |
| 1098 | ting | 1098.0 | +0.00 | 2 | 1097.9 | -0.10 | 601.2 | 1.00 |
| 1130 | whoosh | 1130.08 | +0.08 | 2 | 1130.06 | +0.06 | 8.1 | 1.00 |
| 1160 | sizzle | 1160.06 | +0.06 | 2 | 1160.0 | +0.00 | 30.3 | 1.00 |
| 1250 | twinkle | 1250.01 | +0.01 | 2 | 1249.94 | -0.06 | 999.0 | 1.00 |
| 1296 | zip | 1295.45 | -0.55 | 2 | 1295.66 | -0.34 | 11.6 | 1.00 |
| 1400-1430 | decel_whoosh | 1400.1 | +0.10 | 1 | 1400.06 | +0.06 | 13.9 | 1.00 |
| 1426 | twinkle | 1426.01 | +0.01 | 2 | 1425.92 | -0.08 | 999.0 | 1.00 |
| 1459 | pop | 1459.0 | +0.00 | 1 | 1458.92 | -0.08 | 24.7 | 1.00 |
| 1471 | sizzle | 1471.09 | +0.09 | 2 | 1470.98 | -0.02 | 29.8 | 1.00 |
| 1499-1548 | slide_whistle_up | 1499.02 | +0.02 | 1 | 1499.0 | +0.00 | 26.7 | 1.00 |
| 1550 | glass_pop | 1550.0 | +0.00 | 2 | 1549.88 | -0.12 | 31.5 | 1.00 |
| 1559-1765 | amb_ocean_night | 1559.09 | +0.09 | 1 | - | - | 3.1 | 1.00 |
| 1561-1589 | slide_whistle_down | 1561.02 | +0.02 | 1 | 1560.98 | -0.02 | 290.1 | 1.00 |
| 1589 | splash | 1589.0 | +0.00 | 2 | 1589.0 | +0.00 | 7.1 | 1.00 |
| 1600 | sizzle | 1600.07 | +0.07 | 2 | 1600.16 | +0.16 | 7.1 | 1.00 |
| 1622 | cork_pop | 1622.0 | +0.00 | 1 | 1621.94 | -0.06 | 12.4 | 1.00 |
| 1652 | twinkle | 1652.01 | +0.01 | 2 | 1651.94 | -0.06 | 999.0 | 1.00 |
| 1703 | gulp | 1703.01 | +0.01 | -4 | 1703.0 | +0.00 | 9.6 | 1.00 |
| 1717-1745 | bubbling | 1717.07 | +0.07 | 1 | - | - | 3.4 | 1.00 |
| 1748 | pop | 1748.0 | +0.00 | 1 | 1748.0 | +0.00 | 12.9 | 1.00 |
| 1765-2001 | amb_ocean_night | 1765.08 | +0.08 | 2 | - | - | 2.7 | 1.00 |
| 1772 | zip | 1771.48 | -0.52 | 2 | 1772.0 | -0.00 | 8.9 | 1.00 |
| 1779 | question_blip | 1779.01 | +0.01 | 1 | 1778.96 | -0.04 | 19.0 | 1.00 |
| 1811 | bird_tweet | 1811.17 | +0.17 | 2 | 1811.3 | +0.30 | 43.2 | 1.00 |
| 1861-1877 | decel_whoosh | 1861.05 | +0.05 | 1 | 1861.16 | +0.16 | 5.9 | 1.00 |
| 1919 | power_down | 1919.04 | +0.04 | 1 | 1919.06 | +0.06 | 17.6 | 1.00 |
| 1967 | chomp | 1967.0 | +0.00 | 2 | 1966.94 | -0.06 | 15.5 | 1.00 |
