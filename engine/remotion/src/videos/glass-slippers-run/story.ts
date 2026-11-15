// Timeline of "What If You Ran in Glass Slippers?" (65.9 s, 1977 f at 30 fps), built on the cartoon-short kit
// (src/toon/kit/README.md). Shot boundaries, places, lights, crossfades, the flash and the action frames come from
// engine/videos/glass-slippers-run/shots.json (the sound is built from the same file).
// This file holds the numbers over time: when things happen, where things are, the options of each place, the
// cameras and the depth of field. props.ts holds this video's drawings; staging.ts draws the cast and the cards;
// entry.tsx registers the film. Everything is a pure function of the frame.
import { V3, Key, Framing, SunDef, clamp01, smooth, lerp, readShots, camRig, pushK, dolly, dofTable, focusOn, PARK, TownParams } from "../../toon/kit";
import plan from "../../../../videos/glass-slippers-run/shots.json";

// ---------------- shots ----------------
/** 24 shots: 1 hook elephants | 2 hook run | 3 party wide | 4 Gus | 5 wife | 6 stands, hops | 7 dance | 8 cup |
 *  9 feet | 10 press | 11 ten tons | 12 elephants on the heel | 13 clock | 14 bolts | 15 the step | 16 heel bends |
 *  17 twenty-five | 18 chips (park) | 19 scratches | 20 pull, squeeze | 21 runs | 22 snap | 23 hops home | 24 neighbor */
const SUN: Record<number, SunDef> = { 18: { az: 110 } };
export const T = readShots(plan, SUN);
const S = (id: number) => T.shots[id - 1];

// ---------------- action frames (named events in shots.json) ----------------
export const ELE1 = T.at("ele1"), ELE2 = T.at("ele2"), HOLDS = T.at("holds"), HOOKCRACK = T.at("hookcrack");
export const POSE = T.at("pose"), CIND = T.at("cind"), COVER = T.at("cover"), THINK = T.at("think"), IMAGINE = T.at("imagine"), GULP = T.at("gulp");
export const STAND = T.at("stand"), N1 = T.at("n1"), HOP = T.at("hop"), LAND = T.at("land"), N2 = T.at("n2"), DANCE = T.at("dance"), NOTE1 = T.at("note1"), NOTE2 = T.at("note2"), N3 = T.at("n3");
export const DROP = T.at("drop"), SMASH = T.at("smash"), WHY = T.at("why"), WIGGLE = T.at("wiggle");
export const PRESS1 = T.at("press1"), OK1 = T.at("ok1"), PRESS2 = T.at("press2"), CRUMBLE = T.at("crumble");
export const GCUBE = T.at("gcube"), SUGAR = T.at("sugar"), TENFALL = T.at("tenfall"), TEN = T.at("ten"), TENOK = T.at("tenok"), REVEAL = T.at("reveal"), HEEL = T.at("heel");
export const HAND = T.at("hand"), STRIKE = T.at("strike"), GASP = T.at("gasp"), BOLT = T.at("bolt");
export const STEP = T.at("step"), G1 = T.at("g1"), G2 = T.at("g2"), G3 = T.at("g3"), TILT = T.at("tilt"), SPARK = T.at("spark");
export const BEND = T.at("bend"), SQUEEZE = T.at("squeeze"), STRETCH = T.at("stretch");
export const BARS = T.at("bars"), COUNT = T.at("count"), WEAK = T.at("weak");
export const RIP1 = T.at("rip1"), RIP2 = T.at("rip2"), STRAIN = T.at("strain"), NOTCH = T.at("notch"), TEAR = T.at("tear"), EAT = T.at("eat");
export const LENS = T.at("lens"), SCRATCHES = T.at("scratches"), PULL = T.at("pull"), CRACKRUN = T.at("crackrun"), SPLIT = T.at("split"), NEWBAR = T.at("newbar"), PUSH = T.at("push"), SHUT = T.at("shut");
export const SNAP = T.at("snap"), TRIP = T.at("trip"), HEELFLY = T.at("heelfly"), GONE = T.at("gone");
export const HOPS = [T.at("hop1"), T.at("hop2"), T.at("hop3")], PICK = T.at("pick"), STORY = T.at("story");

// ---------------- the garden at night (lens south of the subject, looking north = -z; screen right is +x) ----------------
export const FLOOR: V3 = [0, 0.03, 0.2], FLOOR_W = 4.4;       // the checkered dance floor (a flat card on the lawn)
export const GUS_AT: V3 = [-0.3, 0, 0.2];                      // Gus in the middle of the floor
export const WIFE_AT: V3 = [1.05, 0, 0.1], NEIGH_AT: V3 = [0.42, 0, -0.4];
export const GUS7: V3 = [-0.5, 0, 0.2], NEIGH7: V3 = [0.46, 0, 0.2];   // the dance
export const CLOCK: V3 = [-1.75, 0, -1.3], CLOCK_H = 2.7, CLOCK_W = 0.9; // pole clock: card foot here; face centre 2.2 m up
export const CUP_AT: V3 = [1.2, 0.03, 0.9];                    // where the cup hits the floor
export const GATE: V3 = [-4.2, 0, 0.6];                        // the white gate (card foot)
export const SNAP_AT: V3 = [-2.7, 0, 0.6];                     // where the heel goes
/** shot 21: Gus runs to screen left */
export const runX = (f: number) => lerp(1.6, SNAP_AT[0], clamp01((f - 1687) / (SNAP - 1687)));
/** shot 23: three hops toward the gate */
export const HOP_N = 14;
export const hopAt = (f: number): { x: number; y: number } => {
  let x = SNAP_AT[0], y = 0;
  HOPS.forEach((f0) => { const u = clamp01((f - f0) / HOP_N); x -= 0.3 * smooth(u); if (u > 0 && u < 1) y = 0.26 * 4 * u * (1 - u); });
  return { x, y };
};

// ---------------- the park ----------------
export const GUS_P: V3 = [PARK[0] - 6.2, 0, PARK[2] - 3.4];

// ---------------- the sky: every diagram is flat cards around the origin, the lens south of them ----------------
export const SHELF_Y = -1.9;                                   // top of the wooden shelf (shots 10, 11, 17)
export const SLIP: V3 = [0.2, -2.2, 0], SLIP_W = 3.0, SLIP_H = 2.1;   // the big slipper (shots 1, 12)
export const FLOOR_Y = -2.3;                                   // floor line of the step diagram (shot 15)

// ---------------- options of each shot's place for this frame ----------------
export const placeAt = (id: number, _f: number): TownParams | { ground?: boolean } | undefined => {
  const place = S(id).place;
  if (place === "sky") return { ground: false };
  return { hole: false, mound: false, shovel: "none", chair: false, washing: false, grill: place === "garden" };
};

// ---------------- cameras ----------------
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const S1 = (f: number) => dolly([0.3, -0.75, 9.3], [0.05, -0.95, 0], pushK(f, 0, 0.0016), { fov: 40, roll: 0.03 });
const S2 = (f: number) => dolly([0.5, 0.85, 4.6], [-0.3, 0.95, 0.2], pushK(f, 115, 0.002), { fov: 40, roll: -0.05 });
const S3 = (f: number) => dolly([0.9, 2.2, 6.6], [-0.15, 1.05, -0.3], pushK(f, 158, 0.0012), { fov: 42 });
const S4 = (f: number) => dolly([0.35, 1.02, 3.95], [-0.3, 0.84, 0.2], pushK(f, 236, 0.002), { fov: 40 });
const S5 = (f: number) => dolly([1.2, 1.52, 3.6], [0.86, 1.46, 0.1], pushK(f, 285, 0.0012), { fov: 38 });
const S6 = (f: number) => dolly([0.3, 1.05, 4.1], [-0.3, 0.9, 0.2], pushK(f, 375, 0.0012), { fov: 40 });
const S7 = (f: number) => dolly([0.0, 1.05, 4.7], [-0.02, 0.9, 0.2], pushK(f, 451, 0.0012), { fov: 40 });
const S8 = (f: number) => dolly([1.05, 0.5, 3.0], [1.2, 0.32, 0.9], pushK(f, 509, 0.0012), { fov: 40 });
const S9 = (f: number) => dolly([-0.15, 0.42, 2.3], [-0.3, 0.34, 0.2], pushK(f, 589, 0.0018), { fov: 40 });
const S10 = (f: number) => dolly([-0.05, -0.9, 8.3], [-0.05, -1.0, 0], pushK(f, 648, 0.0005), { fov: 40 });
const S11 = (f: number) => dolly([0, -0.6, 8.2], [0, -0.7, 0], pushK(f, 783, 0.0006), { fov: 40 });
const S12a = (f: number) => dolly([-0.5, -2.75, 4.4], [-0.72, -2.8, 0], pushK(f, 887, 0.001), { fov: 40 });
const S12b = (f: number) => dolly([0.3, -0.75, 9.3], [0.05, -0.95, 0], pushK(f, 905, 0.0012), { fov: 40, roll: -0.02 });
const S13 = (f: number) => dolly([-1.45, 2.05, 1.9], [-1.75, 2.2, -1.3], pushK(f, 941, 0.0015), { fov: 38 });
const S14 = (f: number) => dolly([0.3, 1.05, 4.1], [-0.3, 0.9, 0.2], pushK(f, 982, 0.0015), { fov: 40, roll: 0.03 });
const S15 = (f: number) => dolly([0, -0.55, 9.4], [0, -0.65, 0], pushK(f, 1013, 0.0005), { fov: 40 });
const S16 = (f: number) => dolly([0, -0.1, 9.0], [0, -0.2, 0], pushK(f, 1137, 0.0006), { fov: 40 });
const S17 = (f: number) => dolly([0, -0.3, 8.3], [0, -0.4, 0], pushK(f, 1251, 0.0007), { fov: 40 });
const S18a = (f: number) => dolly([GUS_P[0] - 0.3, 1.32, GUS_P[2] - 3.3], [GUS_P[0], 1.14, GUS_P[2]], pushK(f, 1328, 0.0008), { fov: 38 });
const S18b = (f: number) => dolly([GUS_P[0] - 0.2, 1.38, GUS_P[2] - 2.75], [GUS_P[0], 1.24, GUS_P[2]], pushK(f, 1435, 0.0012), { fov: 38, roll: 0.02 });
const S19 = (f: number) => dolly([0, 0.1, 9.0], [0, 0, 0], pushK(f, 1467, 0.0006), { fov: 40 });
const S20 = (f: number) => dolly([0, 0.1, 8.6], [0, 0, 0], pushK(f, 1560, 0.0004), { fov: 40 });
const S21 = (f: number): Framing => { const x = runX(f); return { pos: [x + 0.55, 0.95, 4.8], look: [x - 0.25, 0.85, 0.6], fov: 40, roll: 0.03 }; };
const S22 = (f: number) => dolly([-2.85, 0.95, 4.9], [-3.2, 0.8, 0.6], pushK(f, 1743, 0.0008), { fov: 42, roll: -0.03 });
const S23 = (f: number): Framing => { const k = smooth((f - 1828) / 66); return dolly(mix3([-2.85, 0.95, 4.75], [-3.3, 0.95, 4.75], k), mix3([-3.2, 0.8, 0.6], [-3.6, 0.82, 0.6], k), 1, { fov: 42, roll: -0.03 * (1 - k) }); };
const S24 = (f: number) => dolly([0.3, 1.3, 3.6], [0.02, 1.2, 0.2], pushK(f, 1898, 0.0014, 0.004, 20, STORY - 4), { fov: 38 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1 }], 2: [{ f: 115, s: S2 }], 3: [{ f: 158, s: S3 }], 4: [{ f: 236, s: S4 }], 5: [{ f: 285, s: S5 }], 6: [{ f: 375, s: S6 }],
  7: [{ f: 451, s: S7 }], 8: [{ f: 509, s: S8 }], 9: [{ f: 589, s: S9 }], 10: [{ f: 648, s: S10 }], 11: [{ f: 783, s: S11 }],
  12: [{ f: 887, s: S12a }, { f: 889, dur: 32, s: S12b }],        // back and up to the elephants, centred on 905
  13: [{ f: 941, s: S13 }], 14: [{ f: 982, s: S14 }], 15: [{ f: 1013, s: S15 }], 16: [{ f: 1137, s: S16 }], 17: [{ f: 1251, s: S17 }],
  18: [{ f: 1328, s: S18a }, { f: 1422, dur: 26, s: S18b }],      // in on the notch, centred on 1435
  19: [{ f: 1467, s: S19 }], 20: [{ f: 1560, s: S20 }], 21: [{ f: 1691, s: S21 }], 22: [{ f: 1743, s: S22 }], 23: [{ f: 1828, s: S23 }], 24: [{ f: 1898, s: S24 }],
};
/** impact kicks (only where the picture is already moving) */
const KICKS: [number, number][] = [[ELE1, 0.5], [ELE2, 0.5], [HOOKCRACK, 0.5], [TEN, 0.8], [CRUMBLE, 0.5], [STEP, 0.4], [SNAP, 0.5]];
export const { camAt } = camRig(CAMS, KICKS);

// ---------------- lens: depth of field ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 0 },
  { f: 236, cInf: 8, focus: focusOn(GUS_AT, 1.2) },
  { f: 285, cInf: 12, focus: focusOn(WIFE_AT, 1.4) },
  { f: 375, cInf: 8, focus: focusOn(GUS_AT, 1.2) },
  { f: 451, cInf: 0 },
  { f: 509, cInf: 9, focus: focusOn(CUP_AT, 0.2) },
  { f: 589, cInf: 9, focus: focusOn(GUS_AT, 0.2) },
  { f: 648, cInf: 0 },
  { f: 941, cInf: 10, focus: focusOn(CLOCK, 2.2) },
  { f: 982, cInf: 0 },
  { f: 1328, cInf: 12, focus: focusOn(GUS_P, 1.3) },
  { f: 1467, cInf: 0 },
  { f: 1898, cInf: 12, focus: focusOn([-0.2, 0, 0.2], 1.3) },
]);
