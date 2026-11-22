// Timeline of "What If a Fart Was Your Only Rocket in Space?" (64.9 s, 1948 f at 30 fps), built on the cartoon-short
// kit (src/toon/kit/README.md). Shot boundaries, places, lights, crossfades, the flash and the action frames come
// from engine/videos/fart-rocket-in-space/shots.json (the sound is built from the same file).
// This file holds the numbers over time: when things happen, where things are, the options of each place, the
// cameras and the depth of field. props.ts holds this video's drawings; staging.ts draws the cast and the cards;
// places.ts the empty space; entry.tsx registers the film. Everything is a pure function of the frame.
import { V3, Key, Framing, SunDef, smooth, lerp, readShots, camRig, pushK, dolly, dofTable, focusOn, TownParams } from "../../toon/kit";
import plan from "../../../../videos/fart-rocket-in-space/shots.json";
import { HATCH_C, RING_C, WIN_C } from "./props";

// ---------------- shots ----------------
/** 24 shots: 1 hook | 2 over the ocean | 3 the rope | 4 kicks, swims, nothing | 5 wife and neighbor | 6 beans |
 *  7 turns and fires | 8 straight out the back | 9 moving | 10 a hair's width | 11 three weeks | 12 eight hours |
 *  13 but wait | 14 rocket | 15 how much, how fast | 16 skateboard | 17 rolls away | 18 a tenth of a gram |
 *  19 460 pounds | 20 the slipper | 21 half a pound at 20 | 22 x6000 | 23 through the hatch | 24 airtight */
const SUN: Record<number, SunDef> = { 6: { az: 110 }, 16: { az: 112 }, 17: { az: 112 }, 24: { az: 120, el: 40 } };
export const T = readShots(plan, SUN);
const S = (id: number) => T.shots[id - 1];

// ---------------- action frames (named events in shots.json) ----------------
const at = T.at;
export const PULLBACK = at("pullback"), RULER = at("ruler"), THINK = at("think"), PUFF1 = at("puff1");
export const GLINT = at("glint"), UNCLIP = at("unclip"), KICK = at("kick"), SWIM = at("swim"), NOTHING = at("nothing"), BACK4 = at("back4"), PUSH = at("push");
export const RADIO = at("radio"), WIFETHROW = at("wifethrow"), GONER = at("goner"), BEANS = at("beans"), CHOMP = at("chomp");
export const TURN = at("turn"), FIRE = at("fire"), ARROWBACK = at("arrowback"), THUMB = at("thumb"), HERO = at("hero"), MOVING = at("moving");
export const LENS = at("lens"), TICK1 = at("tick1"), WK = [at("wk1"), at("wk2"), at("wk3")], ALARM = at("alarm"), GULP = at("gulp");
export const WAIT = at("wait"), Q1 = at("q1"), ROCKETPASS = at("rocketpass"), WEAK = at("weak"), UP = at("up"), DOWN = at("down");
export const MUCH = at("much"), TIMES = at("times"), FAST = at("fast"), BOARD = at("board"), THROW = at("throw"), PACKLAND = at("packland"), ROLL = at("roll");
export const PUFFSCALE = at("puffscale"), READ = at("read"), ONESEC = at("onesec"), STEP = at("step"), DIAL = at("dial"), LBS = at("lbs");
export const SLIPOFF = at("slipoff"), WINDUP = at("windup"), HURL = at("hurl"), HALF = at("half"), TWENTY = at("twenty"), DRIFT = at("drift"), X6000 = at("x6000");
export const FIVE = at("five"), ENTER = at("enter"), HATCHSHUT = at("hatch"), SEAL = at("seal"), GREENF = at("green"), UHOH = at("uhoh"), END = at("end");

// ---------------- space: flat cards near z = 0, the lens south of them looking toward -z (screen right = +x) ----------------
/** the hull card: 6 x 6 m, 200 canvas px per metre */
export const SHIP: V3 = [2.6, -3.0, -0.3], SHIP_W = 6;
const onHull = (c: [number, number], z = 0): V3 => [SHIP[0] + (c[0] - 600) / 200, SHIP[1] + (600 - c[1]) / 200, z];
export const HATCH = onHull(HATCH_C), RING = onHull(RING_C), WIN = [onHull(WIN_C[0]), onHull(WIN_C[1])];
/** Gus's body centre while he is stranded */
export const G0: V3 = [-0.6, 1.0, 0];
/** his roll once he has turned: head toward the hatch, seat away from it */
export const AIM = Math.atan2(-(HATCH[0] - G0[0]), HATCH[1] - G0[1]);
export const rollAt = (f: number) => (f < TURN ? 0 : f < S(12).a ? AIM * smooth((f - TURN) / 20) : 0);
/** the slipper's push: Gus's body centre from shot 22 on, gliding to the hatch and in */
export const homeK = (f: number) => smooth((f - (DRIFT - 20)) / (ENTER + 6 - (DRIFT - 20))) ** 0.9;
export const gusHome = (f: number): V3 => { const k = homeK(f); return [lerp(G0[0], HATCH[0], k), lerp(G0[1], HATCH[1] - 0.1, k), 0]; };

// ---------------- the garden, the road ----------------
export const BEAN_AT: V3 = [-0.3, 0, 0.2];
export const SKATE0: V3 = [-0.25, 0, 0];
/** how far the skateboard has rolled to screen right */
export const rollX = (f: number) => (f < THROW ? 0 : 0.0165 * (f - THROW) * Math.min(1, (f - THROW) / 8));

// ---------------- options of each shot's place for this frame ----------------
export const placeAt = (id: number, _f: number): TownParams | { ground?: boolean } | undefined => {
  const place = S(id).place;
  if (place === "garden") return { hole: false, mound: false, shovel: "none", washing: true, grill: true };
  return { ground: place === "street" };
};

// ---------------- cameras ----------------
const WIDE = (f: number, f0: number, rate = 0.0005): Framing => dolly([0.4, -0.5, 9.6], [0.4, -0.6, 0], pushK(f, f0, rate), { fov: 40 });
const MED = (f: number, f0: number, rate = 0.0012, roll = 0): Framing => dolly([-0.4, 1.2, 4.1], [-0.6, 1.08, 0], pushK(f, f0, rate), { fov: 40, roll });
const BRD = (f: number, f0: number, rate = 0.0006): Framing => dolly([0, 0.05, 9.5], [0, 0, 0], pushK(f, f0, rate), { fov: 40 });
const S17 = (f: number): Framing => { const x = SKATE0[0] + rollX(f); return dolly([x + 0.3, 1.15, 5.0], [x + 0.1, 1.0, 0], pushK(f, 1233, 0.001), { fov: 40 }); };

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => dolly([-0.35, 1.25, 3.5], [-0.6, 1.1, 0], pushK(f, 0, 0.002), { fov: 40, roll: 0.07 }) }, { f: PULLBACK - 2, dur: 34, s: (f) => WIDE(f, PULLBACK + 32) }],
  2: [{ f: 153, s: (f) => dolly([0.8, -1.1, 12.6], [0.8, -1.2, 0], pushK(f, 153, 0.0012), { fov: 40 }) }],
  3: [{ f: 243, s: (f) => dolly([RING[0] - 0.25, RING[1] + 0.45, 3.3], [RING[0] - 0.3, RING[1] + 0.5, 0], pushK(f, 243, 0.0015), { fov: 40 }) }],
  4: [{ f: 300, s: (f) => MED(f, 300) }, { f: BACK4 - 4, dur: 32, s: (f) => WIDE(f, BACK4 + 28) }],
  5: [{ f: 407, s: (f) => dolly([WIN[0][0], WIN[0][1] + 0.05, 3.3], [WIN[0][0], WIN[0][1], 0], pushK(f, 407, 0.001), { fov: 40 }) },
      { f: 456, dur: 24, s: (f) => dolly([WIN[1][0], WIN[1][1] + 0.05, 3.3], [WIN[1][0], WIN[1][1], 0], pushK(f, 480, 0.001), { fov: 40 }) }],
  6: [{ f: 516, s: (f) => dolly([-0.05, 1.15, 4.5], [-0.4, 1.02, 0.2], pushK(f, 516, 0.001), { fov: 40 }) }],
  7: [{ f: 570, s: (f) => WIDE(f, 570, 0.001) }],
  8: [{ f: 617, s: (f) => dolly([-0.75, 1.3, 6.2], [-0.8, 1.25, 0], pushK(f, 617, 0.0012), { fov: 40 }) }],
  9: [{ f: 693, s: (f) => dolly([-0.1, 0.55, 6.6], [-0.1, 0.5, 0], pushK(f, 693, 0.0012), { fov: 40 }) }],
  10: [{ f: 732, s: (f) => dolly([0.3, 0.25, 6.6], [0.3, 0.2, 0], pushK(f, 732, 0.0015), { fov: 40 }) }],
  11: [{ f: 766, s: (f) => WIDE(f, 766, 0.0006) }],
  12: [{ f: 842, s: (f) => MED(f, 842, 0.0025) }],
  13: [{ f: 889, s: (f) => dolly([-0.4, 1.4, 4.7], [-0.6, 1.3, 0], pushK(f, 889, 0.0008), { fov: 40, roll: -0.03 }) }],
  14: [{ f: 994, s: (f) => BRD(f, 994) }], 15: [{ f: 1083, s: (f) => BRD(f, 1083) }],
  16: [{ f: 1147, s: (f) => dolly([0.2, 1.15, 4.9], [0, 1.0, 0], pushK(f, 1147, 0.0012), { fov: 40 }) }],
  17: [{ f: 1233, s: S17 }],
  18: [{ f: 1270, s: (f) => BRD(f, 1270) }], 19: [{ f: 1387, s: (f) => dolly([0, -0.4, 5.1], [0, -0.45, 0], pushK(f, 1387, 0.001), { fov: 40 }) }],
  20: [{ f: 1468, s: (f) => dolly([-0.5, 1.2, 4.9], [-0.6, 1.1, 0], pushK(f, 1468, 0.001), { fov: 40 }) }],
  21: [{ f: 1543, s: (f) => dolly([0, 0.05, 5.2], [0, 0, 0], pushK(f, 1543, 0.001), { fov: 40, roll: 0.05 }) }],
  22: [{ f: 1613, s: (f) => WIDE(f, 1613, 0.0008) }],
  23: [{ f: 1678, s: (f) => dolly([0.9, -1.45, 7.6], [0.9, -1.55, 0], pushK(f, 1678, 0.001), { fov: 40 }) }],
  24: [{ f: 1775, s: (f) => dolly([0.3, 1.4, 3.75], [0.28, 1.34, 0], pushK(f, 1775, 0.0008), { fov: 38 }) },
       { f: GREENF - 6, dur: 36, s: (f) => dolly([0.03, 1.46, 2.15], [0, 1.43, 0], pushK(f, GREENF + 30, 0.0012), { fov: 38 }) }],
};
/** impact kicks (only where the picture is already moving) */
const KICKS: [number, number][] = [[HURL, 0.4], [PACKLAND, 0.3]];
export const { camAt } = camRig(CAMS, KICKS);

// ---------------- lens: depth of field ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 0 },
  { f: 516, cInf: 8, focus: focusOn(BEAN_AT, 1.3) },
  { f: 570, cInf: 0 },
]);
