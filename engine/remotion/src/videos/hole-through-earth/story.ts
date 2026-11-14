// Timeline of "What If You Jumped Into a Hole Through the Earth?" (64.5 s, 1935 f at 30 fps): the worked example
// of the cartoon-short kit (src/toon/kit/README.md).
// Shot boundaries, places, lights, crossfades, the flash frame and the action frames come from
// engine/videos/hole-through-earth/shots.json (LOCKED: the sound is built from the same file).
// This file holds everything that is a number over time: when things happen, where Gus is, the options of each
// place, the cameras and the depth of field. staging.ts draws the cast from it; entry.tsx registers the film.
// Everything here is a pure function of the frame number.
import {
  V3, Key, Framing, SunDef, clamp01, smooth, lerp, lin, readShots, camRig, pushK, dolly, zoom, add, dofTable, focusOn,
  NEIGH, PARK, PIPE_H, TownParams, ShaftParams, EarthParams,
} from "../../toon/kit";
import plan from "../../../../videos/hole-through-earth/shots.json";

// ---------------- shots ----------------
/** key light per shot where the place's default is not wanted (camera-relative az / el, or a world direction) */
const SUN: Record<number, SunDef> = {
  4: { az: 118 }, 5: { az: 105 }, 6: { az: 110 }, // character shots: the sun over the lens's right shoulder (front-lit sets)
  13: { abs: [0.5, 0.66, 0.56] },                 // up out of the hole: the rim is lit
  20: { abs: [-0.83, 0.27, 0.49] }, 21: { abs: [-0.83, 0.27, 0.49] }, // evening garden: low sun in the open west-south-west, ahead-left of the lens
  16: { az: -55, el: 38 }, 17: { az: -55, el: 38 }, 18: { az: -55, el: 38 },
};
/** 21 shots: 1 hook (shaft) | 2 garden | 3 earth | 4-6 garden | 7-9 shaft | 10 earth | 11-12 shaft | 13 garden |
 *  14 earth | 15 park | 16-18 ocean | 19 shaft | 20-21 evening garden */
export const T = readShots(plan, SUN);
export const TOTAL = T.total;

// ---------------- the garden (town place, ground y = 0, main cameras look toward -z = north) ----------------
export const GUS_STAND: V3 = [-0.85, 0, -0.55];  // where Gus stands by the hole (shots 2, 6)
export const WIFE5: V3 = [1.8, 0, 0.4];          // wife with the pan (shot 5)
export const PANCAKE_AT: V3 = [2.18, 0.02, 0.92]; // where the pancake lands: on the pan's side of her, so the arc never crosses her face
export const CHAIR: V3 = [0.5, 0, 0.95];         // her seat south of the hole (shots 20-21: the lens looks west, into the low sun)

/** shovel (shot 2): 0 = held upright beside Gus, 1 = planted in the mound; the thrust lands on f181 */
export const SHOVEL_HIT = T.at("shovel_thunk"); // 181
export const shovelK = (f: number) => (f < 172 ? 0 : f < 177 ? -0.35 * smooth((f - 172) / 5) : f < SHOVEL_HIT ? -0.35 + 1.35 * ((f - 177) / 4) ** 2 : 1);

/** Gus's hop into the hole (shot 6): crouch 424-429, leaves the ground on f429, in the hole from ~f438 */
export const HOP = T.at("jump_boing"); // 429
export const hopAt = (f: number): { x: number; y: number; z: number; squash: number; air: boolean } => {
  const [x0, , z0] = GUS_STAND;
  if (f < HOP) return { x: x0, y: 0, z: z0, squash: f < 423 ? 0 : smooth((f - 423) / 5), air: false };
  const u = clamp01((f - HOP) / 9); // 9 frames to the middle of the hole
  const x = x0 + (0 - x0) * u, z = z0 + (0 - z0) * u;
  const n = f - HOP, y = n <= 9 ? 0.62 * Math.sin(Math.PI * Math.min(1, n / 11)) : 0.62 * Math.sin((Math.PI * 9) / 11) - 0.045 * (n - 9) ** 2.1;
  return { x, y, z, squash: 0, air: true };
};

/** height of Gus's soles over the lawn in the evening garden (shots 20-21): pops, hangs for one second, drops */
export const POP1 = T.at("cork_pop", 1), HANG1 = T.at("ting", 2), DROP1 = T.at("slide_whistle_down", 2);   // 1711, 1737, 1766
export const POP2 = T.at("cork_pop", 2), BITE = T.at("chomp"), DROP2 = T.at("slide_whistle_down", 3);      // 1834, 1855, 1877
export const HANG_Y = -0.34; // he stops with his shins still in the hole
const DEEP = -2.3;
const popUp = (f: number, f0: number, n: number) => DEEP + (HANG_Y - DEEP) * (1 - (1 - clamp01((f - f0) / n)) ** 2.4);
const dropDown = (f: number, f0: number) => HANG_Y - 0.0125 * Math.max(0, f - f0) ** 2; // gone in 11 frames (the QA read the faster drop as a pop)
export const gardenGusY = (f: number) =>
  f < DROP1 ? popUp(f, POP1 - 3, HANG1 - POP1 + 3) : f < POP2 - 3 ? dropDown(f, DROP1) : f < DROP2 ? popUp(f, POP2 - 3, 17) : dropDown(f, DROP2);

/** the shovel in shot 2: handle top and blade tip (world), for the 3D prop and Gus's hand */
export const shovelAt = (f: number): { top: V3; tip: V3; grip: V3 } => {
  // held: standing on the lawn beside him; planted: stuck in the mound's near slope, leaning his way
  const H0: V3 = [-1.44, 1.3, -0.5], T0: V3 = [-1.48, 0.02, -0.5], H1: V3 = [-1.42, 1.82, -1.05], T1: V3 = [-1.72, 0.58, -1.3];
  const k = shovelK(f), u = Math.max(0, k), w = Math.max(0, -k) / 0.35;
  const lift = 0.5 * w + 0.5 * (u < 1 ? 1 - u * u : 0) * (k > 0 ? 1 : 0);
  const mix3 = (a: V3, b: V3): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + lift, lerp(a[2], b[2], u)];
  const top = mix3(H0, H1), tip = mix3(T0, T1);
  tip[0] -= 0.12 * w; tip[2] -= 0.2 * w; // the wind-up already swings the blade toward the mound
  const g = 0.66;
  return { top, tip, grip: [lerp(tip[0], top[0], g), lerp(tip[1], top[1], g), lerp(tip[2], top[2], g)] };
};

// ---------------- the ocean (water y = 0, pipe at the origin) ----------------
export const POP_SEA = T.at("cork_pop"), STOP_SEA = T.at("ting", 1), SINK_SEA = T.at("gulp"), GONE_SEA = T.at("slide_whistle_down", 1); // 1342, 1442, 1560, 1598
export const SEA_TOP = 0.5;                 // soles over the rim when he hangs
/** height of Gus's soles over the WATER (shots 16-18) */
export const seaGusY = (f: number) => {
  if (f < SINK_SEA) { const u = clamp01((f - (POP_SEA - 1)) / (STOP_SEA - POP_SEA + 1)); return PIPE_H - 1.78 + (1.78 + SEA_TOP) * (1 - (1 - u) ** 3); }
  return PIPE_H + SEA_TOP - 2.95 * ((f - SINK_SEA) / 46) ** 3.2;
};

// ---------------- the park swing (shot 15) ----------------
// One time-warped pendulum so the three sound events line up: the push on f1126 (back end of the arc), fastest through
// the bottom on f1215 ("going down"), dead stop at the top of the arc on f1258 ("back up"), then it hangs.
export const PUSHES = [T.at("push_whoosh"), T.at("push_whoosh", 1)]; // 1126, 1197
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

// ---------------- the Earth cutaway ----------------
/** shot 3: how far the tunnel has punched through (0..1), flag pop 0..1 */
export const TUNNEL_DONE = 245, FLAG_POP = T.at("pop"); // 247
export const tunnelK = (f: number) => (f < 229 ? 1 : f >= 264 ? 1 : clamp01((f - 232) / (TUNNEL_DONE - 232)) ** 1.6);
/** where Gus is in the tunnel: s in -1..1 */
export const ARROW_POP = T.at("arrow_pop"), PASS = T.at("flip_blip"); // 950, 1022
export const earthGusS = (id: number, f: number) => {
  if (id === 10) return -0.4 + 0.8 * ((f - 654) / 27); // streak through the core, centre on ~f667
  if (id === 14) {
    const ph = f <= PASS ? lerp(0.5, Math.PI / 2, clamp01((f - 915) / (PASS - 915))) : lerp(Math.PI / 2, Math.PI - 0.1, clamp01((f - PASS) / (1118 - PASS)));
    return -Math.cos(ph) * 0.93;
  }
  return -2;
};

// ---------------- the shaft (Gus rides at the origin, the walls scroll) ----------------
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
  const s = T.shots[id - 1];
  return lerp(sp[0], sp[1], clamp01((f - s.a) / (s.b - s.a)));
};
export const shaftScroll = (id: number, f: number) => {
  const sp = SPEEDS[id]; if (!sp) return 0;
  const s = T.shots[id - 1], N = s.b - s.a, t = Math.max(0, f - s.a);
  return id * 37.3 + sp[0] * t + ((sp[1] - sp[0]) * t * t) / (2 * N);
};
/** hook: from f96 Gus outruns the camera and drops away down the tunnel (metres below the camera's ride height) */
export const hookDrop = (f: number) => (f < 90 ? 0 : 0.022 * (f - 90) ** 2.3);

// ---------------- place options per frame ----------------
export const placeAt = (id: number, f: number): TownParams | ShaftParams | EarthParams | undefined => {
  const place = T.shots[id - 1].place;
  if (place === "shaft") return { heat: shaftHeat(id, f), scroll: shaftScroll(id, f), speed: shaftSpeed(id, f) };
  if (place === "earth") {
    const near = Math.max(0, 1 - Math.abs(earthGusS(id, f)) / 0.25);                   // the core glows up as he passes
    const pk = id === 3 ? Math.max(0, Math.min(1, (f - 245) / 3)) : 1;                 // the far pipe rim pops out of the sea on f247
    return { tunnel: id === 3 ? tunnelK(f) : 1, pulse: 1 + 0.25 * near + 0.04 * Math.sin(f * 0.21), pipe: pk * (1 + (id === 3 ? 0.35 * Math.max(0, 1 - Math.abs(f - 249) / 3) : 0)) };
  }
  if (place === "garden") {
    // shovel: in Gus's hand until f181 (shot 2), planted in the mound ever after; her deck chair in the evening
    const sh = shovelAt(f);
    return { shovel: id === 2 ? { top: sh.top, tip: sh.tip } : "planted", chair: id >= 20 ? { pos: [CHAIR[0] - 0.2, 0, CHAIR[2] + 0.12], yaw: 0.75 + Math.PI / 2 } : false };
  }
  return undefined;
};

// ---------------- camera ----------------
// ---- shot 1 (hook): falling with Gus -> tilt down past him into the endless glowing tunnel ----
const S1a = (f: number) => dolly([1.0, 0.75, 3.05], [0, 0.12, 0], pushK(f, 0, 0.002), { fov: 50, roll: -0.07 });
const S1b = (f: number) => dolly([-0.75, 0.55, 2.55], [0, 0.2, 0], pushK(f, 40, 0.002), { fov: 46, roll: 0.06 });
const S1c = (f: number): Framing => ({ pos: [0.5, 1.9, 1.35], look: [0.05, -40, -0.1], fov: 56 - 0.05 * Math.max(0, f - 96), roll: 0.02 });
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
const S5a = (f: number) => dolly([1.15, 1.02, 3.75], [2.0, 0.84, 0.5], pushK(f, 319, 0.0014), { fov: 40 });
const S5b = (f: number) => dolly([1.3, 0.98, 3.65], [2.04, 0.74, 0.55], pushK(f, 345, 0.001), { fov: 40, roll: -0.035 });
// ---- shot 6: the clipboard, the salute, the hop; the lens tilts down into the hole after him ----
const S6a = (f: number) => dolly([0.2, 1.45, 2.75], [-0.74, 1.14, -0.5], pushK(f, 393, 0.002), { fov: 38 });
const S6b = (f: number): Framing => { // rides up with the hop, then tips into the hole after him
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
// ---- shot 13: from inside the hole, straight up at the two listeners (slow creep up, slight roll) ----
const S13a = (f: number) => dolly([0.03, -2.0, 0.27], [0, 2.4, -0.11], pushK(f, 861, 0.001, 0.0028, 18, 893), { fov: 56, roll: 0.03 + 0.0009 * (f - 861) });
// ---- shot 14: the explanation ----
const S14a = (f: number) => dolly([0.4, 0.5, 34.2], [0.2, -0.1, 0], pushK(f, 911, 0.00034), { fov: 31, roll: -0.02 }); // the globe fills ~85 % of the width
// ---- shot 15: the park swing (the template's two framings) ----
const S15a = (f: number) => dolly([PARK[0] + 0.1, 1.5, PARK[2] - 8.8], [PARK[0] + 0.0, 1.75, PARK[2]], pushK(f, 1119, 0.001), { fov: 40 });
const S15b = (f: number) => dolly([PARK[0] - 1.3, 1.9, PARK[2] - 10.4], [PARK[0] - 0.1, 1.95, PARK[2]], pushK(f, 1186, 0.0009, 0.004, 28, 1236), { fov: 42 });
// ---- shot 16: night ocean; the lens tilts up with Gus as he rises ----
const seaLook = (f: number): V3 => { const y = seaGusY(Math.min(f, STOP_SEA)); return [0.84, 1.35 + 0.4 * smooth((y - PIPE_H + 1.2) / (SEA_TOP + 1.2)), 0.2]; };
const S16a = (f: number) => dolly([0.45, 1.35, 8.7], [0.86, 1.35, 0.2], pushK(f, 1264, 0.0011), { fov: 42 });
const S16b = (f: number) => dolly([0.45, 1.3, 7.7], seaLook(f), pushK(f, 1342, 0.0006), { fov: 44, roll: -0.03 });
// ---- shots 17-18: the two-shot (one camera, closer on "Unluckily") ----
const TWO: V3 = [0.82, 1.9, 0.2];
const S17a = (f: number) => dolly([0.7, 1.98, 6.8], TWO, pushK(f, 1465, 0.0006), { fov: 42, roll: 0.03 });
const S18a = (f: number) => dolly([1.0, 1.72, 6.55], [0.84, 1.7, 0.2], pushK(f, 1532, 0.0005), { fov: 42, roll: -0.035 });
// ---- shot 19: the way back (mirrored framing) ----
const S19a = (f: number) => dolly([-0.6, 0.5, 2.9], [-0.1, 0.1, 0], pushK(f, 1614, 0.0016), { fov: 46, roll: -0.06 });
// ---- shots 20-21: the evening garden ----
// the lens stands east of the hole and looks west into the low sun: sky over the fence line, long shadows toward us
const E_L: V3 = [0.12, 0.86, 0.48];
const S20a = (f: number) => dolly([4.4, 1.12, -0.6], E_L, pushK(f, 1703, 0.0012), { fov: 44 });
const S21a = (f: number) => dolly([4.2, 1.1, -0.56], [0.12, 0.88, 0.5], pushK(f, 1753, 0.0005), { fov: 44 });
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


// impact kicks: [frame, strength]
const KICKS: [number, number][] = [[SHOVEL_HIT, 0.5], [FLAG_POP, 0.5], [287, 0.5], [351, 0.9], [633, 1.2], [727, 1.4], [801, 1.0],
  [POP_SEA, 0.6], [POP1, 0.5], [POP2, 0.5], [1905, 0.5]];
export const { camAt } = camRig(CAMS, KICKS);

// ---------------- lens: depth of field ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 0 },                                              // shaft: the streaks are the blur
  { f: 118, cInf: 0 },                                            // garden establishing + hero wide: kept sharp
  { f: 229, cInf: 0 },                                            // Earth
  { f: 264, cInf: 12, focus: focusOn(N_EYE) },                    // neighbor MS
  { f: 319, cInf: 8, focus: focusOn(WIFE5, 1.4) },                // wife, full shot
  { f: 393, cInf: 12, focus: focusOn(GUS_STAND, 1.4) },           // Gus MS
  { f: 426, dur: 18, cInf: 4, focus: () => [0, 0, 0] },           // down at the hole
  { f: 448, cInf: 0 },                                            // shaft
  { f: 685, cInf: 13, focus: () => [0, 0.63, 0] },                // face close-up: walls melt
  { f: 743, cInf: 0 },
  { f: 861, cInf: 0 },                                            // up from inside the hole: rim, heads and sky all sharp
  { f: 911, cInf: 0 },                                            // Earth
  { f: 1119, cInf: 7 },                                           // park: focus = look (the swing plane)
  { f: 1264, cInf: 0 },                                           // ocean wide
  { f: 1465, cInf: 9, focus: focusOn(TWO) },                      // two-shot
  { f: 1614, cInf: 0 },                                           // shaft
  { f: 1703, cInf: 9, focus: () => [0.15, 1.0, 0.4] },            // evening garden: Gus and his wife
  { f: 1880, dur: 34, cInf: 12, focus: focusOn(N_EYE) },          // final: over to the neighbor at the fence
]);
