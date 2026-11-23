// Timeline of "What If Gravity Switched Off for 5 Seconds?" (68.2 s, 2047 f at 30 fps), built on the cartoon-short
// kit (src/toon/kit/README.md). Shot boundaries, places, lights, crossfades, the flash and the action frames come
// from engine/videos/gravity-off-5-seconds/shots.json (the sound is built from the same file).
// This file holds the numbers over time: when things happen, where things are, the cameras and the depth of field.
// props.ts holds this video's drawings; staging.ts draws the cast and the cards; entry.tsx registers the film.
// Everything is a pure function of the frame.
import { V3, Key, Framing, SunDef, clamp01, smooth, readShots, camRig, pushK, dolly, dofTable, focusOn, TownParams } from "../../toon/kit";
import plan from "../../../../videos/gravity-off-5-seconds/shots.json";
import { HILL_W, HILL_H, SL0, SL1, BALL_R, hillY } from "./props";

// ---------------- shots ----------------
/** 23 shots: 1 hook close | 2 hook wide | 3 the pancake | 4 gravity off | 5 it keeps going | 6 the neighbor |
 *  7 his wife | 8 ten inches | 9 don't move | 10 the hop | 11 one foot | 12 past the chimney | 13 the hill |
 *  14 no hill | 15 eight feet a second | 16 thirty-two feet | 17 out of reach | 18 gravity is back | 19 the top |
 *  20 the diving tower | 21 the pool | 22 no diver | 23 the water, and the pancake */
const SUN: Record<number, SunDef> = {};
for (let i = 1; i <= 23; i++) SUN[i] = { az: 110 };
export const T = readShots(plan, SUN);
const S = (id: number) => T.shots[id - 1];
const A = (id: number) => S(id).a;

// ---------------- action frames (named events in shots.json) ----------------
export const FLIP1 = T.at("flip1"), CATCH1 = T.at("catch1"), WATCH = T.at("watch"), FIVE = T.at("five"), OFF = T.at("off"), SHIMMER = T.at("shimmer");
export const FLIP2 = T.at("flip2"), EIGHT1 = T.at("eight1"), STARE = T.at("stare"), YELL = T.at("yell"), GLOBE = T.at("globe"), T800 = T.at("t800"), FLUNG = T.at("flung");
export const SIP = T.at("sip"), SINK = T.at("sink"), RULER = T.at("ruler"), TEN = T.at("ten"), THATSALL = T.at("thatsall"), DONT = T.at("dont");
export const CROUCH = T.at("crouch"), HOP = T.at("hop"), HOP1 = T.at("hop1"), LAND1 = T.at("land1"), ONE = T.at("one"), WHY = T.at("why");
export const GARROW = T.at("garrow"), ROLL1 = T.at("roll1"), STOPPED = T.at("stopped"), FLAT = T.at("flat"), ROLL2 = T.at("roll2");
export const POSTS = [T.at("post1"), T.at("post2"), T.at("post3"), T.at("post4")];
export const HOP2 = T.at("hop2"), EIGHT2 = T.at("eight2"), KEEPS = T.at("keeps"), TAPE = T.at("tape"), T32 = T.at("t32");
export const CAKE = T.at("cake"), WATCH1 = T.at("watch1"), TICK1 = T.at("tick1"), SAME = T.at("same"), SAME2 = T.at("same2"), GAP8 = T.at("gap8"), REACH = T.at("reach");
export const SHIMMER2 = T.at("shimmer2"), BELL = T.at("bell"), CHAIRLAND = T.at("chairland"), COAST = T.at("coast"), APEX = T.at("apex"), UHOH = T.at("uhoh"), DOWN = T.at("down");
export const TOWER = T.at("tower"), LEVEL = T.at("level"), POOL = T.at("pool"), SPLASH = T.at("splash"), T30 = T.at("t30"), SURFACE = T.at("surface"), CAKEFALL = T.at("cakefall"), CAKELAND = T.at("cakeland");

// ---------------- the garden (lens south of the subject, looking north = -z; screen right is +x) ----------------
/** eight feet a second (2.445 m/s) in metres per frame: the real thing, in real time */
export const VF = 2.445 / 30;
export const GUS0: V3 = [-0.35, 0, 0.3];
export const CHAIR: V3 = [1.55, 0, -0.7], CHAIR_YAW = 0.3;
export const LIFT = 0.25;                                       // ten inches
/** how far the chair hangs over the lawn */
export const chairLift = (f: number) => f < A(8) ? 0 : f < A(18) ? LIFT * smooth((f - SINK) / 66) : LIFT * (1 - clamp01((f - (CHAIRLAND - 10)) / 10) ** 2);
export const NB: V3 = [2.8, 0.3, -5.08];
export const POOL_AT: V3 = [1.6, 0.3, -6.0], POOL_W = 1.9, POOL_H = POOL_W * 0.65;
/** the water surface of the pool, world y */
export const WATER_Y = POOL_AT[1] + POOL_H * (1 - 114 / 520);
/** shot 3: the ordinary flip, 0..1 while the pancake is in the air */
export const flipU = (f: number) => clamp01((f - FLIP1) / (CATCH1 - FLIP1));
/** shot 5: the pancake's height over the pan after it leaves (two frames after the flick) */
export const cakeUp = (f: number) => VF * Math.max(0, f - FLIP2 - 2);
/** shots 10 and 15: Gus's height after the hop */
export const hopUp = (f: number, f0: number) => VF * Math.max(0, f - f0);
/** shot 11: an ordinary one-foot hop */
export const hop1 = (f: number) => { const u = clamp01((f - HOP1) / (LAND1 - HOP1)); return 0.3048 * 4 * u * (1 - u); };

// ---------------- the sky: flat cards around the origin, the lens south of them ----------------
export const HOUSE_W = 7, HOUSE_H = 8.75;                       // the house card (800 x 1000): 8.66 m from lawn to ridge... a storybook house
/** shot 1 and 12: world y of the house card's centre as it slides down behind Gus */
export const houseY1 = (f: number) => -3.7 - 0.07 * f;
export const houseY12 = (f: number) => -3.55 - 0.04 * (f - A(12));
/** the far shots (2, 16, 20): Gus's soles */
export const gusY2 = (f: number) => 8.6 + 0.008 * (f - A(2));
export const gusY16 = (f: number) => 9.5 + 0.012 * (f - A(16));
export const TOP_Y = 10.08;                                     // the top of his flight = the 10 m platform
/** shot 19: he coasts, stops, falls: y offset */
export const coastY = (f: number) => { const u = clamp01((f - COAST) / (APEX - COAST)); return 0.3 * (2 * u - u * u) - 0.0065 * Math.max(0, f - DOWN) ** 2; };

// the hill diagram: canvas units -> world
export const HW = 3.6, HK = HW / HILL_W, HILL_Y0 = -0.1;        // card width in metres, metres per canvas unit, card centre y
export const hpos = (x: number, y: number, z = 0): V3 => [(x - HILL_W / 2) * HK, HILL_Y0 + (HILL_H / 2 - y) * HK, z];
const X0 = 250, VX = 27;                                         // where the ball waits (canvas x), canvas units per frame on the level
/** shot 13: the ball's canvas x */
export const ballX13 = (f: number) => {
  const n = f - ROLL1, n1 = (SL0 - X0) / VX, N = STOPPED - 2 - ROLL1 - n1;
  if (n <= 0) return X0;
  if (n <= n1) return X0 + VX * n;
  const m = Math.min(n - n1, N), top = SL0 + VX * m - (VX / (2 * N)) * m * m, back = Math.max(0, n - n1 - N - 4);
  return top - 0.4 * back * back;
};
export const hillT = (f: number) => (f < A(14) ? 1 : 1 - smooth((f - (FLAT - 2)) / 12));
/** shot 14: the ball rolls on at one speed */
export const ballX14 = (f: number) => X0 + VX * Math.max(0, f - ROLL2);
export const ballAt = (f: number): { x: number; pos: V3 } => { const x = f < A(14) ? ballX13(f) : ballX14(f), t = hillT(f); return { x, pos: hpos(x, hillY(x, t) - BALL_R - 4, 0.06) }; };
/** shot 14: the lens follows the ball, easing in */
export const camX14 = (f: number) => { const w = (ballX14(f) - X0) * HK; return w - 1.0 * (1 - Math.exp(-w / 1.0)); };
void SL1;

// ---------------- options of each shot's place for this frame ----------------
export const placeAt = (id: number, f: number): TownParams | { ground?: boolean } | undefined => {
  if (S(id).place === "sky") return { ground: false };
  const chair = id === 3 || (id >= 7 && id <= 9) || id === 18;
  return { hole: false, mound: false, shovel: "none", washing: true, grill: true, chair: chair ? { pos: [CHAIR[0], chairLift(f), CHAIR[2]], yaw: CHAIR_YAW } : false };
};

// ---------------- cameras ----------------
const SKY = (f: number, f0: number, y: number, z: number, rate = 0.0006, roll = 0, x = 0): Framing => dolly([x, y + 0.1, z], [x, y, 0], pushK(f, f0, rate), { fov: 40, roll });
const GUSF = (f: number, f0: number) => dolly([-0.15, 1.2, 4.5], [GUS0[0], 0.98, 0.3], pushK(f, f0, 0.0012), { fov: 40 });
const S3a = (f: number) => dolly([0.5, 2.0, 7.4], [0.45, 0.95, 0.0], pushK(f, A(3), 0.001), { fov: 42 });
/** shot 5: wide enough for the climb, then the lens cranes up after the pancake */
const S5 = (f: number): Framing => { const up = Math.max(0, cakeUp(f) - 1.9) * smooth((f - 372) / 16); return { pos: [-0.2, 1.6 + up, 5.3], look: [GUS0[0] + 0.1, 1.62 + up, 0.3], fov: 40 }; };
const NEIGH = (f: number, f0: number) => dolly([1.9, 1.95, -0.6], [2.62, 1.92, -5.08], pushK(f, f0, 0.0012), { fov: 40 });
const NEIGH2 = (f: number) => dolly([2.2, 1.9, -1.6], [2.75, 1.86, -5.08], pushK(f, 541, 0.0012), { fov: 40 });
const WIFE_MS = (f: number, f0: number, dy = 0) => dolly([1.75, 1.3 + dy, 2.5], [CHAIR[0], 1.02 + dy, CHAIR[2]], pushK(f, f0, 0.0014), { fov: 38 });
const CHAIR_FS = (f: number, f0: number) => dolly([1.25, 1.05, 3.0], [CHAIR[0] - 0.1, 0.88, CHAIR[2]], pushK(f, f0, 0.001), { fov: 40 });
const S15 = (f: number): Framing => { const y = hopUp(f, HOP2) * smooth((f - HOP2 + 2) / 14); return { pos: [-0.15, 1.2 + y, 4.5], look: [GUS0[0], 0.98 + y, 0.3], fov: 40 }; };
const POOLCAM = (f: number, f0: number) => dolly([2.1, 2.85, 1.6], [2.1, 1.75, -5.6], pushK(f, f0, 0.0008), { fov: 40 });
const POOLCLOSE = (f: number) => dolly([1.72, 2.3, -2.7], [POOL_AT[0], WATER_Y + 0.5, POOL_AT[2]], pushK(f, 1960, 0.0012, 0.004, 20, CAKELAND - 4), { fov: 40 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => SKY(f, 0, 0.35, 4.7, 0.001, 0.07, 0.1) }],
  2: [{ f: A(2), s: (f) => SKY(f, A(2), 6.6, 24, 0.0008) }],
  3: [{ f: A(3), s: S3a }, { f: 203, dur: 26, s: (f) => GUSF(f, 229) }],
  4: [{ f: A(4), s: (f) => dolly([-0.1, 1.4, 4.6], [GUS0[0] + 0.1, 1.2, 0.3], pushK(f, A(4), 0.0012), { fov: 40 }) }],
  5: [{ f: A(5), s: S5 }],
  6: [{ f: A(6), s: (f) => NEIGH(f, A(6)) }, { f: 541, dur: 22, s: NEIGH2 }],
  7: [{ f: A(7), s: (f) => WIFE_MS(f, A(7)) }],
  8: [{ f: A(8), s: (f) => CHAIR_FS(f, A(8)) }],
  9: [{ f: A(9), s: (f) => WIFE_MS(f, A(9), LIFT) }],
  10: [{ f: A(10), s: (f) => GUSF(f, A(10)) }],
  11: [{ f: A(11), s: (f) => dolly([0.0, 1.15, 3.9], [GUS0[0] + 0.1, 1.03, 0.3], pushK(f, A(11), 0.0012), { fov: 40 }) }],
  12: [{ f: A(12), s: (f) => SKY(f, A(12), 0.3, 4.9, 0.001, -0.04) }],
  13: [{ f: A(13), s: (f) => SKY(f, A(13), -0.3, 7.6, 0.0004) }],
  14: [{ f: A(14), s: (f) => SKY(f, A(13), -0.3, 7.6, 0.0004, 0, camX14(f)) }],
  15: [{ f: A(15), s: S15 }],
  16: [{ f: A(16), s: (f) => SKY(f, A(16), 6.4, 24, 0.0008) }],
  17: [{ f: A(17), s: (f) => SKY(f, A(17), 0.1, 6.5, 0.0006) }],
  18: [{ f: A(18), s: (f) => dolly([1.0, 1.05, 3.2], [CHAIR[0] - 0.3, 0.88, CHAIR[2]], pushK(f, A(18), 0.001), { fov: 40 }) }],
  19: [{ f: A(19), s: (f) => SKY(f, A(19), 0.3, 4.8, 0.001) }],
  20: [{ f: A(20), s: (f) => SKY(f, A(20), 5.6, 23, 0.0008) }],
  21: [{ f: A(21), s: (f) => POOLCAM(f, A(21)) }],
  22: [{ f: A(22), s: (f) => SKY(f, A(22), 0.1, 4.6, 0.0015, -0.09) }],
  23: [{ f: A(23), s: (f) => POOLCAM(f, A(21)) }, { f: 1930, dur: 30, s: POOLCLOSE }],
};
/** impact kicks (only where the picture is already moving) */
const KICKS: [number, number][] = [[SPLASH, 0.6]];
export const { camAt } = camRig(CAMS, KICKS);

// ---------------- lens: depth of field ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 0 },
  { f: A(6), cInf: 10, focus: focusOn(NB, 1.5) },
  { f: A(7), cInf: 11, focus: focusOn(CHAIR, 1.1) },
  { f: A(8), cInf: 0 },
  { f: A(9), cInf: 11, focus: focusOn(CHAIR, 1.3) },
  { f: A(10), cInf: 0 },
]);
