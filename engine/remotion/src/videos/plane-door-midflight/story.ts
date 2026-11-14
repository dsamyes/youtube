// Timeline of "What If You Tried to Open a Plane Door Mid-Flight?" (65.7 s, 1970 f at 30 fps), built on the
// cartoon-short kit (src/toon/kit/README.md). Shot boundaries, places, lights, crossfades, the flash and the action
// frames come from engine/videos/plane-door-midflight/shots.json (the sound is built from the same file).
// This file holds the numbers over time: when things happen, where things are, the options of each place, the
// cameras and the depth of field. places.ts builds this video's own two places (cabin, sky); props.ts holds its
// drawings; staging.ts draws the cast; entry.tsx registers the film. Everything is a pure function of the frame.
import { V3, Key, Framing, SunDef, clamp01, smooth, lerp, lin, readShots, camRig, pushK, dolly, dofTable, focusOn, TownParams } from "../../toon/kit";
import plan from "../../../../videos/plane-door-midflight/shots.json";

// ---------------- shots ----------------
const DAY: SunDef = { az: 110 };
const SUN: Record<number, SunDef> = {};
for (const s of plan.shots) if (s.place !== "sky") SUN[s.id] = DAY;
SUN[11] = SUN[12] = SUN[13] = SUN[14] = { az: 150, el: 40 };
/** 24 shots: 1 hook | 2 outside | 3 wakes | 4 at the door | 5 wife + neighbor | 6-7 pulls, falls | 8 but wait | 9 gauge |
 *  10 cutaway | 11-14 the door: arrows, square, grid, big weight | 15 four cars | 16-17 suction cup | 18 plug |
 *  19 plug diagram | 20 drags the cars | 21 luckily | 22 unluckily | 23 on the ground | 24 the lavatory */
export const T = readShots(plan, SUN);
const S = (id: number) => T.shots[id - 1];

// ---------------- action frames (from the named events in shots.json) ----------------
export const YANKS = [T.at("yank1"), T.at("yank2"), T.at("yank3")];
export const CALM = T.at("calm"), WAKE = T.at("wake"), THINK = T.at("think"), GRAB = T.at("grab");
export const SCREAM = T.at("scream"), GRABS = T.at("grabs"), BELT = T.at("belt");
export const PULL = T.at("pull"), NOTHING = T.at("nothing1"), FOOT = T.at("foot"), SHOE = T.at("shoe"), SLIP = T.at("slip"), FALL = T.at("fall");
export const FLEX = T.at("flex"), WHY = T.at("why");
export const THIN = T.at("thin"), GAUGE = T.at("gauge"), FIFTH = T.at("fifth"), GROUND = T.at("ground");
export const CUTAWAY = T.at("cutaway"), PUMP1 = T.at("pump1"), PUMP2 = T.at("pump2"), OUT1 = T.at("out1"), OUT2 = T.at("out2");
export const LEAN = T.at("lean"), SQUARE = T.at("square"), EIGHT = T.at("eight"), BACK = T.at("back"), GRID0 = T.at("grid"), GRID1 = 1054;
export const ADDUP = T.at("addup"), SLAM = T.at("slam");
export const CARS = [T.at("car1"), T.at("car2"), T.at("car3"), T.at("car4")], HONK = T.at("honk");
export const STICK = T.at("stick"), TUG1 = T.at("tug1"), TUG2 = T.at("tug2"), NOGLUE = T.at("noglue"), AIRPUSH = T.at("airpush"), CUPOFF = T.at("cupoff");
export const DOORSHINE = T.at("doorshine"), PLUG = T.at("plug"), BUMP1 = T.at("bump1"), BUMP2 = T.at("bump2"), COMEIN = T.at("comein"), SWING = T.at("swing");
export const HEAVE = T.at("heave"), SCRABBLE = T.at("scrabble"), GROAN = T.at("groan");
export const SAFE = T.at("safe"), OOPS = T.at("oops"), DANCE = T.at("dance"), THINK2 = T.at("think2"), LETSGO = T.at("letsgo");
export const SHUFFLE = T.at("shuffle"), ONEDOOR = T.at("onedoor"), KNOB = T.at("knob"), TAKEN = T.at("taken");

// ---------------- the cabin (this video's place; metres, y up). The lens looks north (-z) at the door wall, or
// along +x down the seat rows (then screen right is +z) ----------------
export const WALL_Z = -1.9;                                  // the door wall
export const DOOR_X = 0.2, DOOR_W = 0.9, DOOR_H = 1.92;      // the exit door (centre x, size)
export const LAV_X = -1.75, LAV_W = 0.62, LAV_H = 1.84;      // the lavatory door
export const HANDLE: V3 = [DOOR_X - 0.3, 1.05, WALL_Z + 0.16]; // where a hand holds the exit handle
export const LAV_KNOB: V3 = [LAV_X + 0.22, 1.0, WALL_Z + 0.12], LATCH: V3 = [LAV_X, 1.32, WALL_Z + 0.07];
export const GUS_D: V3 = [-0.42, 0, -1.3];                    // Gus at the exit door
export const GUS_L: V3 = [-1.05, 0, -1.3];                   // Gus at the lavatory door
export const ROW0 = 1.95, ROW_D = 0.82, ROWS = 8;            // seat rows: x of the first, pitch
export const SEAT_Z = [-1.62, -1.14, -0.66];                 // window, middle, aisle (north block)
export const seatAt = (i: number): V3 => [ROW0 - 0.3, 0.06, SEAT_Z[i]]; // card base of someone sitting there ("chair" pose)
/** the grid of squares on the door */
export const GRID_C = 10, GRID_R = 22, SQ = 0.085, SQ0 = { c: 7, r: 6 };
export const sqPos = (col: number, row: number): V3 => [DOOR_X - (GRID_C * SQ) / 2 + (col + 0.5) * SQ, DOOR_H - 0.03 - (row + 0.5) * SQ, WALL_Z + 0.078];
export type CabinParams = { handle?: number; rows?: number; square?: number; busy?: boolean; arrows?: number; push?: number };
export type SkyParams = { ground?: boolean };

// ---------------- the sky: the airliner is a flat card at the origin, the lens south of it ----------------
export const PLANE_W = 9, PLANE_H = (PLANE_W * 560) / 1400;
export const PLANE_DOOR_X = ((1129 - 700) / 1400) * PLANE_W;
export const GROUND_W = 16, GROUND_H = (GROUND_W * 560) / 1400, GROUND_Y = ((468 - 280) / 560) * GROUND_H; // parked: card centre this high
export const GROUND_DOOR: V3 = [((1129 - 700) / 1400) * GROUND_W, GROUND_Y + ((280 - 265) / 560) * GROUND_H, 0];
export const GAUGE_AT: V3 = [0, 6.4, 0];
/** the plug diagram: background card 6 x 8 m at the origin, 150 px per metre */
export const DIA_PX = 150;
export const doorDia = (f: number) => {
  const bump = (f0: number) => (f >= f0 - 3 && f < f0 + 6 ? Math.sin(((f - f0 + 3) / 9) * Math.PI) : 0);
  const inK = smooth((f - COMEIN) / 12), rot = (Math.PI / 2) * smooth((f - SWING) / 8), out = smooth((f - SWING - 5) / 11);
  return { y: 0.2 + 0.07 * (bump(BUMP1) + bump(BUMP2)) - 1.9 * inK + 5.6 * out, rot, x: 0.012 * Math.sin(f * 2.1) * (bump(BUMP1) + bump(BUMP2)) };
};

// ---------------- the garden ----------------
export const STACK: V3 = [0.6, 0, -0.6];                     // the door on the lawn with four cars on it
export const CAR_W = 2.5, CAR_H = 1.2, CAR_STEP = 1.0, SLAB_H = 0.24;
export const carY = (n: number) => SLAB_H + 0.52 + n * CAR_STEP;
export const GUS15: V3 = [-1.05, 0, -0.2], GUS20: V3 = [-1.0, 0, -0.1];
export const GUS16: V3 = [-0.45, 0, 0.3], WIFE16: V3 = [0.52, 0, 0.35];

// ---------------- options of each shot's place for this frame ----------------
const yank = (f: number, f0: number) => (f >= f0 - 3 && f < f0 + 8 ? Math.sin(((f - f0 + 3) / 11) * Math.PI) : 0);
export const yankAt = (f: number) => YANKS.reduce((s, f0) => s + yank(f, f0), 0);
export const placeAt = (id: number, f: number): TownParams | CabinParams | SkyParams | undefined => {
  const place = S(id).place;
  if (place === "sky") return { ground: id === 23 };
  if (place === "garden") return { hole: false, mound: false, shovel: "none", chair: false, washing: true, grill: true };
  const door = id >= 11 && id <= 14;
  return {
    handle: id === 1 ? 0.1 * yankAt(f) : id === 6 || id === 7 ? 0.05 * Math.max(0, Math.sin(f * 0.9)) * (f < SLIP ? 1 : 0) : 0,
    arrows: door ? smooth((f - LEAN + 2) / 6) * (1 - smooth((f - 1012) / 8)) : 0,
    push: 0.05 * Math.sin(f * 0.35) + 0.05,
    square: door ? (f < SQUARE ? 0 : f < SQUARE + 4 ? lerp(0.3, 1.25, (f - SQUARE) / 4) : f < SQUARE + 7 ? lerp(1.25, 1, (f - SQUARE - 4) / 3) : 1) : 0,
    rows: door ? lin([[GRID0, 0], [GRID1, GRID_R]], f) : 0,
    busy: f >= TAKEN,
  };
};

// ---------------- cameras ----------------
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const S1 = (f: number) => dolly([-0.3, 1.0, 2.7], [-0.44, 1.02, -1.5], pushK(f, 0, 0.004), { fov: 40, roll: 0.05 });
// 2: pulls back from the plane's door until the plane is small in the sky
const S2 = (f: number): Framing => { const k = 1 - (1 - clamp01((f - 49) / 88)) ** 2.4; return { pos: mix3([PLANE_DOOR_X + 0.2, 0.2, 6.5], [0.4, 1.4, 36], k), look: mix3([PLANE_DOOR_X, 0.05, 0], [0.2, 0.7, 0], k), fov: 40, roll: 0.03 * (1 - k) }; };
const S3a = (f: number) => dolly([-2.75, 1.3, -1.12], [1.7, 1.2, -1.14], pushK(f, 139, 0.001), { fov: 40 });
const S3b = (f: number) => dolly([-2.0, 1.3, -0.95], [1.7, 1.22, -0.84], pushK(f, 200, 0.0012), { fov: 40, roll: 0.02 });
const S4 = (f: number) => dolly([0.2, 1.3, 2.5], [-0.2, 1.3, -1.5], pushK(f, 237, 0.002), { fov: 40 });
const S5a = (f: number) => dolly([-2.3, 1.3, -1.25], [1.7, 1.2, -1.3], pushK(f, 280, 0.001), { fov: 40 });
const S5b = (f: number) => dolly([-2.1, 1.3, -1.42], [1.7, 1.2, -1.46], pushK(f, 320, 0.0012), { fov: 40, roll: -0.02 });
const S6 = (f: number) => dolly([0.05, 1.1, 2.6], [-0.42, 1.0, -1.5], pushK(f, 368, 0.002), { fov: 40 });
const S7 = (f: number) => dolly([-0.1, 0.95, 2.2], [-0.55, 0.9, -1.5], pushK(f, 423, 0.0015), { fov: 42, roll: -0.045 });
const S8a = (f: number) => dolly([0.1, 1.3, 2.2], [-0.35, 1.2, -1.3], pushK(f, 483, 0.0012), { fov: 40 });
const S8b = (f: number) => dolly([0.2, 1.3, 1.7], [-0.1, 1.3, -1.8], pushK(f, 558, 0.002), { fov: 40, roll: 0.02 });
const S9a = (f: number) => dolly([0, 0.6, 23.5], [0, 0.4, 0], pushK(f, 586, 0.0006), { fov: 40 });
const S9b = (f: number) => dolly([0, 2.9, 27.5], [0, 2.9, 0], pushK(f, 663, 0.0005), { fov: 40 });
const S10 = (f: number) => dolly([0, 0.3, 23.8], [0, 0.2, 0], pushK(f, 745, 0.0008), { fov: 40 });
const S11 = (f: number) => dolly([-1.75, 1.4, 1.0], [0.25, 1.05, -1.9], pushK(f, 850, 0.0009), { fov: 40 });
const S13 = (f: number) => dolly([-1.95, 1.35, 1.35], [0.2, 1.0, -1.9], pushK(f, 1023, 0.0006), { fov: 40 });
const S15 = (f: number) => dolly([0.0, 1.5, 8.4], [0.1, 2.25, -0.6], pushK(f, 1168, 0.001), { fov: 42 });
const S16 = (f: number) => dolly([0.05, 1.42, 4.3], [0.03, 1.22, 0.3], pushK(f, 1247, 0.0014), { fov: 40 });
const S17 = (f: number) => dolly([0.22, 1.55, 2.85], [-0.06, 1.47, 0.3], pushK(f, 1308, 0.0012), { fov: 38 });
const S18 = (f: number) => dolly([0.68, 1.15, 2.4], [0.6, 1.0, -1.9], pushK(f, 1399, 0.0015), { fov: 40 });
const S19 = (f: number) => dolly([0, 0.3, 15.8], [0, 0.2, 0], pushK(f, 1451, 0.0006), { fov: 40 });
const S20 = (f: number) => dolly([-0.5, 1.3, 6.2], [-0.55, 1.75, -0.6], pushK(f, 1551, 0.001), { fov: 42 });
const S21 = (f: number) => dolly([0.3, 1.25, 2.2], [-0.2, 1.15, -1.4], pushK(f, 1644, 0.002), { fov: 40 });
const S22 = (f: number) => dolly([0.05, 1.3, 1.7], [-0.44, 1.15, -1.3], pushK(f, 1693, 0.0015), { fov: 40, roll: 0.03 });
const S23 = (f: number) => dolly([GROUND_DOOR[0] - 0.5, 2.0, 10.5], [GROUND_DOOR[0] - 0.4, 2.7, 0], pushK(f, 1764, 0.0012), { fov: 40 });
const S24a = (f: number) => dolly([-0.4, 1.25, 2.4], [-0.55, 1.12, -1.5], pushK(f, 1829, 0.001), { fov: 40 });
const S24b = (f: number) => dolly([-1.25, 1.25, 2.2], [-1.36, 1.15, -1.6], pushK(f, 1856, 0.0008), { fov: 40 });
const S24c = (f: number) => dolly([-1.22, 1.32, 1.65], [-1.3, 1.32, -1.6], pushK(f, 1936, 0.002), { fov: 40, roll: -0.025 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1 }],
  2: [{ f: 49, s: S2 }],
  3: [{ f: 139, s: S3a }, { f: 186, dur: 28, s: S3b }],          // in on Gus, centred on 200 (he wakes)
  4: [{ f: 237, s: S4 }],
  5: [{ f: 280, s: S5a }, { f: 306, dur: 26, s: S5b }],          // over to the neighbor, centred on 319
  6: [{ f: 368, s: S6 }],
  7: [{ f: 423, s: S7 }],
  8: [{ f: 483, s: S8a }, { f: 540, dur: 36, s: S8b }],          // past him toward the handle, centred on 558
  9: [{ f: 586, s: S9a }, { f: 648, dur: 30, s: S9b }],          // up to make room for the gauge, centred on 663
  10: [{ f: 745, s: S10 }],
  11: [{ f: 850, s: S11 }, { f: 1010, dur: 26, s: S13 }],        // eases back for the whole grid, centred on 1023
  15: [{ f: 1168, s: S15 }],
  16: [{ f: 1247, s: S16 }],
  17: [{ f: 1308, s: S17 }],
  18: [{ f: 1399, s: S18 }],
  19: [{ f: 1451, s: S19 }],
  20: [{ f: 1551, s: S20 }],
  21: [{ f: 1644, s: S21 }],
  22: [{ f: 1693, s: S22 }],
  23: [{ f: 1764, s: S23 }],
  24: [{ f: 1829, s: S24a }, { f: 1834, dur: 40, s: S24b }, { f: 1924, dur: 20, s: S24c }], // follows him left; in on him and the latch, centred on 1934
};
CAMS[12] = CAMS[11]; CAMS[13] = CAMS[11]; CAMS[14] = CAMS[11];
/** impact kicks (only where the picture is already busy) */
const KICKS: [number, number][] = [[YANKS[0], 0.4], [YANKS[1], 0.4], [YANKS[2], 0.4], [FALL, 0.4], [SLAM, 0.9], [CARS[0], 0.3], [CARS[2], 0.3]];
export const { camAt } = camRig(CAMS, KICKS);

// ---------------- lens: depth of field (the cabin's door wall is right behind the cast: sharp there) ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 0 },
  { f: 139, cInf: 7, focus: focusOn(seatAt(2), 1.0) },           // seat row: the rows behind melt
  { f: 237, cInf: 0 },
  { f: 280, cInf: 7, focus: focusOn(seatAt(1), 1.0) },
  { f: 368, cInf: 0 },
  { f: 1247, cInf: 8, focus: focusOn(GUS16, 1.4) },              // garden two-shot
  { f: 1308, cInf: 12, focus: focusOn(GUS16, 1.45) },            // the cup close up
  { f: 1399, cInf: 0 },
]);
export { lin };
