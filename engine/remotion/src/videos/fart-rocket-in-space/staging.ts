// Staging of "What If a Fart Was Your Only Rocket in Space?": who is where in which pose, and every 2D card, for all
// 24 shots. stage(c) is a pure function of the shot and the frame; the timing comes from story.ts, the drawings
// from props.ts (plus the stopwatch of immortal-snail).
import {
  Ctx, V3, Pose, Arm, put, fx, armMix, sm, lidAt, talk, q, HANG, HIP, clamp01, lerp, lin, add, hash, flail,
  GUS, WIFE, NEIGHBOR, sparkle, question, arrow, burst, cloud, popIn,
} from "../../toon/kit";
import {
  T, RULER, THINK, PUFF1, GLINT, UNCLIP, KICK, SWIM, NOTHING, PUSH, RADIO, WIFETHROW, GONER, BEANS, CHOMP, TURN, FIRE, ARROWBACK, THUMB, HERO, MOVING,
  LENS, TICK1, WK, ALARM, GULP, Q1, ROCKETPASS, WEAK, UP, DOWN, MUCH, TIMES, FAST, BOARD, THROW, PACKLAND, ROLL, PUFFSCALE, READ, ONESEC, STEP, DIAL, LBS,
  SLIPOFF, WINDUP, HURL, HALF, TWENTY, X6000, FIVE, ENTER, HATCHSHUT, SEAL, GREENF, UHOH, END,
  SHIP, SHIP_W, HATCH, RING, WIN, G0, AIM, rollAt, homeK, gusHome, BEAN_AT, SKATE0, rollX,
} from "./story";
import {
  GUS_SUIT, RED, fxHull, fxInside, fxDoor, fxWall, fxEarth, fxRope, fxDash, fxNum, fxPuff, fxRocket, fxBubble, fxHandset, fxCan, fxSlipper, fxStreak,
  fxSkate, fxPack, fxLens, fxCalendar, fxDial, fxNeedle, fxLamp, fxWeight, fxSign, fxKScale, fxRuler, fxBScale, fxBoard, fxLump, fxHaze,
} from "./props";
import { fxWatch, fxHand } from "../immortal-snail/props";

/** popIn that is 0 before its frame */
const pop = (f: number, f0: number, n = 6) => (f < f0 ? 0 : popIn(f, f0, n));
const pulse = (f: number, f0: number, up = 4, down = 8) => (f < f0 - up || f >= f0 + down ? 0 : f < f0 ? sm(f, f0 - up, f0) : 1 - sm(f, f0, f0 + down));
/** unit vector from Gus's place to the hatch, and its left-hand normal */
const DL = Math.hypot(HATCH[0] - G0[0], HATCH[1] - G0[1]), D: [number, number] = [(HATCH[0] - G0[0]) / DL, (HATCH[1] - G0[1]) / DL];
/** fx rot that turns a card's downward axis into the screen direction (x, y) */
const rotTo = (x: number, y: number) => Math.atan2(x, -y);

// ---------------- the set: Earth, ship ----------------
/** a point that looks as if it were at `p` in the z = 0 plane but lies at depth z; returns the point and the scale */
const far = (c: Ctx, p: V3, z: number): [V3, number] => { const cp = c.cam.pos, s = (cp.z - z) / cp.z; return [[cp.x + (p[0] - cp.x) * s, cp.y + (p[1] - cp.y) * s, z], s]; };
const earth = (c: Ctx, yTop = -3.5, wA = 11) => { const [p, s] = far(c, [0.4, yTop - 0.4 * (wA / 2), 0], -25); fx(c, "earth", 1200, 600, fxEarth, p, wA * s, (wA / 2) * s); };
/** the ship; door 0..1 = the hatch cover swings shut */
const ship = (c: Ctx, door = 0) => {
  fx(c, "inside", 300, 300, fxInside, [HATCH[0], HATCH[1], -0.8], 1.75, 2.6);
  for (const w of WIN) fx(c, "inside", 300, 300, fxInside, [w[0], w[1], -0.8], 1.3, 1.3);
  fx(c, "hull", 1200, 1200, fxHull, SHIP, SHIP_W, SHIP_W);
  if (door > 0.02) fx(c, "door", 400, 580, fxDoor, [HATCH[0], HATCH[1], -0.12], 2.09 * door, 3.03);
};
const space = (c: Ctx, door = 0, yTop = -3.5) => { earth(c, yTop); ship(c, door); };
/** rope from `top` to `bottom` (the hook end) */
const rope = (c: Ctx, top: V3, bottom: V3, slack: number) => {
  const dx = bottom[0] - top[0], dy = bottom[1] - top[1], L = Math.hypot(dx, dy), h = (L * 800) / 728;
  fx(c, `rope${q(slack, 10)}`, 200, 800, (p) => fxRope(p, q(slack, 10)), [(top[0] + bottom[0]) / 2, (top[1] + bottom[1]) / 2, bottom[2]], h * 0.25, h, { rot: rotTo(dx, dy) });
};
/** the dashed ruler between Gus and the hatch with its 10 */
const ruler = (c: Ctx, s: number) => {
  if (s <= 0.01) return;
  const a: V3 = [G0[0] + D[0] * 1.2, G0[1] + D[1] * 1.2, -0.05], L = DL - 1.75, m: V3 = [a[0] + (D[0] * L) / 2, a[1] + (D[1] * L) / 2, -0.05];
  fx(c, "dash", 160, 800, fxDash, m, 0.2 * L * s, (L * 800) / 740 * s, { rot: rotTo(D[0], D[1]) });
  fx(c, "num10", 300, 200, (p) => fxNum(p, "10"), [m[0] - 0.62, m[1] - 0.42, 0], 0.84 * s, 0.56 * s);
};
const puffAt = (c: Ctx, at: V3, w: number, rot = 0) => { if (w > 0.01) fx(c, "puff", 300, 220, (p) => fxPuff(p), at, w, w * 0.733, { rot }); };
const watch = (c: Ctx, at: V3, w: number, turns: number) => {
  if (w <= 0.01) return;
  fx(c, "watch", 300, 340, fxWatch, at, w, w * 1.133);
  fx(c, "hand", 300, 300, fxHand, [at[0], at[1] - (20 / 300) * w, at[2] + 0.02], w, w, { rot: -2 * Math.PI * turns });
};

// ---------------- Gus in space ----------------
const FLOAT_L: Arm = { h: [0.55, 0.45], bend: -0.15 }, FLOAT_R: Arm = { h: [0.55, 0.4], bend: -0.15 };
const floatPose = (f: number): Pose => ({ mode: "air", L: { ...FLOAT_L, h: [0.55 + 0.04 * Math.sin(f * 0.07), 0.45 + 0.05 * Math.sin(f * 0.05)] }, R: { ...FLOAT_R, h: [0.55 + 0.04 * Math.sin(f * 0.06 + 1), 0.4 + 0.05 * Math.sin(f * 0.045 + 2)] },
  legs: [[-0.34 + 0.04 * Math.sin(f * 0.05), 1.12], [0.4 + 0.04 * Math.sin(f * 0.06 + 1), 1.04]] });
const bob = (f: number, n = 0): V3 => [0.03 * Math.sin(f * 0.035 + n), 0.04 * Math.sin(f * 0.05 + n * 2), 0];
const gus = (c: Ctx, pose: Pose, at: V3, roll = 0, scale = 1) => put(c, GUS_SUIT, pose, at, { face: true, roll, wide: true, tall: true, noBlob: true, scale });
/** his seat in the world for a body centre and roll */
const seat = (at: V3, roll: number, d = 0.12): V3 => [at[0] + Math.sin(roll) * d, at[1] - Math.cos(roll) * d, at[2]];
const HERO_POSE = (f: number): Pose => ({ mode: "air", R: { h: [0.5, -1.0], bend: 0.02 }, L: { h: [0.06, 0.7], bend: 0.3 }, legs: [[-0.14 + 0.02 * Math.sin(f * 0.1), 1.3], [0.16, 1.3]] });

const spaceShots = (c: Ctx) => {
  const { id, f } = c;
  if (id === 1) {
    space(c);
    const calm = sm(f, 96, 108), at = add(G0, bob(f));
    const pz: Pose = { ...flail(f * 0.55, 0.9 - 0.5 * calm), expr: f < 100 ? "shock" : f < PUFF1 - 1 ? "wow" : "lick", blink: lidAt(f, 1, [100, PUFF1 - 1]), look: f >= THINK ? 0.6 : 0 };
    gus(c, pz, at, 0.22 * Math.sin(f * 0.05) * (1 - 0.6 * calm));
    const s = seat(at, 0), sway = 0.5 + 0.25 * Math.sin(f * 0.06);
    rope(c, [s[0], s[1], -0.05], [s[0] - 1.1 * Math.sin(sway) - 0.3, s[1] - 1.5 * Math.cos(sway), -0.05], 0.8);
    ruler(c, pop(f, RULER));
    const bs = pop(f, THINK), flip = Math.abs(f - PUFF1) < 7 ? 0.1 + 0.9 * Math.sin((Math.PI / 2) * Math.abs(f - PUFF1) / 7) ** 1.5 : 1, kind = f < PUFF1 ? 0 : 1;
    if (bs > 0.01) fx(c, `bubble${kind}`, 500, 440, (p) => fxBubble(p, kind), [0.95, 2.05, 0.1], 1.75 * bs * flip, 1.54 * bs);
  } else if (id === 2) {
    space(c, 0, -2.7);
    const at = add(G0, bob(f)), wave = 0.5 + 0.5 * Math.sin(f * 0.25);
    gus(c, { ...floatPose(f), R: { h: [0.62, -0.5 - 0.1 * wave], bend: -0.25 }, expr: "smile", blink: lidAt(f, 1) }, at, 0.08 * Math.sin(f * 0.04));
    rope(c, add(seat(at, 0), [0, 0, 0.04]), [RING[0], RING[1] + 0.12, 0.04], 0.25);
    sparkle(c, [-0.9, -4.0, 0.2], GLINT, 18, 0.8);
  } else if (id === 3) {
    space(c);
    const t = Math.max(0, f - UNCLIP), dr = 0.0009 * t * t + 0.012 * t;
    const [gp, gs] = far(c, [1.05 + 0.002 * (f - 243), 0.62, 0], -5);
    put(c, GUS_SUIT, { ...floatPose(f), expr: f >= UNCLIP + 2 ? "shock" : "smile", blink: lidAt(f, 1, [UNCLIP + 2]), look: 0.5 }, gp, { face: true, roll: 0.1, wide: true, tall: true, noBlob: true, scale: gs * 0.92 });
    const hook: V3 = [RING[0] - dr * 0.9, RING[1] + 0.12 + dr * 1.2, 0.05];
    rope(c, [0.75 - dr * 0.3, 0.95 + dr * 0.4, 0.05], hook, 0.25 + 0.5 * sm(f, UNCLIP, UNCLIP + 14));
    sparkle(c, [RING[0], RING[1] + 0.05, 0.2], UNCLIP, 10, 0.5);
  } else if (id === 4) {
    space(c);
    const still = sm(f, NOTHING - 4, NOTHING + 2), swim = sm(f, SWIM - 3, SWIM + 2), a = f * 0.75, sh = pulse(f, PUSH + 2, 6, 10);
    const kick = flail(f * 1.5, 1), k = 1 - still;
    const L0: Arm = { h: [lerp(0.5, 0.5 + 0.35 * Math.cos(a), swim), lerp(0.3, 0.0 + 0.32 * Math.sin(a), swim)], bend: -0.2 };
    const R0: Arm = { h: [lerp(0.5, 0.5 + 0.35 * Math.cos(a), swim), lerp(0.3, 0.0 + 0.32 * Math.sin(a), swim)], bend: -0.2 };
    const shove: Arm = { h: [0.55, 0.95 + 0.12 * sh], bend: 0.02, front: true };
    const legs = kick.legs!.map(([x, y], i) => [lerp(i ? 0.4 : -0.34, x, k), lerp(i ? 1.04 : 1.12, y, k)]) as [[number, number], [number, number]];
    const late = sm(f, PUSH - 12, PUSH - 2);
    gus(c, { mode: "air", legs, L: armMix(armMix(L0, FLOAT_L, still), { ...shove, h: [0.2, shove.h[1]] }, late), R: armMix(armMix(R0, FLOAT_R, still), shove, late),
      expr: f < NOTHING - 1 ? "pained" : f < PUSH - 6 ? "neutral" : "nervous", blink: lidAt(f, 1, [NOTHING - 1, PUSH - 6]), tilt: 14 * late }, add(G0, bob(f)), 0.1 * Math.sin(f * 0.3) * k);
  } else if (id === 5) {
    space(c);
    const speaking = f >= RADIO + 2 && f < 468, th = pulse(f, WIFETHROW + 2, 5, 10);
    const w = put(c, WIFE, { expr: speaking ? talk(f) : "neutral", blink: lidAt(f, 7), headTilt: 2,
      L: { h: [0.34, 0.08], bend: -0.4, front: true }, R: armMix({ h: [0.3, 0.3], bend: -0.3 }, { h: [0.72, -0.42], bend: -0.2 }, th) }, [WIN[0][0], WIN[0][1] - 1.5, -0.55], { noBlob: true, wide: true });
    fx(c, "handset", 140, 240, fxHandset, w.at(w.A.L, 0.03), 0.16, 0.27, { rot: 0.3 });
    const wv = sm(f, GONER - 4, GONER + 2);
    put(c, NEIGHBOR, { expr: f >= GONER - 2 ? "laugh" : "grin", blink: lidAt(f, 6, [GONER - 2]), headTilt: 3 * Math.sin(f * 0.2),
      L: HANG, R: armMix({ h: [0.3, 0.4], bend: -0.3 }, { h: [0.5 + 0.1 * Math.sin(f * 0.7), -0.38], bend: -0.25 }, wv) }, [WIN[1][0], WIN[1][1] - 1.43, -0.55], { noBlob: true, wide: true });
  } else if (id === 7 || id === 8 || id === 9 || id === 11) {
    space(c);
    const roll = rollAt(f), at = add(G0, bob(f)), st = seat(at, roll, 0.2), away: [number, number] = [Math.sin(roll), -Math.cos(roll)];
    if (id === 7) {
      const turn = sm(f, TURN, TURN + 20);
      gus(c, { ...floatPose(f), L: armMix(FLOAT_L, { h: [0.3, 0.55], bend: 0.3 }, turn), R: armMix(FLOAT_R, { h: [0.3, 0.55], bend: 0.3 }, turn),
        expr: f < FIRE - 8 ? "stern" : "pained", blink: lidAt(f, 1, [FIRE - 8]) }, at, roll);
      const t = f - FIRE; puffAt(c, [st[0] + away[0] * (0.35 + 0.02 * Math.max(0, t)), st[1] + away[1] * (0.35 + 0.02 * Math.max(0, t)), 0.1], 0.7 * pop(f, FIRE - 1, 8));
      
    } else if (id === 8) {
      const th = sm(f, THUMB - 6, THUMB);
      gus(c, { ...floatPose(f), L: { ...armMix({ h: [0.3, 0.55], bend: 0.3 }, { h: [0.62, 0.1], bend: -0.3 }, th), front: true, hand: th > 0.5 ? "thumb" : undefined }, R: { h: [0.3, 0.55], bend: 0.3 },
        expr: f < THUMB - 3 ? "pained" : "grin", blink: lidAt(f, 1, [THUMB - 3]) }, at, roll);
      for (let i = 0; i < 6; i++) { const u = (i + (f - 617) * 0.035) % 6, d = 0.4 + 0.5 * u; puffAt(c, [st[0] + away[0] * d, st[1] + away[1] * d, 0.1 - 0.01 * i], 0.62 * (1 - 0.1 * u) * Math.min(1, u * 3) * Math.min(1, (6 - u) * 2)); }
      const px = -away[1], py = away[0];
      arrow(c, [st[0] + away[0] * 1.05 - px * 0.62, st[1] + away[1] * 1.05 - py * 0.62, 0.15], 1.5, rotTo(away[0], away[1]), ARROWBACK);
    } else {
      const h = id === 9 ? sm(f, HERO, HERO + 7) : 1, hp = HERO_POSE(f);
      gus(c, { ...hp, R: armMix({ h: [0.3, 0.55], bend: 0.3 }, hp.R!, h), expr: "grin", blink: lidAt(f, 1) }, at, roll);
      puffAt(c, [st[0] + away[0] * 0.75, st[1] + away[1] * 0.75, 0.1], 0.36);
      if (id === 9) sparkle(c, [at[0] + D[0] * 1.5, at[1] + D[1] * 1.5, 0.2], MOVING, 16, 0.8);
      if (id === 11) {
        ruler(c, 1);
        const n = Math.floor(lin([[770, 0], [WK[0], 7], [WK[1], 14], [WK[2], 21], [836, 24]], f));
        fx(c, `cal${n}`, 600, 680, (p) => fxCalendar(p, n), [1.42, 1.55, 0.1], 1.62 * pop(f, 768), 1.84 * pop(f, 768));
      }
    }
  } else if (id === 10) {
    space(c);
    const t = q(clamp01((f - TICK1) / 25), 25), s = pop(f, LENS);
    fx(c, `lens${t}`, 800, 900, (p) => fxLens(p, t), [0.42, 1.0, 0.2], 2.5 * s, 2.81 * s);
    watch(c, [0.3, -1.35, 0.2], 1.05 * pop(f, LENS + 3), clamp01((f - TICK1) / 25));
  } else if (id === 12) {
    space(c);
    const at = add(G0, bob(f)), s = pop(f, ALARM), dn = sm(f, ALARM, ALARM + 6), gl = pulse(f, GULP + 2, 4, 8);
    const hold: Arm = { h: [0.24, 0.62], bend: 0.3, front: true };
    gus(c, { ...floatPose(f), L: armMix(FLOAT_L, hold, dn), R: armMix(FLOAT_R, hold, dn), expr: f < ALARM + 2 ? "smile" : "nervous", blink: lidAt(f, 1, [ALARM + 2]), headTilt: 0, squash: 0.25 * gl }, at, 0);
    const gp: V3 = [at[0], at[1] - 0.2, 0.12], w = 0.92 * s;
    fx(c, "dial8r", 420, 420, (p) => fxDial(p, "8", true), gp, w, w);
    fx(c, "needle", 420, 420, fxNeedle, add(gp, [0, 0, 0.02]), w, w, { rot: lerp(-1.3, 2.05, sm(f, ALARM + 2, 886)) + 0.04 * Math.sin(f * 0.9) });
    const on = Math.floor((f - ALARM) / 4) % 2 === 0;
    fx(c, `lamp${on}`, 120, 120, (p) => fxLamp(p, on), add(gp, [0.4 * s, 0.42 * s, 0.03]), 0.2 * s, 0.2 * s);
  } else if (id === 13) {
    space(c);
    const at = add(G0, bob(f)), back = sm(f, WEAK - 18, WEAK - 4), up = sm(f, ROCKETPASS, ROCKETPASS + 8) * (1 - back);
    const g = gus(c, { ...floatPose(f), expr: f < WEAK - 2 ? "wow" : "sad", blink: lidAt(f, 1, [WEAK - 2]), look: q(0.8 * up - 0.9 * back, 12), headTilt: -6 * up + 8 * back }, at, 0);
    question(c, add(g.at(g.A.top), [0.05, 0.22, 0]), Q1, 0.46);
    const t = f - ROCKETPASS;
    if (t >= 0 && t < 44) { const [rp, rs] = far(c, [0.55 + 0.004 * t, -1.3 + 0.115 * t, 0], -12), fl = 1 + (Math.floor(f / 2) % 2); fx(c, `rocket${fl}`, 300, 700, (p) => fxRocket(p, fl), rp, 0.75 * rs, 1.75 * rs, { rot: -0.06 }); }
    puffAt(c, [at[0] - 0.62, at[1] - 0.5, 0.1], 0.34 + 0.02 * Math.sin(f * 0.1));
  } else if (id === 20) {
    space(c);
    const t = Math.max(0, f - HURL), rec = 0.0035 * t, at: V3 = add(add(G0, bob(f)), [D[0] * rec, D[1] * rec, 0]);
    const bend = sm(f, 1472, SLIPOFF - 2) * (1 - sm(f, SLIPOFF + 3, WINDUP)), wind = sm(f, WINDUP - 2, WINDUP + 5), thr = sm(f, HURL - 3, HURL + 2);
    const grab: Arm = { h: [0.38, 1.18], bend: 0.1, front: true }, back: Arm = { h: [0.28, 0.2], bend: 0.45, front: true }, out: Arm = { h: [0.98, -0.5], bend: -0.05, front: true };
    const L = armMix(armMix(armMix(FLOAT_L, grab, bend), back, wind), out, thr);
    const g = gus(c, { mode: "air", legs: [[-0.34 - 0.06 * bend, 1.12 - 0.42 * bend], [0.4, 1.04]], L, R: FLOAT_R, tilt: -16 * bend + 10 * wind - 14 * thr,
      expr: f < SLIPOFF - 6 ? "stern" : f < HURL - 2 ? "lick" : "pained", blink: lidAt(f, 1, [SLIPOFF - 6, HURL - 2]) }, at, -0.12 * sm(f, HURL, HURL + 14));
    if (f >= SLIPOFF && f < HURL) fx(c, "slipper", 300, 170, fxSlipper, g.at(g.A.L, 0.07), 0.4 * pop(f, SLIPOFF, 5), 0.227 * pop(f, SLIPOFF, 5), { rot: 0.4 + 1.2 * wind });
    if (f >= HURL) fx(c, "slipper", 300, 170, fxSlipper, [G0[0] - 0.78 - 0.1 * t, G0[1] + 0.6 + 0.08 * t, 0.1], 0.4, 0.227, { rot: 1.6 + 0.3 * t });
    burst(c, [G0[0] - 0.8, G0[1] + 0.62, 0.08], HURL, 6, 0.9);
  } else if (id === 21) {
    const t = f - 1543, ang = Math.atan2(0.63, -0.78);
    for (let i = 0; i < 9; i++) {
      const u = (hash(i, 7) + t * 0.035 * (0.7 + 0.6 * hash(i, 8))) % 1, off = (hash(i, 9) - 0.5) * 4.4;
      const along = 4.5 - 9 * u; if (Math.abs(off) < 0.75) continue;
      fx(c, "streak", 400, 40, fxStreak, [Math.cos(ang) * -along - Math.sin(ang) * off, Math.sin(ang) * -along + Math.cos(ang) * off + 0.6, -0.3], 1.3, 0.13, { rot: ang });
    }
    fx(c, "slipper", 300, 170, fxSlipper, [-0.08 + 0.04 * Math.sin(t * 0.2), 0.8 + 0.05 * Math.sin(t * 0.13), 0], 1.2, 0.68, { rot: 0.5 + 0.3 * Math.sin(t * 0.14) + 0.02 * t });
    const s1 = pop(f, HALF), s2 = pop(f, TWENTY);
    if (s1 > 0.01) fx(c, "wHalf", 420, 400, (p) => fxWeight(p, "½"), [-0.38, -0.4, 0.1], 0.8 * s1, 0.762 * s1);
    if (s2 > 0.01) { fx(c, "dial20", 420, 420, (p) => fxDial(p, "20"), [0.3, -1.15, 0.1], 0.9 * s2, 0.9 * s2); fx(c, "needle", 420, 420, fxNeedle, [0.3, -1.15, 0.12], 0.9 * s2, 0.9 * s2, { rot: lerp(2.0, -0.9, sm(f, TWENTY, TWENTY + 9)) + 0.05 * Math.sin(f * 0.8) }); }
  } else if (id === 22 || id === 23) {
    const k = homeK(f), inside = f >= ENTER + 6, sc = lerp(1, 0.62, sm(f, ENTER - 34, ENTER + 4)), t = Math.max(0, f - (ENTER + 6));
    space(c, sm(f, HATCHSHUT - 14, HATCHSHUT));
    const at = gusHome(f), fold: Arm = { h: [0.02, 0.5], bend: 0.35, front: true };
    put(c, GUS_SUIT, { mode: "air", legs: [[-0.2, 1.2], [0.26, 1.16 + 0.03 * Math.sin(f * 0.1)]], L: fold, R: fold, expr: id === 22 && f < X6000 ? "grin" : "smile_closed", blink: lidAt(f, 1, [X6000]) },
      [at[0] + 0.035 * t, at[1], inside ? -0.55 : 0], { face: true, roll: lerp(-0.5, -0.15, k), wide: true, tall: true, noBlob: true, scale: sc });
    if (id === 22) {
      for (let i = 0; i < 5; i++) fx(c, "streak", 400, 40, fxStreak, [at[0] - D[0] * (1.5 + 0.3 * i) + (i - 2) * 0.22 * D[1], at[1] - D[1] * (1.5 + 0.3 * i) - (i - 2) * 0.22 * D[0], -0.05], 0.9, 0.09, { rot: Math.atan2(D[1], D[0]) + Math.PI });
      const s = pop(f, X6000 - 8), s2 = pop(f, X6000);
      if (s > 0.01) { fx(c, "slipper", 300, 170, fxSlipper, [-0.92, -1.2, 0.1], 0.72 * s, 0.408 * s, { rot: 0.2 }); fx(c, "eq", 200, 200, (p) => fxSign(p, 1), [-0.92, -1.75, 0.1], 0.32 * s, 0.32 * s); }
      if (s2 > 0.01) { puffAt(c, [-0.92, -2.3, 0.1], 0.56 * s2); fx(c, "x6000", 300, 200, (p) => fxNum(p, "×6000"), [-0.92, -2.98, 0.1], 1.08 * s2, 0.72 * s2); }
    } else {
      const s = pop(f, FIVE);
      watch(c, [1.75, 0.2, 0.1], 0.95 * s, 0.02 * Math.sin(f * 0.1));
      if (s > 0.01) fx(c, "num5", 300, 200, (p) => fxNum(p, "5"), [1.75, -0.62, 0.12], 0.62 * s, 0.41 * s);
    }
  } else if (id === 24) {
    fx(c, "wall", 800, 1000, fxWall, [0, 1.6, -1.3], 7.2, 9);
    put(c, WIFE, { expr: "neutral", blink: lidAt(f, 7), look: q(-0.7 * sm(f, UHOH, UHOH + 10), 12), R: HIP, L: HIP }, [0.6, 0, -0.4], { noBlob: true });
    const lvl = q(lin([[GREENF, 0], [UHOH, 0.35], [1888, 1]], f), 60);
    const g = put(c, GUS_SUIT, { expr: f < SEAL ? "relief" : f < UHOH - 2 ? "smile" : f < 1884 ? "nervous" : f < END - 2 ? "pained" : "dazed", blink: lidAt(f, 1, [SEAL, UHOH - 2, 1884, END - 2]),
      L: HANG, R: armMix(HANG, { h: [0.36, 0.12], bend: -0.3, front: true, hand: "thumb" }, sm(f, 1784, 1792) * (1 - sm(f, UHOH, UHOH + 8))) }, [0, 0, 0], { noBlob: true, wide: true });
    if (lvl > 0.005) fx(c, `haze${lvl}`, 400, 400, (p) => fxHaze(p, lvl), add(g.at(g.A.head, 0.04), [0, 0.01, 0]), 0.71, 0.71, { soft: true });
    sparkle(c, add(g.at(g.A.mouth, 0.06), [-0.2, -0.2, 0]), SEAL, 14, 0.3);
  }
};

// ---------------- the blueprint board ----------------
const board = (c: Ctx) => {
  const { id, f } = c;
  fx(c, "board", 800, 800, fxBoard, [0, 0, -2], 19.2, 19.2);
  if (id === 14) {
    const y = -0.2 + 0.012 * (f - 994), fl = 1 + (Math.floor(f / 2) % 2);
    for (let i = 0; i < 6; i++) { const u = (f * 0.045 + i / 6) % 1; fx(c, "lump", 120, 120, fxLump, [0.12 * Math.sin(i * 2.4), y - 1.75 - 2.4 * u, -0.05], 0.42 * (1 - 0.45 * u), 0.42 * (1 - 0.45 * u)); }
    fx(c, `rocket${fl}`, 300, 700, (p) => fxRocket(p, fl), [0, y, 0], 1.35, 3.15);
    arrow(c, [1.2, y + 0.5, 0.1], 1.5, Math.PI, UP, "#7fe3ff");
    arrow(c, [-1.2, y - 2.3, 0.1], 1.5, 0, DOWN, "#ff8a5c");
  } else if (id === 15) {
    const s0 = pop(f, MUCH - 2, 8), s1 = pop(f, TIMES), s2 = pop(f, FAST - 3);
    if (s0 > 0.01) fx(c, "weight", 420, 400, (p) => fxWeight(p), [0, 1.95, 0], 1.75 * s0, 1.67 * s0);
    if (s1 > 0.01) fx(c, "times", 200, 200, (p) => fxSign(p, 0), [0, 0.35, 0], 0.62 * s1, 0.62 * s1);
    if (s2 > 0.01) { fx(c, "dial", 420, 420, (p) => fxDial(p, ""), [0, -1.5, 0], 1.95 * s2, 1.95 * s2); fx(c, "needle", 420, 420, fxNeedle, [0, -1.5, 0.02], 1.95 * s2, 1.95 * s2, { rot: lerp(2.1, -2.0, sm(f, FAST, FAST + 12)) + 0.05 * Math.sin(f * 0.8) }); }
  } else if (id === 18) {
    const text = f < READ ? "" : "0.1";
    fx(c, `kscale${text}`, 520, 440, (p) => fxKScale(p, text), [0, 1.75, 0], 2.3, 1.95);
    puffAt(c, [0, 2.72, 0.05], 0.8 * pop(f, PUFFSCALE - 2, 8));
    fx(c, "ruler", 1300, 220, fxRuler, [0, -1.0, 0], 3.4, 0.575);
    const u = clamp01((f - ONESEC) / 30);
    puffAt(c, [lerp(-1.465, 1.465, u), -0.42, 0.05], 0.5 * pop(f, ONESEC - 5));
    watch(c, [0, -2.45, 0], 0.95, u);
  } else if (id === 19) {
    const text = f < DIAL ? "0" : f < LBS - 2 ? "" : "460", drop = Math.max(0, STEP - f) * 0.13, sq = pulse(f, STEP + 2, 2, 6), sh = sm(f, LBS, LBS + 8);
    fx(c, `bscale${text}`, 760, 300, (p) => fxBScale(p, text), [0, -1.5 - 0.03 * sq, -0.05], 1.75, 0.69);
    const up: Arm = { h: [0.62, 0.3], bend: -0.3 };
    put(c, GUS_SUIT, { expr: f < LBS - 2 ? "smile" : "nervous", blink: lidAt(f, 1, [LBS - 2]), squash: 0.3 * sq, L: armMix(HANG, up, sh), R: armMix(HANG, up, sh), look: q(-0.0 * sh, 4) }, [0, -1.3 + drop - 0.03 * sq, 0], { noBlob: true, wide: true });
  }
};

// ---------------- the garden and the road ----------------
const garden = (c: Ctx) => {
  const { f } = c, up = sm(f, BEANS - 5, BEANS + 1), chewing = f >= CHOMP - 1;
  const g = put(c, GUS, { expr: chewing ? "chew" : "smile", chew: chewing ? ((f - CHOMP) / 9) % 1 : 0, blink: lidAt(f, 1, [CHOMP - 1]), headTilt: 2 * Math.sin(f * 0.15),
    R: { ...armMix(HANG, { h: [0.52, -0.02], bend: -0.2 }, up), front: true }, L: armMix(HANG, { h: [0.12, 0.62], bend: 0.35, front: true }, up) }, BEAN_AT, { wide: true });
  fx(c, "canFull", 220, 300, (p) => fxCan(p, true), add(g.at(g.A.R, 0.07), [0, 0.1, 0]), 0.27, 0.37);
  for (const [x, y] of [[-0.8, 0.17], [-0.56, 0.17], [-0.68, 0.47]] as const) fx(c, "can", 220, 300, (p) => fxCan(p), [x, y, 0.35], 0.25, 0.34);
};
const street = (c: Ctx) => {
  const { id, f } = c, x = SKATE0[0] + rollX(f), t = f - THROW, hop = pulse(f, BOARD + 1, 6, 10);
  cloud(c, [-9, 13, -60], 26, 1); cloud(c, [16, 17, -70], 30, 2); cloud(c, [3, 9, -50], 14, 3);
  fx(c, "skate", 520, 150, fxSkate, [x, 0.145, 0.03], 1.05, 0.303);
  const hug: Arm = { h: [0.08, 0.5], bend: 0.35, front: true }, flung: Arm = { h: [0.95, -0.05], bend: -0.05, front: true }, bal: Arm = { h: [0.8, 0.12 + 0.06 * Math.sin(f * 0.4)], bend: -0.1 };
  const thr = sm(f, THROW - 3, THROW + 2), rel = sm(f, THROW + 10, THROW + 22);
  const g = put(c, GUS, { expr: f < THROW - 6 ? "smile" : f < THROW + 6 ? "pained" : "wow", blink: lidAt(f, 1, [THROW - 6, THROW + 6]), squash: 0.12 * hop, tilt: -8 * thr * (1 - rel) + 5 * rel,
    L: armMix(armMix(hug, flung, thr), bal, rel), R: armMix(hug, { ...bal, h: [0.8, 0.12 - 0.06 * Math.sin(f * 0.4)] }, rel) }, [x, 0.21, 0], { wide: true });
  const py = t < 0 ? 0 : Math.max(0.36, 1.05 + 0.058 * t - 0.0052 * t * t), landed = t >= PACKLAND - THROW;
  const pk: V3 = t < 0 ? add(g.at(g.A.head, 0.08), [0, -0.52, 0]) : [SKATE0[0] - 0.3 - 0.105 * Math.min(t, PACKLAND - THROW) - (landed ? 0.2 * (1 - Math.exp(-(t - (PACKLAND - THROW)) / 6)) : 0), py, 0.1];
  fx(c, "pack", 320, 360, fxPack, pk, 0.66, 0.74, { rot: t < 0 ? 0 : landed ? 0.5 : 0.04 * t });
  if (id === 17) for (let i = 0; i < 3; i++) fx(c, "streak", 400, 40, fxStreak, [x - 0.9 - 0.25 * i, 0.5 + 0.45 * i, -0.1], 0.7, 0.07, { rot: Math.PI });
  if (f >= ROLL) void 0;
};

/** called once per frame and canvas; c.shot is the current shot */
export const stage = (c: Ctx) => {
  const place = T.shots[c.id - 1].place;
  if (place === "board") board(c);
  else if (place === "garden") garden(c);
  else if (place === "street") street(c);
  else spaceShots(c);
};
export { KICK, AIM, RED };
