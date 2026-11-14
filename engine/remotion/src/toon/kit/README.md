# Cartoon-short kit: producer's manual

Flat bean-head characters in a painted 3D world with ink outlines (three.js inside Remotion), 1080x1920, 30 fps.
The kit holds the look, the cast, five places, the camera and the effects. A new video is three small files.
Worked example of a whole film: `src/videos/hole-through-earth/` (64.5 s, 21 shots). Smallest working film:
`src/videos/_template/` (5 s, 3 shots).

All paths below are relative to `engine/remotion/`. Run every command from there.

## 1. Making a new video

`<id>` is the folder name in `engine/videos/<id>/`. The picture reads `engine/videos/<id>/shots.json`.

```
cp -r src/videos/_template src/videos/<id>       # then fix the shots.json import path at the top of story.ts
npx tsc --noEmit -p tsconfig.toon.json            # must be clean (kit + every video with an entry.tsx)
node scripts/toon-stills.mjs <id> 30,90 0.5       # single frames -> out/<id>/stills/f30.jpg ...  (16 s + 10 s each)
python3 scripts/toon-sheet.py <id>                # two stills per shot -> out/<id>/sheets/sheet_NN.jpg: LOOK AT THEM
python3 scripts/toon-sheet.py <id> --frames 400,404,408,412   # a move, frame by frame -> sheets/sheet_x01.jpg
python3 scripts/toon-render.py <id> --scale 0.25  # the whole film as a 270x480 proxy -> out/<id>/proxy/video.mp4
python3 scripts/toon-qa.py <id> --proxy           # black / white / frozen frames, pops and near pops; exit 1 on findings
python3 scripts/toon-sheet.py <id> --from-video --frames 400,404,408   # frames cut from the proxy -> sheets/sheet_v01.jpg
python3 scripts/toon-render.py <id> --scale 0.25 --only 4,5   # after a fix: only those shots again, then joined
```

Time (4 cores, a 65 s film of 21 shots): contact sheets 7 minutes, proxy 19 minutes, QA 16 seconds.
The final render is 86 minutes in one job, so it runs in parallel jobs, each rendering its own shots:

```
python3 scripts/toon-render.py <id> --part i/n    # job i of n (prints all n groups with estimated minutes); chunks only
python3 scripts/toon-render.py <id> --concat-only # once the chunks of all jobs are in out/<id>/chunks/ -> out/<id>/video.mp4
python3 scripts/toon-render.py <id>               # or everything in one job
```

Other flags of `toon-render.py`: `--force 3,7` (render again), `--keep` (keep complete chunks although the source
changed), `--no-concat`, `--dry` (print the plan only). A chunk is reused when it is newer than every code file of
`src/videos/<id>/` and `src/toon/kit/` and than `shots.json`. Browser: `$REMOTION_CHROME` if that file exists, else
the shell under `/opt/pw-browsers`, else Remotion's bundled one. WebGL: `$REMOTION_GL` (default `swangle`, software).
`--part i/n` with fewer than n shots leaves some parts empty.

Do not edit `src/toon/kit/`. Everything a video needs is imported from `"../../toon/kit"`.

## 2. shots.json (the contract with the sound)

```json
{ "fps": 30, "total_frames": 150, "flash_at": 118,
  "shots": [ { "id": 1, "a": 0, "b": 60, "place": "garden", "light": "day" }, ... ],
  "xfade": { "3": 8 },
  "events": [ { "f": 34, "type": "pop" }, { "f": 40, "to": 90, "type": "wind_rush" } ] }
```

- `shots`: ids 1, 2, 3 ... in order, frames `a <= f < b`, no gaps. `place` = a kit place (section 4) or one of your
  own. `light` = a preset (section 5); `shaft_hot` reads as `shaft` (first word).
- `xfade`: shot id -> frames of crossfade centred on that shot's first frame. Use it for a change of place or time
  (8 frames). Plain cuts need nothing.
- `flash_at` (optional): a frame or a list of frames where a 4-frame white flash starts.
- `events`: the sound cues (types: `engine/toon/audio/README.md`). `T.at("ding")` gives the frame of the first
  event of that type, `T.at("ding", 1)` the second. Counting breaks silently when an event of that type is added
  or removed earlier in the file, so give every event the picture depends on a name of its own,
  `{"f": 495, "type": "whoosh", "id": "flip1"}`, and ask for it by that name: `T.at("flip1")`. Time every action
  from these, never from typed-in numbers that repeat them. A visible reaction starts 0-3 frames before its event.
- `planned_pops` (optional): frames where the story wants a hard visual jump inside a shot (something bursts on a
  word). The frame checker treats them like the cuts; every other pop it reports has to be fixed.

## 3. The three files of a video

**`story.ts`**: numbers over time. Pure functions of the frame; no `Math.random`, no state (use `hash(i, seed)`).

```ts
import plan from "../../../../videos/<id>/shots.json";
export const T = readShots(plan, { 1: { az: 110 } });       // shots, xfade, flash, at(); optional key light per shot
export const DING = T.at("ding");                            // action frames
export const placeAt = (id, f) => ({ ... });                 // options of the shot's place this frame (section 4)
const CAMS: Record<number, Key[]> = { 1: [{ f: 0, s: (f) => dolly(pos, look, pushK(f, 0, 0.002), { fov: 38 }) }], ... };
export const { camAt } = camRig(CAMS, [[DING, 0.5]]);       // cameras + impact kicks
export const dofAt = dofTable([{ f: 0, cInf: 12, focus: focusOn(GUS_AT, 1.4) }, { f: 60, cInf: 0 }]);
```

**`staging.ts`**: `export const stage = (c: Ctx) => { ... }`, called for every frame. `c.id` shot, `c.f` frame,
`c.shot.place`, `c.cam` (lens position and axes). It calls `put()` for each character and effect helpers.

**`entry.tsx`**: keep it as the template has it. It registers ONE composition with the id `Short`:

```tsx
const Short = makeShort({ total: T.total, shots: T.shots, xfade: T.xfade, flash: T.flash, cam: camAt, dof: dofAt, place: placeAt, stage });
registerRoot(() => <Composition id="Short" component={Short} durationInFrames={T.total} fps={30} width={1080} height={1920} />);
```

During a crossfade the incoming shot is drawn from `a - xfade/2`, and the town samples every camera from `a - 8` to
`b + 8`: `camAt`, `placeAt` and `stage` must work a few frames outside their shot.

## 4. Places

Units are metres, y is up. One place per shot, named in shots.json. Options come from `placeAt(id, f)`.

### garden and park (one town; `TownParams`)

Garden: a fenced lawn (x -6.5..6.5, z -4.6..9.5) with the hole at the origin, house backs to the north, east and
south, open sky to the west. The main view is toward -z (north): lens south of the subject. Park: 60 m away, swing
set on sand ringed by trees and houses; cameras stand south of it and look toward +z.

| Landmark | Value | What |
|---|---|---|
| hole | origin, radius `HOLE_R` 0.62 | bottomless pit with a stone rim |
| `MOUND` | [-1.95, 0, -1.6] | dirt mound, 0.85 high, the shovel stands in it (`SHOVEL_PLANTED`) |
| `FENCE_N`, `FENCE_H` | z -4.6, 1.15 high | the neighbor's fence |
| `NEIGH` | [2.5, 0.3, -5.08] | where someone stands behind that fence (head and shoulders show) |
| `GRILL` | [3.7, 0, -6.6] | kettle grill with smoke |
| `PARK` | [60, 0, 46] | foot of the swing frame (swing pivot 2.88 above) |

Room for characters: the lawn within 4 m of the hole (washing line in the north-east corner, flower beds along the
fences, the mound north-west of the hole).

Options (all optional): `hole: false` (plain lawn), `mound: false`, `shovel: "planted" | "none" | { top, tip }` (hold
it: give the handle top and blade tip per frame), `chair: { pos, yaw }` (deck chair; yaw 0 faces +z; the sitter is a card with
`mode: "chair"` at about `pos`, nudged until a still looks right: the worked example has both), `washing: false`,
`grill: false`, `lawn: [r, g, b]`.

Framings that work (copy the numbers; `k = pushK(f, shotStart, 0.0015)`):

| Shot | Camera |
|---|---|
| wide, hole in front, subject at [-0.85, 0, -0.55] | `dolly([1.0, 2.15, 5.5], [-0.42, 0.74, -0.55], k, { fov: 42 })` |
| establishing over the west fence | `zoom([-9.3, 2.75, 5.4], [-0.6, 0.95, -0.7], 46, k)` |
| medium shot of that subject | `dolly([0.2, 1.45, 2.75], [-0.74, 1.14, -0.5], k, { fov: 38 })`, DOF 12, sun `{ az: 110 }` |
| full shot of someone at [1.8, 0, 0.4] | `dolly([1.15, 1.02, 3.75], [2.0, 0.84, 0.5], k, { fov: 40 })`, DOF 8 |
| the neighbor over his fence | `dolly([1.6, 1.82, -1.1], [2.6, 1.74, -5.08], k, { fov: 40 })`, DOF 12 |
| from inside the hole, straight up | `dolly([0.03, -2.0, 0.27], [0, 2.4, -0.11], k, { fov: 56 })`, sun `{ abs: [0.5, 0.66, 0.56] }` |
| evening two-shot at the hole, looking west | `dolly([4.4, 1.12, -0.6], [0.12, 0.86, 0.48], k, { fov: 44 })`, light `golden`, sun `{ abs: [-0.83, 0.27, 0.49] }`, DOF 9 |
| park swing | `dolly([PARK[0] + 0.1, 1.5, PARK[2] - 8.8], [PARK[0], 1.75, PARK[2]], k, { fov: 40 })`, light `golden`, DOF 7 |

### shaft (`ShaftParams`)

Inside a tunnel through the planet. The subject and the lens ride at the origin; the wall scrolls up. Radius
`SHAFT_R` 3.4. Light preset `shaft`. Options per frame: `heat` 0 crust (brown), 1 mantle (red), 2 core (white-yellow);
`scroll` metres of wall passed so far (continuous inside a shot; add `id * 37` so shots differ); `speed` m per frame
(0.75 calm, 1.5 fast, 3 very fast). See `shaftHeat / shaftScroll / shaftSpeed` in the worked example.

Characters: `put(c, GUS, { ...flail(f), expr: "shock" }, [0, 0, 0], { face: true, roll: 0.1 })` and
`speedLines(c, 12, 1.5, 1, heat)`. Cameras: `dolly([0.55, 0.42, 2.95], [0.18, 0.1, 0], k, { fov: 46, roll: 0.05 })`;
face close-up `dolly([0.2, 0.74, 1.42], [0, 0.63, 0], k, { fov: 38 })` with DOF 13; down the tunnel
`{ pos: [0.5, 1.9, 1.35], look: [0.05, -40, -0.1], fov: 56 }`.

### earth (`EarthParams`)

The Earth cut in half, floating in space, globe radius `EARTH_R` 5 at the origin; a tunnel runs through the centre.
Light preset `space`. `earthPoint(s, lift, side)` = world position of tunnel point `s` (-1 garden on top, 0 centre,
+1 far side), `lift` metres toward the lens (use 0.8 for cards), `side` metres right of the tunnel. Cards on it are
rotated by `EARTH_ROLL`. Options: `tunnel` 0..1 (how far it is dug), `pulse` (core glow, 1 normal), `pipe` 0..1 (the
far rim). Cameras: whole globe `dolly([0.4, 0.5, 34.2], [0.2, -0.1, 0], k, { fov: 31 })`; closer
`dolly([0.4, 0.3, 17.5], [0, 0, 0], k, { fov: 30 })`. Markers: `earthMini()`, `arrow()`, `targetRing()`, `sparkle()`
with sizes of 1.5-3 m.

### ocean (`OceanParams`)

Open sea, water at y 0. A steel pipe stands at the origin (rim `PIPE_H` 0.95 over the water, bore `PIPE_R` 0.62);
a rowboat with a lantern at `BOAT` [1.45, 0, 0.5]; `FISHER_SEAT` [1.74, -0.15, -0.03] is the card base of someone
sitting in it (`mode: "chair"`, add `0.025 * Math.sin(f * 0.07)` to y: the boat bobs). Made for light `night` (moon
low in the north, behind the pipe as seen from +z). Options: `pipe: false`, `boat: false`. Someone rising out of
the pipe: `put(c, GUS, pose, [0, y, 0], { wide: true })` with y from `PIPE_H - 1.78` (hidden) to `PIPE_H + 0.5`.
Cameras: wide `dolly([0.45, 1.35, 8.7], [0.86, 1.35, 0.2], k, { fov: 42 })`; two-shot
`dolly([0.7, 1.98, 6.8], [0.82, 1.9, 0.2], k, { fov: 42 })` with DOF 9.

## 5. Light presets

`day`, `golden` (low sun, long shadows, sun disc), `night` (moon, stars), `space`, `shaft`. Each sets sky, fog, key
light, shading and colour grade.

| Place | Lights that work |
|---|---|
| garden | `day`; `night` (blue, readable); `golden` only when the lens looks west (any other way the set lies in blue shadow) |
| park | `golden`, `day`, `night` |
| ocean | `night`, `day`, `golden` (sunset over the sea) |
| earth | `space` |
| shaft | `shaft` |

Key light per shot: `readShots(plan, { id: { az, el } })` is relative to the camera (az 0 = behind the subject,
90 = from screen right, 180 = from behind the lens) or `{ abs: [x, y, z] }` a world direction toward the sun. Rule:
character shots by day want `az: 105-118` (over the lens's right shoulder). Golden shots want the lens looking toward
the low sun with open sky behind the subject.

## 6. Cast

`put(c, LOOK, pose, [x, y, z], opts)` places a character standing with its soles at that point, facing the lens.
It returns `{ A, at }`: `g.at(g.A.propR)` is the world position of the right hand's prop; anchors are `L`, `R`
(hands), `propL`, `propR`, `mouth`, `head`, `top`. A card is 2.16 m tall; eyes sit about 1.4 m above the soles.

Looks: `GUS` (striped pyjamas, glass fishbowl helmet), `WIFE` (green dress, apron, bun), `NEIGHBOR` (stout, bald,
moustache, Hawaiian shirt), `FISHER` (yellow oilskin, sou'wester, grey beard). The park pair (kid on the swing and
the adult who pushes) comes from `swingScene(c, pendulum(f, firstPushFrame))`.

Pose fields:

- `mode`: `"stand"` (default), `"chair"` (seated on something), `"sit"`, `"air"` (falling or jumping: give
  `legs: [[x, y], [x, y]]` or spread `...flail(f)`).
- `expr`: `neutral stern smile smile_closed grin laugh relief relief_open wow shock jawdrop nervous sad pained dazed
  asleep whistle lick bite chew flap`. Speaking: `expr: talk(f)` while the line runs. `chew` and `flap` animate with
  `chew: phase` / `flap: phase` (0..1 repeating).
- `facing` -1 / 0 / 1 (head turned to screen left / front / right), `look` -1..1 (eyes), `blink: lidAt(f, n)` (n = any
  number per character; `lidAt(f, n, [frames])` blinks across an expression change so it does not pop).
- `tilt` (body lean, degrees), `headTilt`, `squash` 0..1 (crouch before a jump).
- `L`, `R`: arms. `L` is the arm on screen left. `{ h: [x, y], bend, front, hand, prop, arg }`: `h` = the hand from
  the shoulder in head heights, x outward, y down. Hanging `HANG` [0.17, 0.92]; on the hip `HIP`; wave
  [0.62, -0.6] bend -0.25; both up [0.62, -0.5]; point outward [0.86, 0.22] with `hand: "point"`; hand to the ear
  [0.3, -0.64] bend -0.42; holding something up [0.52, -0.18]; thumbs-up [0.36, 0.12] bend -0.3 with
  `hand: "thumb"`. `front: true` draws the arm over the body. Move an arm with `armMix(a, b, sm(f, f0, f1))`.
  `reach(c, pos, side, worldPoint)` gives the `h` that puts the hand on a point in the world.
- Hand props (`prop`, `arg`): `clipboard`; `thermo` (arg 0..1 level, 2 popped); `pan` (arg = flick angle);
  `fork` with a sausage (0 raw, 1 burning, 2 burnt); `plate` with a sandwich (1 = bitten); `timer` (arg = dial
  degrees). Gus only: `acc` 0..1 tips the helmet back like a lid (needs `tall: true`).

`put` options: `scale`, `mirror`, `face: true` + `roll` (card faces the lens fully and can tumble: falling),
`wide: true` (an arm or prop reaches more than 0.6 m sideways), `tall: true` (something rises above the head),
`noBlob` (no ground shadow: in a hole, behind a fence, in a boat), `blob: 0.5`.

Every change of pose must be eased over 4-8 frames (`sm`, `armMix`, `lin`). A value that jumps in one frame shows
up as a pop in the QA.

## 7. Camera and depth of field

- `dolly(pos, look, k, { fov, roll })`: the lens at `pos` looking at `look`, slid toward it by factor `k`.
  `zoom(pos, look, fov, k)`: same push with the lens fixed (when it stands next to a wall).
- `pushK(f, f0, rate, punch, n, p0)`: every hold creeps in, rate 0.001-0.0035 per frame. `punch` 0.004-0.007 for
  `n` frames from `p0` gives a push on a punch word.
- Keys per shot: the first key is the framing at the shot's start; a later key `{ f, dur, s }` glides there over
  `dur` frames (18-40), centred on the beat at `f + dur / 2`. `cut: true` jumps. Reframe more than half a frame
  width only with a cut. Two shots can share one key list (`CAMS[5] = CAMS[6]`) for an invisible shot change.
- `camRig(CAMS, [[frame, strength]])`: kicks shake the image for 7 frames (0.5 light, 1.4 hard).
- `dofTable([{ f, cInf, focus }])`: `cInf` = background blur: 0 sharp (wides, shaft, earth), 7-9 two-shots, 12-13
  medium shots and close-ups. `focus: focusOn(point, dy)`; without it the focus is the camera's look point. An entry
  with `dur` ramps with the camera glide that shares its `f` and `dur`.

## 8. Effects (one call each inside `stage`)

| Call | What |
|---|---|
| `sparkle(c, pos, f0, n, size)` | four-point glint, n frames |
| `question(c, pos, f0, h)` | big question mark, pops in and stays |
| `arrow(c, pos, h, rot, f0, colour)` | chunky arrow; rot 0 points down the screen, `Math.PI` up |
| `burst(c, pos, f0, n, size, colour)` | impact star |
| `puff(c, pos, f0, n, size)` | dust puff |
| `popDashes(c, rimCentre, f0, w)` | dashes when someone shoots out of a hole or pipe |
| `splash(c, pos, f0, n, size)` | water crown |
| `ripples(c, pos, w, d)` | rings on water, looping |
| `targetRing(c, pos, size)` | pulsing ring facing the lens |
| `flame(c, base, f0, f1)` / `soot(c, pos, f0)` | fire that poofs up and burns (f1 0 = keeps burning) / dark smoke |
| `speedLines(c, n, len, fade, heat)` | streaks rushing up past a falling subject at the origin |
| `birds(c, framesSinceStart)` / `cloud(c, pos, w)` | three birds crossing a day sky / one cloud card |
| `sleepBubble(c, nosePos)` / `dizzyStars(c, headTop)` / `note(c, pos, f0)` | |
| `earthMini(c, s, size, arms, expr, trail, true)` | tiny Gus in the Earth cutaway's tunnel |
| `popIn(f, f0)` | scale 0 -> 1.25 -> 1 for anything that appears on a beat |
| flash | `flash_at` in shots.json |

Positions next to a character come from its anchors: `sparkle(c, add(g.at(g.A.L, 0.06), [0, 0.16, 0]), DING)`.
`behind(c, p, 0.15)` moves a point away from the lens so a card sits behind a character.

## 9. Adding your own, inside `src/videos/<id>/`

- **2D effect or loose prop** (a feather, a pancake, a bullet): `fx(c, "key", canvasW, canvasH, (p) => { ...Pen
  drawing... }, pos, widthMetres, heightMetres, { rot, flat, soft, gain })`. The key names the drawing; put every
  number that changes the drawing into the key, rounded with `q(v, steps)`. Pen: `poly ell stroke arc dot line clip
  band` with ink outlines (`ol` = outline width). Examples: `fxFeather`, `fxPancake` in `kit/people.ts`.
- **Hand prop**: `PROPS.torch = (p, hx, hy, side, u, arg) => { ...draw around the hand...; return [tipX, tipY]; }`,
  then `R: { h: [...], prop: "torch", front: true }`.
- **Cast member**: a `Look` object (colours plus optional painters for hair, hat, beard, clothes), copied from `WIFE`
  or `FISHER` in `kit/people.ts`. Give it a new `id` and `seed`. `build: "stout"` or `"kid"` changes proportions.
- **3D prop in a kit place**: `dress: (place, group) => { if (place === "town") group.add(mesh); }` in the story
  object; return a function to move it every frame. Materials: `build.lam("name", () => ({ color }))` (two-tone
  shaded, takes ink lines). Set `castShadow` and `receiveShadow`.
- **Place**: `places: { cave: (kit, rays) => ({ group, shadows: true, pose(c) { ... } }) }` in the story object,
  then use `"cave"` in shots.json. `sky: false` hides the sky (interiors). Keep it simple: a ground plane, a few
  `build.boxGeo` / three.js primitives with `build.lam` materials. Model: `kit/places/ocean.ts` (160 lines).

## 10. Cost (software WebGL, 4 vCPU, 4 browser tabs)

Seconds per frame at 1080x1920, start-up of a chunk included (about 30 s per chunk):

| Place | Sharp | With depth of field |
|---|---|---|
| earth | 1.45-1.7 | |
| ocean | 1.75 | 3.2 |
| shaft | 2.0-2.5 | 2.7 |
| garden | 2.5 | 3.8-4.4 |
| park | | 3.65 |

Depth of field costs about half as much again as the whole rest of the frame (the lens blur is 43 % of such a frame).
Use it for medium shots and close-ups, not for wides. The hole short (1935 frames) took 86 minutes in one job;
`--part i/6` gives six jobs of 13-16 minutes. A still takes 5-11 s plus 16 s for the bundle.

Proxy (`--scale 0.25`): 19 minutes for the same film; 0.35-0.6 s per frame in the shaft, on the earth and the ocean,
0.7-1.3 s in the garden and the park (their geometry does not shrink with the picture). Card drawings and bloom are
rendered smaller too; colours stay within 2 % of the final. The frame checker reads a proxy almost like the final
(same curve; scores about 6 % lower, thin effects up to 40 % lower), which is why `toon-qa.py --proxy` also fails on
near pops from 0.8. The final film is checked again at full size by `toon/finish.py`.

## 11. Traps (each one cost a render)

1. **Timeout with four tabs.** Four tabs building the garden at once need more than Remotion's default 30 s.
   `toon-render.py` passes `--timeout=180000`; keep it if you call Remotion yourself.
2. **Post chain patch.** `kit/Short.tsx` holds every frame until the post passes exist and then draws once more.
   Without it the first frame of every still, chunk and crossfade layer comes out without ink, blur and grade. Never
   remove it and never draw outside the kit's shell.
3. **Tiny characters.** A card is 2.16 m tall. In a character shot the head must be at least a sixth of the frame
   height: lens 2.7-3.8 m from the subject at fov 38-40. At 6 m the head is a tenth and the face is gone on a
   phone. Use wides only to establish.
4. **A hole that reads as shallow.** A visible floor or a lit wall makes a pit look 1 m deep. The kit's hole has no
   visible floor and fades to black; do the same in your own pits and keep bright things out of them.
5. **Muddy dusk.** `golden` front-lit (sun behind the lens) turns everything orange-brown, and a set ringed by houses
   lies in shadow. Look toward the low sun, keep open sky behind the subject (the garden is open to the west), use
   the sun directions of section 4. Do not tune grades or light colours per video.
6. **QA pops.** `toon-qa.py` flags any frame that changes far more than its neighbours, except shot starts,
   crossfades and flashes from shots.json. Causes met so far: a head or eye direction that snaps in one frame; a
   prop that vanishes for a frame or changes hands; a body that drops out of a close shot in under 8 frames (start
   the fall slowly: 1.25 cm x frames squared passed); an effect that appears at full size (use `popIn`); an
   expression change without a blink over it; a cut that is not a shot boundary in shots.json.
7. **Clipped cards.** Arms, props and lifted things outside the 600-unit card are cut off: `wide: true`,
   `tall: true`.
8. **Things crossing faces.** Cards are flat and face the lens. A flying prop whose path crosses a face reads as part
   of the face; a post or line right behind a head reads as an antenna. Check the action frame of every shot on the
   contact sheet.
9. **Cards inside geometry.** A card placed on a surface sinks into it: lift it toward the lens (`earthPoint(s, 0.8)`,
   `g.at(anchor, 0.05)`).
10. **Judge the look on stills, the motion on the proxy.** Stills are always rendered at full size and scaled
    down, so they show the final picture. The proxy is rendered small: softer lines, coarser cards. Never judge
    line quality or small props on it.
11. **Determinism.** Each frame is rendered in its own browser tab in any order. Anything that depends on the
    previous frame, on time or on `Math.random` flickers in the film.
12. **Flat things on the ground.** A mesh lying a few millimetres above another surface gets a dashed ink line
    along its edge. For a puddle, a rug or a stain use a flat effect card (`fx(..., { flat: true })`) or put the
    mesh on the no-ink layer (`mesh.layers.set(NOINK)`).
