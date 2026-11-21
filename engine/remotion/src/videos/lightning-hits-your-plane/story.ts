// Timeline of "What If Lightning Hit Your Plane?" (65.5 s, 1965 f at 30 fps), built on the cartoon-short kit
// (src/toon/kit/README.md). Shot boundaries, places, lights, crossfades, flashes and action frames come from
// engine/videos/lightning-hits-your-plane/shots.json (the sound is built from the same file). This file holds the
// numbers over time; places.ts the night cabin; props.ts the drawings; staging.ts the cast. Pure functions of the frame.
import { V3, Key, Framing, SunDef, clamp01, smooth, lerp, readShots, camRig, pushK, dolly, dofTable, focusOn, TownParams } from "../../toon/kit";
import plan from "../../../../videos/lightning-hits-your-plane/shots.json";
import { WALL_Z, DOOR_X, LAV_X, GUS_D, GUS_L, LAV_KNOB, seatAt } from "../plane-door-midflight/story";

export { WALL_Z, DOOR_X, LAV_X, GUS_D, GUS_L, LAV_KNOB, seatAt };

// ---------------- shots ----------------
const SUN: Record<number, SunDef> = {};
for (const s of plan.shots) if (s.place === "cabin") SUN[s.id] = { az: 110 };
/** 21 shots: 1 hook: the bolt | 2 Gus sleeps through | 3 into the storm cloud | 4-6 the row: bang, scream, hands up |
 *  7 bolt against the fuse | 8 nobody hurt | 9 the lazy spark | 10 skin and dime | 11 nose to tail | 12 umbrella |
 *  13 the meter | 14 once a year | 15 the plane sets it off | 16 luckily | 17 dry air | 18 slippers | 19 shuffle |
 *  20 zap | 21 the doorknob did */
export const T = readShots(plan, SUN);
const S = (id: number) => T.shots[id - 1];

// ---------------- action frames (named events of shots.json) ----------------
export const STRIKE = T.at("strike"), SUNPOP = T.at("sun"), SWEAT = T.at("sweat"), HIT = T.at("hit"), WAKE = T.at("wake"), GRUMP = T.at("grump");
export const ENTER = T.at("enter"), STORM = T.at("storm"), BANG = T.at("bang"), FLASH2 = T.at("flash2"), SCREAM = T.at("scream"), HANDS = T.at("hands");
export const BIGBOLT = T.at("bigbolt"), X2000 = T.at("x2000"), FUSE = T.at("fuse"), FINE = T.at("fine"), WHERE = T.at("where");
export const SPARK = T.at("spark"), LAZY = T.at("lazy"), SLIDE = T.at("slide"), SLIDE_END = 740, METAL = T.at("metal");
export const SHINE = T.at("shine"), LENS = T.at("lens"), DIME = T.at("dime"), LAND = T.at("land"), RUN = T.at("run"), JUMP = T.at("jump");
export const UMBRELLA = T.at("umbrella"), RUNS = T.at("runs"), RUNS2 = RUNS + 23, DRY = T.at("dry");
export const PUSH = T.at("push"), FEW = T.at("few"), SOCKET = T.at("socket"), SOCKET2 = T.at("socket2");
export const HITS = [T.at("hit1"), T.at("hit2"), T.at("hit3")], YEAR = T.at("year");
export const TEN = T.at("ten"), NINE = T.at("nine"), POKE = T.at("poke"), SETOFF = T.at("setoff");
export const FAR = T.at("far"), SAFE = T.at("safe"), UNLUCKY = T.at("unlucky"), DRYAIR = T.at("dryair"), CARPET = T.at("carpet"), SLIPPERS = T.at("slippers");
export const SHUFFLE = T.at("shuffle"), REACH = T.at("reach"), ZAP = T.at("zap"), K3000 = T.at("k3000"), SMOKE = T.at("smoke"), KNOB = T.at("knob"), ZAP2 = T.at("zap2");

// ---------------- the sky board: the airliner is a flat card, nose to screen right, the lens south of it ----------------
/** nose and tail of the plane card (centre at the origin, width w) */
export const noseOf = (w: number): V3 => [((1310 - 700) / 1400) * w, ((280 - 260) / 560) * w * 0.4, 0];
export const tailOf = (w: number): V3 => [((86 - 700) / 1400) * w, ((280 - 220) / 560) * w * 0.4, 0];
export const W1 = 7.5, W11 = 8.2, W13 = 7.6;
export const PLANE3 = (f: number): V3 => [lerp(-3.9, 0.2, clamp01((f - 190) / 80) ** 0.9), 0.4 + 0.05 * Math.sin(f * 0.1), 0];
export const PLANE15 = (f: number): V3 => [lerp(-2.6, -1.2, smooth((f - 1410) / 62)), 1.6 + 0.04 * Math.sin(f * 0.1), 0];
/** the lazy spark on the road diagram */
export const FORK: V3 = [-0.5, 1.5, 0.2], SLIDE_FOOT: V3 = [2.75, -3.55, 0.2];
/** the meter */
export const METER: V3 = [0, -3.9, 0], NEEDLE0 = -72, NEEDLE_SOCKET = 60;
export const needleDeg = (f: number) => {
  const few = NEEDLE0 + (NEEDLE_SOCKET - NEEDLE0) * (5.6 / 120);          // 5.6 V on a scale where the socket is 120 V
  const k = smooth((f - FEW) / 5);
  return lerp(NEEDLE0, few, k) + (f >= FEW + 5 ? 2.2 * Math.sin((f - FEW - 5) * 0.9) * Math.exp(-(f - FEW - 5) / 6) : 0);
};

// ---------------- the garden ----------------
export const GUS12: V3 = [0, 0, 0.2];

// ---------------- the cabin at night ----------------
export type NightCabin = { flare?: number };
const flick = (f: number, f0: number, n: number, amp = 1) => (f < f0 || f >= f0 + n ? 0 : amp * (1 - (f - f0) / n) ** 1.5);
/** how bright the windows flare (0..1) */
export const flareAt = (f: number) => Math.min(1, flick(f, HIT, 26) + flick(f, HIT + 40, 12, 0.5) + flick(f, BANG, 22) + flick(f, FLASH2, 30) + flick(f, 380, 14, 0.6) + flick(f, 408, 16, 0.7)
  + flick(f, FAR, 14, 0.75) + flick(f, FAR + 22, 8, 0.4) + flick(f, 600, 8, 0.3));
/** a white veil over the whole cabin picture when the bolt is right outside (0..1) */
export const veilAt = (f: number) => Math.min(0.85, flick(f, HIT, 22, 0.95) ** 1.6 + flick(f, BANG, 22, 0.95) ** 1.6);

export const placeAt = (id: number, f: number): TownParams | NightCabin | { ground?: boolean } | undefined => {
  const place = S(id).place;
  if (place === "sky") return { ground: false };
  if (place === "garden") return { hole: false, mound: false, shovel: "none", chair: false, washing: false, grill: false } as TownParams;
  return { flare: flareAt(f) };
};

// ---------------- cameras ----------------
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const board = (f: number, f0: number, look: V3 = [0, 0.4, 0], z = 23.5, rate = 0.0006, roll = 0) => dolly([look[0], look[1] + 3.6, z], look, pushK(f, f0, rate), { fov: 40, roll });
const ROW = (f0: number, roll = 0) => (f: number) => dolly([-2.6, 1.32, -1.16], [1.7, 1.24, -1.18], pushK(f, f0, 0.0005), { fov: 40, roll });
const S1 = (f: number) => dolly([0.2, 1.0, 21.5], [0.2, 1.9, 0], pushK(f, 0, 0.0022), { fov: 40, roll: 0.045 });
const S3 = (f: number): Framing => { const k = clamp01((f - 197) / 84); return { pos: mix3([-0.6, 0.9, 25], [0.5, 0.9, 23.5], k), look: mix3([-0.6, 0.8, 0], [0.5, 0.8, 0], k), fov: 40, roll: -0.02 }; };
const S12 = (f: number) => dolly([0.5, 1.5, 4.7], [0.33, 1.5, 0.2], pushK(f, 1017, 0.0007), { fov: 40 });
const S16 = (f: number) => dolly([-0.2, 1.35, 2.0], [-0.33, 1.32, -1.5], pushK(f, 1516, 0.0015), { fov: 40 });
const S17 = (f: number) => dolly([0.05, 1.3, 1.8], [-0.38, 1.22, -1.3], pushK(f, 1579, 0.0012), { fov: 40, roll: 0.025 });
const S18 = (f: number): Framing => { const x = lerp(-0.3, -0.62, clamp01((f - 1647) / 73)); return { pos: [x + 0.12, 0.42, 0.75], look: [x, 0.2, -1.3], fov: 38, roll: -0.02 }; };
const S19a = (f: number) => dolly([-0.5, 1.25, 2.4], [-0.6, 1.12, -1.5], pushK(f, 1720, 0.001), { fov: 40 });
const S19b = (f: number) => dolly([-1.22, 1.25, 2.2], [-1.34, 1.15, -1.6], pushK(f, 1745, 0.0008), { fov: 40 });
const S20 = (f: number) => dolly([-1.2, 1.2, 1.55], [-1.25, 1.15, -1.6], pushK(f, 1799, 0.0016), { fov: 38, roll: 0.03 });
const S21 = (f: number) => dolly([-1.05, 1.28, 1.7], [-1.15, 1.2, -1.6], pushK(f, 1875, 0.0012), { fov: 40 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1 }],
  2: [{ f: 92, s: ROW(92, 0.03) }],
  3: [{ f: 197, s: S3 }],
  4: [{ f: 281, s: ROW(281) }],
  7: [{ f: 439, s: (f) => board(f, 439, [0, 0.2, 0]) }],
  8: [{ f: 563, s: ROW(563, -0.02) }],
  9: [{ f: 646, s: (f) => board(f, 646, [0, -0.3, 0], 23) }],
  10: [{ f: 798, s: (f) => board(f, 798, [0, -1.6, 0], 23) }],
  11: [{ f: 885, s: (f) => board(f, 885, [0.3, 0.6, 0], 24, 0.0006, 0.02) }],
  12: [{ f: 1017, s: S12 }],
  13: [{ f: 1161, s: (f) => board(f, 1161, [0, 0, 0]) }],
  14: [{ f: 1306, s: (f) => board(f, 1306, [0.5, 0.2, 0]) }],
  15: [{ f: 1414, s: (f) => board(f, 1414, [0, -0.6, 0], 23.5, 0.0006, -0.02) }],
  16: [{ f: 1516, s: S16 }, { f: 1568, dur: 20, s: S17 }],             // one move for 'Luckily ... Unluckily', centred on 1578
  18: [{ f: 1647, s: S18 }],
  19: [{ f: 1720, s: S19a }, { f: 1724, dur: 40, s: S19b }],               // follows him to the lavatory door
  20: [{ f: 1799, s: S20 }],
  21: [{ f: 1875, s: S21 }],
};
CAMS[5] = CAMS[4]; CAMS[6] = CAMS[4]; CAMS[17] = CAMS[16];
/** impact kicks (only where the picture is already busy) */
const KICKS: [number, number][] = [[STRIKE, 0.9], [HIT, 0.6], [BANG, 0.8], [LAND, 0.4], [SETOFF, 0.4], [ZAP, 0.3]];
export const { camAt } = camRig(CAMS, KICKS);

// ---------------- lens: depth of field ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 0 },
  { f: 92, cInf: 7, focus: focusOn(seatAt(1), 1.0) },
  { f: 197, cInf: 0 },
  { f: 281, cInf: 7, focus: focusOn(seatAt(1), 1.0) },
  { f: 439, cInf: 0 },
  { f: 563, cInf: 7, focus: focusOn(seatAt(1), 1.0) },
  { f: 646, cInf: 0 },
  { f: 1017, cInf: 8, focus: focusOn(GUS12, 1.4) },
  { f: 1161, cInf: 0 },
]);
