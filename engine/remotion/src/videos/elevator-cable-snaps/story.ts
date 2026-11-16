// Timeline of "What If the Elevator Cable Snapped?" (66.5 s, 1994 f at 30 fps), built on the cartoon-short kit
// (src/toon/kit/README.md). Shot boundaries, places, lights, crossfades, the flash and the action frames come from
// engine/videos/elevator-cable-snaps/shots.json (the sound is built from the same file).
// This file holds the numbers over time: when things happen, where things are, the options of each place, the
// cameras and the depth of field. places.ts builds the lift car in its shaft; props.ts holds the drawings;
// staging.ts draws the cast; entry.tsx registers the film. Everything is a pure function of the frame.
import { V3, Key, SunDef, clamp01, smooth, lerp, lin, readShots, camRig, pushK, dolly, dofTable, focusOn, TownParams } from "../../toon/kit";
import plan from "../../../../videos/elevator-cable-snaps/shots.json";

// ---------------- shots ----------------
const SUN: Record<number, SunDef> = {};
for (const s of plan.shots) SUN[s.id] = s.place === "sky" ? { az: 150, el: 40 } : { az: 112 };
/** 21 shots: 1 hook outside | 2 hook inside | 3 steps in | 4 six ropes | 5 one rope | 6 the plan | 7 math | 8 building
 *  and dial | 9 best jump | 10 ropes snap | 11 drops | 12 floats, stops | 13 but wait | 14 the governor | 15-16 seat
 *  belt | 17 two wedges | 18 wedge diagram | 19 luckily, unluckily | 20 five feet | 21 still wants to jump */
export const T = readShots(plan, SUN);
const S = (id: number) => T.shots[id - 1];

// ---------------- action frames (named events of shots.json) ----------------
export const HSNAP = T.at("hsnap"), HSTOP = T.at("hstop");
export const STEPIN = T.at("stepin"), FLOOR20 = T.at("floor20"), WAVE = T.at("wave");
export const SIX = T.at("six"), SLACK = T.at("slack"), PACKED = T.at("packed"), HOLDS = T.at("holds");
export const PLAN = T.at("plan"), NCROUCH = T.at("ncrouch"), NHOP = T.at("nhop"), NLAND = T.at("nland"), MATH = T.at("math");
export const BFALL = T.at("bfall"), B76 = T.at("seventysix"), GHOP = T.at("ghop"), SIX6 = T.at("six6");
export const SNAP_A = T.at("snapA"), SNAP = T.at("snap"), DROP = T.at("drop"), FLOAT = T.at("float"), READY = T.at("ready"), STOP = T.at("stop");
export const WHY = T.at("why"), WHEEL = T.at("wheel"), FASTER = T.at("faster"), FLYOUT = T.at("flyout"), TRIP = T.at("trip");
export const BELT = T.at("belt"), PULL = T.at("pull"), YANK = T.at("yank"), LOCKS = T.at("locks");
export const WEDGE1 = T.at("wedge1"), WEDGE2 = T.at("wedge2"), JAM = T.at("jam"), SPARKS = T.at("sparks"), PULLS = T.at("pulls"), BITE = T.at("bite");
export const NOPOWER = T.at("nopower"), NOCOMP = T.at("nocomputer"), NOLUCK = T.at("noluck"), UNLUCKY = T.at("unlucky"), LIFT = T.at("lift"), NOPE = T.at("nope");
export const FIVEFT = T.at("fivefeet"), FINE = T.at("fine"), BETWEEN = T.at("between"), CROUCH = T.at("crouch"), LASTJUMP = T.at("lastjump");

// ---------------- the lift (this video's place; metres, y up, the car floor at y 0, the lens looks north, -z) ----------------
export const CAR_X = 1.1, CAR_Z0 = -1.5, CAR_Z1 = 0.1, CAR_H = 2.4;     // inside: x -1.1..1.1, z -1.5..0.1
export const ROPE_Z = -0.75, ROPE_Y = 2.78, ROPE_X = (i: number) => -0.3 + 0.12 * i;   // six ropes on the crosshead
export const RAIL_X = 1.42, STOREY = 3.1, FELL = 1.5;                    // five feet
export const GUS_AT: V3 = [-0.45, 0, -0.7], NB_AT: V3 = [0.5, 0, -0.7], GUS9: V3 = [-0.32, 0, -0.7];
export const DIAL9: V3 = [0.42, 1.5, -0.55];
export type LiftParams = {
  /** metres the car has fallen: the shaft's floors move up by this */
  scroll?: number;
  /** per rope: frames since it parted (negative = whole) */
  snap?: number[];
  /** 0..1: ropes shiver before they part */
  shiver?: number;
  /** 0..1: every rope but one hangs slack */
  slack?: number;
  /** metres the car sags */
  sag?: number;
  /** number on the car's floor indicator; -1 = two dashes, -2 = dark */
  floor?: number;
  /** 0..1 a glint on the indicator */
  glow?: number;
  /** the wedges have bitten */
  wedge?: number;
};
const WHOLE = [-1, -1, -1, -1, -1, -1], GONE = [999, 999, 999, 999, 999, 999];
export const SNAPS10 = [SNAP_A, SNAP_A + 4, SNAP_A + 8, SNAP_A + 11, SNAP_A + 15, SNAP];   // shot 10: one after another
/** the hook's fall and shot 11's: metres fallen */
const fall1 = (f: number) => (f < HSNAP + 2 ? 0 : 0.012 * (f - HSNAP - 2) ** 2);
const fall11 = (f: number) => 4 + 0.42 * (f - 798) + 0.004 * (f - 798) ** 2;
export const sagAt = (f: number) => 0.09 * smooth((f - PACKED) / 5) * (1 + 0.5 * Math.exp(-Math.max(0, f - PACKED - 5) / 6) * Math.cos((f - PACKED - 5) * 0.8));
export const placeAt = (id: number, f: number): TownParams | LiftParams | { ground?: boolean } | undefined => {
  const place = S(id).place;
  if (place === "sky") return { ground: false };
  if (place === "garden") return { hole: false, mound: false, shovel: "none", chair: false, washing: true, grill: true };
  const blink = Math.floor(f / 9) % 2 === 0;
  if (id === 1) return { scroll: fall1(f), snap: WHOLE.map((_v, i) => f - (HSNAP + (i % 2))), shiver: 1, floor: 20 };
  if (id === 4) return { floor: 20 };
  if (id === 5) return { slack: smooth((f - SLACK) / 10), sag: f >= PACKED ? sagAt(f) : 0, floor: 20 };
  if (id === 10) return { snap: SNAPS10.map((s) => f - s), shiver: smooth((f - 743) / 12), floor: 20 };
  if (id === 11) return { scroll: fall11(f), snap: GONE, floor: 20 };
  if (id === 13 || id === 17 || id === 20) return { scroll: FELL, snap: GONE, wedge: 1, floor: -1 };
  if (id === 2) return { floor: f < HSTOP ? 20 : -1 };
  if (id === 12) return { floor: f < STOP ? 20 : -1 };
  if (id >= 19) return { floor: id === 21 && f >= BETWEEN - 2 && !blink ? -2 : -1 };
  return { floor: 20, glow: id === 3 ? Math.max(0, 1 - Math.abs(f - FLOOR20 - 4) / 8) : 0 };
};

// ---------------- the sky diagrams (flat cards at z 0, the lens 10 m south: the frame is 4.1 m wide, 7.3 m tall) ----------------
export const BLD: V3 = [-1.05, 0.0, 0], BLD_W = 1.5, BLD_H = 6.0;      // the cutaway building (canvas 350 x 1400)
export const DIAL8: V3 = [0.9, 0.6, 0.05];
/** shot 8: the tiny car's fall 0..1 down the building, and the speed shown (mph) */
export const bfall = (f: number) => clamp01((f - BFALL) / (B76 - 4 - BFALL)) ** 2;
export const mph8 = (f: number) => 76 * Math.sqrt(bfall(f));
/** shot 9: Gus's hop (metres) and what the dial shows */
export const hop = (f: number, f0: number, h = 0.38, n = 14) => { const u = (f - f0) / n; return u <= 0 || u >= 1 ? 0 : 4 * h * u * (1 - u); };
export const mph9 = (f: number) => 6 * smooth((f - SIX6 + 6) / 9) * (1 - 0.6 * smooth((f - SIX6 - 8) / 10)) + 0;
/** shot 14: the governor. The car icon rides down its rails; the wheel turns with it (rolling without slipping) */
export const GOV: V3 = [0.75, 1.75, 0.02], GOV_R = 0.72, ICON_X = -1.3, LEVER: V3 = [1.62, 0.95, 0.04];
const iconDrop = (f: number) => {
  const slow = 0.011 * Math.max(0, Math.min(f, TRIP) - 1068);
  const t = Math.max(0, Math.min(f, TRIP) - FASTER), fast = 0.00052 * t * t;
  const v = 0.011 + 0.00104 * (TRIP - FASTER), u = clamp01((f - TRIP) / 12), coast = f > TRIP ? v * 12 * (u - u * u / 2) : 0;
  return slow + fast + coast;
};
export const iconY = (f: number) => 2.55 - iconDrop(f);
export const wheelAngle = (f: number) => iconDrop(f) / GOV_R;
export const flyK = (f: number) => smooth((f - FLYOUT + 2) / 12);
/** shot 18: the wedge. Canvas 900 x 1200 shown 4 x 5.33 m: 225 px per metre */
export const WPX = 225, WDG_BG: V3 = [0, -0.1, 0];
export const jamK = (f: number) => smooth((f - JAM + 3) / 5);

// ---------------- the garden: a small red car on the lawn, seen from its side ----------------
export const CAR_AT: V3 = [0.5, 0, 0.5], CAR_W = 3.3, CAR_HT = (CAR_W * 520) / 1100;
export const GUS_SEAT: V3 = [CAR_AT[0] - 0.4, 0.33, CAR_AT[2] + 0.02];
export const REEL: V3 = [CAR_AT[0] - 0.81, 1.36, CAR_AT[2] + 0.06];

// ---------------- cameras ----------------
const TWO = (f0: number, rate = 0.0012, roll = 0) => (f: number) => dolly([0.03, 1.3, 3.6], [0.03, 1.12, -0.7], pushK(f, f0, rate), { fov: 40, roll });
const NB_MED = (f0: number) => (f: number) => dolly([0.56, 1.38, 2.5], [0.62, 1.28, -0.7], pushK(f, f0, 0.0012), { fov: 40 });
const NB_FULL = (f0: number) => (f: number) => dolly([0.4, 1.3, 3.0], [0.46, 1.16, -0.7], pushK(f, f0, 0.001), { fov: 40 });
const OUT = (f0: number, rate = 0.001, roll = 0) => (f: number) => dolly([0.35, 0.5, 6.1], [0, 1.95, -0.7], pushK(f, f0, rate), { fov: 42, roll });
const SKY = (f0: number, rate = 0.0005) => (f: number) => dolly([0, 0, 10], [0, 0, 0], pushK(f, f0, rate), { fov: 40 });
const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => dolly([0.35, 0.3, 6.0], [0, 2.0, -0.7], pushK(f, 0, 0.002), { fov: 42, roll: 0.05 * smooth((f - HSNAP) / 10) }) }],
  2: [{ f: 56, s: TWO(56, 0.002, 0.04) }],
  3: [{ f: 122, s: TWO(122) }, { f: 236, dur: 28, s: NB_MED(250) }],
  4: [{ f: 273, s: (f) => dolly([0.9, -0.6, 4.4], [0, 2.7, -0.75], pushK(f, 273, 0.0008), { fov: 44 }) },
      { f: 280, dur: 40, s: (f) => dolly([0.9, 0.3, 4.4], [0, 5.0, -0.75], pushK(f, 300, 0.0008), { fov: 44 }) }],
  5: [{ f: 354, s: (f) => dolly([0.3, 0.9, 6.5], [0, 2.1, -0.7], pushK(f, 354, 0.0012), { fov: 42 }) }],
  6: [{ f: 416, s: TWO(416) }, { f: 462, dur: 30, s: NB_FULL(477) }],
  7: [{ f: 547, s: (f) => dolly([-0.5, 1.42, 2.3], [-0.52, 1.32, -0.7], pushK(f, 547, 0.002), { fov: 38 }) }],
  8: [{ f: 585, s: SKY(585) }],
  9: [{ f: 698, s: (f) => dolly([0.03, 1.3, 3.1], [0.03, 1.22, -0.7], pushK(f, 698, 0.0015), { fov: 40 }) }],
  10: [{ f: 743, s: (f) => dolly([0.55, 2.9, 3.0], [0, 3.35, -0.75], pushK(f, 743, 0.0025), { fov: 40 }) }],
  11: [{ f: 798, s: OUT(798, 0.002, -0.06) }],
  12: [{ f: 823, s: TWO(823, 0.0006, -0.03) }, { f: 896, dur: 40, s: TWO(823, 0.0006, 0.035) }],
  13: [{ f: 973, s: OUT(973, 0.0006) }, { f: 990, dur: 36, s: (f) => dolly([0.35, 1.6, 6.3], [0, 3.3, -0.7], pushK(f, 1008, 0.0006), { fov: 42 }) }],
  14: [{ f: 1068, s: SKY(1068) }],
  15: [{ f: 1258, s: (f) => dolly([CAR_AT[0] - 0.3, 1.3, CAR_AT[2] + 4.7], [CAR_AT[0] - 0.35, 1.1, CAR_AT[2]], pushK(f, 1258, 0.0012), { fov: 40 }) }],
  16: [{ f: 1348, s: (f) => dolly([CAR_AT[0] - 0.4, 1.4, CAR_AT[2] + 3.3], [CAR_AT[0] - 0.45, 1.3, CAR_AT[2]], pushK(f, 1348, 0.0015), { fov: 38 }) }],
  17: [{ f: 1389, s: (f) => dolly([0.3, -1.7, 7.8], [0, -0.1, -0.75], pushK(f, 1389, 0.0016), { fov: 42 }) }],
  18: [{ f: 1470, s: SKY(1470, 0.0006) }],
  19: [{ f: 1594, s: TWO(1594, 0.0008) }],
  20: [{ f: 1782, s: (f) => dolly([0.3, 1.7, 7.6], [0, 2.35, -0.7], pushK(f, 1782, 0.0008), { fov: 42 }) }],
  21: [{ f: 1880, s: TWO(1880, 0.001) }],
};
/** impact kicks (only where the picture is already busy) */
export const { camAt } = camRig(CAMS, [[HSNAP, 0.6], [HSTOP, 1.0], [SNAP, 0.5], [STOP, 1.2], [TRIP, 0.3]]);

// ---------------- lens: the car's wall is right behind the cast, so only the garden gets depth of field ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 0 },
  { f: 1258, cInf: 7, focus: focusOn(GUS_SEAT, 1.0) },
  { f: 1348, cInf: 10, focus: focusOn(GUS_SEAT, 1.0) },
  { f: 1389, cInf: 0 },
]);
export { lin, lerp };
