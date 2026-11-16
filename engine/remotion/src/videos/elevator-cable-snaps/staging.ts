// Staging of "What If the Elevator Cable Snapped?": who stands where in which pose, and every 2D effect, per shot.
// put(c, LOOK, pose, position) places a character; fx() places one of this video's drawings (props.ts).
import { Ctx, V3, put, fx, q, sm, lidAt, armMix, talk, add, reach, lerp, HANG, HIP, GUS, WIFE, NEIGHBOR, FISHER, Arm, Pose, Look, flail, speedLines,
  sparkle, arrow, burst, puff, question, dizzyStars, popIn } from "../../toon/kit";
import { HSNAP, HSTOP, STEPIN, WAVE, SIX, PACKED, HOLDS, PLAN, NCROUCH, NHOP, NLAND, MATH, B76, GHOP, SIX6, SNAPS10, FLOAT, READY, STOP, WHY, WHEEL, FASTER, TRIP,
  BELT, PULL, LOCKS, WEDGE1, WEDGE2, JAM, SPARKS, PULLS, BITE, NOPOWER, NOCOMP, NOLUCK, UNLUCKY, LIFT, NOPE, FIVEFT, FINE, CROUCH, LASTJUMP,
  GUS_AT, NB_AT, GUS9, DIAL9, ROPE_X, ROPE_Y, ROPE_Z, RAIL_X, FELL, CAR_Z1, sagAt, BLD, BLD_W, BLD_H, DIAL8, bfall, mph8, hop, mph9, GOV, GOV_R, ICON_X, LEVER, iconY, wheelAngle, flyK,
  WPX, WDG_BG, jamK, CAR_AT, CAR_W, CAR_HT, GUS_SEAT, REEL } from "./story";
import { fxBuilding, fxTinyCar, BLD_TOP, BLD_FLOOR, fxSpeedo, fxNeedle, dialAngle, fxCarIcon, fxRails, fxLoop, fxWheel, fxLever, fxWedgeBg, fxWedge, fxNo, fxAuto, fxStrap, fxTongue,
  fxGhost, fxDouble, fxSparks } from "./props";

const UP: Arm = { h: [0.34, -1.2], bend: -0.08 };
const NB2: Look = { ...NEIGHBOR, id: "neighbor2", seed: 77, top: "#3f9fd6" };
const WIFE2: Look = { ...WIFE, id: "wife2", seed: 91, dress: "#8f7be0", top: "#8f7be0" };
const W: { wide: true } = { wide: true };
const up = (p: V3, y: number): V3 => [p[0], p[1] + y, p[2]];
/** a band stretched between two points in the world (the seat belt, a link in a diagram) */
const band = (c: Ctx, a: V3, b: V3, wid = 0.07) => {
  const dx = (b[0] - a[0]) * c.cam.right.x + (b[2] - a[2]) * c.cam.right.z, dy = b[1] - a[1];
  fx(c, "strap", 400, 40, fxStrap, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], Math.hypot(dx, dy), wid, { rot: Math.atan2(dy, dx) });
};
const sparks = (c: Ctx, pos: V3, f0: number, n = 10, size = 0.8, seed = 0) => {
  if (c.f < f0 || c.f >= f0 + n) return;
  const u = q((c.f - f0) / n, 20);
  fx(c, `sparks${u}|${seed}`, 300, 300, (p) => fxSparks(p, u, seed), pos, size, size, { gain: 1.5 });
};
const dial = (c: Ctx, pos: V3, size: number, mph: number) => {
  fx(c, "speedo", 600, 600, fxSpeedo, pos, size, size);
  fx(c, "speedoNeedle", 600, 600, fxNeedle, [pos[0], pos[1], pos[2] + 0.03], size, size, { rot: (-dialAngle(mph) * Math.PI) / 180 });
};
/** landing after the car stops at f0: the body squashes and springs back */
const land = (f: number, f0: number) => 0.55 * Math.exp(-Math.max(0, f - f0) / 5);
/** a soft landing after a hop: the knees give and come back over n frames */
const give = (f: number, f0: number, n = 10) => { const u = (f - f0) / n; return u <= 0 || u >= 1 ? 0 : 0.35 * Math.sin(Math.PI * u) ** 2; };
const floatY = (f: number, f0: number, h: number) => h * (1 - sm(f, f0 - 3, f0));

// ---------------- inside the car ----------------
const lift = (c: Ctx) => {
  const { id, f } = c;
  if (id === 2) {                                                             // hook: they float, then the car stops
    const air = f < HSTOP;
    const gy = floatY(f, HSTOP, 0.3 + 0.04 * Math.sin(f * 0.3)), ny = floatY(f, HSTOP, 0.24 + 0.04 * Math.sin(f * 0.27 + 2));
    put(c, GUS, air ? { ...flail(f, 0.9), expr: "shock" } : { expr: "dazed", squash: land(f, HSTOP), L: HANG, R: HANG }, up(GUS_AT, gy), W);
    put(c, NEIGHBOR, air ? { ...flail(f + 9, 0.8), expr: "jawdrop" } : { expr: "dazed", squash: land(f, HSTOP), L: HANG, R: HANG }, up(NB_AT, ny), W);
    speedLines(c, 10, 1.4, air ? 1 : 0);
    puff(c, [GUS_AT[0], 0.12, -0.4], HSTOP, 10, 0.7); puff(c, [NB_AT[0], 0.12, -0.4], HSTOP + 1, 10, 0.7);
  } else if (id === 3) {                                                      // Gus steps in; the neighbor waves
    const k = sm(f, STEPIN, STEPIN + 30), x = lerp(-1.95, GUS_AT[0], k), bob = 0.035 * Math.abs(Math.sin((f - STEPIN) * 0.42)) * (k > 0 && k < 1 ? 1 : 0);
    put(c, GUS, { expr: "smile", blink: lidAt(f, 1), tilt: 3 * Math.sin(k * Math.PI), look: sm(f, WAVE - 12, WAVE - 4), L: HANG, R: HANG }, [x, bob, GUS_AT[2]]);
    const w = sm(f, WAVE - 5, WAVE);
    put(c, NEIGHBOR, { expr: f >= WAVE - 2 ? "grin" : "smile", blink: lidAt(f, 2, [WAVE - 2]), look: -sm(f, STEPIN + 6, STEPIN + 16),
      L: HIP, R: armMix(HANG, { h: [0.6 + 0.09 * Math.sin(f * 0.75), -0.58], bend: -0.25 }, w) }, NB_AT, W);
  } else if (id === 6) {                                                      // the neighbor's plan: crouch and hop
    put(c, GUS, { expr: f >= PLAN + 8 ? "nervous" : "smile", blink: lidAt(f, 1, [PLAN + 8]), look: sm(f, PLAN - 8, PLAN), L: HANG, R: HANG }, GUS_AT);
    const fin = sm(f, PLAN - 5, PLAN) * (1 - sm(f, NCROUCH - 8, NCROUCH)), sq = sm(f, NCROUCH, NCROUCH + 12) * (1 - sm(f, NHOP - 2, NHOP + 1));
    const y = hop(f, NHOP, 0.42, NLAND - NHOP), th = sm(f, NLAND + 2, NLAND + 8), air = sm(f, NHOP - 2, NHOP + 2) * (1 - sm(f, NLAND - 3, NLAND + 1));
    const R0 = armMix(HANG, { h: [0.3, -0.72], bend: -0.3, hand: "point" }, fin);
    put(c, NEIGHBOR, { expr: f >= NLAND ? "grin" : f >= NCROUCH ? "stern" : f >= 473 ? talk(f) : f >= PLAN - 2 ? "grin" : "smile", blink: lidAt(f, 2, [PLAN - 2, 473, NCROUCH, NLAND]),
      squash: sq + give(f, NLAND - 1), look: -0.6 * (1 - sm(f, NCROUCH - 6, NCROUCH)),
      R: armMix(R0, UP, air), L: { ...armMix(armMix(HANG, UP, air), { h: [0.36, 0.12], bend: -0.3 }, th), front: true, hand: th > 0.5 ? "thumb" : "dot" } }, up(NB_AT, y), { wide: true, tall: true });
    sparkle(c, [NB_AT[0] + 0.28, 2.0, NB_AT[2] + 0.1], PLAN, 12, 0.24);
  } else if (id === 7) {                                                      // Gus does the math
    const k = sm(f, MATH - 13, MATH);
    put(c, GUS, { expr: "stern", blink: lidAt(f, 1), headTilt: -3 * k, L: { ...armMix({ h: [0.3, 0.75], bend: 0.1 }, { h: [0.56, -0.2], bend: -0.1 }, k), prop: "clipboard", front: true }, R: HIP }, GUS_AT, W);
  } else if (id === 9) {                                                      // his best jump: six miles an hour
    const sq = sm(f, GHOP - 9, GHOP - 2) * (1 - sm(f, GHOP - 2, GHOP + 1)), y = hop(f, GHOP, 0.38, 14), air = sm(f, GHOP - 2, GHOP + 2) * (1 - sm(f, GHOP + 11, GHOP + 15));
    put(c, GUS, { expr: f >= SIX6 + 5 ? "nervous" : "stern", blink: lidAt(f, 1, [SIX6 + 5]), squash: sq + give(f, GHOP + 13), look: sm(f, SIX6 - 3, SIX6 + 3),
      L: armMix(HANG, UP, air), R: armMix(HANG, UP, air) }, up(GUS9, y), { wide: true, tall: true });
    dial(c, DIAL9, 0.66, mph9(f));
  } else if (id === 12) {                                                     // free fall inside: Gus floats, the neighbor tucks; then the stop
    const air = f < STOP, rd = sm(f, READY - 3, READY + 5);
    const gy = floatY(f, STOP, 0.08 + 0.36 * sm(f, FLOAT - 2, FLOAT + 16) + 0.03 * Math.sin(f * 0.21));
    const ny = floatY(f, STOP, 0.2 + 0.05 * Math.sin(f * 0.19 + 1));
    put(c, GUS, air ? { ...flail(f * 0.55, 0.5), expr: "shock" } : { expr: "dazed", squash: land(f, STOP), L: HANG, R: HANG }, up(GUS_AT, gy), W);
    const fl = flail(f * 0.8 + 9, 0.8), tuck: Pose = { mode: "air", L: { h: [0.5, 0.55], bend: 0.25 }, R: { h: [0.5, 0.55], bend: 0.25 }, legs: [[-0.34, 0.55], [0.34, 0.55]] };
    const mixed: Pose = { mode: "air", L: armMix(fl.L as Arm, tuck.L as Arm, rd), R: armMix(fl.R as Arm, tuck.R as Arm, rd),
      legs: [0, 1].map((i) => [lerp(fl.legs![i][0], tuck.legs![i][0], rd), lerp(fl.legs![i][1], tuck.legs![i][1], rd)]) as [[number, number], [number, number]] };
    put(c, NEIGHBOR, air ? { ...mixed, expr: f >= READY ? "stern" : "jawdrop", blink: lidAt(f, 2, [READY]) } : { expr: "dazed", squash: land(f, STOP), L: HANG, R: HANG }, up(NB_AT, ny), W);
    speedLines(c, 10, 1.4, air ? 1 : 0);
    puff(c, [GUS_AT[0], 0.12, -0.4], STOP, 10, 0.7); puff(c, [NB_AT[0], 0.12, -0.4], STOP + 1, 10, 0.7);
    if (f >= STOP + 4) { dizzyStars(c, [GUS_AT[0], 2.02, GUS_AT[2] + 0.05], 0.6); dizzyStars(c, [NB_AT[0], 1.86, NB_AT[2] + 0.05], 0.6); }
  } else if (id === 19) {                                                     // luckily: three things they do not need; unluckily: nobody lifts the car
    const bad = f >= UNLUCKY, push = sm(f, LIFT - 12, LIFT) * (1 - sm(f, NOPE - 2, NOPE + 10)), tip = 0.1 * push + 0.015 * push * Math.sin(f * 1.6);
    const lookUp = sm(f, 1620, 1628) * (1 - sm(f, UNLUCKY - 4, UNLUCKY + 4));
    put(c, GUS, { expr: f >= NOPE ? "sad" : push > 0.5 ? "pained" : bad ? "nervous" : "relief", blink: lidAt(f, 1, [UNLUCKY, LIFT - 3, NOPE]), headTilt: -5 * lookUp - 6 * push,
      L: armMix(HANG, UP, push), R: armMix(HANG, UP, push) }, up(GUS_AT, tip), { wide: true, tall: true });
    put(c, NEIGHBOR, { expr: f >= NOPE ? "sad" : push > 0.5 ? "pained" : bad ? "wow" : "relief_open", blink: lidAt(f, 2, [UNLUCKY, LIFT - 3, NOPE]), headTilt: 5 * lookUp + 6 * push,
      L: armMix(HANG, UP, push), R: armMix(HANG, UP, push) }, up(NB_AT, tip), { wide: true, tall: true });
    const away = 1 - sm(f, UNLUCKY + 4, UNLUCKY + 22);
    [NOPOWER, NOCOMP, NOLUCK].forEach((f0, i) => {
      const s = popIn(f, f0) * away * 0.46;
      if (s > 0.01) fx(c, `no${i}`, 300, 300, (p) => fxNo(p, i), [-0.62 + 0.65 * i, 2.13 + 0.012 * Math.sin(f * 0.12 + i), -1.2], s, s);
    });
  } else if (id === 21) {                                                     // stuck: the neighbor still wants to jump
    put(c, GUS, { expr: "neutral", blink: lidAt(f, 1), look: 0.9 * sm(f, CROUCH, CROUCH + 8), L: HANG, R: HANG }, GUS_AT);
    const sq = 0.6 * sm(f, CROUCH, CROUCH + 10) * (1 - sm(f, LASTJUMP - 2, LASTJUMP + 1)), y = hop(f, LASTJUMP, 0.45, 34), air = sm(f, LASTJUMP - 2, LASTJUMP + 3);
    const wag: Arm = { h: [0.34 + 0.07 * Math.sin(f * 0.7), -0.6], bend: -0.3, hand: "point" }, wk = sm(f, 1900, 1910) * (1 - sm(f, CROUCH - 6, CROUCH));
    put(c, NEIGHBOR, { expr: f >= LASTJUMP - 2 ? "grin" : f >= CROUCH ? "stern" : wk > 0.4 ? talk(f) : "smile", blink: lidAt(f, 2, [1900, CROUCH, LASTJUMP - 2]), squash: sq,
      look: -0.5 * (1 - sm(f, CROUCH - 4, CROUCH + 4)), R: armMix(armMix(HANG, wag, wk), UP, air), L: armMix(HANG, UP, air) }, up(NB_AT, y), { wide: true, tall: true });
  }
};

// ---------------- the shaft from outside ----------------
const riders = (c: Ctx, g: Pose, n: Pose, gy = 0, ny = gy) => {
  const a = put(c, GUS, g, up(GUS_AT, gy), { wide: true, noBlob: true });
  put(c, NEIGHBOR, n, up(NB_AT, ny), { wide: true, noBlob: true });
  return a;
};
const hoistway = (c: Ctx) => {
  const { id, f } = c;
  const calmG: Pose = { expr: "smile", blink: lidAt(f, 1), L: HANG, R: HANG }, calmN: Pose = { expr: "smile", blink: lidAt(f, 2), L: HIP, R: HANG };
  if (id === 1) {                                                             // hook: the ropes part, the car falls
    const air = sm(f, HSNAP, HSNAP + 5);
    if (air < 0.5) riders(c, { expr: f >= 20 ? "nervous" : "smile", blink: lidAt(f, 1, [20]), headTilt: -6 * sm(f, 16, 24), L: HANG, R: HANG }, { expr: f >= 24 ? "wow" : "smile", blink: lidAt(f, 2, [24]), headTilt: 6 * sm(f, 20, 28), L: HIP, R: HANG });
    else riders(c, { ...flail(f, 0.9), expr: "shock" }, { ...flail(f + 9, 0.8), expr: "jawdrop" }, 0.3 * sm(f, HSNAP + 2, HSNAP + 9), 0.25 * sm(f, HSNAP + 2, HSNAP + 9));
    for (let i = 0; i < 6; i += 2) burst(c, [ROPE_X(i) + 0.06, ROPE_Y + 0.25, ROPE_Z + 0.2], HSNAP + (i % 2), 6, 0.7);
    if (f >= HSNAP + 3) speedLines(c, 12, 1.6, sm(f, HSNAP + 3, HSNAP + 9));
  } else if (id === 4) {
    riders(c, calmG, calmN);
    for (let i = 0; i < 6; i++) sparkle(c, [ROPE_X(i), 4.6 + 0.25 * i, ROPE_Z + 0.1], SIX + 3 * i, 10, 0.3);
  } else if (id === 5) {                                                      // one rope carries the packed car
    const sag = f >= PACKED ? sagAt(f) : 0, s = popIn(f, PACKED);
    if (s > 0.01) { put(c, WIFE, { expr: "neutral", L: HANG, R: HANG }, [-0.9, -sag, -1.15], { scale: s, noBlob: true }); put(c, FISHER, { expr: "smile", L: HANG, R: HANG }, [0.02, -sag, -1.2], { scale: s, noBlob: true });
      put(c, NB2, { expr: "grin", L: HANG, R: HANG }, [0.93, -sag, -1.12], { scale: s, noBlob: true }); }
    riders(c, { ...calmG, expr: f >= PACKED ? "nervous" : "smile", blink: lidAt(f, 1, [PACKED]) }, { ...calmN, expr: f >= PACKED ? "wow" : "smile", blink: lidAt(f, 2, [PACKED]) }, -sag);
    if (s > 0.01) { put(c, WIFE2, { expr: "smile", L: HANG, R: HANG }, [-0.04, -sag, -0.3], { scale: s, noBlob: true }); put(c, FISHER, { expr: "wow", L: HANG, R: HANG }, [-0.95, -sag, -0.25], { scale: s, mirror: true, noBlob: true });
      put(c, WIFE, { expr: "stern", L: HANG, R: HANG }, [0.95, -sag, -0.28], { scale: s, mirror: true, noBlob: true }); }
    sparkle(c, [ROPE_X(2), 3.6, ROPE_Z + 0.15], HOLDS, 14, 0.5);
  } else if (id === 10) {
    SNAPS10.forEach((f0, i) => burst(c, [ROPE_X(i), ROPE_Y + 0.3, ROPE_Z + 0.15], f0, 5, i === 5 ? 0.8 : 0.45));
  } else if (id === 11) {
    riders(c, { ...flail(f, 0.9), expr: "shock" }, { ...flail(f + 9, 0.8), expr: "jawdrop" }, 0.3, 0.25);
    speedLines(c, 12, 1.6, 1);
  } else if (id === 13) {
    riders(c, { expr: f >= WHY - 2 ? "wow" : "dazed", blink: lidAt(f, 1, [WHY - 2]), L: HANG, R: HANG }, { expr: f >= WHY - 2 ? "wow" : "dazed", blink: lidAt(f, 2, [WHY - 2]), L: HANG, R: HANG });
    question(c, [0, 3.85, 0.3], WHY, 1.0);
  } else if (id === 17) {
    riders(c, { expr: "wow", blink: lidAt(f, 1), L: HANG, R: HANG }, { expr: "wow", blink: lidAt(f, 2), L: HANG, R: HANG });
    arrow(c, [-RAIL_X, 0.5, ROPE_Z + 0.6], 1.0, 0, WEDGE1, "#ffd84a"); arrow(c, [RAIL_X, 0.5, ROPE_Z + 0.6], 1.0, 0, WEDGE2, "#ffd84a");
    sparkle(c, [-RAIL_X, -0.45, ROPE_Z + 0.35], WEDGE1 + 3, 12, 0.5); sparkle(c, [RAIL_X, -0.45, ROPE_Z + 0.35], WEDGE2 + 3, 12, 0.5);
  } else if (id === 20) {                                                     // fell five feet; he's fine
    const th = sm(f, FINE - 6, FINE);
    const g = riders(c, { expr: f >= FINE - 2 ? "smile_closed" : "smile", blink: lidAt(f, 1, [FINE - 2]), L: { ...armMix(HANG, { h: [0.36, 0.12], bend: -0.3 }, th), front: true, hand: "thumb" }, R: HANG },
      { expr: "neutral", blink: lidAt(f, 2), L: HANG, R: HANG });
    sparkle(c, add(g.at(g.A.L, 0.06), [-0.02, 0.2, 0]), FINE, 14, 0.5);
    const s = popIn(f, FIVEFT);
    if (s > 0.01) {
      fx(c, "ghost", 440, 500, fxGhost, [0, 1.13 + FELL, CAR_Z1 + 0.12], 2.42 * s, 2.75 * s);
      fx(c, "double", 160, 600, fxDouble, [0, 2.5 + FELL / 2, CAR_Z1 + 0.3], 0.42 * s, FELL * s);
    }
  }
};

// ---------------- the diagrams on the sky ----------------
const sky = (c: Ctx) => {
  const { id, f } = c;
  if (id === 8) {                                                             // twenty floors down: 76 mph
    fx(c, "building", 350, 1400, fxBuilding, BLD, BLD_W, BLD_H);
    const py = BLD_TOP + 44 + bfall(f) * (19 * BLD_FLOOR), m = BLD_H / 1400;
    fx(c, "tinycar", 80, 80, fxTinyCar, [BLD[0], BLD[1] + (700 - py) * m, 0.03], 0.3, 0.3);
    const sh = f >= B76 ? 0.012 * Math.min(1, (f - B76) / 3) * Math.exp(-(f - B76) / 5) * Math.sin(f * 2.4) : 0;
    dial(c, [DIAL8[0] + sh, DIAL8[1], DIAL8[2]], 2.0, mph8(f));
  } else if (id === 14) {                                                     // the governor
    const y = iconY(f), tripped = f >= TRIP, bump = 1 + 0.15 * Math.max(0, 1 - Math.abs(f - WHEEL - 3) / 4);
    fx(c, "rails", 260, 1500, fxRails, [ICON_X, 0, 0], 1.1, 6.35);
    fx(c, "loop", 340, 1500, fxLoop, [GOV[0], GOV[1] + 170 / 200 - 3.75, 0.01], 1.7, 7.5);
    band(c, [ICON_X + 0.4, y + 0.42, 0.015], [GOV[0] - GOV_R, y + 0.42, 0.015], 0.06);
    fx(c, `icon${tripped ? 1 : 0}`, 260, 300, (p) => fxCarIcon(p, tripped), [ICON_X, y, 0.02], 1.1, 1.27);
    const k = q(flyK(f), 12), sz = (GOV_R * 500 * bump) / 172;
    fx(c, `wheel${k}`, 500, 500, (p) => fxWheel(p, k), GOV, sz, sz, { rot: -wheelAngle(f) });
    fx(c, "lever", 300, 300, fxLever, LEVER, 1.5, 1.5, { rot: -0.8 * sm(f, TRIP - 1, TRIP + 4) });
    sparkle(c, [GOV[0], GOV[1] + 0.95, 0.1], WHEEL, 12, 0.5);
    burst(c, [LEVER[0] - 0.05, LEVER[1] + 0.55, 0.1], TRIP, 6, 1.1);
    if (tripped) for (const s of [-1, 1]) sparks(c, [ICON_X + s * 0.46, y - 0.5, 0.06], TRIP + 2, 10, 0.6, s);
    if (f >= FASTER && !tripped) for (let i = 0; i < 3; i++) arrow(c, [ICON_X - 0.2 + 0.2 * i, y + 1.1 + 0.25 * ((f * 0.2 + i * 0.37) % 1), 0.05], 0.5, 0, FASTER + 3 * i, "#ffffff");
  } else if (id === 18) {                                                     // the wedge on its rail
    const k = jamK(f), drop = 0.1 * k, sq = popIn(f, BITE);
    const P = (px: number, py: number, z: number): V3 => [WDG_BG[0] + (px - 450) / WPX, WDG_BG[1] + (600 - py) / WPX - drop, z];
    fx(c, "wedgeBg", 900, 1200, fxWedgeBg, [WDG_BG[0], WDG_BG[1] - drop, WDG_BG[2]], 4, 5.333);
    for (const s of [-1, 1]) {
      const bite = f >= BITE ? 4 : 0, px = 450 + s * (lerp(156, 116, k) - bite), py = lerp(728, 568, k);
      fx(c, `wedge${s}`, 200, 400, (p) => fxWedge(p, s), P(px, py, 0.02), 200 / WPX, 400 / WPX);
      sparks(c, P(450 + s * 34, 520, 0.05), SPARKS, 16, 0.9, s);
      if (sq > 0.01) arrow(c, P(450 + s * 330, 600, 0.06), 0.95 * Math.min(1.1, sq), s * -Math.PI / 2, BITE, "#ffd84a");
      arrow(c, P(450 + s * 250, 130, 0.06), 1.0, 0, PULLS + (s > 0 ? 3 : 0), "#ff6b5e");
    }
    burst(c, P(450, 560, 0.08), BITE, 7, 1.3);
    burst(c, P(450, 600, 0.08), JAM, 5, 0.9);
  }
};

// ---------------- the garden: the seat belt ----------------
const garden = (c: Ctx) => {
  const { id, f } = c;
  fx(c, "auto0", 1100, 520, (p) => fxAuto(p, 0), [CAR_AT[0], CAR_HT / 2, CAR_AT[2] - 0.12], CAR_W, CAR_HT);
  // how far the belt is pulled out, 0..1
  let k: number, expr: Pose["expr"], swaps: number[];
  if (id === 15) { k = 0.9 * sm(f, PULL, PULL + 42); expr = f >= PULL + 34 ? "smile_closed" : "smile"; swaps = [PULL + 34]; }
  else {
    const tug = 0.14 * Math.sin(Math.min(1, Math.max(0, (f - 1349) / 9)) * Math.PI), yank = sm(f, LOCKS - 4, LOCKS);
    k = 0.08 + tug + 0.3 * yank + (f >= LOCKS ? 0.035 * Math.exp(-(f - LOCKS) / 4) * Math.cos((f - LOCKS) * 1.7) : 0);
    expr = f >= LOCKS ? "shock" : "stern"; swaps = [LOCKS];
  }
  const from: V3 = [REEL[0] + 0.34, REEL[1] - 0.2, REEL[2]], to: V3 = [GUS_SEAT[0] + 0.3, GUS_SEAT[1] + 0.5, REEL[2]];
  const target: V3 = [lerp(from[0], to[0], k), lerp(from[1], to[1], k) - 0.1 * Math.sin(k * Math.PI), REEL[2]];
  const hold = sm(f, BELT - 8, BELT);
  const arm: Arm = id === 15 ? { ...armMix(HANG, { h: reach(c, GUS_SEAT, 1, target, 0.86), bend: -0.2 }, hold), front: true } : { h: reach(c, GUS_SEAT, 1, target, 0.86), bend: -0.2, front: true };
  const g = put(c, GUS, { mode: "chair", expr, blink: lidAt(f, 1, swaps), look: -0.5 * (id === 15 ? hold : 1) * (f >= LOCKS && id === 16 ? 0 : 1), tilt: id === 16 && f >= LOCKS ? -3 * Math.exp(-(f - LOCKS) / 6) : 0, L: { h: [0.2, 0.6], bend: 0.2 }, R: arm },
    GUS_SEAT, { wide: true, noBlob: true });
  if (id === 16 || f >= BELT) { const h = g.at(g.A.R, 0.05); band(c, REEL, h, 0.075); fx(c, "tongue", 100, 100, fxTongue, [h[0], h[1], h[2] + 0.01], 0.15, 0.15); }
  else band(c, REEL, [from[0] - 0.06, from[1], from[2]], 0.075);
  fx(c, "auto1", 1100, 520, (p) => fxAuto(p, 1), [CAR_AT[0], CAR_HT / 2, CAR_AT[2] + 0.14], CAR_W, CAR_HT);
  if (id === 16) { burst(c, [REEL[0], REEL[1], REEL[2] + 0.2], LOCKS, 6, 0.8); sparkle(c, [REEL[0] + 0.1, REEL[1] + 0.25, REEL[2] + 0.2], LOCKS + 2, 10, 0.3); }
  else sparkle(c, add(g.at(g.A.R, 0.06), [0.05, 0.18, 0]), PULL + 36, 12, 0.24);
};

/** called once per frame and canvas; c.shot is the current shot */
export const stage = (c: Ctx) => {
  const p = c.shot.place;
  if (p === "lift") lift(c);
  else if (p === "hoistway") hoistway(c);
  else if (p === "sky") sky(c);
  else garden(c);
};
