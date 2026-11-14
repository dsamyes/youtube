// Staging of "What If You Tried to Open a Plane Door Mid-Flight?": who stands where in which pose, and every 2D
// card, for all 24 shots. stage(c) is a pure function of the shot and the frame; the timing comes from story.ts,
// this video's drawings from props.ts.
import {
  Ctx, V3, Pose, Arm, PutOpt, put, where, reach, fx, armMix, sm, lidAt, q, HANG, clamp01, lerp, add,
  GUS, WIFE, NEIGHBOR, sparkle, question, burst, puff, arrow, cloud, sleepBubble, dizzyStars, popIn, Expr, hash,
} from "../../toon/kit";
import {
  YANKS, SQUARE, CALM, WAKE, THINK, GRAB, SCREAM, GRABS, BELT, PULL, NOTHING, FOOT, SLIP, FALL, FLEX, WHY, THIN, GAUGE, FIFTH, GROUND,
  CUTAWAY, PUMP1, PUMP2, OUT1, OUT2, EIGHT, BACK, ADDUP, SLAM, CARS, HONK, STICK, TUG1, TUG2, NOGLUE, AIRPUSH, CUPOFF,
  DOORSHINE, PLUG, BUMP1, BUMP2, COMEIN, HEAVE, SCRABBLE, GROAN, SAFE, OOPS, DANCE, THINK2, LETSGO, SHUFFLE, ONEDOOR, KNOB, TAKEN,
  WALL_Z, DOOR_X, DOOR_H, LAV_X, HANDLE, LAV_KNOB, LATCH, GUS_D, GUS_L, seatAt, SQ0, sqPos, yankAt,
  PLANE_W, GROUND_W, GROUND_Y, GROUND_DOOR, GAUGE_AT, doorDia, STACK, CAR_W, CAR_H, SLAB_H, carY, GUS15, GUS20, GUS16, WIFE16,
} from "./story";
import { fxPlane, fxLeaf, fxDial, fxNeedle, dialAngle, fxWeight, fxBigWeight, fxFeeble, fxCar, fxSlab, fxRope, fxCup, fxThought, fxBelt, fxPlug, fxDiagram, fxPlugDoor, fxDots, fxSweat } from "./props";

const AIR = "#49a6ff";
const HHm = 221.8 * 0.00216;                      // one head height in metres
const pulse = (f: number, f0: number, up = 4, down = 8) => (f < f0 - up || f >= f0 + down ? 0 : f < f0 ? sm(f, f0 - up, f0) : 1 - sm(f, f0, f0 + down));
/** popIn that is 0 before its frame */
const pop = (f: number, f0: number, n = 6) => (f < f0 ? 0 : popIn(f, f0, n));

/** an arm whose hand lands on a point in the world, whatever the body's lean (a few correction steps on reach()) */
const grab = (c: Ctx, pos: V3, pose: Pose, side: "L" | "R", target: V3, arm: Partial<Arm>, o: PutOpt = {}): Arm => {
  const sgn = side === "L" ? -1 : 1;
  let h = reach(c, pos, sgn, target);
  const yaw = Math.atan2(c.cam.pos.x - pos[0], c.cam.pos.z - pos[2]), rx = Math.cos(yaw), rz = -Math.sin(yaw);
  for (let i = 0; i < 7; i++) {
    const w = where(c, GUS, { ...pose, [side]: { ...arm, h } }, pos, o), pt = w.at(w.A[side], 0);
    const dx = (target[0] - pt[0]) * rx + (target[2] - pt[2]) * rz, dy = target[1] - pt[1];
    h = [h[0] + (0.8 * sgn * dx) / HHm, h[1] - (0.8 * dy) / HHm];
    const L = Math.hypot(h[0], h[1]); if (L > 1.75) h = [(h[0] * 1.75) / L, (h[1] * 1.75) / L];
  }
  return { ...arm, h } as Arm;
};
const sweat = (c: Ctx, at: V3, f0: number, size = 0.5) => { if (c.f >= f0 && c.f < f0 + 10) { const u = q((c.f - f0) / 10, 20); fx(c, `sweat${u}`, 200, 200, (p) => fxSweat(p, u), at, size, size); } };
const thought = (c: Ctx, at: V3, f0: number, w = 0.62) => { const s = pop(c.f, f0); if (s > 0) fx(c, "thoughtWC", 460, 460, fxThought, at, w * s, w * s); };
const LAP: Arm = { h: [0.2, 0.62], bend: 0.2 };

// ---------------- the cabin ----------------
/** Gus hanging on the exit handle with both hands, leaning away from it by `lean` degrees */
const pulling = (c: Ctx, lean: number, expr: Expr, extra: Pose = {}, pos: V3 = GUS_D, o: PutOpt = { wide: true }) => {
  const pose: Pose = { expr, facing: 1, look: 1, tilt: -lean, headTilt: -4, ...extra };
  pose.R = grab(c, pos, pose, "R", HANDLE, { bend: 0.1, front: true }, o);
  pose.L = grab(c, pos, pose, "L", [HANDLE[0] - 0.09, HANDLE[1] - 0.02, HANDLE[2]], { bend: -0.12, front: true }, o);
  return put(c, GUS, pose, pos, o);
};

const cabin = (c: Ctx) => {
  const { id, f } = c;
  if (id === 1) {
    // HOOK: three yanks on the handle
    const y = yankAt(f);
    const g = pulling(c, 24 + 9 * y, y > 0.3 ? "pained" : "stern", { blink: lidAt(f, 1), headTilt: -4 - 5 * y });
    for (const f0 of YANKS) sweat(c, add(g.at(g.A.head, 0.08), [-0.1, 0.28, 0]), f0, 0.6);
  } else if (id === 3) {
    // the seat row: neighbor at the window, wife in the middle, Gus asleep on the aisle
    put(c, NEIGHBOR, { mode: "chair", expr: "asleep", headTilt: -9 + 1.5 * Math.sin(f * 0.06), L: LAP, R: LAP }, seatAt(0), { noBlob: true });
    put(c, WIFE, { mode: "chair", expr: "neutral", look: f >= WAKE + 6 ? 1 : 0, blink: lidAt(f, 7), headTilt: 2, L: LAP, R: LAP }, add(seatAt(1), [-0.04, 0, 0]), { noBlob: true });
    const awake = f >= WAKE, st = sm(f, WAKE + 10, WAKE + 20);
    const up: Arm = { h: [0.6, -0.55], bend: -0.2 };
    const pose: Pose = awake
      ? { mode: "chair", expr: f < WAKE + 10 ? "shock" : "wow", blink: lidAt(f, 2, [WAKE, WAKE + 10]), headTilt: lerp(0, -6, st), L: armMix(LAP, up, st), R: armMix(LAP, { h: [0.62, -0.5], bend: -0.2 }, st) }
      : { mode: "chair", expr: "asleep", headTilt: 11 + 1.5 * Math.sin(f * 0.07), tilt: 3, L: LAP, R: LAP };
    const g = put(c, GUS, pose, add(seatAt(2), [-0.08, 0, 0]), { noBlob: true, wide: true, tall: true });
    const head = g.at(g.A.head, 0.05);
    if (!awake) sleepBubble(c, [head[0], head[1] - 0.1, head[2] + 0.36], 0.3);
    burst(c, [head[0], head[1] - 0.1, head[2] + 0.4], WAKE, 6, 0.6, "#d8eeff");
  } else if (id === 4) {
    // sleepy Gus arrives at the exit door: he thinks it is the bathroom
    const inK = 1 - (1 - clamp01((f - 232) / 22)) ** 2, pos: V3 = [GUS_D[0] - 0.75 * (1 - inK), 0.02 * Math.abs(Math.sin(f * 0.45)) * (1 - inK), GUS_D[2]];
    const base: Pose = { expr: "neutral", facing: 1, look: 1, blink: lidAt(f, 1), headTilt: 5, tilt: 2 };
    const k = sm(f, GRAB - 9, GRAB);
    const R = k > 0.01 ? armMix(HANG, grab(c, pos, base, "R", HANDLE, { bend: 0.1, front: true }), k) : HANG;
    const g = put(c, GUS, { ...base, L: HANG, R: { ...R, front: k > 0.5 } }, pos, { wide: true });
    const h = g.at(g.A.head, 0.06);
    thought(c, [h[0] - 0.2, h[1] + 0.58, h[2]], THINK, 0.56);
  } else if (id === 5) {
    // the wife screams; the neighbor grabs his seat belt
    const scr = f >= SCREAM - 2, up = sm(f, SCREAM - 4, SCREAM + 2);
    put(c, WIFE, { mode: "chair", expr: scr ? "shock" : "wow", facing: 1, look: 1, blink: lidAt(f, 7, [SCREAM - 2]), headTilt: -4 * up, tilt: 0.6 * Math.sin(f * 1.7) * up,
      L: armMix(LAP, { h: [0.16, -0.78], bend: -0.12 }, up), R: armMix(LAP, { h: [0.6, -0.5], bend: -0.2 }, up) }, add(seatAt(1), [-0.04, 0, 0]), { noBlob: true, wide: true, tall: true });
    const gk = sm(f, GRABS - 2, GRABS + 5), tight = sm(f, BELT - 4, BELT);
    const belly: Arm = { h: [0.02, 0.6], bend: 0.3, front: true };
    const n = put(c, NEIGHBOR, { mode: "chair", expr: f >= GRABS ? "nervous" : "wow", look: f >= BELT + 6 ? 0 : 1, blink: lidAt(f, 6, [GRABS]), headTilt: 3 * gk, tilt: -2 * tight,
      L: armMix(LAP, belly, gk), R: armMix(LAP, belly, gk) }, seatAt(0), { noBlob: true, wide: true });
    const s = pop(f, GRABS, 5);
    if (s > 0) { const a = n.at(n.A.L, 0.05), b = n.at(n.A.R, 0.05); fx(c, "belt", 420, 100, fxBelt, [(a[0] + b[0]) / 2 - 0.02, (a[1] + b[1]) / 2 + 0.02, (a[2] + b[2]) / 2], 0.56 * s * (1 - 0.1 * tight), 0.133 * s); }
  } else if (id === 6) {
    // pulls harder: nothing
    const g = pulling(c, 20 + 16 * sm(f, 366, 398) + 1.5 * Math.sin(f * 0.9), "pained", { blink: lidAt(f, 1) });
    sweat(c, add(g.at(g.A.head, 0.08), [-0.1, 0.28, 0]), PULL, 0.6);
    sparkle(c, [DOOR_X + 0.22, 1.32, WALL_Z + 0.2], NOTHING, 14, 0.34);
  } else if (id === 7) {
    // a foot on the door, then he slips and sits down
    if (f < FALL) {
      const k = sm(f, FOOT - 7, FOOT), slip = sm(f, SLIP, FALL), strain = 4 * Math.sin(f * 0.8) * (1 - slip);
      const pose: Pose = { mode: "air", expr: slip > 0.2 ? "shock" : "pained", facing: 1, look: 1, tilt: -(24 + 6 * k + strain * 0.4 + 30 * slip), headTilt: -4, blink: lidAt(f, 1, [SLIP + 2]),
        legs: [[-0.08, 1.4], [lerp(0.12, 0.74, k), lerp(1.4, 0.82, k)]] };
      const pos: V3 = [GUS_D[0] - 0.12 - 0.3 * slip, -0.35 * slip * slip, GUS_D[2]];
      if (slip < 0.15) { pose.R = grab(c, pos, pose, "R", HANDLE, { bend: 0.1, front: true }, { wide: true }); pose.L = grab(c, pos, pose, "L", [HANDLE[0] - 0.09, HANDLE[1] - 0.02, HANDLE[2]], { bend: -0.12, front: true }, { wide: true }); }
      else { pose.R = { h: [0.7, -0.3], bend: -0.2 }; pose.L = { h: [0.7, -0.35], bend: -0.2 }; }
      const g = put(c, GUS, pose, pos, { wide: true });
      sweat(c, add(g.at(g.A.head, 0.08), [-0.1, 0.28, 0]), 452, 0.6);
      burst(c, [DOOR_X - 0.1, 0.72, WALL_Z + 0.25], FOOT, 6, 0.5);
    } else {
      const pos: V3 = [GUS_D[0] - 0.5, 0, GUS_D[2] + 0.15];
      const g = put(c, GUS, { mode: "sit", expr: "dazed", headTilt: 6 * Math.sin(f * 0.4), L: { h: [0.5, 0.6], bend: 0.1 }, R: { h: [0.5, 0.6], bend: 0.1 } }, pos, { wide: true });
      puff(c, [pos[0], 0.12, pos[2] + 0.1], FALL, 10, 1.0);
      dizzyStars(c, g.at(g.A.top, 0.05), 0.7);
    }
  } else if (id === 8) {
    // but wait: he is not that weak
    const pos: V3 = [-0.62, 0, -1.25], fl = sm(f, FLEX - 10, FLEX - 2) * (1 - sm(f, WHY - 8, WHY));
    const turn = sm(f, WHY - 6, WHY + 2);
    const g = put(c, GUS, { expr: f >= WHY - 2 ? "wow" : f >= FLEX - 10 ? "stern" : "nervous", look: q(lerp(0, 1, turn), 20), headTilt: lerp(3, -5, turn), blink: lidAt(f, 1, [FLEX - 10, WHY - 2]),
      L: HANG, R: { ...armMix(HANG, { h: [0.5, -0.34], bend: -0.5 }, fl), front: true } }, pos, { wide: true });
    sparkle(c, add(g.at(g.A.R, 0.06), [0, 0.1, 0]), FLEX, 12, 0.22);
    question(c, [DOOR_X + 0.02, 1.52, WALL_Z + 0.35], WHY, 0.52);
  } else if (id >= 11 && id <= 14) {
    // the door at an angle: square inch, weight, grid, the big weight
    const s0 = sqPos(SQ0.c, SQ0.r), at8: V3 = [s0[0], s0[1], s0[2] + 0.16];
    sparkle(c, [s0[0], s0[1], s0[2] + 0.1], SQUARE, 14, 0.3);
    const centre: V3 = [DOOR_X - 0.4, 1.02, WALL_Z + 0.5];
    const little = (key: string, from: V3, f0: number, i: number) => {
      const k = sm(f, ADDUP + 10 + i, ADDUP + 26 + i), sc = pop(f, f0, 5) * (1 - 0.75 * k) * (1 - sm(f, SLAM - 7, SLAM - 3));
      if (sc > 0.02) fx(c, key, 300, 300, (p) => fxWeight(p, "8"), [lerp(from[0], centre[0] + 0.3 * (hash(i, 5) - 0.5), k), lerp(from[1], centre[1] + 0.3 * (hash(i, 6) - 0.5), k), lerp(from[2], centre[2], k)], 0.3 * sc, 0.3 * sc);
    };
    if (f >= EIGHT - 7) {
      const drop = f < EIGHT ? 1.1 * (1 - (f - (EIGHT - 7)) / 7) ** 1.6 : 0.03 * Math.sin((f - EIGHT) * 0.9) * Math.exp(-(f - EIGHT) / 6);
      little("w8", [at8[0], at8[1] + drop, at8[2]], EIGHT - 7, 0);
    }
    for (let i = 1; i < 10; i++) { const p0 = sqPos(Math.floor(hash(i, 3) * 10), 1 + Math.floor(hash(i, 4) * 19)); little("w8", [p0[0], p0[1], p0[2] + 0.16], ADDUP + i, i); }
    // the thin air outside taps back, feebly
    if (f >= BACK - 6 && f < 1014) {
      const s = pop(f, BACK - 6, 5) * (1 - sm(f, 1004, 1012)), tap = pulse(f, BACK + 1, 3, 5) + pulse(f, BACK + 10, 3, 5), droop = sm(f, BACK + 16, BACK + 22);
      if (s > 0.02) fx(c, "feeble", 200, 120, fxFeeble, [DOOR_X + 0.34 - 0.06 * tap, 1.6 - 0.05 * droop, WALL_Z + 0.2], 0.24 * s, 0.144 * s, { rot: 0.7 * droop });
    }
    if (f >= SLAM - 6) {
      const k = clamp01((f - (SLAM - 6)) / 6), sc = f < SLAM ? lerp(2.6, 1, k * k) : 1 + 0.07 * Math.sin((f - SLAM) * 1.1) * Math.exp(-(f - SLAM) / 5);
      fx(c, "wBig", 640, 560, fxBigWeight, [centre[0], centre[1] + 0.02, centre[2] + 0.9 * (1 - k)], 1.05 * sc, 0.919 * sc);
      burst(c, [centre[0], centre[1], centre[2] - 0.2], SLAM, 7, 2.2);
    }
  } else if (id === 18) {
    // a plane door is a plug
    [[-1, 1], [1, 1], [1, -1], [-1, -1]].forEach(([sx, sy], i) => sparkle(c, [DOOR_X + sx * 0.45, DOOR_H / 2 + sy * 0.9, WALL_Z + 0.2], DOORSHINE + i * 4, 12, 0.3));
    const s = pop(f, PLUG);
    if (s > 0) fx(c, "plug", 300, 380, fxPlug, [DOOR_X + 0.76, 1.2 + 0.015 * Math.sin(f * 0.2), WALL_Z + 0.4], 0.5 * s, 0.633 * s, { rot: 0.08 * Math.sin(f * 0.13) });
    sparkle(c, [DOOR_X + 0.94, 1.55, WALL_Z + 0.45], PLUG + 2, 12, 0.24);
  } else if (id === 21) {
    // luckily nobody can: he lets go
    const k = sm(f, 1640, 1652);
    put(c, GUS, { expr: "sad", facing: 1, look: q(lerp(1, 0.3, k), 20), blink: lidAt(f, 1), tilt: -3, headTilt: lerp(-2, 12, k), L: HANG, R: HANG }, GUS_D, { wide: true });
    sparkle(c, [DOOR_X + 0.2, 1.3, WALL_Z + 0.2], SAFE, 14, 0.36);
    sparkle(c, [DOOR_X - 0.22, 0.6, WALL_Z + 0.2], SAFE + 5, 12, 0.24);
  } else if (id === 22) {
    // unluckily he still needs the bathroom
    const d = f >= DANCE, hop = d ? Math.abs(Math.sin((f - DANCE) * 0.52)) : 0, sway = d ? Math.sin((f - DANCE) * 0.52) : 0;
    const press: Arm = { h: [0.03, 0.98], bend: 0.28, front: true };
    const k = sm(f, OOPS + 4, OOPS + 22), da = sm(f, DANCE, DANCE + 12);
    const g = put(c, GUS, { expr: f < DANCE ? "shock" : "nervous", look: 0, blink: lidAt(f, 1, [DANCE]), tilt: 4 * sway * da, headTilt: -3 * sway * da, squash: 0.25 * k,
      L: armMix(HANG, press, k), R: armMix(HANG, press, k) }, [GUS_D[0], 0.05 * hop * da, GUS_D[2]], { wide: true });
    const h = g.at(g.A.head, 0.06);
    thought(c, [h[0] - 0.3, h[1] + 0.44, h[2]], THINK2, 0.5);
  } else if (id === 24) {
    // the next door: the lavatory. It is taken.
    const wk = sm(f, SHUFFLE, SHUFFLE + 36), x = lerp(GUS_D[0], GUS_L[0], wk), walking = wk > 0.01 && wk < 0.99;
    const pos: V3 = [x, walking ? 0.03 * Math.abs(Math.sin(f * 0.5)) : 0, GUS_L[2]];
    const taken = f >= TAKEN, hope = f >= ONEDOOR - 2;
    const base: Pose = { expr: taken ? (f >= TAKEN + 12 ? "sad" : "jawdrop") : hope ? "grin" : "nervous", facing: -1, look: -1, blink: lidAt(f, 1, [ONEDOOR - 2, TAKEN, TAKEN + 12]),
      tilt: walking ? 3 * Math.sin(f * 0.5) : 0, headTilt: lerp(0, 7, sm(f, TAKEN + 8, TAKEN + 16)), squash: 0.2 };
    const k = sm(f, KNOB - 10, KNOB) * (1 - 0.0 * sm(f, TAKEN + 6, TAKEN + 14));
    const press: Arm = { h: [0.03, 0.98], bend: 0.28, front: true };
    const L = k > 0.01 ? armMix(press, grab(c, pos, base, "L", LAV_KNOB, { bend: -0.1, front: true }), k) : press;
    put(c, GUS, { ...base, L: { ...L, front: true }, R: press }, pos, { wide: true });
    sparkle(c, [LAV_X - 0.1, 1.5, WALL_Z + 0.2], ONEDOOR, 14, 0.36);
    sparkle(c, [LAV_X + 0.14, 0.7, WALL_Z + 0.2], ONEDOOR + 6, 12, 0.26);
    burst(c, [LATCH[0], LATCH[1], LATCH[2] + 0.12], TAKEN, 7, 0.7, "#ffb0a8");
  }
};

// ---------------- the sky ----------------
const planeCard = (c: Ctx, variant: "side" | "cut" | "gear" | "open", pos: V3, w: number, hk = 1, rot = 0) =>
  fx(c, `plane|${variant}`, 1400, 560, (p) => fxPlane(p, variant === "cut", variant === "gear" || variant === "open", variant === "open"), pos, w, w * 0.4 * hk, { rot });
/** a sea of clouds drifting past below the plane (soft cards: kept clear of everything else on screen) */
const cloudSea = (c: Ctx, speed: number, high = false) => {
  for (let i = 0; i < 12; i++) {
    const x0 = -54 + i * 9 + 4 * hash(i, 31), x = ((((x0 - speed * c.f) % 108) + 108) % 108) - 54;
    cloud(c, [x, -5.2 - 4.5 * hash(i, 32), -4 - 34 * hash(i, 33)], 9 + 6 * hash(i, 34), i % 4);
  }
  if (high) for (let i = 0; i < 4; i++) { const x0 = -40 + i * 22, x = ((((x0 - speed * 0.5 * c.f) % 108) + 108) % 108) - 54; cloud(c, [x, 13 + 3 * hash(i, 35), -30], 12, (i + 1) % 4); }
};
const dots = (c: Ctx, seed: number, n: number, pos: V3, w: number, sc = 1) => { if (sc > 0.02) fx(c, `dots${seed}|${n}`, 600, 600, (p) => fxDots(p, seed, n), pos, w * sc, w * sc); };

const skyStage = (c: Ctx) => {
  const { id, f } = c, bob = 0.06 * Math.sin(f * 0.07);
  if (id === 2) {
    cloudSea(c, 0.07, true);
    planeCard(c, "side", [0, bob, 0], PLANE_W);
    sparkle(c, [1.2, 0.95 + bob, 0.2], CALM, 16, 1.5);
  } else if (id === 9) {
    cloudSea(c, 0.07);
    planeCard(c, "side", [0, bob, 0], PLANE_W);
    // lonely air dots drifting past; on "thin" half of them go
    const gone = 1 - sm(f, THIN, THIN + 10);
    for (let i = 0; i < 6; i++) {
      const x = ((((-6 + i * 4.1 - 0.035 * f) % 13) + 13) % 13) - 6.5, y = (i % 2 ? 2.6 : -2.3) + 0.5 * hash(i, 41) + (i % 3 === 0 ? 0.8 : 0);
      dots(c, 50 + i, 2, [x, y, -0.4], 2.6, (i % 2 ? gone : 1) * clamp01((6.3 - Math.abs(x)) / 0.8));
    }
    const s = pop(f, GAUGE);
    if (s > 0) {
      const v = lerp(1, 0.2, sm(f, FIFTH, FIFTH + 15)) + 0.03 * Math.sin((f - FIFTH - 15) * 0.7) * Math.exp(-Math.max(0, f - FIFTH - 15) / 7) * (f >= FIFTH + 15 ? 1 : 0);
      const blink = f >= GROUND && f < GROUND + 14 && Math.floor((f - GROUND) / 4) % 2 === 0;
      fx(c, `dial${blink ? 1 : 0}`, 500, 500, (p) => fxDial(p, blink), GAUGE_AT, 5 * s, 5 * s);
      fx(c, "needle", 500, 500, fxNeedle, [GAUGE_AT[0], GAUGE_AT[1], GAUGE_AT[2] + 0.1], 5 * s, 5 * s, { rot: (-dialAngle(v) * Math.PI) / 180 });
    }
  } else if (id === 10) {
    cloudSea(c, 0.07);
    for (let i = 0; i < 4; i++) dots(c, 60 + i, 2, [(i - 1.5) * 2.6, i % 2 ? 3.0 : -2.9, -0.4], 2.2);
    const flip = 1 + 0 * CUTAWAY, hk = 1;   // the cutaway is there from the cut
    const bulge = 1 + 0.07 * pop(f, PUMP1 - 1, 7) + 0.07 * pop(f, PUMP2 - 1, 7);
    planeCard(c, flip < 0.5 ? "side" : "cut", [0, bob, 0], PLANE_W, hk * bulge);
    [-2.4, 0.4, 2.5].forEach((x, i) => arrow(c, [x, 1.95 + bob + 0.12 * Math.sin(f * 0.3 + i), 0.2], 1.5, Math.PI, OUT1 + i * 2, AIR));
    [-2.9, 1.9, 3.2].forEach((x, i) => arrow(c, [x, -1.75 + bob - 0.12 * Math.sin(f * 0.3 + i), 0.2], 1.4, 0, OUT2 + i * 2, AIR));
  } else if (id === 19) {
    cloudSea(c, 0.03);
    fx(c, "diagram", 900, 1200, fxDiagram, [0, 0, 0], 6, 8);
    const d = doorDia(f);
    fx(c, "plugDoor", 360, 160, fxPlugDoor, [d.x, d.y, 0.1], 2.4, 1.067, { rot: d.rot });
    const ak = 1 - sm(f, COMEIN - 4, COMEIN + 2);
    if (ak > 0.03) [-0.7, 0, 0.7].forEach((x, i) => arrow(c, [x, -1.0 + 0.1 * Math.sin(f * 0.35 + i), 0.2], 1.0 * ak, Math.PI, -1e9, AIR));
    for (const f0 of [BUMP1, BUMP2]) for (const sx of [-1, 1]) burst(c, [sx * 0.95, 0.42, 0.25], f0, 6, 0.9);
  } else if (id === 23) {
    const open = f >= LETSGO;
    planeCard(c, open ? "open" : "gear", [0, GROUND_Y, 0], GROUND_W);
    if (open) { const s = popIn(f, LETSGO, 7), w = 0.62 * s; fx(c, "leaf", 120, 240, fxLeaf, [GROUND_DOOR[0] + 0.26 + w / 2, GROUND_DOOR[1], 0.1], w, 1.26); }
    burst(c, [GROUND_DOOR[0], GROUND_DOOR[1], 0.3], LETSGO, 7, 2.4);
    cloud(c, [-9, 13, -60], 26, 1); cloud(c, [16, 17, -70], 30, 2);
  }
};

// ---------------- the garden ----------------
const CAR_COLS = ["#e0352c", "#f2b632", "#3f8fe0", "#4fae5a"];
const stack = (c: Ctx, dropping: boolean) => {
  const { f } = c;
  fx(c, "slab", 500, 70, fxSlab, [STACK[0], SLAB_H / 2 + 0.02, STACK[2] + 0.02], 2.3, 0.322);
  CAR_COLS.forEach((col, n) => {
    const f0 = CARS[n];
    if (dropping && f < f0 - 8) return;
    const k = dropping ? clamp01((f - (f0 - 8)) / 8) : 1, land = dropping ? Math.max(0, f - f0) : 99;
    const sq = 1 - 0.16 * Math.exp(-land / 3) * Math.cos(land * 0.9), honk = n === 3 && f >= HONK && f < HONK + 14 && dropping;
    const jig = honk ? 0.02 * Math.sin(f * 2.4) : 0;
    fx(c, `car${n}${honk ? "h" : ""}`, 500, 240, (p) => { if (n % 2) { p.g.translate(500, 0); p.g.scale(-1, 1); } fxCar(p, col, honk); }, [STACK[0] + (n % 2 ? 0.06 : -0.06) + jig, carY(n) - (CAR_H * (1 - sq)) / 2 + 7 * (1 - k) ** 1.5, STACK[2] - 0.02 * n], CAR_W, CAR_H * sq);
  });
};
const garden = (c: Ctx) => {
  const { id, f } = c;
  if (id === 15) {
    stack(c, true);
    const dn = sm(f, HONK + 6, HONK + 16);
    put(c, GUS, { expr: f >= HONK + 8 ? "nervous" : "wow", facing: 1, look: 1, headTilt: lerp(-13, 7, dn), blink: lidAt(f, 1, [HONK + 8]), L: HANG,
      R: { ...armMix(HANG, { h: [0.8, 0.5], bend: 0.05, hand: "point" }, dn), front: true } }, GUS15, { wide: true });
    burst(c, [STACK[0] - 1.25, carY(3) + 0.05, STACK[2] + 0.1], HONK, 6, 0.9);
  } else if (id === 20) {
    stack(c, false);
    const sl = f >= SCRABBLE ? 0.035 * Math.sin(f * 1.3) : 0, pos: V3 = [GUS20[0] + sl, 0, GUS20[2]];
    const pose: Pose = { expr: f >= GROAN - 2 ? "pained" : "stern", facing: -1, look: -1, tilt: -(26 + 2 * Math.sin(f * 0.7)), headTilt: 6, blink: lidAt(f, 1, [GROAN - 2]),
      L: { h: [-0.12, 0.2], bend: 0.3, front: true }, R: { h: [-0.3, 0.12], bend: -0.3, front: true } };
    const g = put(c, GUS, pose, pos, { wide: true });
    const a = g.at(g.A.L, 0.04), b: V3 = [STACK[0] - 1.0, SLAB_H / 2 + 0.04, STACK[2] + 0.06];
    fx(c, "rope", 400, 300, fxRope, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a[2] - 0.03], Math.abs(b[0] - a[0]) + 0.06, Math.abs(a[1] - b[1]) + 0.06);
    sweat(c, add(g.at(g.A.head, 0.08), [0.1, 0.28, 0]), HEAVE, 0.6);
    sweat(c, add(g.at(g.A.head, 0.08), [0.1, 0.28, 0]), GROAN, 0.6);
    for (let i = 0; i < 5; i++) puff(c, [pos[0] + 0.3, 0.12, pos[2] + 0.1], SCRABBLE + i * 8, 9, 0.5);
  } else {
    // 16-17: the suction cup on the helmet glass
    const close = id === 17;
    const tug = close ? 0 : 0.55 * (pulse(f, TUG1 + 5, 11, 9) + pulse(f, TUG2 + 6, 8, 10)), off = close ? clamp01((f - CUPOFF) / 6) : 0;
    const recoil = close ? pulse(f, CUPOFF + 1, 2, 10) : 0;
    const gpos: V3 = [GUS16[0] + 0.06 * tug - 0.04 * recoil, 0, GUS16[2]];
    const gpose: Pose = { expr: close ? (f >= CUPOFF ? "wow" : f >= AIRPUSH ? "nervous" : "neutral") : f >= STICK ? "nervous" : "smile", look: q(close && f >= CUPOFF + 8 ? 0 : 0.9, 10),
      blink: close ? lidAt(f, 1, [AIRPUSH, CUPOFF, CUPOFF + 8]) : (f < STICK + 6 ? lidAt(f, 1, [STICK]) : 0), tilt: 5 * tug - 3 * recoil, headTilt: 4 * tug - 4 * recoil, L: HANG, R: HANG };
    const g = put(c, GUS, gpose, gpos);
    const head = g.at(g.A.head, 0), rim: V3 = [head[0] + 0.335, head[1] + 0.02, head[2] + 0.06];
    const cupW = 0.32, cupH = 0.2, knobOf = (r: V3): V3 => [r[0] + (248 / 320) * cupW, r[1], r[2]];
    const wx = close ? 0.95 : WIFE16[0], wpos: V3 = [wx + 0.05 * tug, 0, WIFE16[2]];
    const wbase: Pose = { expr: close ? "wow" : f >= STICK + 8 ? "stern" : "smile", facing: -1, look: -1, blink: lidAt(f, 7, close ? [] : [STICK + 8]), tilt: 4 * tug, R: HANG };
    let cupRim = rim, L: Arm;
    if (!close) {
      const k = sm(f, STICK - 9, STICK);                              // she brings the cup to the glass
      const start: V3 = [wpos[0] - 0.42, 1.12, wpos[2] + 0.05];
      cupRim = [lerp(start[0] - 0.25, rim[0], k), lerp(start[1], rim[1], k), rim[2]];
      L = { h: reach(c, wpos, -1, knobOf(cupRim)), bend: -0.1, front: true };
    } else {
      const back = sm(f, CUPOFF - 16, CUPOFF - 5), fly: V3 = [rim[0] + 0.55 * off ** 0.6, rim[1] + 0.06 * off, rim[2]];
      cupRim = fly;
      const h = reach(c, wpos, -1, knobOf(cupRim));
      L = back > 0.01 ? { ...armMix(HANG, { h, bend: -0.1 }, back), front: true } : HANG;
    }
    put(c, WIFE, { ...wbase, L }, wpos, { wide: true });
    fx(c, "cup", 320, 200, fxCup, [cupRim[0] + cupW / 2 - (14 / 320) * cupW, cupRim[1], cupRim[2] + 0.02], cupW, cupH);
    if (!close) burst(c, [rim[0], rim[1], rim[2] + 0.1], STICK, 5, 0.4);
    else {
      question(c, [rim[0] + 0.14, rim[1] + 0.34, rim[2] + 0.05], NOGLUE, 0.3 * (f < AIRPUSH - 4 ? 1 : Math.max(0.01, 1 - sm(f, AIRPUSH - 4, AIRPUSH))));
      if (f < CUPOFF) [[0.33, 0.0, -Math.PI / 2], [0.25, 0.25, -Math.PI / 2 - 0.55], [0.25, -0.25, -Math.PI / 2 + 0.55]].forEach(([dx, dy, rot], i) => {
        const pu = 0.02 * Math.sin(f * 0.4 + i);
        arrow(c, [rim[0] + dx + 0.1 + pu, rim[1] + dy * 1.1, rim[2] + 0.12], 0.3, rot, AIRPUSH + i * 2, AIR);
      });
      burst(c, [rim[0] + 0.05, rim[1], rim[2] + 0.15], CUPOFF, 6, 0.7);
    }
  }
};

/** called once per frame and canvas; c.shot is the current shot */
export const stage = (c: Ctx) => {
  if (c.shot.place === "sky") skyStage(c);
  else if (c.shot.place === "garden") garden(c);
  else cabin(c);
};
