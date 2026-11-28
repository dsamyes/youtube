// Timeline of "What If Your Pool Was 100 Feet Deep?" (67.3 s, 2018 f at 30 fps), built on the cartoon-short kit
// (src/toon/kit/README.md). Shot boundaries, places, lights, crossfades, the flash and the action frames come from
// engine/videos/pool-100-feet-deep/shots.json (the sound is built from the same file).
// This file holds the numbers over time: the depth of the lens under water, the size of the ball (Boyle's law, the
// real thing), where things are, the cameras and the depth of field. props.ts holds the drawings and the pool,
// places.ts the under-water place, staging.ts draws the cast and the cards. Everything is a pure function of the frame.
import { V3, Key, Framing, SunDef, clamp01, smooth, lerp, readShots, camRig, pushK, dolly, dofTable, focusOn, TownParams } from "../../toon/kit";
import plan from "../../../../videos/pool-100-feet-deep/shots.json";

/** 23 shots: 1 hook close | 2 hook: the floor | 3 the garden | 4 the dive to 100 | 5 dump trucks | 6 the hose |
 *  7 the neighbor | 8 the beach ball | 9 the barbell | 10 down to 34 and 100 | 11 basketball | 12 what squeezes it |
 *  13 the bucket | 14 the pancakes | 15 the bottom pancake | 16 slabs of water | 17 the scale | 18 four skies |
 *  19 three tons | 20 up again | 21 full size | 22 gulp | 23 the top two feet */
const SUN: Record<number, SunDef> = {};
for (let i = 1; i <= 23; i++) SUN[i] = { az: 110 };
export const T = readShots(plan, SUN);
export const S = (id: number) => T.shots[id - 1];
export const A = (id: number) => S(id).a;

// ---------------- action frames (named events in shots.json) ----------------
export const BBALL1 = T.at("bball1"), FLOOR1 = T.at("floor1"), POINT = T.at("point"), AT100 = T.at("at100"), T200 = T.at("t200"), HONK = T.at("honk");
export const CAL = T.at("cal"), DOZE = T.at("doze"), WEEKS = T.at("weeks"), LAUGH = T.at("laugh"), WAVE = T.at("wave");
export const BALL = T.at("ball"), PUSH = T.at("push"), POPUP = T.at("popup"), UPARROW = T.at("uparrow"), T60 = T.at("t60");
export const TIE = T.at("tie"), PAT = T.at("pat"), LOWER = T.at("lower"), M34 = T.at("m34"), HALF = T.at("half"), DROP2 = T.at("drop2"), FLOOR2 = T.at("floor2"), QUARTER = T.at("quarter"), BBALL2 = T.at("bball2");
export const HANDS = T.at("hands"), WHAT = T.at("what"), BUCKET = T.at("bucket"), HEAVY = T.at("heavy");
export const STK = [T.at("stk1"), T.at("stk2"), T.at("stk3"), T.at("stk4")], MORE = [T.at("more1"), T.at("more2"), T.at("more3")], SQUASH = T.at("squash");
export const SLAB = [T.at("slab1"), T.at("slab2"), T.at("slab3")], BOTTOM = T.at("bottom");
export const WBLOCK = T.at("wblock"), T34 = T.at("t34"), AIRCOL = T.at("aircol"), LEVEL = T.at("level"), TILT = T.at("tilt"), SPACE = T.at("space");
export const COUNT = [T.at("c1"), T.at("c2"), T.at("c3"), T.at("c4")], TILE = T.at("tile"), FOOT = T.at("foot"), TONS = T.at("tons");
export const RISE = T.at("rise"), PULL = T.at("pull"), OUT = T.at("out"), BACK = T.at("back"), GULP = T.at("gulp"), DUCK = T.at("duck"), TWO = T.at("two");

// ---------------- the garden pool (lens south of it, looking north = -z; screen right is +x) ----------------
export const PX0 = -0.6, PX1 = 2.6, PZ0 = -1.1, PZ1 = 1.3, RIM_W = 0.28, RIM_H = 0.12, WATER_Y = 0.07;
export const GUS_B: V3 = [1.0, 0, -1.55];                      // Gus behind the pool
export const BALL_W: V3 = [1.0, WATER_Y + 0.24, -0.82];        // the ball floating in front of him (centre)
export const BALL_D = 0.62;                                    // cartoon beach ball, metres across at the surface
export const BAR_RIM: V3 = [1.22, RIM_H + 0.16, -1.24];         // the barbell lying on the rim
export const WIFE_AT: V3 = [-1.5, 0, 0.9];
export const PLATE: V3 = [WIFE_AT[0] + 0.44, 1.12, WIFE_AT[2] + 0.03];   // the plate in her hand
export const NB: V3 = [2.5, 0.3, -5.08];
export const STEP: V3 = [-0.15, -0.5, 0.85];                   // Gus on the top step (soles), last shot

// ---------------- under water ----------------
export const FT_M = 0.12;                                       // metres of wall per foot of depth (the picture is compressed)
export const FT_ATM = 33.9;                                     // feet of fresh water per atmosphere
const ease = (f: number, a: number, b: number) => smooth((f - a) / (b - a));
const out2 = (f: number, a: number, b: number) => 1 - (1 - clamp01((f - a) / (b - a))) ** 2;
/** depth of the ball in feet at frame f (per shot) */
export const depthAt = (id: number, f: number): number => {
  if (id === 1) return 16 + (f / 56) * 34;
  if (id === 2) return f < 56 ? 16 + (f / 56) * 34 : lerp(50, 100, out2(f, 56, FLOOR1));
  if (id === 4) return lerp(4, 100, out2(f, A(4) - 6, AT100));
  if (id === 10) return f < DROP2 ? lerp(22, 34, out2(f, A(10) - 8, M34 + 3)) : lerp(34, 100, ease(f, DROP2, FLOOR2));
  if (id === 20) return lerp(100, 6, ease(f, RISE, A(21) - 2));
  return 100;
};
/** Boyle's law: the air's volume at depth d feet, as a fraction of its volume at the surface */
export const volAt = (d: number) => 1 / (1 + d / FT_ATM);
/** the ball's width as a fraction of its width at the surface */
export const sizeAt = (d: number) => Math.cbrt(volAt(d));
/** 0 at the surface .. 1 at a hundred feet: how dark the water is */
export const darkAt = (d: number) => clamp01(d / 100) ** 0.8;
export const FLOOR_Y = -1.05;                                   // the floor's world y when the ball is at a hundred feet
export const floorY = (d: number) => FLOOR_Y - (100 - d) * FT_M;
/** world y of a mark on the wall at depth D feet, when the ball is at d feet */
export const markY = (D: number, d: number) => (d - D) * FT_M - 0.05;
export const BALL_C: V3 = [0, 0.25, 0];                         // the ball under water (centre), the barbell under it
export const BAR_C: V3 = [0, -0.8, 0];
export const WALL_Z = -1.1;
export type DeepParams = { depth: number; floor: boolean };

// ---------------- the scale (board) ----------------
export const PIVOT: V3 = [0, 0.9, 0], ARM = 0.8, HANGS = 0.75;
/** beam angle (radians, positive = left pan down) */
export const beamAt = (f: number) => {
  const a = 0.26 * ease(f, WBLOCK, WBLOCK + 10), n = f - LEVEL + 12;
  return n < 0 ? a : 0.26 * Math.exp(-n / 9) * Math.cos(n / 4.5);
};
/** how far the lens has climbed up the column of air */
export const climb = (f: number) => 4.9 * ease(f, TILT, SPACE + 4);

// ---------------- options of each shot's place for this frame ----------------
export const placeAt = (id: number, f: number): TownParams | DeepParams | { ground?: boolean } | undefined => {
  const p = S(id).place;
  if (p === "deep") return { depth: depthAt(id, f), floor: true };
  if (p === "street") return { ground: true };
  if (p === "board") return { ground: false };
  return { hole: false, mound: true, shovel: "planted", washing: true, grill: true };
};

// ---------------- cameras ----------------
const DEEP = (f: number, f0: number, z = 3.5, y = -0.1, roll = 0, rate = 0.0008): Framing => dolly([0.25, y + 0.15, z], [0, y, 0], pushK(f, f0, rate), { fov: 40, roll });
const GUSF = (f: number, f0: number) => dolly([1.0, 1.3, 2.1], [1.0, 0.92, -1.5], pushK(f, f0, 0.001), { fov: 40 });
const GUSM = (f: number, f0: number) => dolly([1.2, 1.5, 1.5], [1.0, 1.3, -1.55], pushK(f, f0, 0.0012), { fov: 38 });
const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => DEEP(f, 0, 3.0, 0.0, 0.06, 0.001) }],
  2: [{ f: A(2), s: (f) => DEEP(f, A(2), 4.5, -0.2, -0.03) }],
  3: [{ f: A(3), s: (f) => dolly([-1.6, 3.1, 7.6], [0.8, 0.5, -0.6], pushK(f, A(3), 0.001), { fov: 44 }) }, { f: 176, dur: 30, s: (f) => dolly([0.6, 1.6, 3.4], [1.0, 0.8, -1.3], pushK(f, 206, 0.001), { fov: 40 }) }],
  4: [{ f: A(4), s: (f) => DEEP(f, A(4), 3.6, -0.25, 0.04) }],
  5: [{ f: A(5), s: (f) => dolly([0.3, 1.5, 7.2], [0, 1.15, 0], pushK(f, A(5), 0.0008), { fov: 40 }) }],
  6: [{ f: A(6), s: (f) => dolly([1.3, 1.35, 2.7], [1.27, 1.0, -1.5], pushK(f, A(6), 0.001), { fov: 40 }) }],
  7: [{ f: A(7), s: (f) => dolly([1.9, 1.98, -2.0], [2.52, 1.84, -5.08], pushK(f, A(7), 0.0014), { fov: 40 }) }],
  8: [{ f: A(8), s: (f) => GUSF(f, A(8)) }],
  9: [{ f: A(9), s: (f) => dolly([1.25, 1.2, 2.4], [1.0, 0.9, -1.45], pushK(f, A(9), 0.001), { fov: 40 }) }],
  10: [{ f: A(10), s: (f) => DEEP(f, A(10), 3.7, -0.15, 0.03) }],
  11: [{ f: A(11), s: (f) => dolly([0.3, 0.0, 3.6], [0.12, -0.12, 0], pushK(f, A(11), 0.0012), { fov: 40 }) }],
  12: [{ f: A(12), s: (f) => GUSM(f, A(12)) }],
  13: [{ f: A(13), s: (f) => GUSF(f, A(13)) }],
  14: [{ f: A(14), s: (f) => dolly([-1.2, 1.5, 3.9], [WIFE_AT[0] + 0.12, 1.3, WIFE_AT[2]], pushK(f, A(14), 0.0012), { fov: 38 }) }],
  15: [{ f: A(15), s: (f) => dolly([-1.0, 1.42, 3.1], [PLATE[0], 1.36, PLATE[2]], pushK(f, A(15), 0.0012), { fov: 36 }) }],
  16: [{ f: A(16), s: (f) => DEEP(f, A(16), 4.3, 0.35) }],
  17: [{ f: A(17), s: (f) => { const u = climb(f); const t = u / 4.9; return dolly([0.15 + 0.65 * t, 0.6 + u, 7.0 - 2.4 * t], [0.8 * t, 0.45 + u, 0], pushK(f, A(17), 0.0004), { fov: 40 }); } }],
  18: [{ f: A(18), s: (f) => DEEP(f, A(18), 4.9, 0.55) }],
  19: [{ f: A(19), s: (f) => dolly([0.6, 0.15, 3.6], [0, -0.45, 0], pushK(f, A(19), 0.0008), { fov: 40 }) }],
  20: [{ f: A(20), s: (f) => DEEP(f, A(20), 3.7, -0.15, -0.03) }],
  21: [{ f: A(21), s: (f) => GUSF(f, A(21)) }],
  22: [{ f: A(22), s: (f) => GUSM(f, A(22)) }],
  23: [{ f: A(23), s: (f) => dolly([0.3, 1.1, 4.3], [0.04, 0.7, 0.85], pushK(f, A(23), 0.0009, 0.004, 16, TWO - 4), { fov: 40 }) }],
};
/** impact kicks (only where the picture is already moving) */
export const { camAt } = camRig(CAMS, [[FLOOR1, 0.5], [TONS, 0.9]]);

// ---------------- lens: depth of field ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 0 },
  { f: A(7), cInf: 10, focus: focusOn(NB, 1.5) },
  { f: A(8), cInf: 0 },
  { f: A(12), cInf: 9, focus: focusOn(GUS_B, 1.4) },
  { f: A(13), cInf: 0 },
  { f: A(14), cInf: 10, focus: focusOn(WIFE_AT, 1.3) },
  { f: A(16), cInf: 0 },
  { f: A(22), cInf: 9, focus: focusOn(GUS_B, 1.4) },
  { f: A(23), cInf: 0 },
]);
