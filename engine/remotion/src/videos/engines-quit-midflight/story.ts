// Timeline of "What If Both Engines Quit on Your Plane?" (67.5 s, 2026 f at 30 fps), built on the cartoon-short kit
// (src/toon/kit/README.md). Shot boundaries, places, lights, crossfades, the flash and the action frames come from
// engine/videos/engines-quit-midflight/shots.json (the sound is built from the same file). This file holds the
// numbers over time; props.ts the drawings; staging.ts the cast and the cards. Pure functions of the frame.
import { V3, Key, Framing, SunDef, clamp01, smooth, lerp, readShots, camRig, pushK, dolly, dofTable, focusOn, OceanParams } from "../../toon/kit";
import plan from "../../../../videos/engines-quit-midflight/shots.json";
import { seatAt } from "../plane-door-midflight/story";

export { seatAt };

// ---------------- shots ----------------
const SUN: Record<number, SunDef> = {};
for (const s of plan.shots) if (s.place === "cabin") SUN[s.id] = { az: 110 };
/** 23 shots: 1 hook: the engine quits | 2 seven miles up | 3 the movie stops | 4 afternoon | 5 the row | 6 quiet |
 *  7 black screen | 8 neighbor grabs, Gus yells | 9 the sandwich | 10 but wait | 11 wings lift, engines push |
 *  12-13 the bike | 14 a hill of air | 15 one to fifteen | 16 the ramp | 17 a hundred miles, twenty minutes |
 *  18 the night glide to the island | 19 the little propeller | 20 no movie | 21 idle a hundred miles out |
 *  22 gliding home | 23 the dead screen */
export const T = readShots(plan, SUN);
const S = (id: number) => T.shots[id - 1];
export const A = (id: number) => S(id).a;

// ---------------- action frames (named events of shots.json) ----------------
export const COUGH = T.at("cough"), QUIT = T.at("quit"), SEVEN = T.at("seven"), STOP = T.at("stop"), SUNF = T.at("sun"), LAUGH = T.at("laugh");
export const QUIET = T.at("quiet"), BLACK = T.at("black"), REFLECT = T.at("reflect"), GRAB = T.at("grab"), YELL = T.at("yell"), ROCK = T.at("rock"), ROCKFALL = T.at("rockfall"), BITE = T.at("bite");
export const NODROP = T.at("nodrop"), WHY = T.at("why"), FAKE = T.at("fake"), CROSS = T.at("cross"), LIFT1 = T.at("lift1"), LIFT2 = T.at("lift2"), PUSH = T.at("push"), NUDGE = T.at("nudge");
export const COAST = T.at("coast"), LEGS = T.at("legs"), ROLL = T.at("roll"), SLIDE = T.at("slide"), SLIDE_END = 960, AIR = T.at("air"), FLAT = T.at("flat");
export const ONE = T.at("one"), SINK = T.at("sink"), TICKS = T.at("ticks"), TICKS_END = 1093, FIFTEEN = T.at("fifteen"), CHAIR = T.at("chair"), FLATTER = T.at("flatter");
export const SEVEN2 = T.at("seven2"), GLIDE = T.at("glide"), GLIDE_END = 1300, HUNDRED = T.at("hundred"), CLOCK = T.at("clock"), SWEEP = T.at("sweep"), TWENTY = T.at("twenty");
export const GAUGE = T.at("gauge"), EMPTY = T.at("empty"), OUT = T.at("out"), MILES75 = T.at("miles75"), ISLAND = T.at("island"), LAND = T.at("land"), LIVED = T.at("lived");
export const HATCH = T.at("hatch"), DROP = T.at("drop"), SPIN = T.at("spin"), POWER = T.at("power"), CONTROLS = T.at("controls");
export const POKE1 = T.at("poke1"), POKE2 = T.at("poke2"), NOPE = T.at("nope"), THING = T.at("thing"), PULL = T.at("pull"), PULL_END = 1812, IDLE = T.at("idle"), HUNDRED2 = T.at("hundred2");
export const HOME = T.at("home"), HOUSE = T.at("house"), SIGH = T.at("sigh"), TAP = T.at("tap");

// ---------------- the sky board: every sky shot is flat cards near z = 0, the lens south of them looking north ----------------
/** a point given in pixels of the 1400 x 560 airliner card (plane-door-midflight fxPlane, nose to the right) for a
 *  card of width w centred on `at` and turned by rot (counter-clockwise) */
export const onPlane = (at: V3, w: number, px: number, py: number, rot = 0, dz = 0.1): V3 => {
  const x = ((px - 700) / 1400) * w, y = ((280 - py) / 1400) * w, c = Math.cos(rot), s = Math.sin(rot);
  return [at[0] + x * c - y * s, at[1] + x * s + y * c, at[2] + dz];
};
export const ENGINE_BACK: [number, number] = [600, 362], ENGINE_MID: [number, number] = [672, 362], WING: [number, number] = [520, 440], NOSE: [number, number] = [1310, 262];

/** the slope card (props.ts fxSlope, 1400 x 1500 canvas): the slope starts at pixel (40, 120) and falls to the right */
export const SLOPE_W = 15, SLOPE_AT: V3 = [0.6, -1.6, -0.3], HILL_DEG = 20, GLIDE_DEG = 3.81;
export const slopeDeg = (f: number) => lerp(HILL_DEG, GLIDE_DEG, smooth((f - FLAT) / 15));
/** world point on the slope line, u metres along it from its top, lifted n metres off it */
export const onSlope = (deg: number, u: number, n = 0): V3 => {
  const s = SLOPE_W / 1400, a = (deg * Math.PI) / 180;
  return [SLOPE_AT[0] + (40 - 700) * s + u * Math.cos(a) + n * Math.sin(a), SLOPE_AT[1] + (750 - 120) * s - u * Math.sin(a) + n * Math.cos(a), 0];
};
/** how far down the hill the bike is (metres along the slope) */
export const bikeU = (f: number) => (f < A(13) ? 1.7 + 0.0013 * Math.max(0, f - COAST) ** 2 : 6.0 + 0.06 * (f - A(13)));
/** how far down the slope the airliner is in shot 14 */
export const planeU = (f: number) => 4.4 + 3.6 * smooth((f - SLIDE) / (SLIDE_END - SLIDE)) + 0.004 * (f - A(14));

/** shot 15: the true-scale triangle card (1400 x 400 canvas, 9.2 m wide): top-left corner pixel (60, 120), one unit = 86 px */
export const TRI_W = 9.2, TRI_AT: V3 = [0, -1.6, 0];
export const onTri = (px: number, py: number, dz = 0.1): V3 => [TRI_AT[0] + ((px - 700) / 1400) * TRI_W, TRI_AT[1] + ((200 - py) / 1400) * TRI_W, dz];

/** shot 17: the whole glide */
export const G0: V3 = [-3.3, 1.9, 0], G1: V3 = [2.9, -0.55, 0];
/** shot 21 and 22: the descent line */
export const D0: V3 = [-2.0, 4.6, 0], D1: V3 = [3.5, 3.0, 0];
export const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------- the ocean (kit place, night): the glide to the island ----------------
export const ISLAND_AT = (f: number): V3 => [lerp(4.6, 1.75, smooth((f - ISLAND) / 22)), 0.42, -0.2];
export const JET_AT = (f: number): V3 => {
  const k = smooth((f - (ISLAND + 4)) / (LAND - ISLAND - 4)), x = lerp(lerp(-1.6, 0.25, clamp01((f - 1311) / 70) ** 0.8), 1.55, k);
  return [x, lerp(2.3 - 0.0035 * Math.min(f - 1311, 100), 0.8, k) + (f < LAND ? 0.03 * Math.sin(f * 0.11) : 0), 0];
};

// ---------------- the cabin: Gus's point of view of the seat back (a card that fills the frame) ----------------
export const POV_POS: V3 = [-0.3, 1.2, 1.0], POV_LOOK: V3 = [-0.3, 1.2, -1.9];
/** distance of the seat-back card from the lens: it creeps closer during each POV shot */
export const povDist = (id: number, f: number) => 1.34 * (1 - 0.0011 * Math.max(0, f - A(id)));

export const placeAt = (id: number, _f: number): OceanParams | { ground?: boolean } | Record<string, unknown> | undefined => {
  const place = S(id).place;
  if (place === "sky") return { ground: false };
  if (place === "ocean") return { pipe: false, boat: false, lantern: false } as OceanParams;
  return {};
};

// ---------------- cameras ----------------
const board = (f: number, f0: number, look: V3 = [0, 0, 0], z = 23.5, rate = 0.0006, roll = 0) => dolly([look[0], look[1] + 0.3, z], look, pushK(f, f0, rate), { fov: 40, roll });
const POV = (f: number): Framing => ({ pos: POV_POS, look: POV_LOOK, fov: 40 });
const ROW = (f0: number) => (f: number) => dolly([-2.25, 1.3, -1.16], [1.7, 1.2, -1.17], pushK(f, f0, 0.0007), { fov: 40 });
const ROW_GUS = (f: number) => dolly([-2.0, 1.3, -0.95], [1.7, 1.22, -0.84], pushK(f, 413, 0.0009), { fov: 40, roll: 0.02 });
const ROW_WIFE = (f: number) => dolly([-1.9, 1.3, -1.2], [1.7, 1.2, -1.15], pushK(f, 468, 0.0009), { fov: 40 });
const S1 = (f: number) => dolly([0.3, 0.2, 19], [0.1, 0.2, 0], pushK(f, 0, 0.0024), { fov: 40, roll: 0.05 });
const S4 = (f: number): Framing => { const k = clamp01((f - 197) / 44); return { pos: mix3([-0.5, 0.9, 25], [0.3, 0.9, 24], k), look: mix3([-0.5, 0.8, 0], [0.3, 0.8, 0], k), fov: 40, roll: -0.015 }; };
const S6 = (f: number) => dolly([0, 0.2, 10.5], [0, 0, 0], pushK(f, 294, 0.0016), { fov: 40, roll: -0.02 });
/** shot 12 and 13: the lens rides down the hill with Gus */
const S12 = (f: number): Framing => { const p = onSlope(HILL_DEG, bikeU(f), 1.6); const x = Math.max(-3.9, p[0] + 0.5); return { pos: [x, p[1] + 0.2, 12], look: [x, p[1] - 0.6, 0], fov: 40 }; };
const S13 = (f: number): Framing => { const p = onSlope(HILL_DEG, bikeU(f), 1.75); return { pos: [p[0] + 0.1, p[1] + 0.2, 7.6 * pushK(f, 812, 0.0008)], look: [p[0] + 0.1, p[1] - 0.2, 0], fov: 40, roll: 0.03 }; };
const S18a = (f: number) => dolly([0.2, 1.75, 8.9], [0.3, 1.75, 0], pushK(f, 1311, 0.0005), { fov: 42 });
const S18b = (f: number) => dolly([1.25, 1.4, 7.4], [1.3, 1.4, 0], pushK(f, 1425, 0.001), { fov: 42 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1 }],
  2: [{ f: 86, s: (f) => board(f, 86, [0, 0, 0], 23.5, 0.0008) }],
  3: [{ f: 129, s: POV }],
  4: [{ f: 197, s: S4 }],
  5: [{ f: 241, s: ROW(241) }],
  6: [{ f: 294, s: S6 }],
  7: [{ f: 329, s: POV }],
  8: [{ f: 371, s: ROW(371) }, { f: 400, dur: 26, s: ROW_GUS }, { f: 456, dur: 24, s: ROW_WIFE }],   // to Gus (centred on 413), then to his wife (468)
  10: [{ f: 537, s: (f) => board(f, 537, [0, 0, 0], 23.5, 0.0008, 0.02) }],
  11: [{ f: 607, s: (f) => board(f, 607, [0, 0.4, 0], 22.5, 0.0005) }],
  12: [{ f: 755, s: S12 }],
  13: [{ f: 812, s: S13 }],
  14: [{ f: 871, s: (f) => board(f, 871, [0.4, 1.2, 0], 23.5, 0.0004) }],
  15: [{ f: 1019, s: (f) => board(f, 1019, [0, -0.4, 0], 23.5, 0.0005) }],
  16: [{ f: 1120, s: (f) => board(f, 1120, [0, 0, 0], 23.5, 0.0009) }],
  17: [{ f: 1169, s: (f) => board(f, 1169, [0, 0.6, 0], 23.5, 0.0004) }],
  18: [{ f: 1311, s: S18a }, { f: 1412, dur: 30, s: S18b }],                 // closes on the island as it comes in, centred on 1427
  19: [{ f: 1472, s: (f) => board(f, 1472, [0.4, 0.5, 0], 23, 0.0006, -0.015) }],
  20: [{ f: 1622, s: POV }],
  21: [{ f: 1709, s: (f) => board(f, 1709, [0, 0, 0], 23.5, 0.0004) }],
  22: [{ f: 1874, s: (f) => board(f, 1874, [0, 0.2, 0], 23.5, 0.0009, 0.02) }],
  23: [{ f: 1952, s: POV }],
};
CAMS[9] = CAMS[8];
/** impact kicks (only where the picture is already busy) */
const KICKS: [number, number][] = [[COUGH, 0.7], [QUIT, 0.6], [LAND, 0.4]];
export const { camAt } = camRig(CAMS, KICKS);

// ---------------- lens: depth of field ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 0 },
  { f: 241, cInf: 7, focus: focusOn(seatAt(1), 1.0) },
  { f: 294, cInf: 0 },
  { f: 371, cInf: 7, focus: focusOn(seatAt(1), 1.0) },
  { f: 537, cInf: 0 },
]);
