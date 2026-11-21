// Staging of "What If Lightning Hit Your Plane?": who stands where in which pose, and every 2D card, for all 21
// shots. stage(c) is a pure function of the shot and the frame; the timing comes from story.ts, the drawings from
// props.ts (and the airliner card from plane-door-midflight).
import {
  Ctx, V3, Pose, Arm, PutOpt, put, where, reach, fx, armMix, sm, lidAt, q, HANG, clamp01, lerp, add, toon, P2,
  GUS, WIFE, NEIGHBOR, sparkle, question, burst, arrow, sleepBubble, soot, popIn, hash,
} from "../../toon/kit";
import { fxPlane } from "../plane-door-midflight/props";
import {
  STRIKE, SUNPOP, SWEAT, HIT, WAKE, GRUMP, STORM, BANG, SCREAM, HANDS, X2000, FUSE, FINE, WHERE,
  SPARK, LAZY, SLIDE, SLIDE_END, METAL, SHINE, LENS, DIME, LAND, RUN, JUMP, UMBRELLA, RUNS, RUNS2, DRY, PUSH, SOCKET, SOCKET2,
  HITS, YEAR, TEN, NINE, SETOFF, SAFE, UNLUCKY, DRYAIR, SLIPPERS, SHUFFLE, REACH, ZAP, K3000, SMOKE, KNOB, ZAP2,
  WALL_Z, LAV_X, GUS_D, GUS_L, LAV_KNOB, seatAt, noseOf, tailOf, W1, W11, W13, PLANE3, PLANE15, METER, NEEDLE_SOCKET, needleDeg, GUS12, veilAt,
} from "./story";
import { fxBolt, fxBoltIcon, fxSkinGlow, fxSun, fxStorm, fxTag, fxFuse, fxHouse, fxSparky, fxRoads, fxLens, fxMeter, fxNeedle, fxSocket, fxCalendar, fxUmbrella, fxStream, fxRain, fxNoDrop, fxPlus, fxArc, fxVeil } from "./props";

const HHm = 221.8 * 0.00216;                      // one head height in metres
const NIGHT = 0.85;                               // gain of unlit cards on the night sky
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
const LAP: Arm = { h: [0.2, 0.62], bend: 0.2 };
const UP_L: Arm = { h: [0.38, -1.4], bend: -0.05 }, UP_R: Arm = { h: [0.38, -1.4], bend: -0.05 };

// ---------------- cards shared by the sky shots ----------------
const planeCard = (c: Ctx, pos: V3, w: number, gain = NIGHT) => fx(c, "plane|side", 1400, 560, (p) => fxPlane(p, false, false, false), pos, w, w * 0.4, { gain });
/** a bolt whose tip sits on `tip`: it comes down from the upper right (down = false) or leaves toward the lower left */
const bolt = (c: Ctx, tip: V3, h: number, down = false, grow = 1, gain = 1.15, right = false) => {
  const hh = h * Math.max(0.05, grow), w = hh / 3, s = down ? -1 : 1;
  fx(c, right ? "boltM" : "bolt", 300, 900, (p) => { if (right) { p.g.translate(300, 0); p.g.scale(-1, 1); } fxBolt(p); }, [tip[0] + (right ? -s : s) * 0.4 * w, tip[1] + s * 0.485 * hh, tip[2] + 0.05], w, hh, { rot: down ? Math.PI : 0, gain: gain * (1 + 0.2 * Math.sin(c.f * 2.7)) });
};
const storm = (c: Ctx, pos: V3, w: number, seed: number, lit = false, signs = false) =>
  fx(c, `storm${seed}|${lit ? 1 : 0}${signs ? 1 : 0}`, 900, 500, (p) => fxStorm(p, seed, lit, signs), pos, w, (w * 5) / 9, { gain: lit ? 1.2 : NIGHT });
/** dark clouds drifting to screen left behind everything (the plane flies right); kept at the top and bottom */
const clouds = (c: Ctx, speed = 0.05, n = 5) => {
  for (let i = 0; i < n; i++) {
    const x0 = -12 + i * (24 / n) + 3 * hash(i, 61), x = ((((x0 - speed * c.f) % 24) + 24) % 24) - 12;
    storm(c, [x, (i % 2 ? 7.6 : -7.4) + 1.6 * hash(i, 62), -3 - i], 6.5 + 3 * hash(i, 63), 10 + i);
  }
};
const veil = (c: Ctx) => {
  const a = q(veilAt(c.f), 100);
  if (a > 0.004) fx(c, `veil${a}`, 16, 16, (p) => fxVeil(p, a), [c.cam.pos.x + c.cam.fwd.x * 1.2, c.cam.pos.y + c.cam.fwd.y * 1.2, c.cam.pos.z + c.cam.fwd.z * 1.2], 3, 3, { soft: true });
};

// ---------------- the sky ----------------
const skyStage = (c: Ctx) => {
  const { id, f } = c, bob = 0.06 * Math.sin(f * 0.07);
  if (id === 1) {
    // HOOK: the bolt on the nose, the worried sun
    clouds(c, 0.09);
    planeCard(c, [-1.1, bob, 0], W1, 0.95);
    const nose = add(noseOf(W1), [-1.1, bob, 0]);
    bolt(c, nose, 9.4, false, clamp01((f + 2) / 3), 1.15);
    for (const f0 of [STRIKE - 1, 20, 42, 66]) burst(c, [nose[0], nose[1], 0.2], f0, 8, 2.6);
    const s = pop(f, SUNPOP);
    if (s > 0) fx(c, `sun${f >= SWEAT ? 1 : 0}`, 400, 400, (p) => fxSun(p, f >= SWEAT), [-1.9, 4.4 + 0.08 * Math.sin(f * 0.3), 0.1], 2.8 * s, 2.8 * s, { rot: 0.05 * Math.sin(f * 0.2) });
  } else if (id === 3) {
    // wide: the plane slides into the storm cloud
    const lit = f >= STORM && f < STORM + 10;
    storm(c, [-6.5, 6.5, -4], 6, 21); storm(c, [-3.5, -6.5, -4], 7, 22);
    planeCard(c, PLANE3(f), 4.2);
    storm(c, [4.7, 0.9, 0.3], 9.6, 2, lit);
    storm(c, [3.4, 5.6, 0.2], 6.4, 5, lit); storm(c, [4.4, -3.6, 0.25], 7.2, 6, false);
  } else if (id === 7) {
    // the bolt against the kitchen fuse
    bolt(c, [-3.0, -0.4, 0], 8.6, false, clamp01((f - 435) / 4), 1.15);
    const s = pop(f, X2000);
    if (s > 0) fx(c, "tag|x2000", 520, 220, (p) => fxTag(p, "× 2,000"), [2.3, 3.2, 0.1], 4.2 * s, 1.78 * s, { rot: -0.05 });
    const blown = f >= FUSE, jig = blown ? 0.05 * Math.sin((f - FUSE) * 1.9) * Math.exp(-(f - FUSE) / 5) : 0;
    fx(c, `house${blown ? 0 : 1}`, 400, 400, (p) => fxHouse(p, !blown), [-2.9, -4.4, 0], 3.3, 3.3, { gain: blown ? 0.8 : 1 });
    fx(c, `fuse${blown ? 1 : 0}`, 600, 260, (p) => fxFuse(p, blown), [1.7 + jig, -4.8, 0.1], 5.0, 2.17);
    burst(c, [1.7, -4.8, 0.3], FUSE, 7, 3.6);
    if (blown) soot(c, [1.7, -3.9, 0.2], FUSE + 3, 1.5);
  } else if (id === 9) {
    // electricity is lazy: the rocky climb or the metal slide
    const X0 = -0.6, Y0 = -1.2, PX = 107, W = (px: number, py: number, z = 0.1): V3 => [X0 + (px - 450) / PX, Y0 - (py - 600) / PX, z];
    fx(c, "roads", 900, 1200, fxRoads, [X0, Y0, 0], 8.41, 11.21);
    const path: P2[] = toon.curve([440, 474], [640, 880], [860, 1076], 30);
    const u = sm(f, SLIDE, SLIDE_END), i = Math.min(29, Math.floor(u * 30)), t = u * 30 - i;
    const on: V3 = u <= 0 ? W(384, 468) : W(lerp(path[i][0], path[i + 1][0], t), lerp(path[i][1], path[i + 1][1], t) - 8);
    const mood = f >= SLIDE - 6 ? 2 : f >= LAZY ? 1 : 0, s = pop(f, SPARK), yawn = mood === 1 ? 0.06 * Math.sin((f - LAZY) * 0.25) : 0;
    const peek = pulse(f, LAZY - 14, 8, 8);                                  // he looks up the rocky road first: no, thanks
    if (s > 0) fx(c, `sparky${mood}`, 320, 420, (p) => fxSparky(p, mood), [on[0] + 0.42 - 0.12 * peek, on[1] + 1.5 * s + yawn, 0.2], 2.4 * s, 3.15 * s * (1 + yawn * 0.5), { rot: 0.12 * peek - 0.5 * Math.sin(Math.PI * u) * (u > 0 && u < 1 ? 1 : 0), gain: 1.15 });
    if (f >= LAZY - 14 && f < SLIDE - 4) question(c, W(200, 20, 0.2), LAZY - 14, 1.6);
    sparkle(c, W(600, 800, 0.3), METAL, 16, 2.2); sparkle(c, W(740, 960, 0.3), METAL + 5, 14, 1.5);
  } else if (id === 10) {
    // the skin, no thicker than a dime
    clouds(c, 0.03, 3);
    planeCard(c, [0, 2.6 + bob, 0], 9, 0.95);
    for (let i = 0; i < 4; i++) sparkle(c, [3 - i * 1.9, 3.5 + bob, 0.2], SHINE + i * 5, 14, 1.3);
    const s = pop(f, LENS), coin = f >= DIME;
    if (s > 0) fx(c, `lens${coin ? 1 : 0}`, 760, 860, (p) => fxLens(p, coin), [0.3, -4.3, 0.3], 6.6 * s, 7.47 * s);
    sparkle(c, [1.0, -3.2, 0.5], DIME, 14, 1.5);
  } else if (id === 11) {
    // lands on the nose, runs along the outside, jumps off the tail
    clouds(c, 0.06);
    const at: V3 = [0, 0.6 + bob, 0];
    planeCard(c, at, W11, 0.9);
    const nose = add(noseOf(W11), at), tail = add(tailOf(W11), at);
    if (f >= LAND - 1 && f < RUN + 12) bolt(c, nose, 8.2, false, clamp01((f - LAND + 2) / 3) * (1 - sm(f, RUN + 4, RUN + 12)));
    burst(c, [nose[0], nose[1], 0.3], LAND, 8, 2.6);
    const u1 = q(sm(f, RUN - 6, RUN + 34), 30), u0 = q(sm(f, RUN + 22, JUMP + 14), 30);
    if (f >= RUN - 6 && u1 - u0 > 0.01) fx(c, `glow${u0}|${u1}`, 1400, 560, (p) => fxSkinGlow(p, u0, u1), [at[0], at[1], 0.1], W11, W11 * 0.4, { gain: 1.5 });
    if (f >= JUMP - 1 && f < JUMP + 26) bolt(c, tail, 6.4, true, clamp01((f - JUMP + 2) / 3) * (1 - sm(f, JUMP + 16, JUMP + 26)), 1.15, true);
    burst(c, [tail[0], tail[1], 0.3], JUMP, 8, 2.4);
  } else if (id === 13) {
    // a few volts from nose to tail; the wall socket is far up the scale
    const at: V3 = [0, 3.6 + bob, 0];
    planeCard(c, at, W13, 0.9);
    fx(c, "glow0|1", 1400, 560, (p) => fxSkinGlow(p, 0, 1), [at[0], at[1], 0.1], W13, W13 * 0.4, { gain: 1.25 + 0.2 * Math.sin(f * 0.5) });
    const k = clamp01((f - PUSH) / 30);
    if (f >= PUSH && k < 1) arrow(c, [lerp(3.0, -3.0, k), at[1] + 2.3, 0.2], 1.5, -Math.PI / 2, PUSH, "#ffe95c");
    fx(c, "meter", 960, 660, fxMeter, METER, 6.4, 4.4);
    const piv: V3 = [METER[0], METER[1] - (560 - 330) / 150, 0.1];
    fx(c, "needle", 900, 900, fxNeedle, [piv[0], piv[1], 0.9], 6, 6, { rot: (-needleDeg(f) * Math.PI) / 180 });
    const s = pop(f, SOCKET), a = (NEEDLE_SOCKET * Math.PI) / 180, blink = f >= SOCKET2 && f < SOCKET2 + 16 && Math.floor((f - SOCKET2) / 4) % 2 === 0;
    if (s > 0) fx(c, `socket${blink ? 1 : 0}`, 300, 380, (p) => fxSocket(p, blink), [piv[0] + 3.55 * Math.sin(a), piv[1] + 3.55 * Math.cos(a) + 0.3, 0.6], 1.7 * s, 2.15 * s, { rot: -0.12 });
  } else if (id === 14) {
    // every airliner, about once a year
    clouds(c, 0.04, 4);
    const P: V3[] = [[-1.5, 5.6, 0], [-0.6, 0.6, 0], [-1.4, -4.4, 0]];
    P.forEach((p0, i) => {
      const at: V3 = [p0[0] + 0.006 * (f - 1306), p0[1] + 0.06 * Math.sin(f * 0.07 + i * 2), 0], f0 = HITS[i], w = 5.4;
      planeCard(c, at, w, NIGHT + 0.5 * pulse(f, f0 + 1, 2, 6));
      const nose = add(noseOf(w), at);
      if (f >= f0 - 1 && f < f0 + 10) bolt(c, nose, 4.6, false, clamp01((f - f0 + 2) / 3) * (1 - sm(f, f0 + 5, f0 + 10)));
      burst(c, [nose[0], nose[1], 0.3], f0, 7, 2.0);
    });
    const s = pop(f, YEAR);
    if (s > 0) fx(c, "calendar", 440, 480, fxCalendar, [3.1, -2.0, 0.2], 2.9 * s, 3.16 * s, { rot: 0.06 });
  } else if (id === 15) {
    // nine times out of ten the plane sets it off
    for (let i = 0; i < 10; i++) {
      const s = pop(f, TEN + i, 5), on = i < 9 && f >= NINE + i;
      if (s > 0) fx(c, `icon${on ? 1 : 0}`, 200, 300, (p) => fxBoltIcon(p, on), [-4.05 + 0.9 * i, -7.5, 0.1], 0.66 * s, 0.99 * s, { gain: on ? 1.3 : 0.8 });
    }
    const at = PLANE15(f), w = 5.0, go = f >= SETOFF - 1 && f < SETOFF + 24, lit = f >= SETOFF && f < SETOFF + 18;
    storm(c, [-4.6, 7.4, -3], 6, 31);
    planeCard(c, at, w, NIGHT + (go ? 0.3 : 0));
    storm(c, [3.9, 2.0, 0.3], 6.8, 7, lit, true);
    if (go) {
      const g = clamp01((f - SETOFF + 2) / 3) * (1 - sm(f, SETOFF + 15, SETOFF + 24));
      bolt(c, [at[0] + 0.3, at[1] + 0.5, 0.35], 5.6, false, g); bolt(c, [at[0] - 0.9, at[1] - 0.55, 0.35], 5.2, true, g);
    }
    burst(c, [at[0] - 0.2, at[1], 0.4], SETOFF, 8, 2.6);
  }
};

// ---------------- the cabin ----------------
const cabin = (c: Ctx) => {
  const { id, f } = c;
  const row = (wife: Pose, neighbor: Pose, gus: Pose, bubble: boolean) => {
    const n = put(c, NEIGHBOR, { mode: "chair", L: LAP, R: LAP, ...neighbor }, seatAt(0), { noBlob: true, wide: true, tall: true });
    const w = put(c, WIFE, { mode: "chair", L: LAP, R: LAP, ...wife }, add(seatAt(1), [-0.04, 0, 0]), { noBlob: true, wide: true, tall: true });
    const g = put(c, GUS, { mode: "chair", L: LAP, R: LAP, ...gus }, add(seatAt(2), [-0.08, 0, 0]), { noBlob: true, wide: true, tall: true });
    if (bubble) { const head = g.at(g.A.head, 0.05); sleepBubble(c, [head[0], head[1] - 0.1, head[2] + 0.36], 0.3); }
    return { n, w, g };
  };
  const asleep: Pose = { expr: "asleep", headTilt: 11 + 1.5 * Math.sin(f * 0.07), tilt: 3 };
  if (id === 2) {
    // the hook from inside: everybody jumps, Gus sleeps on, then wakes up grumpy
    const up = sm(f, HIT - 2, HIT + 5), awake = f >= WAKE, st = sm(f, WAKE, WAKE + 9);
    const r = row(
      { expr: f >= HIT ? "shock" : "neutral", blink: lidAt(f, 7, [HIT]), headTilt: -4 * up, tilt: 0.6 * Math.sin(f * 1.7) * up, L: armMix(LAP, { h: [0.3, -1.3], bend: -0.05 }, up), R: armMix(LAP, { h: [0.4, -1.3], bend: -0.05 }, up) },
      { expr: f >= HIT ? "jawdrop" : "smile", blink: lidAt(f, 6, [HIT]), headTilt: 3 * up, L: armMix(LAP, UP_L, up), R: armMix(LAP, UP_R, up) },
      awake ? { expr: f >= GRUMP ? "stern" : "nervous", blink: lidAt(f, 2, [WAKE, GRUMP]), headTilt: lerp(11, -2, st), tilt: lerp(3, 0, st), look: q(-0.8 * sm(f, GRUMP, GRUMP + 8), 20) } : asleep, !awake);
    const head = r.g.at(r.g.A.head, 0.05);
    burst(c, [head[0], head[1] - 0.1, head[2] + 0.4], WAKE, 6, 0.6, "#d8eeff");
    veil(c);
  } else if (id >= 4 && id <= 6) {
    // nine at night: calm; BANG; a white flash; she screams; he throws both hands up
    const jolt = sm(f, BANG - 1, BANG + 4), scr = sm(f, SCREAM - 4, SCREAM + 2), hu = sm(f, HANDS - 5, HANDS + 2);
    row(
      { expr: f >= SCREAM - 2 ? "shock" : f >= BANG ? "wow" : "neutral", blink: lidAt(f, 7, [BANG, SCREAM - 2]), headTilt: 2 - 6 * scr, tilt: 0.7 * Math.sin(f * 1.7) * scr, look: q(-0.6 * jolt, 20),
        L: armMix(LAP, { h: [0.3, -1.3], bend: -0.05 }, scr), R: armMix(LAP, { h: [0.4, -1.3], bend: -0.05 }, scr) },
      { expr: f >= HANDS - 2 ? "jawdrop" : f >= BANG ? "shock" : "smile", blink: lidAt(f, 6, [BANG, HANDS - 2]), look: q(-0.9 * (1 - hu), 20), headTilt: -3 * hu, tilt: -2 * jolt * (1 - hu),
        L: armMix(LAP, UP_L, hu), R: armMix(LAP, UP_R, hu) },
      asleep, true);
    veil(c);
  } else if (id === 8) {
    // nobody is hurt: where did it all go?
    const pat = 0.5 + 0.5 * Math.sin(f * 0.5);
    const r = row(
      { expr: f >= FINE ? "relief" : "nervous", blink: lidAt(f, 7, [FINE]), headTilt: 3, L: { h: [0.05, 0.25 + 0.08 * pat], bend: 0.3, front: true }, R: { h: [0.05, 0.3 - 0.08 * pat], bend: 0.3, front: true } },
      { expr: "wow", blink: lidAt(f, 6), headTilt: 8, look: 0, L: { h: [0.42, 0.25], bend: -0.2, front: true }, R: { h: [0.42, 0.25], bend: -0.2, front: true } },
      { expr: f >= WHERE - 2 ? "wow" : "stern", blink: lidAt(f, 2, [WHERE - 2]), headTilt: lerp(0, -5, sm(f, WHERE - 4, WHERE + 4)) }, false);
    const wh = r.w.at(r.w.A.head, 0.06), nh = r.n.at(r.n.A.head, 0.06);
    sparkle(c, [wh[0], wh[1] + 0.3, wh[2] + 0.2], FINE, 14, 0.3); sparkle(c, [nh[0], nh[1] + 0.3, nh[2] - 0.2], FINE + 5, 14, 0.3);
    question(c, [wh[0] - 0.3, wh[1] + 0.75, wh[2] + 0.1], WHERE, 0.55);
  } else if (id === 16 || id === 17) {
    // luckily the lightning can't get to him; unluckily ...
    const un = f >= UNLUCKY, k = sm(f, UNLUCKY, UNLUCKY + 14), hop = un ? Math.abs(Math.sin((f - UNLUCKY) * 0.5)) : 0, sway = un ? Math.sin((f - UNLUCKY) * 0.5) : 0;
    const back: Arm = { h: [0.3, -0.64], bend: -0.42 }, press: Arm = { h: [0.03, 0.98], bend: 0.28, front: true };
    const g = put(c, GUS, { expr: un ? "nervous" : "smile_closed", blink: un ? lidAt(f, 1, [UNLUCKY]) : 0, tilt: lerp(-3, 0, k) + 4 * sway * k, headTilt: lerp(-5, 0, k) - 3 * sway * k, squash: 0.22 * k,
      L: { ...armMix(back, press, k), front: k > 0.5 }, R: { ...armMix(back, press, k), front: k > 0.5 } }, [GUS_D[0], 0.05 * hop * k, GUS_D[2]], { wide: true, tall: true });
    const h = g.at(g.A.head, 0.06);
    sparkle(c, [h[0] + 0.24, h[1] + 0.26, h[2] + 0.1], SAFE, 14, 0.34);
    const s = pop(f, DRYAIR);
    if (s > 0) fx(c, "nodrop", 320, 320, fxNoDrop, [h[0] - 0.3, h[1] + 0.56 + 0.01 * Math.sin(f * 0.2), h[2]], 0.36 * s, 0.36 * s);
  } else if (id === 18) {
    // slippers on carpet
    const x = lerp(-0.3, -0.62, clamp01((f - 1647) / 73)), step = Math.sin((f - 1647) * 0.36);
    put(c, GUS, { facing: -1, look: -1, tilt: 3 * step, squash: 0.1 }, [x, 0.012 * Math.abs(step), GUS_D[2]], { wide: true });
    for (let i = 0; i < 9; i++) { const f0 = 1650 + i * 8, side = i % 2 ? 0.13 : -0.1; sparkle(c, [lerp(-0.3, -0.62, (f0 - 1647) / 73) + side, 0.07, GUS_D[2] + 0.12], f0, 8, 0.2); }
    sparkle(c, [x - 0.08, 0.16, GUS_D[2] + 0.15], SLIPPERS, 14, 0.2);
  } else if (id === 19) {
    // he shuffles to the lavatory door and reaches for the knob
    const wk = sm(f, SHUFFLE, SHUFFLE + 36), x = lerp(GUS_D[0], GUS_L[0], wk), walking = wk > 0.01 && wk < 0.99;
    const pos: V3 = [x, walking ? 0.03 * Math.abs(Math.sin(f * 0.5)) : 0, GUS_L[2]];
    const base: Pose = { expr: f >= REACH - 2 ? "grin" : "nervous", facing: -1, look: -1, blink: lidAt(f, 1, [REACH - 2]), tilt: walking ? 3 * Math.sin(f * 0.5) : 0, squash: 0.18 };
    const k = sm(f, REACH, REACH + 16);
    const press: Arm = { h: [0.03, 0.98], bend: 0.28, front: true };
    const L = k > 0.01 ? armMix(press, grab(c, pos, base, "L", add(LAV_KNOB, [0.13, 0.0, 0.02]), { bend: -0.1, front: true }), k) : press;
    const g = put(c, GUS, { ...base, L: { ...L, front: true, hand: k > 0.5 ? "point" : undefined }, R: press }, pos, { wide: true });
    charge(c, g.at(g.A.head, 0.08), SHUFFLE + 4, 1e9);
    for (let i = 0; i < 5; i++) { const f0 = SHUFFLE + 2 + i * 7; sparkle(c, [lerp(GUS_D[0], GUS_L[0], sm(f0, SHUFFLE, SHUFFLE + 36)) + (i % 2 ? 0.12 : -0.1), 0.07, GUS_L[2] + 0.12], f0, 8, 0.22); }
  } else if (id === 20) {
    // ZAP
    const hot = pulse(f, ZAP, 1, 16), back = sm(f, ZAP + 14, ZAP + 24);
    const pos: V3 = [GUS_L[0] + 0.03 * Math.sin(f * 2.4) * hot + 0.1 * back, 0, GUS_L[2]];
    const base: Pose = { expr: f < ZAP + 26 ? "shock" : "pained", facing: -1, look: -1, blink: lidAt(f, 1, [ZAP + 26]), tilt: 5 * hot + 2 * Math.sin(f * 2.4) * hot, headTilt: -4 * hot };
    const at = grab(c, pos, base, "L", add(LAV_KNOB, [0.13, 0.0, 0.02]), { bend: -0.1, front: true }, { wide: true, tall: true });
    const g = put(c, GUS, { ...base, L: { ...armMix(at, { h: [0.45, -0.25], bend: -0.3 }, back), front: true, hand: back < 0.5 ? "point" : undefined }, R: armMix({ h: [0.03, 0.98], bend: 0.28, front: true }, { h: [0.7, -0.3], bend: -0.2 }, sm(f, ZAP - 1, ZAP + 3)) }, pos, { wide: true, tall: true });
    const hand = g.at(g.A.L, 0.06), kn: V3 = [LAV_KNOB[0], LAV_KNOB[1], LAV_KNOB[2] + 0.06];
    if (f >= ZAP - 1 && f < ZAP + 13) {
      const seed = Math.floor(f / 2), mid: V3 = [(hand[0] + kn[0]) / 2, (hand[1] + kn[1]) / 2, kn[2] + 0.05], len = Math.max(0.16, Math.hypot(hand[0] - kn[0], hand[1] - kn[1]) + 0.1);
      fx(c, `arc${seed % 5}`, 400, 200, (p) => fxArc(p, seed % 5), mid, len, len / 2, { gain: 1.5 });
    }
    burst(c, [kn[0] + 0.07, kn[1], kn[2] + 0.1], ZAP, 8, 0.9, "#cfeaff");
    charge(c, g.at(g.A.head, 0.08), -1e9, ZAP);
    const s = pop(f, K3000);
    if (s > 0) fx(c, "tag|3000", 520, 220, (p) => fxTag(p, "3,000", true), [LAV_X + 0.25, 1.74, WALL_Z + 0.3], 0.62 * s, 0.262 * s, { rot: 0.05 });
  } else if (id === 21) {
    // the lightning never touched him. The doorknob did.
    const z2 = f >= ZAP2 - 1, hopk = pulse(f, ZAP2 + 2, 3, 9);
    const pos: V3 = [GUS_L[0] + 0.1 + 0.08 * sm(f, ZAP2, ZAP2 + 6), 0.07 * hopk, GUS_L[2]];
    const g = put(c, GUS, { expr: z2 ? "shock" : "stern", facing: -1, look: -1, blink: lidAt(f, 1, [ZAP2 - 1]), tilt: 2 + 4 * hopk, headTilt: lerp(6, 0, sm(f, KNOB - 8, KNOB)),
      L: { h: [0.45, -0.25], bend: -0.3, front: true, hand: "point" }, R: armMix(HANG, { h: [0.7, -0.3], bend: -0.2 }, sm(f, ZAP2 - 1, ZAP2 + 3)) }, pos, { wide: true, tall: true });
    const hand = g.at(g.A.L, 0.06), kn: V3 = [LAV_KNOB[0], LAV_KNOB[1], LAV_KNOB[2] + 0.06];
    if (f < ZAP2) soot(c, [hand[0] - 0.03, hand[1] + 0.1, hand[2]], SMOKE, 0.2);
    sparkle(c, [kn[0], kn[1] + 0.02, kn[2] + 0.06], KNOB, 16, 0.3);
    if (f >= ZAP2 - 1 && f < ZAP2 + 7) { const seed = Math.floor(f / 2); fx(c, `arc${seed % 5}`, 400, 200, (p) => fxArc(p, seed % 5), [kn[0] + 0.17, kn[1] + 0.02, kn[2] + 0.05], 0.3, 0.15, { gain: 1.5 }); }
    burst(c, [kn[0] + 0.05, kn[1], kn[2] + 0.1], ZAP2, 6, 0.5, "#cfeaff");
  }
};
/** plus signs clinging to a charged Gus: they pop in one by one from f0 and are gone at f1 */
const charge = (c: Ctx, head: V3, f0: number, f1: number) => {
  if (c.f >= f1) return;
  const spots: [number, number][] = [[-0.42, 0.3], [0.44, 0.1], [-0.38, -0.5], [0.4, -0.75], [0.05, 0.48]];
  spots.forEach(([dx, dy], i) => { const s = f0 < 0 ? 1 : pop(c.f, f0 + i * 7, 5); if (s > 0) fx(c, "plus", 120, 120, fxPlus, [head[0] + dx + 0.015 * Math.sin(c.f * 0.4 + i), head[1] + dy + 0.015 * Math.cos(c.f * 0.33 + i * 2), head[2] + 0.02], 0.13 * s, 0.13 * s); });
};

// ---------------- the garden: under the umbrella ----------------
const garden = (c: Ctx) => {
  const { f } = c;
  const open = f >= UMBRELLA, s = open ? popIn(f, UMBRELLA, 6) : 1, dry = sm(f, DRY - 6, DRY);
  const g = put(c, GUS, { expr: f >= DRY - 2 ? "grin" : open ? "smile" : "nervous", blink: lidAt(f, 1, [UMBRELLA, DRY - 2]), look: q(0.6 * (1 - sm(f, UMBRELLA + 20, UMBRELLA + 30)), 20), headTilt: open ? 0 : 5,
    R: { h: [0.45, 0.2], bend: -0.25, front: true }, L: { ...armMix(HANG, { h: [0.36, 0.12], bend: -0.3 }, dry), front: dry > 0.5, hand: dry > 0.5 ? "thumb" : undefined } }, GUS12, { wide: true, tall: true });
  const hand = g.at(g.A.R, 0.06), cy = hand[1] + 0.59 * s, rimY = cy + 0.2 * s, half = 0.71 * s;
  fx(c, `umbrella${open ? 1 : 0}`, 760, 800, (p) => fxUmbrella(p, open), [hand[0], cy, hand[2]], 1.5 * s, 1.58 * s, { gain: 0.7 });
  // rain everywhere but under the dome
  for (let i = 0; i < 80; i++) {
    const x = -3.2 + 6.4 * hash(i, 1), z = -3.5 + 5.2 * hash(i, 2), y = 4.4 - ((f * 0.19 + 4.4 * hash(i, 3)) % 4.4);
    if (open && Math.abs(x - hand[0]) < half + 0.05 && y < rimY + 0.15 && z > GUS12[2] - 0.7) continue;
    fx(c, "rain", 24, 200, fxRain, [x, y, z], 0.045, 0.42, { soft: true, gain: 0.8 });
  }
  // the water runs off the rim on both sides
  [[-1, RUNS], [1, RUNS2]].forEach(([sx, f0]) => {
    if (f < f0) return;
    const len = rimY * clamp01((f - f0 + 1) / 8), ph = Math.floor(f / 3) % 4;
    fx(c, `stream${ph}`, 90, 600, (p) => fxStream(p, ph), [hand[0] + sx * (half - 0.04), rimY - len / 2, hand[2] + 0.02], 0.16, len, { gain: 0.75 });
  });
  sparkle(c, add(g.at(g.A.L, 0.06), [-0.02, 0.16, 0]), DRY, 14, 0.24);
};

/** called once per frame and canvas; c.shot is the current shot */
export const stage = (c: Ctx) => {
  if (c.shot.place === "sky") skyStage(c);
  else if (c.shot.place === "garden") garden(c);
  else cabin(c);
};
