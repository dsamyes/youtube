// Timeline of "What If You Had a Hummingbird's Metabolism?" (66.7 s, 2001 f at 30 fps), built on the cartoon-short kit
// (src/toon/kit/README.md). Shot boundaries, places, lights, crossfades, the flash and the action frames come from
// engine/videos/hummingbird-metabolism/shots.json (the sound is built from the same file).
// This file holds the numbers over time: when things happen, where things are, the options of each place, the
// cameras and the depth of field. staging.ts draws the cast; props.ts holds this video's own drawings; entry.tsx
// registers the film. Everything here is a pure function of the frame number.
import {
  V3, Key, Framing, SunDef, clamp01, smooth, lerp, lin, readShots, camRig, pushK, dolly, add, dofTable, focusOn,
  NEIGH, PARK, FISHER_SEAT, TownParams, OceanParams,
} from "../../toon/kit";
import plan from "../../../../videos/hummingbird-metabolism/shots.json";

// ---------------- shots ----------------
/** key light per shot: character shots by day want the sun over the lens's right shoulder */
const DAY: SunDef = { az: 110 };
const SUN: Record<number, SunDef> = {
  1: DAY, 2: DAY, 3: { az: 118 }, 4: DAY, 5: { az: 105 }, 6: { az: 118 }, 7: DAY, 8: DAY, 9: DAY, 10: { az: 112 }, 11: { az: 112 }, 12: { az: 112 },
  13: { az: 118 }, 14: DAY, 15: DAY, 16: { az: 112, el: 42 }, 17: { az: 112, el: 42 },
};
/** 21 shots: 1 hook | 2 wake-up | 3 bird (park) | 4 tower | 5 pancakes | 6 neighbor | 7 heart | 8 fog | 9 heaters |
 *  10-12 fry and potato | 13 bird (park) | 14 butter | 15 thermometer | 16-17 sea by day | 18-19 sunset | 20-21 night */
export const T = readShots(plan, SUN);
const S = (id: number) => T.shots[id - 1];

// ---------------- action frames (from the events in shots.json) ----------------
export const BITES = [T.at("chomp", 0), T.at("chomp", 1), T.at("chomp", 2)];            // hook: 17, 40, 62
export const STEAM0 = T.at("sizzle", 0);                                                 // 84: steam from his collar
export const BIRD_IN = T.at("zip", 0), WAKE = T.at("pop", 0), TAP = T.at("twinkle", 0), BIRD_OUT = T.at("zip", 1); // 150, 174, 194, 222
export const BURN = T.at("flame_poof", 0), DRAIN0 = T.at("slide_whistle_down", 0), DRAIN1 = 366;      // 302, 322
export const TOWER0 = T.at("slide_whistle_up", 0), TOWER1 = T.at("thud", 0), LOOKUP = T.at("gulp", 0); // 409, 470, 478
export const FLIP0 = T.at("whoosh", 0);                                                  // 495: first pancake leaves the pan
export const CATCH = [T.at("chomp", 3), T.at("chomp", 4), T.at("chomp", 5)];             // 507, 527, 547
export const FLIPS = CATCH.map((f) => f - 12);                                           // each pancake flies 12 frames
export const GONE = T.at("ting", 0);                                                     // 558
export const POPUP = T.at("cork_pop", 0), SAUSAGE = T.at("chomp", 6), JAW = T.at("gulp", 1); // 654, 676, 698
export const TICK0 = T.at("typing", 0), HUM = T.at("power_up", 0);                       // 725, 805
export const FOG0 = T.at("sizzle", 1), WHY = T.at("question_blip", 0);                   // 862, 885
export const TO_HEAT = T.at("flame_poof", 1), HEAT_A = T.at("pop", 1), HEAT_B = T.at("pop", 2), GLOW = T.at("power_up", 1); // 941, 1000, 1014, 1031
export const FRY_HOT = T.at("sizzle", 2), FRY_COLD = T.at("ting", 1), TO_POTATO = T.at("whoosh", 2), SKIN = T.at("twinkle", 1); // 1076, 1098, 1130, 1250
export const LEAK0 = T.at("decel_whoosh", 0), COOL = T.at("twinkle", 2);                 // 1400, 1426
export const BUTTER = T.at("pop", 3), MELT = T.at("sizzle", 4);                          // 1459, 1471
export const THERMO0 = T.at("slide_whistle_up", 1), THERMO_POP = T.at("glass_pop", 0);   // 1499, 1550
export const DROP0 = T.at("slide_whistle_down", 1), SPLASH = T.at("splash", 0), HISS = T.at("sizzle", 5), SURFACE = T.at("cork_pop", 1), BLISS = T.at("twinkle", 3); // 1561, 1589, 1600, 1622, 1652
export const OOPS = T.at("gulp", 2), RUMBLE0 = T.at("bubbling", 0), THINK = T.at("pop", 4); // 1703, 1717, 1748
export const BIRD_SEA = T.at("zip", 3), FUNNY = T.at("question_blip", 1), LAND0 = T.at("decel_whoosh", 1), SHUT = T.at("power_down", 0), LAST_BITE = T.at("chomp", 7); // 1772, 1779, 1861, 1919, 1967

// ---------------- where things are: the garden (lens south of the subject, looking north = -z) ----------------
export const TABLE: V3 = [-0.85, 0, 0.3], TABLE_H = 0.78;   // garden table: top 1.8 x 0.8 m (props.ts builds it)
export const GUS_T: V3 = [-0.85, 0, -0.42];                 // Gus behind the table (shots 1, 4)
export const GUS_C: V3 = [0, 0, 0];                         // Gus alone on the lawn (shots 7-9, 14, 15)
export const CHAIR: V3 = [0.95, 0, 0.55], CHAIR_YAW = 0.3;  // deck chair (shot 2)
export const GUS_CHAIR: V3 = [CHAIR[0] + 0.23 * Math.sin(CHAIR_YAW), 0, CHAIR[2] + 0.23 * Math.cos(CHAIR_YAW)];
export const GUS5: V3 = [0.8, 0, 0.3], WIFE5: V3 = [1.78, 0, 0.4]; // the pancake two-shot
export const GUS6: V3 = [3.2, 0.3, -5.1];                   // Gus behind the neighbor's fence, at the fork (staging.ts moves him onto the sausage)
export const FRY_AT: V3 = [-1.08, TABLE_H, 0.38], POTATO_AT: V3 = [-0.62, TABLE_H, 0.38];
/** the burger tower (shot 4): n-th burger sits at this height; it appears on towerF(n) */
export const TOWER_N = 15, TOWER_X = -0.12, TOWER_Z = 0.26;
export const towerF = (n: number) => TOWER0 + (TOWER1 - TOWER0) * (1 - (1 - n / (TOWER_N - 1)) ** 1.7); // slow start, fast end
export const towerTop = (f: number) => { let n = 0; while (n < TOWER_N && f >= towerF(n)) n++; return TABLE_H + 0.2 * n; };

// ---------------- the park (only a backdrop for the hummingbird) ----------------
export const BIRD_P: V3 = [PARK[0] - 6.2, 1.5, PARK[2] - 3.4];
// ---------------- the sea ----------------
export const SEA_G: V3 = [0.8, 0, 2.3];                     // where Gus floats: off the bow, nearer the lens than the boat
export const NECK = -1.15;                                  // soles this far under water = water at his collar
/** height of Gus's soles over the water in shot 16: cannonball from the sky, under, back up to neck-deep */
export const seaY = (f: number) => {
  if (f < SPLASH) { const u = clamp01((f - DROP0) / (SPLASH - DROP0)); return 5.2 - 5.9 * u * u; }       // -0.7 at the splash
  if (f < SURFACE - 8) return lerp(-0.7, -2.6, smooth((f - SPLASH) / 8));
  return lerp(-2.6, NECK, 1 - (1 - clamp01((f - (SURFACE - 8)) / 16)) ** 2.2) + 0.03 * Math.sin(f * 0.11);
};
export const bobY = (f: number) => 0.03 * Math.sin(f * 0.11);
export const FISHER_AT = (f: number): V3 => [FISHER_SEAT[0], FISHER_SEAT[1] + 0.025 * Math.sin(f * 0.07), FISHER_SEAT[2]];
/** the top of the fisherman's sou'wester (where the bird lands) */
export const HAT: V3 = [FISHER_SEAT[0], 1.27, FISHER_SEAT[2]];

// ---------------- options of each shot's place for this frame ----------------
export const placeAt = (id: number, _f: number): TownParams | OceanParams | undefined => {
  const place = S(id).place;
  if (place === "ocean") return { pipe: false, boat: true };
  return { hole: false, mound: false, shovel: "none", chair: id === 2 ? { pos: CHAIR, yaw: CHAIR_YAW } : false, washing: true, grill: true };
};
/** the garden table is only there in the shots that use it */
export const tableOn = (id: number) => id === 1 || id === 4 || (id >= 10 && id <= 12);

// ---------------- cameras ----------------
const EYE_T: V3 = [GUS_T[0], 1.3, GUS_T[2]];
// 1 hook: medium shot over the burger table, then a push toward his eyes
const S1a = (f: number) => dolly([-0.3, 1.5, 3.5], [-0.85, 1.24, -0.3], pushK(f, 0, 0.0016), { fov: 38, roll: 0.03 });
const S1b = (f: number) => dolly([-0.6, 1.5, 2.25], [-0.85, 1.3, -0.3], pushK(f, 104, 0.003), { fov: 38, roll: -0.02 });
// 2 the deck chair
const S2a = (f: number) => dolly([1.5, 1.3, 4.5], [1.02, 0.86, 0.75], pushK(f, 131, 0.0012), { fov: 40 });
const S2b = (f: number) => dolly([1.4, 1.2, 3.55], [1.16, 0.98, 0.75], pushK(f, 170, 0.0016), { fov: 40, roll: 0.025 });
// 3 the bird at its feeder (park)
const S3a = (f: number) => dolly([BIRD_P[0] - 0.22, BIRD_P[1] + 0.1, BIRD_P[2] - 2.1], [BIRD_P[0] - 0.035, BIRD_P[1] + 0.02, BIRD_P[2]], pushK(f, 239, 0.0012, 0.004, 24, 296), { fov: 36, roll: 0.03 });
// 4 the tower: wide, then the lens tilts up with it
const S4a = (f: number) => dolly([0.45, 1.25, 4.9], [-0.55, 1.05, 0], pushK(f, 380, 0.001), { fov: 42 });
const S4b = (f: number): Framing => dolly([0.5, 1.0, 5.3], [-0.42, lerp(1.25, 2.55, smooth((f - 420) / 46)), 0], pushK(f, 420, 0.0006), { fov: 46, roll: 0.03 });
// 5 pancakes: the two-shot
const S5a = (f: number) => dolly([1.3, 1.26, 4.75], [1.275, 1.08, 0.35], pushK(f, 482, 0.0007), { fov: 40 });
const S5b = (f: number) => dolly([1.36, 1.24, 4.5], [1.3, 1.1, 0.36], pushK(f, 552, 0.0008), { fov: 40, roll: -0.025 });
// 6 the neighbor over his fence, then both
const N_EYE: V3 = [NEIGH[0], NEIGH[1] + 1.42, NEIGH[2]];
const S6a = (f: number) => dolly([1.6, 1.82, -1.1], add(N_EYE, [0.1, 0.02, 0]), pushK(f, 573, 0.0018), { fov: 40, roll: 0.035 });
const S6b = (f: number) => dolly([2.1, 1.8, -1.0], [2.86, 1.72, -5.08], pushK(f, 650, 0.0012), { fov: 40, roll: -0.02 });
// 7 the heart
const S7a = (f: number) => dolly([0.55, 1.3, 2.75], [0.06, 1.12, 0], pushK(f, 711, 0.0016), { fov: 38, roll: -0.02 });
const S7b = (f: number) => dolly([0.62, 1.36, 2.6], [0.2, 1.24, 0], pushK(f, 800, 0.0016), { fov: 38, roll: 0.02 });
// 8 the fogged helmet
const S8a = (f: number) => dolly([0.2, 1.52, 1.72], [0.02, 1.43, 0], pushK(f, 826, 0.002, 0.005, 16, 880), { fov: 38, roll: 0.03 });
// 9 burger into heat, then back for the four heaters
const S9a = (f: number) => dolly([0.5, 1.4, 3.1], [0.12, 1.16, 0], pushK(f, 892, 0.0012), { fov: 38 });
const S9b = (f: number) => dolly([0.2, 1.12, 4.25], [0, 0.84, 0.2], pushK(f, 990, 0.0012), { fov: 40 });
// 10-12 the table: fry, potato, both
const S10a = (f: number) => dolly([FRY_AT[0] + 0.12, 1.2, 1.62], [FRY_AT[0], 0.9, FRY_AT[2]], pushK(f, 1049, 0.0015), { fov: 36, roll: 0.02 });
const S11a = (f: number) => dolly([POTATO_AT[0] + 0.1, 1.24, 1.72], [POTATO_AT[0], 0.96, POTATO_AT[2]], pushK(f, 1130, 0.0014), { fov: 36, roll: -0.02 });
const S12a = (f: number) => dolly([-0.8, 1.34, 2.95], [-0.85, 0.94, 0.38], pushK(f, 1213, 0.001), { fov: 36 });
// 13 the bird again, from the other side
const S13a = (f: number) => dolly([BIRD_P[0] + 0.3, BIRD_P[1] + 0.04, BIRD_P[2] - 1.85], [BIRD_P[0] - 0.07, BIRD_P[1] + 0.02, BIRD_P[2]], pushK(f, 1292, 0.0011), { fov: 36, roll: -0.03 });
// 14 Gus is the potato; 15 the thermometer
const S14a = (f: number) => dolly([0.5, 1.5, 3.2], [0.02, 1.34, 0], pushK(f, 1441, 0.002), { fov: 40 });
const S15a = (f: number) => dolly([0.62, 1.42, 2.7], [0.2, 1.3, 0], pushK(f, 1497, 0.002, 0.006, 14, 1540), { fov: 38, roll: -0.03 });
// 16 the sea: wide for the cannonball, then in on Gus with the boat behind him
const SEA_EYE: V3 = [SEA_G[0], NECK + 1.42, SEA_G[2]];
const S16a = (f: number) => dolly([0.85, 1.6, 8.6], [1.0, 1.5, 0.8], pushK(f, 1559, 0.0012), { fov: 42 });
const S16b = (f: number) => dolly([0.7, 0.84, 5.2], [1.04, 0.58, 0.5], pushK(f, 1615, 0.0008), { fov: 40, roll: -0.02 });
// 17 close on Gus in the water
const S17a = (f: number) => dolly([SEA_G[0] + 1.25, 0.64, SEA_G[2] + 2.5], [SEA_G[0] + 0.05, 0.44, SEA_G[2]], pushK(f, 1681, 0.0016), { fov: 38, roll: 0.03 });
// 18 sunset: Gus in front, the boat behind; 19 the bird at the lantern over the hat
const S18a = (f: number) => dolly([0.8, 1.0, 5.5], [1.12, 0.72, 0.5], pushK(f, 1761, 0.0016), { fov: 40 });
const S19a = (f: number) => dolly([HAT[0] - 0.2, HAT[1] + 0.42, 2.0], [HAT[0] - 0.14, HAT[1] + 0.22, HAT[2]], pushK(f, 1800, 0.0014), { fov: 36, roll: 0.025 });
// 20 night: the bird on the hat; 21 everyone but Gus asleep
const S20a = (f: number) => dolly([HAT[0] - 0.02, HAT[1] + 0.22, 1.5], [HAT[0] - 0.1, HAT[1] + 0.05, HAT[2]], pushK(f, 1873, 0.0016), { fov: 36, roll: -0.02 });
const S21a = (f: number) => dolly([0.78, 0.76, 5.45], [1.1, 0.54, 0.5], pushK(f, 1946, 0.0009), { fov: 40, roll: 0.02 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: 96, dur: 30, s: S1b }],               // centred on 111 ("biggest problem")
  2: [{ f: 131, s: S2a }, { f: 158, dur: 30, s: S2b }],            // centred on 173 (he wakes)
  3: [{ f: 239, s: S3a }],
  4: [{ f: 380, s: S4a }, { f: 414, dur: 40, s: S4b }],            // up with the tower
  5: [{ f: 482, s: S5a }, { f: 546, dur: 24, s: S5b }],            // toward her and the empty pan, centred on 558
  6: [{ f: 573, s: S6a }, { f: 640, dur: 26, s: S6b }],            // over to the fork, centred on 653 (Gus pops up there)
  7: [{ f: 711, s: S7a }, { f: 794, dur: 26, s: S7b }],            // makes room for the bird, centred on 807
  8: [{ f: 826, s: S8a }],
  9: [{ f: 892, s: S9a }, { f: 968, dur: 34, s: S9b }],            // back for the heaters, centred on 985
  10: [{ f: 1049, s: S10a }],
  11: [{ f: 1049, s: S10a }, { f: 1116, dur: 30, s: S11a }],       // along the table to the potato, centred on 1131
  12: [{ f: 1049, s: S10a }, { f: 1116, dur: 30, s: S11a }, { f: 1201, dur: 28, s: S12a }], // back to hold both, centred on 1215
  13: [{ f: 1292, s: S13a }],
  14: [{ f: 1441, s: S14a }],
  15: [{ f: 1441, s: S14a }, { f: 1488, dur: 20, s: S15a }],       // in for the thermometer, centred on 1498
  16: [{ f: 1559, s: S16a }, { f: 1604, dur: 34, s: S16b }],       // in as he surfaces, centred on 1621
  17: [{ f: 1681, s: S17a }],
  18: [{ f: 1761, s: S18a }],
  19: [{ f: 1800, s: S19a }],
  20: [{ f: 1873, s: S20a }],
  21: [{ f: 1946, s: S21a }],
};
CAMS[10] = CAMS[12]; CAMS[11] = CAMS[12];
CAMS[14] = CAMS[15];
/** impact kicks: [frame, strength] */
// (kicks only where the picture is already busy: in a quiet medium shot the frame checker reads a kick as a pop)
const KICKS: [number, number][] = [[BITES[0], 0.4], [BITES[1], 0.4], [BITES[2], 0.4], [TOWER1, 0.35], [POPUP, 0.6], [THERMO_POP, 0.3], [SPLASH, 1.2], [LAST_BITE, 0.4]];
export const { camAt } = camRig(CAMS, KICKS);

// ---------------- lens: depth of field ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 10, focus: focusOn(EYE_T) },                       // hook: medium shot
  { f: 131, cInf: 6, focus: focusOn(GUS_CHAIR, 1.0) },             // chair: full shot, a little blur
  { f: 239, cInf: 14, focus: () => BIRD_P },                       // bird close-up: the park melts
  { f: 380, cInf: 0 },                                             // tower wide: sharp
  { f: 482, cInf: 8, focus: focusOn(WIFE5, 1.3) },                 // two-shot
  { f: 573, cInf: 12, focus: focusOn(N_EYE) },                     // neighbor
  { f: 711, cInf: 11, focus: focusOn(GUS_C, 1.3) },                // Gus medium
  { f: 826, cInf: 13, focus: focusOn(GUS_C, 1.42) },               // helmet close-up
  { f: 892, cInf: 10, focus: focusOn(GUS_C, 1.3) },                // Gus medium
  { f: 968, dur: 34, cInf: 4, focus: focusOn(GUS_C, 1.0) },        // wider for the heaters
  { f: 1049, cInf: 12, focus: () => [-0.85, 0.9, 0.38] },          // table top
  { f: 1292, cInf: 14, focus: () => BIRD_P },                      // bird
  { f: 1441, cInf: 11, focus: focusOn(GUS_C, 1.35) },              // Gus medium
  { f: 1559, cInf: 0 },                                            // sea wide
  { f: 1604, dur: 34, cInf: 4, focus: () => SEA_EYE },             // in on Gus
  { f: 1681, cInf: 11, focus: () => SEA_EYE },                     // Gus in the water
  { f: 1761, cInf: 3, focus: () => SEA_EYE },                      // sunset
  { f: 1800, cInf: 11, focus: () => [HAT[0] - 0.1, HAT[1] + 0.3, HAT[2]] }, // bird over the hat
  { f: 1873, cInf: 12, focus: () => HAT },
  { f: 1946, cInf: 4, focus: () => SEA_EYE },                      // payoff
]);
export { lin };
