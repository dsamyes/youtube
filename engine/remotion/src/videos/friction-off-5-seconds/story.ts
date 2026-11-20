// Timeline of "What If Friction Vanished for 5 Seconds?" (67.3 s, 2020 f at 30 fps), built on the cartoon-short kit
// (src/toon/kit/README.md). Shot boundaries, places, lights, crossfades, the flash and the action frames come from
// engine/videos/friction-off-5-seconds/shots.json (the sound is built from the same file).
// This file holds the numbers over time: when things happen, where things are, the cameras and the depth of field.
// props.ts holds this video's drawings; staging.ts draws the cast and the cards; entry.tsx registers the film.
// The slide runs toward screen left (west, -x): the garden is open that way. Everything is a pure function of the frame.
import { V3, Key, Framing, SunDef, clamp01, smooth, readShots, camRig, pushK, dolly, dofTable, focusOn, TownParams } from "../../toon/kit";
import plan from "../../../../videos/friction-off-5-seconds/shots.json";

// ---------------- shots ----------------
/** 24 shots: 1 hook slide | 2 hook Gus | 3 the pot | 4 it sticks | 5 wife | 6 neighbor | 7 the wish | 8 the puck |
 *  9 runs on the spot | 10 the cup | 11 the ladder | 12 the drift | 13 what pulls? | 14 no lawn is flat | 15 the rule
 *  and the rain | 16 nine pounds | 17 brushes | 18 bristles lock | 19 taken away | 20 all alike | 21 it comes back |
 *  22 the rest of Gus | 23 too far | 24 the way back */
const SUN: Record<number, SunDef> = {};
for (let i = 1; i <= 24; i++) SUN[i] = { az: 110 };
export const T = readShots(plan, SUN);
const S = (id: number) => T.shots[id - 1];

// ---------------- action frames (named events in shots.json) ----------------
export const TAG20 = T.at("tag20"), SHOVE1 = T.at("shove1"), SHOVE2 = T.at("shove2"), SCRAPE3 = T.at("scrape3"), STICK = T.at("stick"), JAB = T.at("jab");
export const SIP = T.at("sip"), THUMB = T.at("thumb"), WATCH = T.at("watch"), FIVE = T.at("five"), START = T.at("start"), WISH = T.at("wish");
export const PUSH = T.at("push"), YES = T.at("yes"), RUN = T.at("run"), SLIP1 = T.at("slip1"), SLIP2 = T.at("slip2"), CUP = T.at("cup"), LADDER = T.at("ladder"), CLATTER = T.at("clatter");
export const DRIFT = T.at("drift"), WHY = T.at("why"), TIP = T.at("tip"), RULE = T.at("rule"), RAINCLOUD = T.at("raincloud"), TUG = T.at("tug"), NINE = T.at("nine"), WHISTLE = T.at("whistle");
export const BRUSH = T.at("brush"), MESH = T.at("mesh"), STUCK = T.at("stuck"), LENS = T.at("lens"), LOCK = T.at("lock"), GONE = T.at("gone"), SLIPS = T.at("slips");
export const HEAVY = T.at("heavy"), LIGHT = T.at("light"), WATCH2 = T.at("watch2"), TICKS = T.at("ticks"), TWENTY = T.at("twenty"), FIVE2 = T.at("five2");
export const BACK = T.at("back"), GRIP = T.at("grip"), GRAB = T.at("grab"), TIP2 = T.at("tip2"), FLOP = T.at("flop"), PAN = T.at("pan"), TWENTY2 = T.at("twenty2");
export const DRAGS = [T.at("drag1"), T.at("drag2"), T.at("drag3")], THANKS = T.at("thanks");

// ---------------- the garden (lens south of the subject, looking north = -z; screen right is +x) ----------------
export const ROLL = 0.05;                                      // the tilted horizon of the slide shots (2.9 degrees, the real slope)
export const GUS0: V3 = [0.75, 0, 0.3], POT0: V3 = [0.0, 0, 0.38];
export const SAUCER: V3 = [-1.25, 0, 0.5];
export const WIFE_AT: V3 = [1.9, 0, -0.9];
export const NB: V3 = [2.8, 0.3, -5.08], LADDER_AT: V3 = [2.02, 0, -5.75];
/** shots 3 and 4: how far the pot has been shoved to screen left */
export const shoved = (f: number) => 0.12 * smooth((f - SHOVE1) / 9) + 0.12 * smooth((f - SHOVE2) / 9) + 0.08 * smooth((f - SCRAPE3) / 12);
export const SHOVED = 0.32;
/** hook: where the group is */
export const x1 = (f: number) => 2.6 - 0.058 * f;
export const x2 = (f: number) => 2.2 - 0.058 * (f - 89);
/** shot 8: the pot glides away */
export const potGlide = (f: number) => 0.024 * Math.max(0, f - PUSH - 2);
/** shot 12: the real thing, a = g sin(2.86 deg) = 0.49 m/s2 -> 0.000272 m per frame squared */
export const d12 = (f: number) => 0.000272 * Math.max(0, f - DRIFT) ** 2;
export const x13 = (f: number) => 1.6 - 0.03 * (f - 980) - 0.00012 * (f - 980) ** 2;
/** shot 20: twenty feet (6.1 m) while the stopwatch hand runs to five */
export const x20 = (f: number) => { const u = Math.max(0, (f - (TICKS - 3)) / (FIVE2 - TICKS + 3)); return Math.max(-5.2, 3.3 - 6.1 * u * u); };
/** shot 21: the slippers glide, then bite */
export const x21 = (f: number) => { const t = f - (GRIP - 5); return t < 0 ? 1.0 - 0.07 * (f - 1660) : 1.0 - 0.07 * (GRIP - 5 - 1660) - 0.07 * (Math.min(t, 10) - Math.min(t, 10) ** 2 / 20); };
/** shot 22: his feet, then the pivot of his body: [x, y, roll] of the body centre (0.81 m above the soles) */
export const FEET22 = 0.55;
export const feet22 = (f: number) => FEET22 + 0.07 * Math.max(0, GRAB - f);
export const body22 = (f: number): [number, number, number] => {
  if (f < GRAB) return [feet22(f), 0.81, 0];
  const th = 0.85 * clamp01((f - GRAB) / (TIP2 - GRAB)) ** 1.3;
  if (f < TIP2) return [FEET22 - 0.81 * Math.sin(th), 0.81 * Math.cos(th), th];
  const n = f - TIP2, N = FLOP - TIP2, x0 = FEET22 - 0.81 * Math.sin(0.85), y0 = 0.81 * Math.cos(0.85), u = clamp01(n / N);
  const roll = 0.85 + (Math.PI / 2 - 0.85) * smooth(n / 14);
  if (f < FLOP) return [x0 - 0.046 * n, y0 + (0.2 - y0) * u + 1.5 * u * (1 - u), roll];
  const s = Math.min(f - FLOP, 16);
  return [x0 - 0.046 * N - 0.046 * (s - (s * s) / 32), 0.2, Math.PI / 2];
};
/** shots 23 and 24: where the slide ended */
export const POT_END: V3 = [-5.5, 0, 0.4], GUS_END: V3 = [-4.72, 0, 0.45];
export const dragged = (f: number) => DRAGS.reduce((s, f0) => s + 0.15 * smooth((f - f0) / 14), 0);

// ---------------- options of each shot's place for this frame ----------------
export const placeAt = (id: number, _f: number): TownParams | { ground?: boolean } | undefined => {
  if (S(id).place === "sky") return { ground: false };
  return { hole: false, mound: false, shovel: "none", chair: false, washing: true, grill: true };
};

// ---------------- cameras ----------------
const SKY = (f: number, f0: number, y: number, z: number, rate = 0.0006) => dolly([0, y + 0.1, z], [0, y, 0], pushK(f, f0, rate), { fov: 40 });
const track = (x: number, dx: number, y: number, z: number, ly: number, fov: number, roll = ROLL): Framing => ({ pos: [x + dx, y, z], look: [x, ly, 0.3], fov, roll });
const S3a = (f: number) => dolly([0.2, 2.0, 7.2], [-0.35, 0.9, 0.2], pushK(f, 165, 0.001), { fov: 42 });
const S3b = (f: number) => dolly([0.45, 1.15, 4.7], [0.2, 0.9, 0.3], pushK(f, 245, 0.001), { fov: 42 });
const S4 = (f: number, f0: number, y = 0.95) => dolly([0.2, y + 0.25, 4.1], [0.02, y, 0.3], pushK(f, f0, 0.0012), { fov: 40 });
const WIFE = (f: number, f0: number) => dolly([2.1, 1.5, 2.5], [1.85, 1.42, -0.9], pushK(f, f0, 0.0014), { fov: 38 });
const NEIGH = (f: number, f0: number) => dolly([1.8, 1.85, -1.0], [2.5, 1.8, -5.08], pushK(f, f0, 0.0012), { fov: 40 });
const S8 = (f: number) => dolly([0.0, 1.15, 5.0], [-0.25, 0.9, 0.3], pushK(f, 590, 0.001), { fov: 42 });
const S9 = (f: number) => dolly([0.6, 1.12, 3.9], [0.45, 0.94, 0.3], pushK(f, 660, 0.0016), { fov: 40 });
const S12 = (f: number): Framing => { const s = 0.5 * d12(f); return { pos: [-0.3 - s, 2.3, 8.9], look: [-0.4 - s, 0.85, 0], fov: 40, roll: ROLL }; };
const S16 = (f: number) => dolly([-0.2, 1.1, 4.4], [-0.38, 0.92, 0.3], pushK(f, 1220, 0.0012), { fov: 40 });
const FEET = (f: number, f0: number) => dolly([0.15, 0.62, 2.9], [0.0, 0.42, 0.3], pushK(f, f0, 0.0008), { fov: 40 });
const S21 = (f: number): Framing => { const x = x21(f); return { pos: [x + 0.12, 0.62, 2.3], look: [x - 0.05, 0.3, 0.3], fov: 40 }; };
const S22 = (f: number): Framing => { const [bx] = body22(f), k = smooth((f - GRAB) / 22), x = 0.25 + (bx - 0.1 - 0.25) * k; return { pos: [x + 0.1, 1.15 - 0.15 * k, 5.0 + 1.2 * k], look: [x, 0.85 - 0.2 * k, 0.3], fov: 42 }; };
const S23a = (f: number) => dolly([-1.05, 1.05, 3.9], [SAUCER[0], 0.4, SAUCER[2]], pushK(f, 1840, 0.0012), { fov: 40 });
const S23b = (f: number) => dolly([-4.95, 1.2, 5.0], [-5.12, 0.8, 0.4], pushK(f, 1886, 0.0012), { fov: 40 });
const S24 = (f: number) => dolly([-4.3, 1.15, 4.9], [-4.45, 0.9, 0.4], pushK(f, 1916, 0.0012, 0.004, 24, THANKS - 6), { fov: 40 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: (f) => track(x1(f) - 0.1, 0.4, 1.3, 5.1, 0.95, 42) }],
  2: [{ f: 89, s: (f) => track(x2(f) - 0.12, 0.3, 1.45, 3.9, 1.2, 38) }],
  3: [{ f: 165, s: S3a }, { f: 221, dur: 28, s: S3b }],
  4: [{ f: 309, s: (f) => S4(f, 309) }],
  5: [{ f: 412, s: (f) => WIFE(f, 412) }], 6: [{ f: 461, s: (f) => NEIGH(f, 461) }],
  7: [{ f: 522, s: (f) => dolly([0.2, 1.45, 4.7], [0.0, 1.15, 0.3], pushK(f, 522, 0.0012), { fov: 40 }) }],
  8: [{ f: 590, s: S8 }], 9: [{ f: 660, s: S9 }],
  10: [{ f: 743, s: (f) => WIFE(f, 743) }], 11: [{ f: 813, s: (f) => NEIGH(f, 813) }],
  12: [{ f: 889, s: S12 }],
  13: [{ f: 980, s: (f) => track(x13(f), 0.3, 1.6, 3.9, 1.32, 38) }],
  14: [{ f: 1055, s: (f) => SKY(f, 1055, 0.0, 8.8) }], 15: [{ f: 1110, s: (f) => SKY(f, 1110, 0.12, 8.7) }],
  16: [{ f: 1220, s: S16 }],
  17: [{ f: 1305, s: (f) => SKY(f, 1305, 0.0, 6.8, 0.001) }],
  18: [{ f: 1360, s: (f) => FEET(f, 1360) }], 19: [{ f: 1456, s: (f) => FEET(f, 1360) }],
  20: [{ f: 1535, s: (f) => track(x20(f) - 0.08, 0.1, 1.6, 5.9, 1.2, 42) }],
  21: [{ f: 1660, s: S21 }],
  22: [{ f: 1705, s: S22 }],
  23: [{ f: 1840, s: S23a }, { f: PAN, dur: 26, s: S23b }],
  24: [{ f: 1916, s: S24 }],
};
/** impact kicks (only where the picture is already moving) */
const KICKS: [number, number][] = [[CLATTER, 0.3], [GRIP, 0.4], [FLOP, 0.5]];
export const { camAt } = camRig(CAMS, KICKS);

// ---------------- lens: depth of field ----------------
export const dofAt = dofTable([
  { f: 0, cInf: 0 },
  { f: 89, cInf: 9 },
  { f: 165, cInf: 0 },
  { f: 412, cInf: 12, focus: focusOn(WIFE_AT, 1.4) },
  { f: 461, cInf: 10, focus: focusOn(NB, 1.4) },
  { f: 522, cInf: 0 },
  { f: 743, cInf: 12, focus: focusOn(WIFE_AT, 1.4) },
  { f: 813, cInf: 10, focus: focusOn(NB, 1.4) },
  { f: 889, cInf: 0 },
  { f: 980, cInf: 9 },
  { f: 1055, cInf: 0 },
]);
