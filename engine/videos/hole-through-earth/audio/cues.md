# What If You Jumped Into a Hole Through the Earth? - soundtrack cue sheet

All sound is original and synthesized in numpy/scipy (no samples): `sfx_gen.py` / `instruments.py` make the sounds, `sfx.py` / `music.py` place them on the frames of `../shots.json` (read by `timeline.py`), `mix.py` mixes, `verify.py` measures. Rebuild everything with `python build_audio.py`.
Voice = `../voice/voice.wav`, gain only (no EQ, no compression, no pitch); the master limiter is the only dynamics.

## Files
| file | content |
|---|---|
| `mix.wav` | final mix, 48 kHz, stereo, 24-bit, 3,096,000 samples = 1935 frames at 30 fps = 64.500 s |
| `stem_voice.wav` / `stem_music.wav` / `stem_sfx.wav` | stems with the mix's master gain and limiter gain (they sum to the mix) |
| `cues.md` | this sheet (written by `mix.py`, the verification block at the end by `verify.py`) |
| `mix_report.json` / `verify.json` | the same numbers as data (levels of every cue, section gains, every measurement) |

## Master loudness (own BS.1770-4 meter)
- Integrated **-14.0 LUFS**, true peak **-1.2 dBTP**, LRA 1.3 LU, max momentary -9.4 LUFS, max short-term -12.9 LUFS
- Stems: voice -14.3 LUFS, music -24.3 LUFS, sfx -29.2 LUFS (master gain +5.73 dB on everything; the voice file itself is -19.3 LUFS)
- Master limiter (4x oversampled look-ahead, ceiling -1.2 dBTP): max gain reduction 6.11 dB, active (>0.1 dB) on 25.79 % of samples, >0.5 dB on 13.13 %, >3 dB on 1.460 %

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

| section (shots) | frames | voice | music | sfx | bed | margin LU | speech median LU | speech p10 LU |
|---|---|---|---|---|---|---|---|---|
| hook (1) | 0-118 | -14.2 | - | -23.9 | -23.9 | 9.7 | 9.1 | 4.8 |
| garden (2-6) | 118-448 | -14.1 | -23.2 | -31.7 | -22.8 | 8.6 | 8.5 | 4.6 |
| fall, crust (7-8) | 448-598 | -14.0 | -24.9 | -33.5 | -24.4 | 10.3 | 10.6 | 7.4 |
| fall, mantle+core (9-11) | 598-743 | -14.7 | -25.1 | -29.6 | -23.7 | 9.0 | 9.1 | 5.8 |
| fall, core (12) | 743-861 | -14.2 | -23.8 | -27.6 | -22.3 | 8.1 | 7.7 | 4.3 |
| but wait (13) | 861-915 | -13.1 | - | -30.4 | -30.4 | 17.3 | 18.9 | 12.6 |
| explanation (14) | 915-1123 | -14.3 | -25.5 | -32.2 | -25.2 | 10.8 | 10.8 | 6.6 |
| swing (15) | 1123-1268 | -14.1 | -24.2 | -32.9 | -23.9 | 9.7 | 9.0 | 6.8 |
| ocean, rise (16) | 1268-1465 | -14.6 | -25.3 | -31.6 | -24.7 | 10.2 | 10.2 | 7.4 |
| luckily / unluckily (17-18) | 1465-1614 | -14.2 | -25.0 | -32.8 | -24.3 | 10.1 | 9.9 | 7.6 |
| return (19) | 1614-1707 | -14.2 | -23.4 | -31.0 | -22.7 | 8.6 | 8.8 | 3.7 |
| payoff (20-21) | 1707-1935 | -14.5 | -23.8 | -29.6 | -22.9 | 8.4 | 8.2 | 5.7 |

## Music map (original score: one 4-bar tune in F major, varied by every section)
The tune (clarinet, swung): `C A C F- D C | D Bb D G- F E | F A C'- A F D E | F`. Music level per section, LU under the voice (after a -3 dB speech duck keyed from words.json): sunday -9.5, fall1 -11.0, fall2 -10.3, fall3 -9.5, explain -11.5, swing -11.0, lullaby -11.5, luckily -11.5, return -9.5, payoff -9.5. Applied section gains (dB): sunday -8.1, fall1 -7.4, fall2 -11.7, fall3 -13.0, explain -9.4, swing -8.8, lullaby -9.6, luckily -8.8, return -9.7, payoff -11.0, breath -8.8, stop -9.4, hook -8.1.

Rides (music only, dB): f232-262 -2.0, f824-858 -2.5, f1700-1716 -2.5, f1876-1921 -3.0 - the punch lines stay on top of the busiest bars, the band blooms again after them.

| frame | time s | music |
|---|---|---|
| 0 | 0.00 | (no music under the hook: the falling rush only) |
| 118.0 | 3.93 | SUNDAY THEME starts on the flash: F major, swung, 130.9 bpm; clarinet tune, pizzicato boom-chick, brushes |
| 283.0 | 9.43 | theme bar 4: the tune lands on F, 'pom-pom' answer (C7, F) on beats 3 and 4 |
| 338.0 | 11.27 | second statement: tune doubled by marimba and glockenspiel |
| 420.5 | 14.02 | stop chord (C7) on 'math': the band leaves the boing and the slide whistle alone, vibes ring |
| 448.0 | 14.93 | FALL OSTINATO: the tune's head as running eighths (marimba), 142 bpm and accelerating; bars F F Gm Gm |
| 633.0 | 21.10 | downbeat on kick ('shoots'): Bb major, timpani + cymbal; 184 bpm, bass on every beat, xylophone doubles the ostinato |
| 743.0 | 24.77 | downbeat on the white-hot core: Eb major, timpani + cymbal; 222 bpm, running bass, glock on top, soft brass swells |
| 834.3 | 27.81 | last bar: C7, 269 bpm, everything climbs (clarinet run, timpani eighths) |
| 861.0 | 28.70 | DEAD STOP on 'But wait' (unresolved C7): the score is silent until the explanation |
| 915.0 | 30.50 | EXPLANATION: the tune at half speed in D minor (vibes), tick-tock woodblock + pizzicato, 138 bpm felt in two; soft |
| 1019.0 | 33.97 | answering phrase a step higher (Gm), as he passes the centre |
| 1071.0 | 35.70 | half cadence on A: the tick-tock slows and stops ('slowing him down') |
| 1123.0 | 37.43 | SWING WALTZ: music box in F, one 3/4 bar per half swing (152 bpm), pick-up on the push (f1126), downbeats when the swing passes the bottom (f1144, f1179, f1215) |
| 1179.4 | 39.31 | 'all the speed it gains going down': the tune steps down F-D-Bb into |
| 1215.0 | 40.50 | the bottom of the arc (low F); then the arpeggio climbs F-A-C-F, slower and slower, to the top |
| 1258.0 | 41.93 | top of the arc: high F rings, everything else waits |
| 1268.0 | 42.27 | LULLABY: the tune rocking in 6/8, Db major (F is the common tone), music box + harp + warm pad, 62 dotted-quarters a minute |
| 1384.0 | 46.13 | third bar climbs to an unresolved Eb (the slide whistle is heading for the same note) |
| 1442.0 | 48.07 | HELD BREATH: he stops, the music stops (choked on the Eb); silence until 'Luckily' |
| 1465.0 | 48.83 | 'Luckily': the head of the tune once more, sweet, ending on a rolled Db chord |
| 1537.0 | 51.23 | 'Unluckily': the same phrase again ... |
| 1561.0 | 52.03 | ... but it droops: Fb-Eb-Db-C with a soft sad trombone, landing on C (the way home) |
| 1614.0 | 53.80 | RETURN: the ostinato again on C7, 218 bpm and accelerating, three bars up into the theme |
| 1707.0 | 56.90 | PAYOFF: the tune comes home, F major, warm and a little faster (148.6 bpm): clarinet + glock + marimba, soft horns, pad |
| 1900.8 | 63.36 | tag: tutti F chord ('ta-da'), one low pizzicato C ... |
| 1925.0 | 64.17 | BUTTON: final F (pizzicato, marimba, glock, clarinet, soft timpani, triangle), choked to silence by the last frame |

## SFX cues (every event of shots.json, in frame order)
Level convention: every EVENT has a naive level (LU vs the voice stem, as the event's max momentary loudness); applied = naive - 6 dB (standard mix rule). BEDS are integrated loudness, not reduced. Both are then ducked -2 dB while the narrator speaks. 'mix LUFS' = the cue's level in the final mix before that duck (voice stem = -14.3 LUFS integrated). Reverb by place: tunnel (shaft), open air (garden, park, ocean), void (earth cutaway). The white flash (f118) and the record stop cut everything that was sounding before them.

| # | frame | to | time s | cue | what | naive LU | applied LU | mix LUFS | pan |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 118 | 0.000 | wind_rush (bed) | falling rush under the hook, rising into the flash (noise band + faint whistle + flutter, follows the speed) | -8.5 | -8.5 | -22.1 | +0.00 |
| 2 | 103 |  | 3.433 | whoosh_big | big deep whoosh (air band diving from bright to dark + sub swell): camera tilts down the tunnel | -2.0 | -8.0 | -21.6 | +0.00 |
| 3 | 118 | 229 | 3.933 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 4 | 118 |  | 3.933 | flash_hit | white flash: bright airy burst + soft low whoomp; the hook's rush is cut here | -5.0 | -11.0 | -24.6 | +0.00 |
| 5 | 181 |  | 6.033 | shovel_thunk | shovel into the dirt mound: thud + grit + dull blade ring | -6.0 | -12.0 | -25.6 | +0.00 |
| 6 | 229 |  | 7.633 | whoosh | quick whoosh (ease-out burst): cut to Earth cutaway | -10.0 | -16.0 | -29.6 | +0.00 |
| 7 | 247 |  | 8.233 | pop | small bright pop: tunnel punches through, flag pops | -8.0 | -14.0 | -27.6 | +0.00 |
| 8 | 264 | 448 | 8.800 | amb_garden (bed) | garden air: light breeze, sparrows | -25.0 | -25.0 | -38.6 | +0.00 |
| 9 | 287 |  | 9.567 | flame_poof | 'fwoomp' + flutter + crackle: sausage ignites | -6.0 | -12.0 | -25.6 | +0.20 |
| 10 | 305 |  | 10.167 | sizzle | sizzle dying away: burnt crisp | -9.0 | -15.0 | -28.6 | +0.20 |
| 11 | 351 |  | 11.700 | splat | wet splat: slap + squelch + glops + thud (pancake hits the lawn) | -4.0 | -10.0 | -23.6 | -0.10 |
| 12 | 412 |  | 13.733 | paper_flick | paper flaps + board knock: clipboard up | -11.0 | -17.0 | -30.6 | +0.00 |
| 13 | 429 |  | 14.300 | jump_boing | spring 'boing': Gus hops in | -5.0 | -11.0 | -24.6 | +0.00 |
| 14 | 431 | 448 | 14.367 | slide_whistle_down | slide whistle falling 1319 -> 349 Hz over 17 frames: falling away | -7.0 | -13.0 | -26.6 | +0.00 |
| 15 | 448 | 861 | 14.933 | wind_rush (bed) | tunnel rush: pitch and level rise to f743, then hold; cut dead by the record stop (noise band + faint whistle + flutter, follows the speed) | -16.0 | -16.0 | -29.6 | +0.00 |
| 16 | 504 |  | 16.800 | twinkle | sparkle run of five tiny bells: feather drifts in | -9.0 | -15.0 | -28.6 | +0.00 |
| 17 | 564 |  | 18.800 | zip | 'zwip' pass-by: Gus overtakes the bullet | -7.0 | -13.0 | -26.6 | +0.00 |
| 18 | 581 |  | 19.367 | ricochet_ping | cartoon ricochet 'pyeeow', small: little wave at the bullet | -9.0 | -15.0 | -28.6 | +0.15 |
| 19 | 633 |  | 21.100 | impact_kick | speed-surge kick (sub thump + upward air burst): 'shoots': speed surge | -5.0 | -11.0 | -24.6 | +0.00 |
| 20 | 654 |  | 21.800 | zip | 'zwip' pass-by: streak through the core (Earth cutaway insert) | -8.0 | -14.0 | -27.6 | +0.00 |
| 21 | 727 |  | 24.233 | impact_kick | speed-surge kick (sub thump + upward air burst): 'hour' | -5.0 | -11.0 | -24.6 | +0.00 |
| 22 | 765 |  | 25.500 | sizzle | sizzle dying away: 'hot' | -10.0 | -16.0 | -29.6 | +0.20 |
| 23 | 801 |  | 26.700 | glass_pop | thermometer pops: small pop + glass tink + tiny shards | -6.0 | -12.0 | -25.6 | +0.00 |
| 24 | 836 |  | 27.867 | ding | friendly two-bell 'ding' (G6 + C7): thumbs-up | -7.0 | -13.0 | -26.6 | +0.00 |
| 25 | 861 | 915 | 28.700 | amb_garden (bed) | awkward quiet: faint breeze and ONE cricket | -33.0 | -33.0 | -46.6 | +0.00 |
| 26 | 861 |  | 28.700 | record_stop | record stop: needle scratch + the last chord winding down to nothing (0.4 s) | -3.0 | -9.0 | -22.6 | +0.00 |
| 27 | 867 |  | 28.900 | cricket | the one cricket (3-pulse chirps, about 1.6 per second) | -15.0 | -21.0 | -34.6 | +0.35 |
| 28 | 897 |  | 29.900 | question_blip | '?' card: two soft blips, the second one bending up like a question (A5, C#6 -> E6) | -7.0 | -13.0 | -26.6 | +0.00 |
| 29 | 950 |  | 31.667 | arrow_pop | arrow card pops in: pop + tiny D6 blip | -8.0 | -14.0 | -27.6 | +0.00 |
| 30 | 1022 |  | 34.067 | flip_blip | arrow flips: two-note 'bi-dup' (G6, D6) + a flick of air | -8.0 | -14.0 | -27.6 | +0.00 |
| 31 | 1091 | 1115 | 36.367 | decel_whoosh | slowing down: air band + faint tone sinking in pitch and level | -10.0 | -16.0 | -29.6 | +0.00 |
| 32 | 1126 |  | 37.533 | push_whoosh | push on the swing: hands on the back + chain jingle + soft whoosh | -9.0 | -15.0 | -28.6 | +0.10 |
| 33 | 1130 | 1260 | 37.667 | swing_creak | swing ropes creak in rhythm with the swing: 5 creaks at f1130, 1144, 1179, 1215, 1236 (the push, every pass through the bottom, once on the way up) | -9.0 | -15.0 | -28.6 | +0.15 |
| 34 | 1215 |  | 40.500 | whoosh | quick whoosh (ease-out burst): swing fastest at the bottom | -10.0 | -16.0 | -29.6 | +0.00 |
| 35 | 1258 |  | 41.933 | ting | triangle 'ting': swing stops at the top | -9.0 | -15.0 | -28.6 | +0.00 |
| 36 | 1268 | 1614 | 42.267 | amb_ocean_night (bed) | night ocean: slow swells, foam, water lapping on the boat, timber creaks | -21.0 | -21.0 | -34.6 | +0.00 |
| 37 | 1342 |  | 44.733 | cork_pop | cork pop + a few drips: Gus pops out of the pipe | -3.0 | -9.0 | -22.6 | +0.00 |
| 38 | 1344 | 1440 | 44.800 | slide_whistle_up_slowing | slide whistle rising 415 -> 1245 Hz, slower and slower, fading to nothing by f1440 | -9.0 | -15.0 | -28.6 | +0.00 |
| 39 | 1442 |  | 48.067 | ting | triangle 'ting': he stops dead; music holds its breath | -9.0 | -15.0 | -28.6 | +0.00 |
| 40 | 1482 |  | 49.400 | twinkle | sparkle run of five tiny bells: friendly wave | -9.0 | -15.0 | -28.6 | +0.00 |
| 41 | 1560 |  | 52.000 | gulp | cartoon gulp: smile drops | -7.0 | -13.0 | -26.6 | +0.00 |
| 42 | 1598 | 1614 | 53.267 | slide_whistle_down | slide whistle falling 1109 -> 262 Hz over 16 frames: drops back into the pipe | -7.0 | -13.0 | -26.6 | +0.00 |
| 43 | 1614 | 1707 | 53.800 | wind_rush (bed) | return trip: rush up to top speed and down again (time-lapse) (noise band + faint whistle + flutter, follows the speed) | -15.5 | -15.5 | -29.1 | +0.00 |
| 44 | 1707 | 1935 | 56.900 | amb_garden_evening (bed) | evening garden: soft breeze, blackbird phrases, crickets | -25.0 | -25.0 | -38.6 | +0.00 |
| 45 | 1711 |  | 57.033 | cork_pop | cork pop: pops up in his own garden | -3.0 | -9.0 | -22.6 | +0.00 |
| 46 | 1737 |  | 57.900 | ting | triangle 'ting': hangs at the top | -9.0 | -15.0 | -28.6 | +0.00 |
| 47 | 1766 | 1782 | 58.867 | slide_whistle_down | slide whistle falling 1319 -> 349 Hz over 16 frames: drops again | -7.0 | -13.0 | -26.6 | +0.00 |
| 48 | 1790 | 1832 | 59.667 | timer_ticks | egg timer: 13 tick-tocks, one every 3.5 frames, last one on f1832 | -14.0 | -20.0 | -33.6 | -0.15 |
| 49 | 1834 |  | 61.133 | cork_pop | cork pop: back again | -3.0 | -9.0 | -22.6 | +0.00 |
| 50 | 1834 |  | 61.133 | timer_ding | kitchen-timer bell (C7), rings about 1 s: the timer rings exactly as he arrives | -4.0 | -10.0 | -23.6 | -0.15 |
| 51 | 1855 |  | 61.833 | chomp | one big bite: jaw snap + crunch + 'omp' | -5.0 | -11.0 | -24.6 | +0.00 |
| 52 | 1877 | 1893 | 62.567 | slide_whistle_down | slide whistle falling 1319 -> 349 Hz over 16 frames: and gone | -7.0 | -13.0 | -26.6 | +0.00 |
| 53 | 1905 |  | 63.500 | flame_poof | 'fwoomp' + flutter + crackle: neighbor's sausage catches fire again | -9.0 | -15.0 | -28.6 | +0.20 |

## Verification (measured from the written WAV files by `verify.py`; nobody listened)
- **Result: all checks passed**
- Files: `mix.wav` 3,096,000 samples, 48000 Hz, 2 ch, 24-bit, peak -1.21 dBFS, 0 clipped; `stem_voice.wav` 3,096,000 samples, 48000 Hz, 2 ch, 24-bit, peak -0.48 dBFS, 0 clipped; `stem_music.wav` 3,096,000 samples, 48000 Hz, 2 ch, 24-bit, peak -8.73 dBFS, 0 clipped; `stem_sfx.wav` 3,096,000 samples, 48000 Hz, 2 ch, 24-bit, peak -7.44 dBFS, 0 clipped
- Loudness of `mix.wav`: **-14.01 LUFS** integrated, true peak **-1.2 dBTP** (sample peak -1.21 dBFS), LRA 1.32 LU, max momentary -9.44 LUFS. Stems minus mix: -126.6 dB.
- Event onsets in `stem_sfx.wav` (52 events, tolerance 1 frame): matched 52/52 within tolerance (largest error 0.54 frame, largest lag 93 samples); blind band-flux detector resolved 47 of them, 47 within tolerance (largest error 0.56 frame). Not resolved blind (soft starts under louder sounds, placement confirmed by the matched test): amb_garden@118, flame_poof@287, wind_rush@448, wind_rush@1614, amb_garden_evening@1707.
- Voice minus bed (music + sfx) in 300-3000 Hz while the narrator speaks: **8.3 dB** over 52.13 s of speech (400 ms windows: median 7.09, 10th percentile 2.3, 90th 12.67 dB).
- Silence gaps longer than 0.5 s (50 ms RMS): mix under -50 dBFS: none; score under -60 dBFS (frames): 0-117.9, 861-915, 1444.6-1464.4 (intended: no music under the hook, the dead stop, the held breath); unintended: none; bed (music + sfx) under -60 dBFS: none.
- Spectrum of the mix: DC -67.6 dBFS, below 20 Hz -40.3 dB, above 12 kHz -45.2 dB of the total energy, centroid 840 Hz. Bands (dB of total): 0-20 Hz -40.3, 20-60 Hz -29.5, 60-300 Hz -3.9, 300-3000 Hz -2.9, 3000-8000 Hz -11.0, 8000-12000 Hz -24.0, 12000-16000 Hz -45.2, 16000-24000 Hz -68.4.
- Score landmarks: first sound at f117.99 (flash f118); after the dead stop f861 -240.0 dBFS until it resumes at f914.84 (f915); held breath -240.0 dBFS from f1447 until f1464.38 (f1465); theme returns at f1707.02 (f1707); button at f1924.88 (f1925); last 10 ms -78.0 dBFS.

### Voice minus bed per score section (speech band, while speaking)
| section | frames | level difference dB | median of 400 ms windows | 10th percentile |
|---|---|---|---|---|
| hook | 0-118 | 8.42 | 7.03 | 3.07 |
| sunday | 118-448 | 7.4 | 6.54 | 1.39 |
| fall1 | 448-633 | 9.83 | 9.51 | 5.92 |
| fall2 | 633-743 | 6.6 | 6.37 | 2.05 |
| fall3 | 743-861 | 8.3 | 6.93 | 2.47 |
| stop | 861-915 | 17.18 | 16.91 | 8.86 |
| explain | 915-1123 | 8.88 | 6.74 | 1.89 |
| swing | 1123-1268 | 7.54 | 6.3 | 2.01 |
| lullaby | 1268-1442 | 8.81 | 6.44 | 4.28 |
| breath | 1442-1465 | 17.2 | 10.9 | 2.81 |
| luckily | 1465-1614 | 9.05 | 8.09 | 3.74 |
| return | 1614-1707 | 8.0 | 5.86 | 1.27 |
| payoff | 1707-1935 | 7.5 | 6.1 | 1.33 |

### Onset of every event in the SFX stem
err = detected onset minus the frame in shots.json, in frames. matched = cross-correlation with the cue rendered alone + its 10 % rise; blind = first strong band-energy rise within 3 frames (snr = largest rise over the local median; under 5 = not resolved).

| frame | event | matched onset | err | lag samples | blind onset | err | snr |
|---|---|---|---|---|---|---|---|
| 0-118 | wind_rush | 0.07 | +0.07 | 1 | -0.1 | -0.10 | 20.0 |
| 103 | whoosh_big | 102.49 | -0.51 | 1 | 102.5 | -0.50 | 5.0 |
| 118 | flash_hit | 117.65 | -0.35 | 2 | 118.16 | +0.16 | 8.2 |
| 118-229 | amb_garden | 118.13 | +0.13 | 1 | - | - | 2.7 |
| 181 | shovel_thunk | 181.0 | +0.00 | 2 | 180.92 | -0.08 | 16.9 |
| 229 | whoosh | 229.0 | +0.00 | 2 | 229.16 | +0.16 | 9.5 |
| 247 | pop | 247.0 | +0.00 | 1 | 246.92 | -0.08 | 26.8 |
| 264-448 | amb_garden | 264.14 | +0.14 | 1 | 263.96 | -0.04 | 9.8 |
| 287 | flame_poof | 287.02 | +0.02 | 1 | - | - | 4.6 |
| 305 | sizzle | 305.1 | +0.10 | 2 | 305.0 | +0.00 | 28.3 |
| 351 | splat | 351.0 | +0.00 | 2 | 350.9 | -0.10 | 18.6 |
| 412 | paper_flick | 412.0 | +0.00 | 2 | 411.92 | -0.08 | 26.3 |
| 429 | jump_boing | 429.01 | +0.01 | 1 | 429.02 | +0.02 | 11.5 |
| 431-448 | slide_whistle_down | 431.02 | +0.02 | 1 | 431.12 | +0.12 | 8.1 |
| 448-861 | wind_rush | 448.1 | +0.10 | 1 | - | - | 3.8 |
| 504 | twinkle | 504.01 | +0.01 | 2 | 503.9 | -0.10 | 999.0 |
| 564 | zip | 563.46 | -0.54 | 1 | 563.6 | -0.40 | 14.6 |
| 581 | ricochet_ping | 581.0 | +0.00 | 2 | 580.88 | -0.12 | 80.9 |
| 633 | impact_kick | 632.97 | -0.03 | -56 | 632.9 | -0.10 | 28.8 |
| 654 | zip | 653.49 | -0.51 | 2 | 653.78 | -0.22 | 10.8 |
| 727 | impact_kick | 727.0 | +0.00 | 1 | 726.44 | -0.56 | 25.0 |
| 765 | sizzle | 765.11 | +0.11 | 2 | 765.02 | +0.02 | 10.9 |
| 801 | glass_pop | 801.0 | +0.00 | 2 | 800.9 | -0.10 | 12.8 |
| 836 | ding | 836.0 | +0.00 | 1 | 836.0 | -0.00 | 16.3 |
| 861 | record_stop | 861.0 | +0.00 | 2 | 860.9 | -0.10 | 15.7 |
| 861-915 | amb_garden | 861.02 | +0.02 | 2 | 860.9 | -0.10 | 9.8 |
| 897 | question_blip | 897.01 | +0.01 | 1 | 896.96 | -0.04 | 32.4 |
| 950 | arrow_pop | 950.0 | +0.00 | 1 | 949.88 | -0.12 | 999.0 |
| 1022 | flip_blip | 1022.01 | +0.00 | 1 | 1021.88 | -0.12 | 999.0 |
| 1091-1115 | decel_whoosh | 1091.09 | +0.09 | 1 | 1090.94 | -0.06 | 189.7 |
| 1126 | push_whoosh | 1126.0 | +0.00 | 2 | 1125.92 | -0.08 | 28.2 |
| 1130-1260 | swing_creak | 1130.0 | +0.00 | 1 | 1130.0 | +0.00 | 8.3 |
| 1215 | whoosh | 1214.84 | -0.16 | 2 | 1214.84 | -0.16 | 82.7 |
| 1258 | ting | 1258.0 | +0.00 | 2 | 1257.86 | -0.14 | 999.0 |
| 1268-1614 | amb_ocean_night | 1268.16 | +0.16 | 2 | 1268.06 | +0.06 | 11.4 |
| 1342 | cork_pop | 1342.0 | +0.00 | 1 | 1342.04 | +0.04 | 10.1 |
| 1344-1440 | slide_whistle_up_slowing | 1344.03 | +0.03 | 1 | 1344.2 | +0.20 | 6.3 |
| 1442 | ting | 1442.0 | +0.00 | 2 | 1441.94 | -0.06 | 39.6 |
| 1482 | twinkle | 1482.0 | +0.00 | 2 | 1482.02 | +0.02 | 999.0 |
| 1560 | gulp | 1560.08 | +0.08 | -4 | 1560.02 | +0.02 | 9.9 |
| 1598-1614 | slide_whistle_down | 1598.02 | +0.02 | 1 | 1598.06 | +0.06 | 13.0 |
| 1614-1707 | wind_rush | 1614.06 | +0.06 | 1 | - | - | 3.8 |
| 1707-1935 | amb_garden_evening | 1707.44 | +0.44 | 1 | - | - | 3.1 |
| 1711 | cork_pop | 1711.0 | +0.00 | 1 | 1710.86 | -0.14 | 17.3 |
| 1737 | ting | 1737.0 | +0.00 | 2 | 1736.9 | -0.10 | 270.8 |
| 1766-1782 | slide_whistle_down | 1766.02 | +0.02 | 1 | 1766.0 | +0.00 | 36.4 |
| 1790-1832 | timer_ticks | 1790.0 | +0.00 | 2 | 1789.88 | -0.12 | 23.2 |
| 1834 | cork_pop | 1834.0 | +0.00 | 1 | 1833.92 | -0.08 | 19.6 |
| 1834 | timer_ding | 1834.06 | +0.06 | 93 | 1833.92 | -0.08 | 69.8 |
| 1855 | chomp | 1855.0 | +0.00 | 2 | 1854.92 | -0.08 | 17.6 |
| 1877-1893 | slide_whistle_down | 1877.03 | +0.03 | 1 | 1876.94 | -0.06 | 36.3 |
| 1905 | flame_poof | 1905.02 | +0.02 | 1 | 1905.08 | +0.08 | 5.3 |
