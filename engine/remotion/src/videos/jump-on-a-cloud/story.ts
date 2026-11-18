// Timeline of "What If You Jumped on a Cloud?" (66.2 s, 1986 f at 30 fps), built on the cartoon-short kit
// (src/toon/kit/README.md). Shot boundaries, places, lights, crossfades, the flash and the action frames come from
// engine/videos/jump-on-a-cloud/shots.json (the sound is built from the same file).
// This file holds the numbers over time: when things happen, where things are, the options of each place, the
// cameras and the depth of field. props.ts holds this video's drawings; staging.ts draws the cast and the cards;
// entry.tsx registers the film. Everything is a pure function of the frame.
import { V3, Key, Framing, SunDef, clamp01, smooth, lerp, lin, readShots, camRig, pushK, dolly, dofTable, focusOn, TownParams } from "../../toon/kit";
import plan from "../../../../videos/jump-on-a-cloud/shots.json";

// ---------------- shots ----------------
/** 24 shots: 1 hook in | 2 hook out | 3 the chair | 4 the bed | 5 wife | 6 neighbor | 7 parachute | 8 balloon |
 *  9 up close | 10 tons and elephants | 11 the jump | 12 inside | 13 all white | 14 where? | 15 huge | 16 fridge |
 *  17 droplet | 18 fog | 19 one cup | 20 the canopy | 21 landing | 22 raindrop | 23 evening | 24 the rain */
const SUN: Record<number, SunDef> = { 3: { az: 110 }, 5: { az: 110 }, 6: { az: 110 }, 7: { az: 110 }, 18: { az: 110 }, 21: { az: 110 }, 23: { abs: [-0.83, 0.27, 0.49] }, 24: { abs: [-0.83, 0.27, 0.49] } };
export const T = readShots(plan, SUN);
const S = (id: number) => T.shots[id - 1];

// ---------------- action frames (named events in shots.json) ----------------
export const PLUNGE = T.at("plunge"), OUT1 = T.at("out1"), CHAIRF = T.at("chair"), GLINT = T.at("glint");
export const PILLOW = T.at("pillow"), BLANKET = T.at("blanket"), DREAM = T.at("dream"), WAVE = T.at("wave"), BOUNCE = T.at("bounce");
export const STRAP = T.at("strap"), TUG = T.at("tug"), BURNER = T.at("burner"), RISE = T.at("rise"), KNOCK = T.at("knock");
export const TONS = T.at("tons"), ELEPH = [T.at("eleph1"), T.at("eleph2"), T.at("eleph3")];
export const JUMP = T.at("jump"), ENTER = T.at("enter"), WATCH = T.at("watch"), TICKS = T.at("ticks"), T22 = T.at("t22");
export const STOP = T.at("stop"), WHY = T.at("why"), PULL = T.at("pull"), PIECE = T.at("piece"), FRIDGE = T.at("fridge"), DROPS = T.at("drops"), DOOR = T.at("door");
export const DROPLET = T.at("droplet"), SINK = T.at("sink"), BREEZE = T.at("breeze"), HELD = T.at("held"), SAT = T.at("sat");
export const CUP = T.at("cup"), TIP = T.at("tip"), CHUTE = T.at("chute"), LAND = T.at("land"), DAMP = T.at("damp");
export const SWARM = T.at("swarm"), MERGE = T.at("merge"), RAINDROP = T.at("raindrop"), DARK = T.at("dark"), FIRST = T.at("first"), POUR = T.at("pour"), UMBRELLA = T.at("umbrella");

// ---------------- the garden (lens south of the subject, looking north = -z; screen right is +x) ----------------
export const CHAIR: V3 = [-0.2, 0, 0.3];
export const GUS_AT: V3 = [-0.3, 0, 0.2];
export const WIFE_AT: V3 = [1.05, 0, 0.1];
/** shot 18: he feels his way through the fog, from screen right to the middle */
export const walk18 = (f: number) => lerp(0.7, 0.1, smooth((f - 1393) / 48));
/** shot 21: height of his soles as he floats down under the canopy */
export const drop21 = (f: number) => 3.1 * (1 - clamp01((f - 1615) / (LAND - 1615))) ** 1.3;
/** evening (shots 23, 24): the lens looks west */
export const EVE: V3 = [0.12, 0, 0.48];

// ---------------- the sky: flat cards around the origin, the lens south of them ----------------
/** shot 1: the cloud (9 m wide) rises to swallow Gus, who stays at the origin */
export const cloud1 = (f: number) => lin([[0, -4.3], [37, -1.75], [75, -0.3]], f);
/** shot 2: its belly lifts off him */
export const cloud2 = (f: number) => (f < OUT1 - 5 ? 0.6 : 0.6 + 0.012 * (f - (OUT1 - 5)) ** 2 + 0.1 * (f - (OUT1 - 5)));
/** shot 8: the balloon's centre */
export const balloon8 = (f: number): V3 => [1.7, lerp(-7.5, 3.4, smooth((f - 500) / (RISE + 26 - 500))) + 0.06 * Math.sin(f * 0.11), 0];
/** shot 11: Gus's jump from the basket; t = 0 at the take-off, 1 where he meets the cloud top */
export const jumpT = (f: number) => (f - JUMP) / (ENTER - JUMP);
/** shot 17: height of the droplet: half an inch a second on a scale of 1.2 m to the inch = 2 cm a frame */
export const INCH = 1.2;
export const dropletY = (f: number) => 1.0 - (INCH / 60) * Math.max(0, Math.min(f, BREEZE + 4) - SINK) + (f > BREEZE + 4 ? 0.05 * Math.sin((f - BREEZE - 4) * 0.2) * smooth((f - BREEZE - 4) / 12) : 0);

// ---------------- options of each shot's place for this frame ----------------
export const placeAt = (id: number, _f: number): TownParams | { ground?: boolean } | undefined => {
  const place = S(id).place;
  if (place !== "garden") return { ground: false };
  return { hole: false, mound: false, shovel: "none", chair: id === 3 ? { pos: CHAIR, yaw: 0.3 } : false, washing: false, grill: id !== 23 && id !== 24 };
};

// ---------------- cameras ----------------
const SKY = (f: number, f0: number, y = 0, z = 9.4, rate = 0.0006, roll = 0) => dolly([0, y + 0.1, z], [0, y, 0], pushK(f, f0, rate), { fov: 40, roll });
const S3a = (f: number) => dolly([0.25, 0.95, 3.5], [-0.2, 1.15, 0.3], pushK(f, 146, 0.0012), { fov: 40 });
const S3b = (f: number) => dolly([0.5, 0.5, 4.9], [-0.3, 3.1, 0.3], pushK(f, 262, 0.001), { fov: 50 });
const S5 = (f: number) => dolly([1.2, 1.52, 3.6], [0.86, 1.46, 0.1], pushK(f, 361, 0.0015), { fov: 38 });
const S6 = (f: number) => dolly([1.6, 1.82, -1.1], [2.6, 1.74, -5.08], pushK(f, 413, 0.0015), { fov: 40 });
const S7 = (f: number) => dolly([0.05, 1.15, 3.9], [-0.3, 1.02, 0.2], pushK(f, 460, 0.002), { fov: 40 });
const S8 = (f: number): Framing => { const y = lerp(-1.2, 0.9, smooth((f - 508) / 70)); return { pos: [0, y + 0.2, 17], look: [0, y, 0], fov: 40 }; };
const S15 = (f: number): Framing => { const k = smooth((f - PULL) / 34), z = lerp(10, 62, k * k) - 0.02 * (f - PULL); return { pos: [0, lerp(1.5, 0, k), z], look: [0, lerp(1.5, -0.5, k), 0], fov: 40 }; };
const S18 = (f: number) => dolly([0.35, 1.12, 4.4], [0.2, 0.98, 0.3], pushK(f, 1393, 0.0012), { fov: 40 });
const S21a = (f: number) => dolly([0.2, 1.5, 6.0], [-0.3, 1.55, 0.2], pushK(f, 1623, 0.001), { fov: 42 });
const S21b = (f: number) => dolly([0.1, 1.25, 3.6], [-0.3, 1.15, 0.2], pushK(f, 1670, 0.002), { fov: 40 });
const S23 = (f: number) => dolly([5.7, 0.9, -0.9], [EVE[0], 1.75, EVE[2]], pushK(f, 1807, 0.001), { fov: 46 });
const S24 = (f: number) => dolly([4.5, 1.0, -0.6], [EVE[0], 1.42, EVE[2] - 0.1], pushK(f, 1872, 0.0012, 0.004, 20, POUR - 2), { fov: 44 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => SKY(f, 0, 0.2, 5.4, 0.002, -0.05) }],
  2: [{ f: 75, s: (f) => SKY(f, 75, 0.3, 5.8, 0.004, 0.05) }],
  3: [{ f: 146, s: S3a }, { f: 236, dur: 30, s: S3b }],
  4: [{ f: 298, s: (f) => SKY(f, 298, 0.0, 6.2, 0.0012) }],
  5: [{ f: 361, s: S5 }], 6: [{ f: 413, s: S6 }], 7: [{ f: 460, s: S7 }],
  8: [{ f: 508, s: S8 }],
  9: [{ f: 584, s: (f) => SKY(f, 584, 0.25, 6.2, 0.0015) }],
  10: [{ f: 646, s: (f) => SKY(f, 646, 1.3, 17.5, 0.0005) }],
  11: [{ f: 765, s: (f) => SKY(f, 765, 0.3, 10.2, 0.0008) }],
  12: [{ f: 823, s: (f) => dolly([0.6, 0.5, 5.6], [0.3, 0.3, 0], pushK(f, 823, 0.0012), { fov: 44, roll: 0.05 }) }],
  13: [{ f: 943, s: (f) => dolly([0.2, 0.74, 1.6], [0, 0.63, 0], pushK(f, 943, 0.003), { fov: 38 }) }],
  14: [{ f: 985, s: (f) => SKY(f, 985, 1.3, 6.4, 0.0012) }],
  15: [{ f: 1036, s: S15 }],
  16: [{ f: 1095, s: (f) => SKY(f, 1095, -0.3, 9.4, 0.0005) }],
  17: [{ f: 1236, s: (f) => SKY(f, 1236, 0.1, 8.2, 0.0006) }],
  18: [{ f: 1393, s: S18 }],
  19: [{ f: 1480, s: (f) => SKY(f, 1480, 0.35, 6.0, 0.0015, -0.04) }],
  20: [{ f: 1575, s: (f) => SKY(f, 1575, 1.3, 8.6, 0.001) }],
  21: [{ f: 1623, s: S21a }, { f: 1658, dur: 24, s: S21b }],
  22: [{ f: 1702, s: (f) => SKY(f, 1702, 0.1, 8.2, 0.0008) }],
  23: [{ f: 1807, s: S23 }], 24: [{ f: 1872, s: S24 }],
};
/** impact kicks (only where the picture is already moving) */
const KICKS: [number, number][] = [[PLUNGE, 0.4], [TONS, 0.5], [CHUTE, 0.5], [SAT, 0.3]];
export const { camAt } = camRig(CAMS, KICKS);

// ---------------- lens: depth of field ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 0 },
  { f: 146, cInf: 10, focus: focusOn(CHAIR, 1.2) },
  { f: 236, dur: 30, cInf: 0 },
  { f: 298, cInf: 0 },
  { f: 361, cInf: 12, focus: focusOn(WIFE_AT, 1.4) },
  { f: 413, cInf: 12, focus: focusOn([2.5, 0.3, -5.08], 1.4) },
  { f: 460, cInf: 8, focus: focusOn(GUS_AT, 1.3) },
  { f: 508, cInf: 0 },
  { f: 1658, dur: 24, cInf: 10, focus: focusOn(GUS_AT, 1.3) },
  { f: 1702, cInf: 0 },
  { f: 1872, cInf: 8, focus: focusOn(EVE, 1.3) },
]);
