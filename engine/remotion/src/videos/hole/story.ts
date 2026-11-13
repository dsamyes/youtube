// Timeline of "What If You Jumped Into a Hole Through the Earth?" (64.5 s, 1935 f at 30 fps).
// Shot boundaries, crossfades, the flash frame and every action frame come from
// engine/videos/hole-through-earth/shots.json (LOCKED: the sound is built from the same file).
// Camera grammar is the template's (cartoon-3d-short): smootherstep glides of 18-40 f, every hold creeps in,
// hard cuts only on big jumps, impact kicks flip sign every frame and decay over 7 f, no hand-held float.
// Everything here is a pure function of the frame number.
export const FPS = 30;
export const TOTAL = 1935;
export const D0 = 0; // ground level of the town (garden + park)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** piecewise-linear table lookup */
export const lin = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};
/** deterministic hash in [0, 1) */
export const hash = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

// ---------------- shots ----------------
export type Place = "shaft" | "garden" | "earth" | "park" | "ocean";
export type Light = "day" | "golden" | "night" | "space" | "shaft";
export type ShotDef = { id: number; a: number; b: number; place: Place; light: Light };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 118, place: "shaft", light: "shaft" },      // hook: falling, tilt down the endless tunnel
  { id: 2, a: 118, b: 229, place: "garden", light: "day" },     // Sunday morning, the hole, the shovel
  { id: 3, a: 229, b: 264, place: "earth", light: "space" },    // straight through the planet
  { id: 4, a: 264, b: 319, place: "garden", light: "day" },     // neighbor: burn to a crisp
  { id: 5, a: 319, b: 393, place: "garden", light: "day" },     // wife: splat
  { id: 6, a: 393, b: 448, place: "garden", light: "day" },     // did the math, jumps
  { id: 7, a: 448, b: 537, place: "shaft", light: "shaft" },    // no air: the feather
  { id: 8, a: 537, b: 598, place: "shaft", light: "shaft" },    // outrunning a bullet
  { id: 9, a: 598, b: 654, place: "shaft", light: "shaft" },    // mantle, cheeks flap
  { id: 10, a: 654, b: 685, place: "earth", light: "space" },   // insert: through the core
  { id: 11, a: 685, b: 743, place: "shaft", light: "shaft" },   // close-up, 22,000 mph
  { id: 12, a: 743, b: 861, place: "shaft", light: "shaft" },   // thermometer, thumbs-up
  { id: 13, a: 861, b: 915, place: "garden", light: "day" },    // but wait: listening for the splat
  { id: 14, a: 915, b: 1123, place: "earth", light: "space" },  // explanation: the arrow flips
  { id: 15, a: 1123, b: 1268, place: "park", light: "golden" }, // the swing
  { id: 16, a: 1268, b: 1465, place: "ocean", light: "night" }, // pops up, stops
  { id: 17, a: 1465, b: 1537, place: "ocean", light: "night" }, // luckily
  { id: 18, a: 1537, b: 1614, place: "ocean", light: "night" }, // unluckily
  { id: 19, a: 1614, b: 1707, place: "shaft", light: "shaft" }, // down he goes again (time-lapse)
  { id: 20, a: 1707, b: 1753, place: "garden", light: "golden" }, // back in his own garden
  { id: 21, a: 1753, b: TOTAL, place: "garden", light: "golden" }, // payoff
];
/** crossfades (frames) at place/time changes; a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = { 14: 8, 15: 8, 16: 8, 20: 8 };
export const FLASH_AT = 118;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** layers to draw at frame f: base shot, plus the next shot fading in during a crossfade */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- the garden (town place, ground y = 0, main cameras look toward -z = north) ----------------
export const HOLE_R = 0.62;
export const MOUND: V3 = [-1.95, 0, -1.6];       // dirt mound centre (radius 1.1, height 0.85)
export const GUS_STAND: V3 = [-0.85, 0, -0.55];  // where Gus stands by the hole (shots 2, 6)
export const FENCE_N = -4.6;                      // the neighbor's fence (z), 1.15 m high
export const FENCE_H = 1.15;
export const NEIGH: V3 = [2.5, 0.3, -5.08];      // neighbor behind the fence, on his log pile (right of the hole: never behind Gus's head)
export const GRILL: V3 = [3.7, 0, -6.6];
export const WIFE5: V3 = [1.8, 0, 0.4];        // wife with the pan (shot 5)
export const PANCAKE_AT: V3 = [2.16, 0.02, 1.5]; // on the pan's side of her: the arc never crosses her face // where the pancake lands
export const CHAIR: V3 = [-1.04, 0, 0.42];       // deck chair by the hole (shots 20-21)
export const PARK: V3 = [60, 0, 46];             // swing pivot base

/** shovel (shot 2): 0 = held upright beside Gus, 1 = planted in the mound; the thrust lands on f181 */
export const SHOVEL_HIT = 181;
export const shovelK = (f: number) => (f < 172 ? 0 : f < 177 ? -0.35 * smooth((f - 172) / 5) : f < SHOVEL_HIT ? -0.35 + 1.35 * ((f - 177) / 4) ** 2 : 1);

/** Gus's hop into the hole (shot 6): crouch 424-429, leaves the ground on f429, in the hole from ~f438 */
export const HOP = 429;
export const hopAt = (f: number): { x: number; y: number; z: number; squash: number; air: boolean } => {
  const [x0, , z0] = GUS_STAND;
  if (f < HOP) return { x: x0, y: 0, z: z0, squash: f < 423 ? 0 : smooth((f - 423) / 5), air: false };
  const u = clamp01((f - HOP) / 9); // 9 frames to the middle of the hole
  const x = x0 + (0 - x0) * u, z = z0 + (0 - z0) * u;
  const n = f - HOP, y = n <= 9 ? 0.62 * Math.sin(Math.PI * Math.min(1, n / 11)) : 0.62 * Math.sin((Math.PI * 9) / 11) - 0.045 * (n - 9) ** 2.1;
  return { x, y, z, squash: 0, air: true };
};

/** height of Gus's soles over the lawn in the evening garden (shots 20-21): pops, hangs for one second, drops */
export const POP1 = 1711, HANG1 = 1737, DROP1 = 1766, POP2 = 1834, BITE = 1855, DROP2 = 1877;
export const HANG_Y = -0.34; // he stops with his shins still in the hole
const DEEP = -2.3;
const popUp = (f: number, f0: number, n: number) => DEEP + (HANG_Y - DEEP) * (1 - (1 - clamp01((f - f0) / n)) ** 2.4);
const dropDown = (f: number, f0: number) => HANG_Y - 0.02 * Math.max(0, f - f0) ** 2.2;
export const gardenGusY = (f: number) =>
  f < DROP1 ? popUp(f, POP1 - 3, HANG1 - POP1 + 3) : f < POP2 - 3 ? dropDown(f, DROP1) : f < DROP2 ? popUp(f, POP2 - 3, 17) : dropDown(f, DROP2);

// ---------------- the ocean (water y = 0, pipe at the origin) ----------------
export const PIPE_H = 0.95;                 // rim height over the water
export const BOAT: V3 = [1.45, 0, 0.35];    // rowboat centre (bow toward the lens)
export const FISHER: V3 = [1.45, 0.06, 0.3];  // fisherman's seat (card base)
export const POP_SEA = 1342, STOP_SEA = 1442, SINK_SEA = 1560, GONE_SEA = 1598;
export const SEA_TOP = 0.5;                 // soles over the rim when he hangs
/** height of Gus's soles over the WATER (shots 16-18) */
export const seaGusY = (f: number) => {
  if (f < SINK_SEA) { const u = clamp01((f - (POP_SEA - 1)) / (STOP_SEA - POP_SEA + 1)); return PIPE_H - 1.78 + (1.78 + SEA_TOP) * (1 - (1 - u) ** 3); }
  return PIPE_H + SEA_TOP - 2.95 * ((f - SINK_SEA) / 46) ** 3.2;
};

// ---------------- the park swing (shot 15) ----------------
// One time-warped pendulum so the three sound events line up: the push on f1126 (back end of the arc), fastest through
// the bottom on f1215 ("going down"), dead stop at the top of the arc on f1258 ("back up"), then it hangs.
export const PUSHES = [1126, 1197];
const TH_RATE = (2.5 * Math.PI) / (1215 - 1126);
/** swing phase: 0 = back end (push), PI/2 = bottom going forward, PI = front end, ... */
export const swingTheta = (f: number) => {
  if (f <= 1215) return (f - 1126) * TH_RATE;
  const t = Math.min(f - 1215, 43), r0 = Math.PI / 43;
  return 2.5 * Math.PI + r0 * t - (r0 * t * t) / (2 * 43);
};
/** amplitude in degrees: grows with each push */
export const swingAmp = (f: number) => 13 + 13 * smooth((f - PUSHES[0]) / 9) + 11 * smooth((f - PUSHES[1]) / 9);
export const swingAngle = (f: number) => -((swingAmp(f) * Math.PI) / 180) * Math.cos(swingTheta(f));

// ---------------- the Earth cutaway (globe radius EARTH_R at the origin, cut face toward the camera) ----------------
export const EARTH_R = 5;
export const EARTH_YAW = -0.6, EARTH_ROLL = 0.16; // the cut face is turned so a crescent of the surface shows
export const LAYERS = { crust: 0.965, mantle: 0.55, outer: 0.2 }; // outer radius of mantle / outer core / inner core (x EARTH_R)
/** world position of the tunnel point s (-1 = the garden, 0 = the centre, +1 = the far side), `lift` m off the cut face */
export const earthPoint = (s: number, lift = 0, side = 0): V3 => {
  // local: tunnel along -y, face normal +z, `side` along +x
  const lx = side, ly = -s * EARTH_R, lz = lift;
  const cy = Math.cos(EARTH_YAW), sy = Math.sin(EARTH_YAW), cr = Math.cos(EARTH_ROLL), sr = Math.sin(EARTH_ROLL);
  const x1 = lx * cy + lz * sy, z1 = -lx * sy + lz * cy; // yaw about y
  return [x1 * cr - ly * sr, x1 * sr + ly * cr, z1];      // roll about z
};
/** shot 3: how far the tunnel has punched through (0..1), flag pop 0..1 */
export const TUNNEL_DONE = 245, FLAG_POP = 247;
export const tunnelK = (f: number) => (f < 229 ? 1 : f >= 264 ? 1 : clamp01((f - 232) / (TUNNEL_DONE - 232)) ** 1.6);
/** where Gus is in the tunnel: s in -1..1 */
export const ARROW_POP = 950, PASS = 1022;
export const earthGusS = (id: number, f: number) => {
  if (id === 10) return -0.4 + 0.8 * ((f - 654) / 27); // streak through the core, centre on ~f667
  if (id === 14) {
    const ph = f <= PASS ? lerp(0.5, Math.PI / 2, clamp01((f - 915) / (PASS - 915))) : lerp(Math.PI / 2, Math.PI - 0.1, clamp01((f - PASS) / (1118 - PASS)));
    return -Math.cos(ph) * 0.93;
  }
  return -2;
};

// ---------------- the shaft (Gus rides at the origin, the walls scroll) ----------------
export const SHAFT_R = 3.4;
/** depth look: 0 = brown crust, 1 = red/orange mantle, 2 = white-yellow core */
export const shaftHeat = (id: number, f: number) => {
  switch (id) {
    case 1: return 1.12;
    case 7: case 8: return 0;
    case 9: return lin([[598, 0.55], [622, 1.0], [654, 1.5]], f);
    case 11: case 12: return 2;
    case 19: return lin([[1614, 0.9], [1640, 1.9], [1662, 2], [1684, 1.0], [1700, 0.1], [1707, 0]], f);
    default: return 0;
  }
};
/** wall speed in m per frame and the distance scrolled so far (the camera rides with Gus) */
const SPEEDS: Record<number, [number, number]> = { 1: [1.5, 1.9], 7: [0.75, 0.95], 8: [1.05, 1.15], 9: [1.5, 2.5], 11: [2.9, 3.0], 12: [3.0, 3.0], 19: [2.9, 2.9] };
export const shaftSpeed = (id: number, f: number) => {
  const sp = SPEEDS[id]; if (!sp) return 0;
  const s = SHOTS[id - 1];
  return lerp(sp[0], sp[1], clamp01((f - s.a) / (s.b - s.a)));
};
export const shaftScroll = (id: number, f: number) => {
  const sp = SPEEDS[id]; if (!sp) return 0;
  const s = SHOTS[id - 1], T = s.b - s.a, t = Math.max(0, f - s.a);
  return id * 37.3 + sp[0] * t + ((sp[1] - sp[0]) * t * t) / (2 * T);
};
/** hook: from f96 Gus outruns the camera and drops away down the tunnel (metres below the camera's ride height) */
export const hookDrop = (f: number) => (f < 90 ? 0 : 0.022 * (f - 90) ** 2.3);

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
/** reference camera ease: symmetric smootherstep (attack = release, ~10 f each on a 23 f move) */
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (with 8 f soft edges) for the first n frames */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35, p0 = f0) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) { const y = Math.max(0, f - p0); for (let i = 0; i < Math.min(y, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8)); }
  return Math.exp(-s);
};
/** dolly push: camera slides toward the look point by factor k */
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** zoom push (camera stays put): tan(fov/2) shrinks by k */
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// ---- shot 1 (hook): falling with Gus -> tilt down past him into the endless glowing tunnel ----
const S1a = (f: number) => dolly([1.0, 0.75, 3.05], [0, 0.12, 0], pushK(f, 0, 0.002), { fov: 50, roll: -0.07 });
const S1b = (f: number) => dolly([-0.75, 0.55, 2.55], [0, 0.2, 0], pushK(f, 40, 0.002), { fov: 46, roll: 0.06 });
const S1c = (f: number): Shot => ({ pos: [0.5, 1.9, 1.35], look: [0.05, -40, -0.1], fov: 56 - 0.05 * Math.max(0, f - 96), roll: 0.02 });
// ---- shot 2: over the west fence into the garden, then the hero framing: hole in front, Gus, the mound behind ----
const G2L: V3 = [-0.42, 0.74, -0.55];
const S2a = (f: number) => zoom([-9.3, 2.75, 5.4], [-0.6, 0.95, -0.7], 46, pushK(f, 118, 0.0015));
const S2b = (f: number) => dolly([1.0, 2.15, 5.5], G2L, pushK(f, 150, 0.001, 0.004, 26, 176), { fov: 42 });
// ---- shot 3: the Earth cutaway ----
const S3a = (f: number) => dolly([0.6, 0.8, 36.5], [0, -0.15, 0], pushK(f, 229, 0.0022), { fov: 31, roll: -0.03 });
const S3b = (f: number) => dolly([0.9, -3.2, 27], [0.75, -3.4, 0], pushK(f, 240, 0.002), { fov: 31, roll: 0.02 }); // down to the far side for the flag
// ---- shot 4: the neighbor over the fence ----
const N_EYE: V3 = [NEIGH[0], NEIGH[1] + 1.42, NEIGH[2]];
const S4a = (f: number) => dolly([1.6, 1.82, -1.1], add(N_EYE, [0.1, 0.02, 0]), pushK(f, 264, 0.0022, 0.006, 26, 281), { fov: 40, roll: 0.035 });
// ---- shot 5: the wife and the pancake ----
const S5a = (f: number) => dolly([0.8, 1.5, 4.3], [1.98, 0.8, 0.7], pushK(f, 319, 0.0018), { fov: 40 });
const S5b = (f: number) => dolly([1.0, 1.42, 4.15], [2.06, 0.7, 0.85], pushK(f, 345, 0.0012), { fov: 38, roll: -0.035 });
// ---- shot 6: the clipboard, the salute, the hop; the lens tilts down into the hole after him ----
const S6a = (f: number) => dolly([0.2, 1.45, 2.75], [-0.74, 1.14, -0.5], pushK(f, 393, 0.002), { fov: 38 });
const S6b = (f: number): Shot => { // rides up with the hop, then tips into the hole after him
  const h = hopAt(f), k = smooth((f - 436) / 10), ly = lerp(Math.max(0.2, h.y + 0.95), -0.3, k);
  return dolly([0.6, 2.55, 3.0], [lerp(h.x, 0, k) * 0.7, ly, lerp(h.z, 0.05, k)], pushK(f, 426, 0.002), { fov: 44, roll: 0.04 });
};
// ---- shot 7: crust, the feather ----
const S7a = (f: number) => dolly([0.55, 0.42, 2.95], [0.18, 0.1, 0], pushK(f, 448, 0.0016), { fov: 46, roll: 0.05 });
const S7b = (f: number) => dolly([0.42, 0.62, 2.95], [0.2, 0.45, 0], pushK(f, 496, 0.0014), { fov: 44, roll: 0.02 });
// ---- shot 8: the bullet ----
const S8a = (f: number) => dolly([-0.5, 0.2, 3.0], [0.3, 0.12, 0], pushK(f, 537, 0.0018), { fov: 46, roll: -0.05 });
// ---- shot 9: mantle ----
const S9a = (f: number) => dolly([0.5, -0.5, 2.9], [0, 0.08, 0], pushK(f, 598, 0.002, 0.007, 21, 630), { fov: 48, roll: 0.07 });
// ---- shot 10: through the core (insert) ----
const S10a = (f: number) => dolly([0.4, 0.3, 17.5], [0, 0, 0], pushK(f, 654, 0.003), { fov: 30, roll: 0.05 });
// ---- shot 11: face close-up ----
const S11a = (f: number) => dolly([0.2, 0.74, 1.42], [0, 0.63, 0], pushK(f, 685, 0.0022, 0.007, 16, 724), { fov: 38, roll: -0.045 });
// ---- shot 12: the thermometer, the thumbs-up ----
const S12a = (f: number) => dolly([0.3, 0.35, 2.65], [0.22, 0.2, 0], pushK(f, 743, 0.0015, 0.005, 22, 790), { fov: 42, roll: 0.03 });
const S12b = (f: number) => dolly([0.0, 0.4, 2.2], [-0.02, 0.32, 0], pushK(f, 820, 0.0018), { fov: 40, roll: -0.03 });
// ---- shot 13: listening over the hole ----
const S13a = (f: number) => dolly([0.08, 0.72, 5.5], [0, 0.98, -0.1], pushK(f, 861, 0.0016, 0.004, 20, 893), { fov: 44 });
// ---- shot 14: the explanation ----
const S14a = (f: number) => dolly([0.4, 0.5, 36], [0.15, -0.1, 0], pushK(f, 911, 0.0009), { fov: 31, roll: -0.02 });
// ---- shot 15: the park swing (the template's two framings) ----
const S15a = (f: number) => dolly([PARK[0] + 0.1, 1.5, PARK[2] - 8.8], [PARK[0] + 0.0, 1.75, PARK[2]], pushK(f, 1119, 0.001), { fov: 40 });
const S15b = (f: number) => dolly([PARK[0] - 1.3, 1.9, PARK[2] - 10.4], [PARK[0] - 0.1, 1.95, PARK[2]], pushK(f, 1186, 0.0009, 0.004, 28, 1236), { fov: 42 });
// ---- shot 16: night ocean; the lens tilts up with Gus as he rises ----
const seaLook = (f: number): V3 => { const y = seaGusY(Math.min(f, STOP_SEA)); return [0.7, 1.35 + 0.4 * smooth((y - PIPE_H + 1.2) / (SEA_TOP + 1.2)), 0.2]; };
const S16a = (f: number) => dolly([0.3, 1.35, 8.7], [0.72, 1.35, 0.2], pushK(f, 1264, 0.0011), { fov: 42 });
const S16b = (f: number) => dolly([0.3, 1.3, 7.7], seaLook(f), pushK(f, 1342, 0.0006), { fov: 44, roll: -0.03 });
// ---- shots 17-18: the two-shot (one camera, closer on "Unluckily") ----
const TWO: V3 = [0.76, 1.92, 0.2];
const S17a = (f: number) => dolly([0.55, 1.98, 6.25], TWO, pushK(f, 1465, 0.0006), { fov: 42, roll: 0.03 });
const S18a = (f: number) => dolly([0.95, 1.72, 5.95], [0.8, 1.72, 0.2], pushK(f, 1532, 0.0005), { fov: 42, roll: -0.035 });
// ---- shot 19: the way back (mirrored framing) ----
const S19a = (f: number) => dolly([-0.6, 0.5, 2.9], [-0.1, 0.1, 0], pushK(f, 1614, 0.0016), { fov: 46, roll: -0.06 });
// ---- shots 20-21: the evening garden ----
const E_L: V3 = [-0.52, 0.8, 0.1];
const S20a = (f: number) => dolly([-0.5, 1.25, 5.45], E_L, pushK(f, 1703, 0.0012), { fov: 44 });
const S21a = (f: number) => dolly([-0.56, 1.2, 5.1], [-0.54, 0.82, 0.1], pushK(f, 1753, 0.0006), { fov: 44 });
const S21b = (f: number) => dolly([1.8, 1.86, -0.9], add(N_EYE, [0.1, 0.0, 0]), pushK(f, 1884, 0.0016, 0.005, 18, 1903), { fov: 40, roll: -0.03 });

const CAMS: Record<number, Key[]> = {
  1: [
    { f: 0, s: S1a },
    { f: 40, dur: 30, s: S1b },   // centred on 55 ("of the Earth")
    { f: 92, dur: 22, s: S1c },   // "hit the bottom": tilt down the tunnel (whoosh at 103)
  ],
  2: [
    { f: 118, s: S2a },
    { f: 130, dur: 40, s: S2b },  // crane over the fence, centred on 150
  ],
  3: [{ f: 229, s: S3a }, { f: 234, dur: 18, s: S3b }], // centred on 243, lands as the flag pops
  4: [{ f: 264, s: S4a }],
  5: [
    { f: 319, s: S5a },
    { f: 340, dur: 20, s: S5b },  // centred on 350 (the splat)
  ],
  6: [
    { f: 393, s: S6a },
    { f: 424, dur: 14, s: S6b },  // up with the hop, then down after him
  ],
  7: [
    { f: 448, s: S7a },
    { f: 486, dur: 26, s: S7b },  // closer for the feather, centred on 499
  ],
  8: [{ f: 537, s: S8a }],
  9: [{ f: 598, s: S9a }],
  10: [{ f: 654, s: S10a }],
  11: [{ f: 685, s: S11a }],
  12: [
    { f: 743, s: S12a },
    { f: 812, dur: 24, s: S12b }, // "It's a very good tunnel", centred on 824
  ],
  13: [{ f: 861, s: S13a }],
  14: [{ f: 911, s: S14a }],
  15: [
    { f: 1119, s: S15a },
    { f: 1172, dur: 28, s: S15b }, // centred on 1186 ("the speed")
  ],
  16: [
    { f: 1264, s: S16a },
    { f: 1330, dur: 26, s: S16b }, // centred on 1343 (the pop)
  ],
  17: [{ f: 1465, s: S17a }],
  18: [
    { f: 1465, s: S17a },
    { f: 1532, dur: 20, s: S18a }, // centred on 1542 ("Unluckily"), runs across the invisible 17 -> 18 change
  ],
  19: [{ f: 1614, s: S19a }],
  20: [{ f: 1703, s: S20a }],
  21: [
    { f: 1703, s: S20a },
    { f: 1750, dur: 20, s: S21a },  // tiny reframe across the invisible 20 -> 21 change
    { f: 1880, dur: 34, s: S21b },  // up to the neighbor at the fence, centred on 1897
  ],
};
CAMS[17] = CAMS[18];
CAMS[20] = CAMS[21];

// impact kicks: the image offset flips sign every frame (~3 px at 720p per unit), decays to 0 in 7 f
const KICKS: [number, number][] = [[SHOVEL_HIT, 0.5], [FLAG_POP, 0.5], [287, 0.5], [351, 0.9], [633, 1.2], [727, 1.4], [801, 1.0],
  [POP_SEA, 0.6], [POP1, 0.5], [POP2, 0.5], [1905, 0.5]];
export const kickAt = (f: number) => {
  let a = 0;
  for (const [f0, g] of KICKS) { const n = f - f0; if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5; }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(f);
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a; // metres at the look distance for 3 px x a
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

// ---------------- lens: depth of field + foreground framing ----------------
/** cInf = blur-disc radius in px at 1080x1920 for things at infinity; 0 = all sharp. Entries switch on cuts (no dur)
 *  or ramp with the camera glide they share f/dur with. focus = world point (else the camera look point). */
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
const at = (p: V3, dy = 0) => (): V3 => [p[0], p[1] + dy, p[2]];
export const DOF: Dof[] = [
  { f: 0, cInf: 0 },                                              // shaft: the streaks are the blur
  { f: 118, cInf: 0 },                                            // garden establishing + hero wide: kept sharp
  { f: 229, cInf: 0 },                                            // Earth
  { f: 264, cInf: 12, focus: at(N_EYE) },                         // neighbor MS
  { f: 319, cInf: 8, focus: at(WIFE5, 1.4) },                     // wife, full shot
  { f: 393, cInf: 12, focus: at(GUS_STAND, 1.4) },                // Gus MS
  { f: 426, dur: 18, cInf: 4, focus: () => [0, 0, 0] },           // down at the hole
  { f: 448, cInf: 0 },                                            // shaft
  { f: 685, cInf: 13, focus: () => [0, 0.63, 0] },                // face close-up: walls melt
  { f: 743, cInf: 0 },
  { f: 861, cInf: 8, focus: () => [0, 1.1, -0.15] },              // listening over the hole
  { f: 911, cInf: 0 },                                            // Earth
  { f: 1119, cInf: 7 },                                           // park: focus = look (the swing plane)
  { f: 1264, cInf: 0 },                                           // ocean wide
  { f: 1465, cInf: 9, focus: at(TWO) },                           // two-shot
  { f: 1614, cInf: 0 },                                           // shaft
  { f: 1703, cInf: 9, focus: () => [0, 1.0, 0] },                 // evening garden: Gus and his wife
  { f: 1880, dur: 34, cInf: 12, focus: at(N_EYE) },                // final: over to the neighbor at the fence
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};

/** near framing objects: visible while a <= f < b; kit = a name accepted by build.ts kitClone() */
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [
  // (none: the park bush of the template sat in the middle of this short's wider swing framing)
];
