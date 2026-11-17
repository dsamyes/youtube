// Timeline of "What If an Immortal Snail Was Chasing You?" (63.2 s, 1896 f at 30 fps), built on the cartoon-short
// kit (src/toon/kit/README.md). Shot boundaries, places, lights, crossfades, the flash and the action frames come
// from engine/videos/immortal-snail/shots.json (the sound is built from the same file).
// This file holds the numbers over time: when things happen, where things are, the options of each place, the
// cameras and the depth of field. props.ts holds this video's drawings; staging.ts draws the cast and the cards;
// places.ts is the beach; entry.tsx registers the film. Everything is a pure function of the frame.
import { V3, Key, Framing, SunDef, clamp01, smooth, lerp, lin, readShots, camRig, pushK, dolly, dofTable, focusOn, TownParams } from "../../toon/kit";
import plan from "../../../../videos/immortal-snail/shots.json";

// ---------------- shots ----------------
/** 24 shots: 1 hook run | 2 hook snail | 3 the deal | 4 can't die | 5 one touch | 6 wife | 7 neighbor | 8 a point |
 *  9 the record | 10 one step | 11 five hundred times | 12 can't sleep | 13 stops, eats | 14 naps | 15 sleeps |
 *  16 never does | 17 the tap | 18 the tub | 19 every night | 20 milestones | 21 the walk | 22 the flight |
 *  23 hitching | 24 the beach */
const SUN: Record<number, SunDef> = { 3: { az: 110 }, 5: { az: 110 }, 6: { az: 110 }, 7: { az: 110 }, 8: { az: 110 }, 10: { az: 110 }, 13: { az: 110 }, 14: { az: 110 }, 21: { az: 110 }, 24: { az: 112, el: 50 } };
export const T = readShots(plan, SUN);
const S = (id: number) => T.shots[id - 1];

// ---------------- action frames (named events in shots.json) ----------------
export const BILL = T.at("bill"), HOOKGLINT = T.at("hookglint"), MONEY = T.at("money");
export const WFALL = T.at("wfall"), WLAND = T.at("wland"), WFLIP = T.at("wflip"), FOREVER = T.at("forever");
export const STALK = T.at("stalk"), JUMP = T.at("jump"), JLAND = T.at("jland"), OVER = T.at("over");
export const LAUGH = T.at("laugh"), WPOINT = T.at("wpoint"), NSTEP = T.at("nstep"), NDOWN = T.at("ndown"), THUMB = T.at("thumb"), POINT = T.at("point");
export const START = T.at("start"), RACE = T.at("race"), FINISH = T.at("finish");
export const STEP = T.at("step"), WATCH = T.at("watch"), FOUR = T.at("four"), CAUGHT = T.at("caught");
export const LAPS = [T.at("lap1"), T.at("lap2"), T.at("lap3"), T.at("lap4")], CRAWLS = T.at("crawls");
export const WHY = T.at("why"), GULP = T.at("gulp"), STOP = T.at("stop"), EAT = T.at("eat"), NEVER = T.at("never");
export const DRIPS = [T.at("drip1"), T.at("drip2"), T.at("drip3")], WEEK = T.at("week"), FULL = T.at("full"), DUCK = T.at("duck");
export const TAPE = T.at("tape"), CLOSER = T.at("closer"), MILE1 = T.at("mile1"), MILE2 = T.at("mile2"), YEAR = T.at("year");
export const WHISTLE = T.at("whistle"), THREE_ = T.at("three"), WALKED = T.at("walked");
export const FLY = T.at("fly"), YEARS = T.at("years"), XRAY = T.at("xray"), WINK = T.at("wink"), RIDE = T.at("ride");
export const BEACH = T.at("beach"), BILL2 = T.at("bill2"), CASE = T.at("case"), RISE = T.at("rise"), LAST = T.at("last");

// ---------------- the garden (lens south of the subject, looking north = -z; screen right is +x) ----------------
export const GUS_AT: V3 = [-0.3, 0, 0.2];
export const WIFE_AT: V3 = [1.05, 0, 0.1];
export const SN2: V3 = [0.2, 0, 0.6];                         // the snail in the hook close-up (and at night, shot 16)
export const SN4: V3 = [-0.9, 0, 1.2];                        // under the weight
export const G5: V3 = [-0.3, 0, 0.4], SN5: V3 = [0.36, 0, 0.45];
export const SN7: V3 = [0.2, 0, 0.45];                        // the neighbor steps over it
export const G10: V3 = [-0.05, 0, 0.4], SN10: V3 = [0.46, 0, 0.45];
export const CHAIR: V3 = [-0.2, 0, 0.3];                      // the deck chair (shots 12, 14, 15)
export const CHAIR19: V3 = [0.7, 0, -0.5], SN19: V3 = [0.15, 0, 2.1];
/** shot 5: Gus jumps back to screen left */
export const jump5 = (f: number) => { const u = clamp01((f - JUMP) / (JLAND - JUMP)); return { x: G5[0] - 0.42 * smooth(u), y: u > 0 && u < 1 ? 0.3 * 4 * u * (1 - u) : 0 }; };
/** shot 7: the neighbor crosses from screen right to screen left */
export const neighX = (f: number) => lin([[431, 1.0], [NSTEP, 0.64], [NDOWN, -0.16], [NDOWN + 10, -0.28]], f);
/** shot 10: Gus's one step */
export const step10 = (f: number) => smooth((f - STEP) / 10);
/** shot 13: he strides in and stops dead */
export const stride13 = (f: number) => lerp(1.3, -0.2, 1 - (1 - clamp01((f - 895) / (STOP - 895))) ** 1.6);
/** shot 21: the stroll */
export const walk21 = (f: number) => 0.9 - 0.02 * (f - 1432);

// ---------------- the sky: every diagram is flat cards around the origin, the lens south of them ----------------
export const RULER_Y = -1.9, RULER_W = 2.9;
export const raceX = (f: number) => lerp(-1.18, 1.02, clamp01((f - START) / (FINISH - START)));

// ---------------- options of each shot's place for this frame ----------------
export const placeAt = (id: number, _f: number): TownParams | { ground?: boolean } | undefined => {
  const place = S(id).place;
  if (place === "sky") return { ground: false };
  if (place === "beach") return {};
  const chair = id === 12 || id === 14 || id === 15 ? { pos: CHAIR, yaw: 0.3 } : id === 19 ? { pos: CHAIR19, yaw: -0.3 } : false;
  return { hole: false, mound: false, shovel: "none", chair, washing: false, grill: true };
};

// ---------------- cameras ----------------
const SKY = (f: number, f0: number, y = -0.6, z = 9.4, rate = 0.0005) => dolly([0, y + 0.1, z], [0, y, 0], pushK(f, f0, rate), { fov: 40 });
const S1 = (f: number) => dolly([0.5, 0.85, 4.6], [-0.3, 0.95, 0.2], pushK(f, 0, 0.002), { fov: 40, roll: -0.05 });
const S2 = (f: number) => dolly([SN2[0] + 0.15, 0.32, SN2[2] + 1.45], [SN2[0] + 0.03, 0.17, SN2[2]], pushK(f, 52, 0.003), { fov: 40, roll: 0.03 });
const S3a = (f: number) => dolly([0.9, 2.2, 6.6], [-0.15, 1.05, -0.3], pushK(f, 103, 0.0012), { fov: 42 });
const S3b = (f: number) => dolly([0.1, 1.3, 3.5], [-0.3, 1.12, 0.2], pushK(f, 198, 0.0015), { fov: 40 });
const S4 = (f: number) => dolly([SN4[0] + 0.2, 0.52, SN4[2] + 2.0], [SN4[0] + 0.05, 0.36, SN4[2]], pushK(f, 233, 0.0012), { fov: 40 });
const S5 = (f: number) => dolly([0.1, 1.02, 4.5], [-0.22, 0.84, 0.4], pushK(f, 320, 0.0014), { fov: 40 });
const S6 = (f: number) => dolly([1.2, 1.52, 3.6], [0.86, 1.46, 0.1], pushK(f, 373, 0.0012), { fov: 38 });
const S7 = (f: number) => dolly([0.1, 1.05, 4.7], [0.0, 0.88, 0.45], pushK(f, 431, 0.0012), { fov: 40 });
const S8 = (f: number) => dolly([0.2, 1.42, 3.1], [-0.3, 1.2, 0.2], pushK(f, 509, 0.002), { fov: 38 });
const S10 = (f: number) => dolly([0.05, 1.02, 5.0], [-0.1, 0.84, 0.4], pushK(f, 660, 0.0012), { fov: 40 });
const S12 = (f: number) => dolly([0.3, 1.1, 3.7], [-0.2, 0.86, 0.3], pushK(f, 852, 0.002), { fov: 40 });
const S13 = (f: number): Framing => { const x = stride13(f); return { pos: [x + 0.45, 1.1, 4.3], look: [x - 0.1, 0.95, 0.3], fov: 40 }; };
const S14 = (f: number) => dolly([0.3, 1.1, 3.5], [-0.2, 0.86, 0.3], pushK(f, 960, 0.002), { fov: 40 });
const S16 = (f: number) => dolly([SN2[0] + 0.2, 0.34, SN2[2] + 1.55], [SN2[0] + 0.03, 0.18, SN2[2]], pushK(f, 992, 0.003), { fov: 40, roll: -0.03 });
const S19 = (f: number) => dolly([0.1, 0.42, 3.95], [0.18, 0.5, 0.5], pushK(f, 1198, 0.0006), { fov: 40 });
const S21 = (f: number): Framing => { const x = walk21(f); return { pos: [x + 0.35, 1.12, 4.4], look: [x + 0.12, 1.0, 0.3], fov: 40 }; };
const S24a = (f: number) => dolly([0.3, 1.2, 5.3], [0.22, 0.98, 0], pushK(f, 1712, 0.0008), { fov: 40 });
const S24b = (f: number) => dolly([0.3, 0.98, 4.0], [0.24, 0.84, 0], pushK(f, 1820, 0.0012, 0.004, 20, LAST - 4), { fov: 40 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1 }], 2: [{ f: 52, s: S2 }],
  3: [{ f: 103, s: S3a }, { f: 186, dur: 24, s: S3b }],
  4: [{ f: 233, s: S4 }], 5: [{ f: 320, s: S5 }], 6: [{ f: 373, s: S6 }], 7: [{ f: 431, s: S7 }], 8: [{ f: 509, s: S8 }],
  9: [{ f: 546, s: (f) => SKY(f, 546, -0.55, 8.0) }], 10: [{ f: 660, s: S10 }], 11: [{ f: 764, s: (f) => SKY(f, 764, -0.9, 8.0) }],
  12: [{ f: 852, s: S12 }], 13: [{ f: 899, s: S13 }], 14: [{ f: 960, s: S14 }], 15: [{ f: 974, s: S14 }], 16: [{ f: 992, s: S16 }],
  17: [{ f: 1036, s: (f) => SKY(f, 1036, -0.75, 8.8) }], 18: [{ f: 1115, s: (f) => SKY(f, 1115, -1.35, 7.9, 0.0008) }],
  19: [{ f: 1198, s: S19 }], 20: [{ f: 1314, s: (f) => SKY(f, 1314, -1.0, 9.2) }], 21: [{ f: 1432, s: S21 }],
  22: [{ f: 1527, s: (f) => SKY(f, 1527, -0.6, 9.6) }], 23: [{ f: 1635, s: (f) => SKY(f, 1635, -0.8, 9.2, 0.0008) }],
  24: [{ f: 1712, s: S24a }, { f: 1808, dur: 24, s: S24b }],
};
/** impact kicks (only where the picture is already moving) */
const KICKS: [number, number][] = [[WLAND, 0.5], [WFLIP, 0.4], [BEACH, 0.3]];
export const { camAt } = camRig(CAMS, KICKS);

// ---------------- lens: depth of field ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 0 },
  { f: 52, cInf: 10, focus: focusOn(SN2, 0.15) },
  { f: 103, cInf: 0 },
  { f: 186, dur: 24, cInf: 10, focus: focusOn(GUS_AT, 1.3) },
  { f: 233, cInf: 9, focus: focusOn(SN4, 0.2) },
  { f: 320, cInf: 0 },
  { f: 373, cInf: 12, focus: focusOn(WIFE_AT, 1.4) },
  { f: 431, cInf: 0 },
  { f: 509, cInf: 12, focus: focusOn(GUS_AT, 1.3) },
  { f: 546, cInf: 0 },
  { f: 992, cInf: 10, focus: focusOn(SN2, 0.15) },
  { f: 1036, cInf: 0 },
  { f: 1198, cInf: 7, focus: focusOn(SN19, 0.2) },
  { f: 1314, cInf: 0 },
]);
