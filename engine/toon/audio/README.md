# The soundtrack of a cartoon short (`engine/toon/audio`)

One command turns a shot plan, a narration and a small sound plan into the finished soundtrack: the voice on top,
an original synthesized score under it, a synthesized sound effect on every event, mixed to YouTube loudness and
measured. You write data (two JSON files). You never write or change sound code: if a story needs a sound that is
not in the table below, use the nearest type from the table.

## 1. The command

```
engine/.venv/bin/python engine/toon/audio/build.py <video_id>
```

| reads (all under `engine/videos/<id>/`) | writes (`engine/videos/<id>/audio/`) |
|---|---|
| `shots.json`: shots, places, flashes, crossfades, the event table | `mix.wav`: the final mix (48 kHz stereo 24-bit, exactly `total_frames / fps` s; `toon/finish.py` muxes it) |
| `voice/voice.wav`, `voice/words.json`, `voice/lines.json` (from `toon/voice.py`) | `stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav` (they sum to the mix) |
| `audio/score.json`: the sound plan you write (section 3) | `cues.md` (every cue and measurement, readable), `verify.json` (the same as data, `"ok": true/false`) |

- Exit **0**: built, every check passed. Exit **1**: built, a check failed (section 6). Exit **2**: the inputs are
  wrong, nothing was rendered; every problem is printed with the valid choices. Fix and run again.
- `build.py <video_id> --check` validates the inputs only (a second). Run it after every edit of the two JSON files.
  Before `audio/score.json` exists it checks the shot plan and the events alone, so the events can be validated
  while the shots are being planned.
- `build.py --list` prints the tables of this manual from the code (types, options, moods, tunes).
- About 35 s for a 65 s short on 4 cores. numpy + scipy only, seeded (same inputs, same samples), no network.
  It runs from any directory (from `engine/`: `.venv/bin/python -B toon/audio/build.py <id>`).
- Order of work: `voice.py` first (frames come from `words.json`), then `shots.json`, then `score.json`, then build.
  Any change to frames, events, voice or score means building again.

## 2. `shots.json`: what the sound reads

`fps`, `total_frames`; `shots[]` with `id`, `a` (first frame), `b` (end frame, exclusive) and `place`; `flash_at`
(optional: a frame or a list of frames with a white flash); `xfade` (optional: `{"<shot id>": frames}` of crossfade
into that shot); `events[]`. Other keys are ignored by the sound.

An event is one sound on one frame:

```json
{"f": 351, "type": "splat", "note": "pancake hits the lawn"}
{"f": 448, "to": 861, "type": "wind_rush", "shape": "hold", "peak": 743, "note": "tunnel rush"}
```

- `f`: the frame where the sound starts. Put it on the picture action, which is 0 to 2 frames before the word that
  names it. `to` (some types): the frame where it ends. `type`: a name from the table. `note`: what it is for (it
  goes into `cues.md`). `id` (optional): a name of its own, used once, by which the picture finds the event
  (`T.at("flip1")`); the sound ignores it. Any other key is an option of that type (the options column).
- Ambience beds need `to`. They fade in over one frame (over the crossfade if the shot has one) and out at `to`.
- A type starting with `music_` or `pic_` makes no sound: `music_...` marks a moment of the score (the score itself
  is `score.json`), `pic_...` is an action frame of the picture that should stay silent.
- A white flash (`flash_at`) and every `record_stop` are **dead cuts**: all sound that started before them stops
  there. A bed that should continue must start on that frame.
- An unknown type stops the build and lists the valid ones. **Never invent a type and never add code for a new
  sound.** Take the nearest type and say in `note` what it stands for: a rocket launch is `rocket_rumble` +
  `whoosh_big`; lightning is `zap` + `thunder`; an earthquake is `rocket_rumble` (`"shape": "steady"`) + `crash`;
  under water is `bubbling`; a city is `amb_crowd` + `car_pass` + `car_horn`; a lab is `amb_room` + `bubbling`;
  magic or teleporting is `twinkle` (+ `zap`); a phone or doorbell is `ding` or `alarm` (`"kind": "bell"`); a punch
  is `thud` or `bonk`; a scream or laugh is `crowd_gasp`, `crowd_ooh` or `oof`; an animal gets the effect of what it
  does (`footsteps`, `squeak`, `chomp`, `bird_tweet`), there are no animal voices.

### Event types (the whole vocabulary)

| type | span | what it sounds like, when to use it | options |
|---|---|---|---|
| **ambience beds** | | | |
| `wind_rush` | needs "to" | Stylised speed rush, a cartoon whoosh that lasts (not real wind): a band of noise with a faint whistle and flutter that follows the speed. Falling, flying, driving fast. Default level -15 (hook -8.5). | `shape`: rise (default: faster and faster) / hook (already fast, loud; alone under a cold open, no music) / hold (rises to 'peak', then stays) / arc (up to 'peak' and down again); `peak`: frame of top speed for hold / arc (default: the start of the last shot inside the span, or 45 % for arc) |
| `amb_garden`, `amb_garden_evening`, `amb_cricket` | needs "to" | Outdoor air. amb_garden: light breeze and sparrows (day). amb_garden_evening: softer breeze, blackbird phrases, crickets. amb_cricket: almost nothing, faint air and one cricket (the awkward pause after a dead stop). Default level -25 (amb_cricket -33). | `birds`: 0..1, how much bird song (default 1; amb_cricket 0); `cricket`: 1 adds ONE cricket chirping alone, the sound of an awkward silence (default 0; amb_cricket 1) |
| `amb_ocean_night` | needs "to" | Open sea close to a small boat: slow swells, foam, water lapping on the hull, timber creaks. Sea, lake, harbour, any calm water. Level -21. | - |
| `amb_night` | needs "to" | Night outdoors without birds: a chorus of crickets over faint air. Camping, desert night, a quiet street. Level -27. | - |
| `amb_wind` | needs "to" | Real wind: gusting air with a hollow howl that wanders. Mountain top, storm, desert, the outside of a plane. Level -22. | `strength`: 0 light .. 1 storm (default 0.6) |
| `amb_rain` | needs "to" | Rain: steady hiss, drops pattering, a little low weight. Add thunder events for a storm. Level -23. | `heavy`: 0 drizzle .. 1 downpour (default 0.5) |
| `amb_fire` | needs "to" | Fire burning: low fluttering roar, hiss, crackles, now and then a pop. Campfire, lava, a burning house, the surface of a star. Level -23. | `size`: 0 campfire .. 1 inferno (default 0.5) |
| `amb_river` | needs "to" | Running water close by: flow, babble, lapping, a slosh and a drip now and then. River, stream, flooded street, a bath. Level -22. | - |
| `bubbling` | needs "to" | A liquid bubbling: plinks of all sizes over a low gurgle. Boiling pot, lab flask, lava, swamp, under water. Level -22. | `rate`: small bubbles per second, 5..80 (default 26) |
| `amb_drone` | needs "to" | The hum of empty space, a spaceship or a machine hall: a low open fifth that breathes, a little air. Space, deep sea, inside a computer, a dream. Level -24. | - |
| `amb_room` | needs "to" | Indoor quiet: soft air and a faint mains hum, so a room is never dead silent. Kitchen, lab, office, bedroom. Level -32. | - |
| `amb_crowd` | needs "to" | A room of people talking, no word understood. Market, classroom, stadium before the game, a party. Level -26. | - |
| `rocket_rumble` | needs "to" | Rocket, jet or giant engine: low roar with a crackling band and flutter. Launches, volcano, earthquake, a monster truck. Level -13 (it is meant to be felt). | `shape`: rise (default: builds over the span) / steady / fade (flies away) |
| **spot effects** | | | |
| `whoosh` | one shot | Quick light whoosh, an ease-out burst of air. Hard cuts, a fast arm, something passing. The everyday transition sound. Level -10. | - |
| `whoosh_big` | one shot | Big deep 'whooom': an air band diving from bright to dark with a sub swell, 1 s. Big camera moves, a reveal of scale, a giant passing. Level -2. | - |
| `flash_hit` | one shot | The white flash: bright airy burst with a soft low whoomp. Put it on every flash_at frame. Level -5. | - |
| `impact_kick` | one shot | Speed-surge kick: soft sub thump with an upward burst of air. A sudden acceleration, a launch, a punchy emphasis on one word. Level -5. | - |
| `decel_whoosh` | "to" optional | The opposite of a whoosh: air and a faint tone sinking in pitch and level as something slows down ('to' sets the length, default 0.8 s). Level -10. | - |
| `push_whoosh` | one shot | A push or shove: hands on a back, a little jingle, a soft whoosh. Pushing a swing, a cart, a door. Level -9. | - |
| `zip` | one shot | 'Zwip' pass-by: a tone and air racing up, a short Doppler fall. A bullet, a bee, a fast car in the distance, text flying in. Level -7 (small -8). | `size`: normal (default) / small (higher and lighter: something tiny, or seen from far) |
| `car_pass` | "to" optional | A car driving past, left to right: engine note dropping as it passes, tyre noise ('to' sets the length, default 1.2 s). Any vehicle going by. Level -6. | - |
| `pop` | one shot | Small bright cartoon pop. Something appears: a flag, a label, a bubble, an idea. Level -8. | `pitch`: note name ("G6"), MIDI number, or Hz above 127 |
| `arrow_pop` | one shot | A graphic card pops in: pop with a tiny high blip. Arrows, labels, numbers on screen. Level -8. | - |
| `flip_blip` | one shot | Two-note 'bi-dup' with a flick of air. A card flips, a sign reverses, a value changes. Level -8. | - |
| `question_blip` | one shot | Two soft blips, the second bending up like a question. A '?' appears, somebody wonders. Level -7. | - |
| `blip`, `beep` | one shot | blip: one tiny neutral tone (0.08 s), the plainest marker for anything on screen. beep: the same, longer (0.2 s): a machine, a scanner, a countdown. Level -10 / -9. | `pitch`: note name ("G6"), MIDI number, or Hz above 127 |
| `ding` | one shot | Friendly two-bell 'ding!' (G6 + C7). Correct, done, thumbs-up, an idea lands. Level -7. | `pitch`: note name ("G6"), MIDI number, or Hz above 127 |
| `ting` | one shot | One triangle 'ting', tuned to the score. Something stops dead, hangs in the air, a tiny highlight. Level -9. | `pitch`: note name ("G6"), MIDI number, or Hz above 127; default: the home note of the score at that frame |
| `twinkle` | one shot | Sparkle: a quick run of five tiny bells, tuned to the score. Magic, stars, something delicate, a friendly wave, clean and shiny. Level -9. | - |
| `ricochet_ping` | one shot | Small cartoon ricochet 'pyeeow'. A near miss, something bounces off, a cheeky glance. Level -9. | - |
| `laser_zap` | one shot | Toy ray gun 'pew': a tone that dives three octaves. Lasers, robots, sci-fi gadgets, a scanner beam. Level -7. | - |
| `zap` | one shot | Electric spark: a ragged crackle buzzing at mains rate, 0.3 s. Electric shock, lightning close up, static, a short circuit. Level -7. | - |
| `power_up`, `power_down` | one shot | A machine powering up (pitch and shimmer rise to a held tone) or down (it sinks and dies), 0.7 s. Switching on, charging, shutting down, deflating. Level -8. | - |
| `cork_pop` | one shot | Loud cork 'pop!'. Somebody or something pops out of a hole, a pipe, the water, a box. Level -3. | `wet`: true adds a few drips (default: true in a place whose acoustics is 'water') |
| `glass_pop` | one shot | Small glass pop: pressure pop, glass tink, tiny shards. A thermometer, a light bulb, a test tube, a window far away. Level -6. | - |
| `timer_ticks` | "to" optional | Wind-up egg timer: fast tick-tock (about 9 a second) with a faint whirr, the last tick on 'to' (default 1.4 s). Waiting, a short countdown. Level -14. | - |
| `clock_tick` | "to" optional | Wall clock: slow tick ... tock ('to' sets the length, default 2 s). Time passing, a long wait, a slow countdown, suspense. Level -13. | `every`: frames between ticks (default: half a second) |
| `timer_ding` | one shot | Kitchen-timer bell (C7), one bright strike ringing for a second. Time is up, ready, the answer arrives. Level -4. | `pitch`: note name ("G6"), MIDI number, or Hz above 127 |
| `bell` | one shot | One stroke of a big bell, ringing 2.8 s. Clock tower, school, church, a ship, a boxing round. Level -6. | `pitch`: note name ("G6"), MIDI number, or Hz above 127 (default G4) |
| `buzzer` | one shot | Game-show 'wrong!' buzzer, half a second. A wrong answer, a myth busted, access denied. Level -6. | - |
| `alarm` | "to" optional | An alarm ('to' sets the length, default 1.5 s). Warning, emergency, wake up, a countdown running out. Level -12 (it sits in the speech band; keep it short under narration). | `kind`: beep (default: digital, four beeps a second) / siren (two-tone hi-lo) / bell (alarm clock) |
| `car_horn` | one shot | Two-tone car horn. Traffic, impatience, 'out of the way', a clown car. Level -5. | `beeps`: 2 (default: beep-beep) / 1 (one long honk) |
| `camera_click`, `click` | one shot | camera_click: shutter click-whirr-clack (a photo, a snapshot of a moment). click: one small mechanical click (a switch, a button, a seat belt). Level -10 / -11. | - |
| `typing` | "to" optional | Somebody typing: key clicks in bursts ('to' sets the length, default 1.5 s). Computers, hacking, a calculation, a letter being written. Level -13. | - |
| `shovel_thunk` | one shot | A blade into earth: thud, grit, dull metal ring. Digging, planting a flag or a sign, an axe, a spade. Level -6. | - |
| `flame_poof` | one shot | 'Fwoomp': something catches fire, with flutter and a few crackles. Ignition, a match, a burner, a dragon's hiccup. Level -6. | - |
| `sizzle` | one shot | Frying sizzle that dies away. Burnt, hot surface, acid, something fizzing or dissolving. Level -9. | `dur`: seconds, 0.3..3 (default 0.7) |
| `splat` | one shot | Wet splat: slap, squelch, glops, low thud. Food on the floor, mud, slime, a tomato, a bug on a windscreen. Level -4. | - |
| `splash` | one shot | Something falls into water. Level -5 (big -3). | `size`: small (default: a plop with bubbles) / big (a body or a boat hits the water, 2.6 s) |
| `drip` | one shot | One drop of water into water, with its small echo. A leak, a cave, a tear, a tap, 'one drop is enough'. Level -10. | - |
| `paper_flick` | one shot | Paper flaps and a small board knock. A clipboard, a map, a newspaper, a page turned, a card held up. Level -11. | - |
| `jump_boing`, `boing` | one shot | Cartoon spring 'boing'. A hop, a bounce, a jump off, eyes popping out. Level -5. | - |
| `bonk` | one shot | Hollow wooden 'bonk' that dips in pitch. A knock on the head, a coconut, a dumb idea, two things bump. Level -6. | - |
| `squeak` | one shot | Rubber-toy squeak. A squeaky shoe, a mouse, a tiny brake, something small squeezed. Level -8. | - |
| `gulp` | one shot | Cartoon gulp: a throat thump and a bubble. Nervous, 'uh-oh', swallowing, the smile drops. Level -7. | - |
| `chomp` | one shot | One big bite: jaw snap, crunch, 'omp'. Eating, a shark, a black hole swallowing something. Level -5. | - |
| `thud` | one shot | Something heavy and soft hits the floor: low thump, no ring. A body, a sack, a book, fainting, landing. Level -5. | - |
| `crash` | one shot | Something big falls over or breaks: splintering crack and boom, bits clattering down, 1.9 s. A shelf, a tree, a wall, a pile of plates. Level -3. | - |
| `metal_clang` | one shot | A big piece of metal struck: bright hit, long inharmonic ring. A pipe, a pan, an anvil, a hull, a robot's head. Level -6. | `pitch`: note name ("G6"), MIDI number, or Hz above 127 (default 310 Hz; higher = smaller object) |
| `door_slam`, `knock`, `door_creak` | "to" optional | door_slam: heavy thump, panel ring, latch, rattle (level -4). knock: knuckles on wood (level -7). door_creak: a slow wooden creak, 'to' sets the length, default 0.9 s (level -9). | `count`: knock only: how many knocks, 1..6 (default 3) |
| `footsteps` | "to" optional | Somebody walking or running, left-right ('to' sets the length, default two steps). Level -11. | `pace`: steps per second, 0.5..6 (default 2); `surface`: hard (default: floor, planks, pavement) / soft (grass, carpet, sand, snow); `at`: list of frames, one step on each (instead of pace) |
| `heartbeat` | "to" optional | Lub-dub heartbeat ('to' sets the length, default two beats). Fear, suspense, the body, 'still alive'. Works best with little music. Level -8. | `bpm`: beats per minute, 40..200 (default 72; 120+ is fear or effort) |
| `bird_tweet` | one shot | One small bird: a few quick chirps. A bird lands, somebody is knocked silly, a peaceful beat. Level -11. | - |
| `thunder` | one shot | Thunder: a tearing crack, then a rumble that rolls for 3.4 s. Storms, a giant's footstep far away, doom. Level -3 (far -8). | `distance`: near (default: crack, then rumble) / far (rumble only, softer) |
| `explosion` | one shot | Cartoon explosion: sub thump, a blast that darkens fast, rumble, debris, 2 s. Booms, eruptions, impacts, a failed experiment. Level -2. | `size`: 0.5 small .. 1.5 huge (default 1) |
| `crowd_gasp`, `crowd_ooh`, `crowd_cheer`, `applause` | "to" optional | A small crowd (formant-synthesized voices). crowd_gasp: a sharp shared gasp (level -6). crowd_ooh: an impressed 'ooh' (-7). crowd_cheer: hurrahs over clapping, 'to' sets the length, default 1.8 s (-8). applause: clapping only, default 2 s (-10). | - |
| `oof` | one shot | One man's short impact grunt. Somebody lands, gets hit, lifts something heavy. Level -6. | `kind`: oof (default) / ugh / oh / ow |
| `record_stop` | one shot | Record stop: needle scratch and the band's last chord winding down in 0.4 s. It is also a DEAD CUT: every sound that started before it stops. Put it on the first frame of a 'silence' section, for 'But wait'. Level -3. | - |
| `slide_whistle_down` | "to" optional | Slide whistle falling two octaves onto the home note, faster at the end like a falling body ('to' = when it lands, default 0.55 s). Falling, dropping out of frame, deflating, a plan failing. Level -7. | `pitch`: start note (default from the key of the score); `pitch_to`: end note (default from the key of the score) |
| `slide_whistle_up` | "to" optional | Slide whistle shooting up two octaves ('to' = when it arrives, default 0.5 s). Jumping up, taking off, a rocket-powered idea, eyebrows. Level -7. | `pitch`: start note (default from the key of the score); `pitch_to`: end note (default from the key of the score) |
| `slide_whistle_up_slowing` | "to" optional | Slide whistle rising slower and slower and fading to nothing by 'to' (default 3 s). Something rises and runs out of speed: a ball thrown up, a balloon, hope. Level -9. | `pitch`: start note (default from the key of the score); `pitch_to`: end note (default from the key of the score) |
| `sad_trombone` | one shot | 'Wah wah wah waaah': four falling trombone notes, 1.9 s, in the key of the score. Failure, disappointment, the plan did not work. Only in a 'silence' section or over mystery / lullaby. Level -5. | - |
| `tada` | one shot | 'Ta-daa!': two brass chords and a cymbal, 1 s, in the key of the score. A reveal, a result, a proud moment. Only in a 'silence' section (the finale has its own). Level -4. | - |
| `rimshot` | one shot | 'Ba-dum tss': two drum hits and a cymbal, 1.2 s. The punch line of a joke. Only in a 'silence' section or over soft music. Level -5. | - |
| `drum_roll` | "to" optional | Snare roll that swells and ends in a cymbal crash on 'to' (default 1.5 s). Suspense before a reveal: 'and the answer is ...'. Only in a 'silence' section or over soft music. Level -8. | - |
| `swing_creak` | "to" optional | Ropes or hinges creaking under a load, in rhythm ('to' sets the length, default 4 s). A swing, a hammock, a rope bridge, a rocking boat or chair. Level -9. | `at`: list of frames, one creak on each (default: one every 0.95 s) |

Every event also takes `level` (naive level in LU relative to the voice (the default is in the table; -3 is loud, -12 soft)); `pan` (-1 left .. +1 right).

Levels are LU relative to the narrator: -3 is a big hit, -8 a normal effect, -12 a detail; beds are -21 to -33.
Change a level only to fix a failed check or a note, by 2 to 4.

## 3. `audio/score.json`: the sound plan

```json
{
 "_doc": "Sound plan of hole-through-earth, read by engine/toon/audio/build.py (manual: engine/toon/audio/README.md). This is the reference short: the plan reproduces the mix the owner approved.",
 "key": "F",
 "tempo": 131,
 "seed": 3811,
 "theme": "stroll",
 "places": {
  "shaft": "tunnel",
  "garden": "outdoor",
  "earth": "void",
  "park": {"room": "outdoor", "send": 0.12},
  "ocean": "water"
 },
 "sections": [
  {"from": 0, "mood": "silence", "_why": "the hook: the falling rush only"},
  {"from": 118, "mood": "theme", "end": "stop", "_why": "Sunday morning in the garden; stops on 'math' for the boing and the slide whistle"},
  {"from": 448, "mood": "chase", "hits": [633, 743], "_why": "the fall: downbeats on the kick ('shoots') and on the white-hot core"},
  {"from": 861, "mood": "silence", "_why": "'But wait': dead stop with the record_stop event"},
  {"from": 915, "mood": "mystery", "_why": "the explanation over the Earth cutaway"},
  {"from": 1123, "mood": "waltz", "hits": [1126, 1215, 1258], "_why": "the swing: push, bottom of the arc, top of the arc"},
  {"from": 1268, "mood": "lullaby", "_why": "night ocean, he rises slower and slower"},
  {"from": 1442, "mood": "silence", "_why": "he stops; held breath until 'Luckily'"},
  {"from": 1465, "mood": "bittersweet", "hits": [1537], "_why": "'Luckily' ... 'Unluckily' (1537)"},
  {"from": 1614, "mood": "runup", "_why": "the return trip in time-lapse"},
  {"from": 1707, "mood": "finale", "hits": [1925], "_why": "home again; button after the last word"}
 ],
 "dips": [
  [232, 262, -2.0],
  [824, 858, -2.5],
  [1700, 1716, -2.5],
  [1876, 1921, -3.0]
 ],
 "sfx": {
  "wind_rush@0": {"shape": "hook"},
  "wind_rush@448": {"shape": "hold", "peak": 743},
  "wind_rush@1614": {"shape": "arc"},
  "amb_garden@861": {"birds": 0, "cricket": 1, "level": -33},
  "zip@654": {"size": "small"},
  "sizzle@765": {"dur": 0.85, "level": -10},
  "swing_creak@1130": {"at": [1130, 1143.8, 1179.4, 1215, 1236.5]},
  "slide_whistle_up_slowing@1344": {"pitch": "Ab4", "pitch_to": "Eb6"},
  "ting@1442": {"pitch": "Eb6"},
  "slide_whistle_down@1598": {"pitch": "Db6", "pitch_to": "C4"},
  "flame_poof@1905": {"level": -9}
 }
}
```

That is the hole short (`engine/videos/hole-through-earth/audio/score.json`, the reference: it rebuilds the approved
mix bit for bit). A smaller one with other choices: `engine/videos/_audio_test/audio/score.json`.

| key | meaning |
|---|---|
| `key` | Home key of the score, always major: `C Db D Eb E F F# G Ab A Bb B`. Changes the colour of everything, tuned effects included. |
| `tempo` | 90 to 180 beats per minute (hole: 131). It decides how many bars fit each section; the bars are then stretched to fit the frames exactly (at most 45 % off the plan tempo, else the build says the section is too short). Slower = calmer, fewer notes; faster = busier. |
| `theme` | The tune every mood is built on: `stroll` (hole), `hop`, `tiptoe`, or `"seed:<number>"` for a tune made from that number. |
| `seed` | Any whole number. Same seed, same performance; another seed changes touch and micro-timing, not the notes. |
| `places` | Every `place` of `shots.json` -> its acoustics (table below). Decides the reverb of the effects there. Long form: `{"room": "outdoor", "send": 0.12, "wet": false}`. |
| `sections` | The music, in frame order. Each `{"from": frame, "mood": name}` runs until the next one's `from`; the first starts at 0, the last ends with the film. Optional: `hits` (frames the mood must land on, see the table), `level` (LU under the voice instead of the mood's own; a chase takes three), `bars` (force the bar count; normally leave it out), `"end": "stop"` (theme only). Keys starting with `_` are comments. |
| `dips` | `[[first frame, last frame, dB]]`: the music steps back by that much under one line (hole: four dips of -2 to -3 dB under punch lines that fall on busy bars). |
| `sfx` | Options for single events, `{"type@frame": {...}}`. The same options can be written on the event in `shots.json`; this block wins. Use it when `shots.json` is locked. |

### Moods (`sections`)

| mood | level LU | hits | what it sounds like, when to use it |
|---|---|---|---|
| `silence` | - | none | No music. Under the cold open (the effects carry it), for a dead stop after a chase, for a held breath. |
| `theme` | -9.5 | none | The tune, swung and bouncy: clarinet, pizzicato bass, plucked chords, brushes; repeats are doubled by marimba and glockenspiel. Option "end": "stop" ends it on a stop chord two beats before the next section (leaves room for a boing, a slide whistle). |
| `chase` | -11 / -10.3 / -9.5 | 0-2 frames where a downbeat with timpani + cymbal must land (a kick, a reveal) | Running marimba ostinato that accelerates to twice its speed and climbs chord by chord; adds xylophone, running bass, glockenspiel and brass in three gears; ends unresolved. For falls, pursuits, countdowns, anything that builds. Follow it with silence (dead stop) or let it crash into the next mood. |
| `mystery` | -11.5 | none | The tune at half speed in the relative minor: vibraphone over a tick-tock woodblock and pizzicato, the clock runs down at the end. For explanations, 'but wait', thinking, science. |
| `waltz` | -11 | none, or exactly three: [pick-up, low point, rest]. The low point comes at least two bars (about 3 s at tempo 128) after the pick-up, and the rest within 1.2 s of the section's end | Music-box waltz: a pick-up, down to a low point, then an arpeggio that climbs slower and slower to a ringing rest. For swings, pendulums, floating, gentle analogies. |
| `lullaby` | -11.5 | none | The tune rocking in 6/8 in a warmer, darker key: music box, harp arpeggios, breathing pad; the last bar stays open. For night, sea, space, sleep, wonder. A silence after it sounds like a held breath. |
| `bittersweet` | -11.5 | 0-1: the frame where it turns sour (default: the middle) | One little phrase twice: first sweet (music box, harp), then it droops with a soft sad trombone and lands on the dominant. For 'luckily ... unluckily', hope then oops. |
| `runup` | -9.5 | none | A few fast accelerating bars on the dominant with a clarinet run: a spring that releases into the next section. For time-lapses, returns, 'here we go again'. Put it right before a theme or the finale. |
| `finale` | -9.5 | 0-1: the frame of the button (default: a third of a second before the section ends) | The tune comes home, warm and a little faster, with horns and pad, then the tag and the BUTTON, one short final chord. Use it once, as the last section. |

Start every section on a shot start, an event frame or a word start (the build prints a note otherwise).
Shortest sections at tempo 131: silence 0.25 s, runup 1.5 s, theme and mystery 2.5 s, lullaby 2.7 s, chase, waltz,
bittersweet and finale about 3.2 s. They sound best between 4 and 12 s. theme, chase, waltz and finale are in the
home key, mystery in its relative minor, lullaby and bittersweet a major third lower (F -> Db).

### Acoustics (`places`)

| name | for |
|---|---|
| `outdoor` | open air: garden, street, park, field, desert (short, dry) |
| `water` | open air at or on water: sea, lake, pool, rain (pops get drips) |
| `tunnel` | pipe, shaft, corridor, cave mouth (long with close echoes) |
| `void` | space, a diagram, an abstract cutaway (long, far) |
| `room` | small indoor room: kitchen, lab, bedroom (very short) |
| `hall` | big indoor space: hangar, cave, cathedral, stadium (long) |

## 4. What happens automatically (do not try to do it by hand)

- **Ducking.** While `words.json` says the narrator speaks, the music drops 3 dB and the effects 2 dB (in 70 ms,
  back in 450 ms).
- **Music level.** Each section is set to its mood's level under the voice measured in that same section (theme
  -9.5 LU ... lullaby -11.5 LU). `dips` and `level` are the only handles, and are rarely needed.
- **Effect levels.** Every event is normalized to its own level relative to the narrator, then lowered 6 dB (the
  standard mix); beds are set by their average loudness. Loud and soft effects therefore stay in proportion whatever
  the voice file's level is.
- **Loudness.** The mix is brought to -14.0 LUFS integrated and limited to -1.2 dBTP true peak (4x oversampled
  look-ahead limiter); the three stems get the same gain curve. The voice is only gained, never processed.
- **Space.** Each effect gets the reverb of the place of its shot. **Pitch.** `ting`, `twinkle`, the slide
  whistles, `record_stop`, `sad_trombone` and `tada` are tuned to the key the score is in at their frame.
- **Silences and the end.** A `silence` section is really silent (cut dead after theme / chase / runup, choked in
  0.18 s after the ringing moods); the last 5 frames fade, so the button is the last thing heard.

## 5. Rules that made the hole mix work

Measured on the approved short (64.5 s, 21 shots, 237 words):

1. **Density.** 45 spot effects and 8 beds: one spot effect every 1.2 s on average, never more than 3 in one
   second or 7 in five. Every effect answers something visible. `toon/check.py` wants at least 20 events.
2. **Do not stack.** Two effects closer than 10 frames only as a deliberate pair of one short low sound and one
   high or long one: boing + slide whistle 2 frames later, cork pop + slide whistle, cork pop + timer bell, push +
   creak. The 12 loud effects (level -5 and louder) are about 5 s apart and never closer than half a second
   otherwise. A sustained effect in the speech band (`alarm`, `applause`, `crowd_cheer`, `typing`) sits between
   lines or stays under 1.5 s.
3. **One bed per real place**, from the first frame of the place's first shot to the end of its last (garden:
   `amb_garden`, tunnel: `wind_rush`, ocean: `amb_ocean_night`), changing on the cut. An abstract place (a diagram,
   a cutaway) or a short insert needs none while music plays. Under a `silence` section there must be a bed, or
   the mix has a hole: the hole short uses the quiet one-cricket bed there.
4. **The hook has no music**: `{"from": 0, "mood": "silence"}`, one loud bed (`wind_rush` with `"shape": "hook"`,
   or `rocket_rumble`), a `whoosh_big` half a second before the flash, `flash_hit` on the flash. The music starts
   on the flash.
5. **Music follows the story beats**: 11 sections of 3 to 11 s (silences 0.8 to 4 s) in the order silence, theme
   (ending on its stop chord), chase, silence, mystery, waltz, lullaby, silence, bittersweet, runup, finale.
   The dead stop is `chase` -> `silence` with a `record_stop` event on the same frame and one small effect in the
   pause. The held breath is `lullaby` -> `silence`. A `chase` gets its `hits` on the frames of the big moments.
6. **The end.** The last word ends about half a second before the last frame; the finale's button is right after
   it (hole: 10 frames before the end). Nothing after the button.
7. **Stings need room.** `sad_trombone`, `tada`, `rimshot`, `drum_roll` only in a `silence` section or over
   mystery / lullaby; `heartbeat` likewise.
8. **Leave the defaults.** The hole short sets options on 11 of its 53 sounding events (3 levels, 3 pitches, 3 rush
   shapes, one zip size, one creak rhythm) and has 4 dips. Everything else is the default.

## 6. The checks, and what to do when one fails

Nobody listens in this pipeline: the written WAV files are measured. Exit 1 prints `RESULT: FAIL` with one line
per failed check (also in `cues.md` and `verify.json` `fails`). Change the JSON, never the code, and build again.

| failed check | what it means | what to do |
|---|---|---|
| `the voice is only N dB above music + effects` / `the voice is covered in section ...` | In the speech band (300-3000 Hz), while the narrator speaks, the voice must be 6 dB above everything else over the film and 4 dB in every section. The message names the most covered lines with their frames. | In this order: add a dip over that line (`[first frame, last frame, -3]`); lower that section's `level` by 2; lower the `level` of the bed or long effect under the line by 3 to 6, or end it before the line; remove an effect that overlaps the line. |
| `silence in the mix (frames): [[a, b]]` | For more than half a second there is no voice, no music and no bed. | Extend the ambience of that place over those frames, add a quiet bed (`amb_room`, `amb_cricket`), or start the next music section earlier. |
| `events cut off before they have sounded: type@f keeps N % ...` | The event starts just before a white flash, a `record_stop` or the end of the film, which cuts it. | Put it on the frame of the cut or after it, or earlier by its own length; near the end, at least half a second before the last frame. |
| `unintended gaps in the score (frames): [[a, b]]` | A music section falls silent for more than half a second (a long tail after a waltz's rest or after the button). | Move that section's last hit nearer its end, start the next section earlier, or make the gap a `silence` section. |
| `music: section N should start on frame F; the score becomes audible at X` | After a silence the music is not there on its frame. | Give the silence before it at least 8 frames; if it stays, use another mood there. |
| `music: section N (...) is not silent` | A ring of the mood before leaks into a silence. | Make the silence at least 10 frames long. |
| `music: the button should sound on frame F` | The final chord is not on its frame. | Remove the finale's `hits` (the default is 10 frames before the end) or keep it 6 to 20 frames before the end. |
| `event onsets off by more than a frame: type@f` | A sound does not start on its frame in the effects stem. | Remove unusual options of that event (`level`, `at`, `peak`); if it stays, replace the type by its nearest neighbour. |
| `integrated loudness ...`, `true peak ...`, `clipped samples`, `energy above 12 kHz`, `DC offset`, `format/length`, `the stems do not sum`, `no speech found` | The master always reaches -14.0 LUFS and -1 dBTP by itself; these fail only if an input is abnormal. | Run `toon/voice.py` again (a silent, clipped or wrong `voice.wav`, or `words.json` from another take); remove `level` options above -2. |

`note:` lines are advice, not failures: a section that starts on no landmark; an event that "does not stand out"
(a louder sound covers its start: move one of the two by 3 frames or more, or drop one); a button before the last
word. Exit 2 problems name the file, the entry and the valid choices; nothing else is needed to fix them.

## 7. Trying it without a real video

```
engine/.venv/bin/python engine/toon/audio/fake_voice.py _audio_test --force   # a synthetic stand-in narrator
engine/.venv/bin/python engine/toon/audio/build.py _audio_test                # must end with "all checks passed"
engine/.venv/bin/python engine/toon/audio/audition.py                         # measures every event type alone
```

`engine/videos/_audio_test/` is an invented 20 s short (other key, tempo, tune and mood order than the hole short,
effects the hole short does not use). Its JSON files are a small example to copy from; its WAV files are not kept.
`fake_voice.py` refuses to replace an existing `voice.wav` without `--force`: never use it on a real video.

## 8. The library

| file | what it holds |
|---|---|
| `build.py` | the command: validate, render, mix, check, exit code; `--check`, `--list` |
| `project.py` | loads and validates `shots.json`, `score.json`, `voice/`; frames, shots, events, error messages with the valid choices |
| `music.py` | the score engine: tunes, the nine moods, bar fitting, key and tempo, the band's render and silences |
| `sfx.py` | the event vocabulary: type -> sound, options, acoustics of places, dead cuts, the effects stem |
| `sfx_gen.py` | the sound-effect generators (numpy synthesis) |
| `instruments.py` | the synthesized instruments of the score |
| `dsp.py` | filters, noise, reverb impulse responses, BS.1770 loudness and true-peak meters, WAV read/write |
| `mix.py` | ducking, per-section music level, master gain and limiter, the four WAV files, `cues.md` |
| `verify.py` | the checks on the written files, `verify.json`, the verification block of `cues.md` |
| `audition.py`, `fake_voice.py` | tools: measure every effect alone; a stand-in narrator for tests |
