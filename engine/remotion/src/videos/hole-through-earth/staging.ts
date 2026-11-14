// Staging of "What If You Jumped Into a Hole Through the Earth?": who stands where in which pose, and every 2D
// effect card, for all 21 shots. stage(c) is a pure function of the shot and the frame; the timing comes from
// story.ts. Characters go in with put() (it returns their hand / mouth anchors in the world), effects with fx() or a
// helper from the kit's effects.ts.
import {
  Ctx, PutOpt, V3, Pose, Arm, put, where, reach, behind, fx, armMix, sm, lidAt, q, HANG, HIP, speedLines, flail, swingScene, birds, flame, earthMini,
  clamp01, lerp, lin, hash, GUS, WIFE, NEIGHBOR, FISHER, NEIGH, FISHER_SEAT, PIPE_H, EARTH_ROLL, earthPoint, draw, toon,
} from "../../toon/kit";
import {
  GUS_STAND, WIFE5, PANCAKE_AT, CHAIR, hopAt, gardenGusY, HANG_Y, POP1, HANG1, DROP1, POP2, BITE, DROP2, POP_SEA, STOP_SEA, SINK_SEA, GONE_SEA,
  seaGusY, PUSHES, swingTheta, swingAmp, swingAngle, earthGusS, FLAG_POP, ARROW_POP, PASS, hookDrop, shaftHeat, SHOVEL_HIT, shovelAt,
} from "./story";

const { fxFeather, fxBullet, fxSoot, fxQuestion, fxArrow, fxPancake, fxSplat, fxSparkle, fxShards, fxBubble, fxCrumbs, fxPop } = draw;
const { fxBurst, fxRing, fxPuff, fxSplash, fxCloud } = toon;

// ---------------- the shaft ----------------
/** speed lines in the colour of the depth */
const lines = (c: Ctx, n: number, len: number, fade = 1) => speedLines(c, n, len, fade, shaftHeat(c.id, c.f));
const shaft = (c: Ctx) => {
  const { id, f } = c;
  const drift: V3 = [0.03 * Math.sin(f * 0.11), 0.04 * Math.sin(f * 0.17 + 1), 0];
  if (id === 1) {
    const dy = hookDrop(f);
    put(c, GUS, { ...flail(f), expr: "shock", flap: (f * 0.23) % 1, blink: 0 }, [drift[0], drift[1] - dy, -0.02 * dy], { face: true, roll: 0.22 * Math.sin(f * 0.085) - 0.1 });
    lines(c, 12, 1.5, 1 - sm(f, 90, 100));
  } else if (id === 7) {
    const feather = sm(f, 497, 513), lookF = f >= 505;
    const pose: Pose = { ...flail(f * 0.45, 0.45), expr: f < 470 ? "nervous" : lookF ? (f >= 512 ? "wow" : "neutral") : "smile", facing: lookF ? 1 : 0, look: lookF ? 1 : 0,
      headTilt: lookF ? 6 * sm(f, 505, 512) : 0, blink: lidAt(f, 1, [470, 505]), flap: (f * 0.13) % 1 };
    const g = put(c, GUS, pose, drift, { face: true, roll: 0.1 * Math.sin(f * 0.05) + 0.06 });
    if (f >= 496) {
      const hp = g.at(g.A.head), k = 1 - feather;
      fx(c, "feather", 220, 420, fxFeather, [hp[0] + 0.6 + 1.3 * k, hp[1] + 0.06 + 1.5 * k * k, hp[2] + 0.05], 0.22, 0.42, { rot: -0.35 });
      if (f >= 513 && f < 523) { const u = (f - 513) / 10; fx(c, "sparkle", 200, 200, fxSparkle, [hp[0] + 0.8, hp[1] + 0.3, hp[2] + 0.06], 0.16 * Math.sin(Math.PI * u), 0.16 * Math.sin(Math.PI * u), { rot: u }); }
    }
    lines(c, 8, 0.9);
  } else if (id === 8) {
    const by = lin([[537, -1.85], [564, 0.32], [581, 0.92], [598, 2.0]], f), wave = f >= 578;
    const pose: Pose = { ...flail(f * 0.4, 0.35), expr: f < 560 ? "neutral" : f < 578 ? "wow" : "smile", facing: 1, look: 1, blink: lidAt(f, 2, [560, 578]), headTilt: lin([[537, 14], [564, 0], [598, -10]], f),
      flap: (f * 0.15) % 1 };
    if (wave) pose.R = { h: [0.6 + 0.1 * Math.sin((f - 578) * 1.1), -0.62], bend: -0.25 };
    put(c, GUS, pose, drift, { face: true, roll: -0.05 });
    fx(c, "bullet", 200, 420, fxBullet, [0.8, by, 0.05], 0.375, 0.79);
    lines(c, 9, 1.0);
  } else if (id === 9) {
    const fl = (f * 0.31) % 1, sh = 0.012 * Math.sin(f * 2.3);
    const pose: Pose = { mode: "air", expr: "flap", flap: fl,
      L: { h: [0.5 + 0.05 * Math.sin(f * 1.9), -0.72 + 0.06 * Math.sin(f * 2.3)], bend: -0.12 }, R: { h: [0.52 + 0.05 * Math.sin(f * 2.1 + 1), -0.7 + 0.06 * Math.sin(f * 1.7)], bend: -0.12 },
      legs: [[-0.46 + 0.04 * Math.sin(f * 2), 0.82], [0.5 + 0.04 * Math.sin(f * 2.4), 0.74]] };
    put(c, GUS, pose, [drift[0] + sh, drift[1], 0], { face: true, roll: 0.05 });
    lines(c, 14, 1.8);
  } else if (id === 11) {
    const fl = (f * 0.37) % 1, jx = 0.008 * Math.sin(f * 2.9), jy = 0.008 * Math.sin(f * 3.7);
    put(c, GUS, { mode: "air", expr: "flap", flap: fl, L: { h: [0.5, -0.7], bend: -0.12 }, R: { h: [0.52, -0.7], bend: -0.12 }, legs: [[-0.46, 0.82], [0.5, 0.74]] }, [jx, jy, 0], { face: true, roll: 0.03 });
    lines(c, 16, 1.4);
  } else if (id === 12) {
    // the thermometer climbs to the top and pops on f801; he lowers what is left of it, then the calm thumbs-up on f836
    const lvl = f >= 801 ? 2 : lin([[745, 0.06], [765, 0.22], [786, 0.7], [800, 1.0]], f);
    const lower = sm(f, 812, 826), calm = f >= 822, thumb = sm(f, 831, 836);
    const R: Arm = { ...armMix({ h: [0.86, -0.3], bend: 0.1 }, { h: [0.42, 0.75], bend: 0.1 }, lower), front: true, prop: "thermo", arg: lvl };
    const L: Arm = f >= 831 ? { ...armMix(HANG, { h: [0.36, 0.12], bend: -0.3 }, thumb), front: true, hand: "thumb" } : { h: [0.3, 0.8], bend: 0.1 };
    const pose: Pose = { mode: "air", expr: f >= 801 && f < 809 ? "shock" : calm ? "smile_closed" : "neutral", facing: calm ? 0 : 1, look: calm ? 0 : 1, blink: lidAt(f, 3, [801, 822]),
      R, L, legs: [[-0.3, 1.2], [0.36, 1.16]], flap: (f * 0.17) % 1 };
    const g = put(c, GUS, pose, drift, { face: true, roll: 0.03 });
    if (f >= 801 && f < 815) {
      const u = (f - 801) / 14, at = g.at(g.A.propR, 0.05);
      fx(c, `shards${q(u, 30)}`, 400, 400, (p) => fxShards(p, q(u, 30)), at, 0.9, 0.9);
      if (u < 0.45) fx(c, `burstR${q(u / 0.45, 30)}`, 500, 500, (p) => fxBurst(p, q(u / 0.45, 30), "#ffd9c8", 9, 30, 200), at, 0.7, 0.7);
    }
    if (f >= 836 && f < 850) { const u = (f - 836) / 14, at = g.at(g.A.L, 0.06), s = 0.2 * Math.sin(Math.PI * u) ** 0.6; fx(c, "sparkle", 200, 200, fxSparkle, [at[0] - 0.02, at[1] + 0.16, at[2]], s, s, { rot: u * 1.2 }); }
    lines(c, 12, 1.4);
  } else if (id === 19) {
    const yawn = f >= 1652 && f < 1672;
    const pose: Pose = { mode: "air", expr: yawn ? "asleep" : "neutral", look: yawn ? 0 : Math.sin(f * 0.04) > 0 ? 1 : -1, blink: lidAt(f, 4, [1652, 1672]),
      L: { h: [-0.5, 0.44], bend: 0.3, front: true }, R: { h: [-0.46, 0.52], bend: 0.3, front: true }, legs: [[0.16, 1.24], [-0.12, 1.2]], flap: (f * 0.21) % 1 };
    put(c, GUS, pose, [-drift[0], drift[1], 0], { face: true, roll: -0.28 + 0.03 * Math.sin(f * 0.06), mirror: true });
    lines(c, 14, 1.7);
  }
};

// ---------------- the garden ----------------
const NEIGH_BASE: Pose = { mode: "stand" };
const neighbor = (c: Ctx, pose: Pose, pos: V3 = NEIGH, o: PutOpt = {}) => put(c, NEIGHBOR, { ...NEIGH_BASE, ...pose }, pos, { noBlob: pos === NEIGH, ...o });
const garden = (c: Ctx) => {
  const { id, f } = c;
  if (id === 2) {
    const sh = shovelAt(f), planted = f >= SHOVEL_HIT, look = f >= 170 && f < 190;
    const proud = f >= 190;
    const L: Arm = { h: reach(c, GUS_STAND, -1, sh.grip), bend: 0.12, front: !planted };
    const pose: Pose = { expr: proud ? "relief_open" : look ? "grin" : "smile_closed", facing: look ? -1 : 0, look: look ? -1 : 0, blink: lidAt(f, 5, [170, 190]),
      L, R: HIP, tilt: look ? -4 * sm(f, 170, 176) * (1 - sm(f, 184, 192)) : 0, headTilt: proud ? -4 : 0 };
    put(c, GUS, pose, GUS_STAND);
    if (f >= SHOVEL_HIT && f < SHOVEL_HIT + 10) {
      const u = (f - SHOVEL_HIT) / 10;
      fx(c, `puff${q(u, 20)}`, 300, 300, (p) => fxPuff(p, q(u, 20)), [sh.tip[0] + 0.12, sh.tip[1] + 0.25, sh.tip[2] + 0.3], 0.9 + 0.5 * u, 0.9 + 0.5 * u, { soft: true });
      for (let i = 0; i < 4; i++) { const a = 0.6 + i * 0.55, r = 0.5 * u; fx(c, "clod", 60, 60, (p) => p.ell(30, 30, 20, 17, "#7a5236", 8), [sh.tip[0] + 0.1 + Math.cos(a) * r, sh.tip[1] + 0.3 + Math.sin(a) * r * 1.4 - 1.2 * u * u, sh.tip[2] + 0.35], 0.07, 0.07); }
    }
    birds(c, f - 118);
  } else if (id === 4) {
    const burn = f >= 287, crisp = f >= 305, notice = f >= 300;
    const laugh = !notice, shake = laugh ? 0.012 * Math.sin(f * 1.5) : 0;
    const pose: Pose = { expr: crisp ? "sad" : notice ? "shock" : "laugh", facing: notice ? 1 : -1, look: notice ? 1 : -1, blink: notice ? 0 : lidAt(f, 6, [300]),
      tilt: laugh ? -5 + 2.5 * Math.sin(f * 0.75) : 3, headTilt: laugh ? 5 * Math.sin(f * 0.75 + 1) : -4,
      L: laugh ? { h: [0.86, 0.22 + 0.05 * Math.sin(f * 0.75)], bend: 0.1, front: true, hand: "point" } : { h: [0.5, 0.36], bend: 0.2, front: true },
      R: { h: [0.52, -0.18], bend: -0.3, front: true, prop: "fork", arg: crisp ? 2 : burn ? 1 : 0 } };
    const g = neighbor(c, pose, [NEIGH[0], NEIGH[1] + shake, NEIGH[2]], { wide: true });
    const at = g.at(g.A.propR, 0.04);
    flame(c, at, 287, 306);
    if (crisp) { const u = ((f - 305) % 14) / 14; fx(c, `soot${q(u, 14)}`, 300, 300, (p) => fxSoot(p, q(u, 14)), [at[0] + 0.02, at[1] + 0.2 + 0.25 * u, at[2]], 0.3, 0.3); }
  } else if (id === 5) {
    const landed = f >= 351;
    const wifePose = (ff: number): Pose => {
      const flick = lin([[333, 0], [337, 26], [341, -4], [346, 0]], ff), up = lin([[333, 0], [337, 0.16], [342, 0]], ff);
      const away = sm(ff, 367, 377); // she looks back at us, slowly
      return { expr: "neutral", look: q(sm(ff, 335, 339) * (1 - away), 20), facing: ff >= 345 ? 1 : 0, blink: lidAt(ff, 7, [351, 372]),
        headTilt: -5 * sm(ff, 336, 340) * (1 - sm(ff, 348, 352)) + 4 * sm(ff, 350, 354) * (1 - away),
        L: { h: [0.02, 0.74], bend: 0.36, front: true }, R: { h: [0.5, 0.4 - up], bend: 0.12, front: true, prop: "pan", arg: flick } };
    };
    const pose = wifePose(f);
    const g = put(c, WIFE, pose, WIFE5);
    const pan = g.at(g.A.propR, 0.05);
    if (f < 337) fx(c, "cake0.2", 300, 300, (p) => fxPancake(p, 0.2), [pan[0], pan[1] + 0.02, pan[2]], 0.34, 0.34);
    else if (!landed) {
      const rel = where(c, WIFE, wifePose(337), WIFE5), p0 = rel.at(rel.A.propR, 0.05), u = (f - 337) / 14; // leaves the pan where the flick tossed it
      const pos: V3 = [lerp(p0[0], PANCAKE_AT[0], u), lerp(p0[1] + 0.03, 0.05, u) + 0.95 * 4 * u * (1 - u), lerp(p0[2], PANCAKE_AT[2], u)];
      const sq = q(Math.cos(u * Math.PI * 3), 20);
      fx(c, `cake${sq}`, 300, 300, (p) => fxPancake(p, sq), pos, 0.36, 0.36, { rot: 0.3 * Math.sin(u * 5) });
    } else {
      const u = Math.min(1, (f - 351) / 8), s = 0.62 * (0.75 + 0.25 * Math.min(1, (f - 350) / 2));
      fx(c, `splat${q(u, 16)}`, 400, 400, (p) => fxSplat(p, q(u, 16)), PANCAKE_AT, s, s, { flat: true, rot: 0.4 });
      if (f < 359) for (let i = 0; i < 6; i++) { const a = 0.25 + i * 0.52, r = 0.16 + (0.4 + 0.25 * hash(i, 5)) * u; fx(c, "drop", 60, 60, (p) => p.ell(30, 30, 20, 20, "#f0c46a", 8), [PANCAKE_AT[0] + Math.cos(a) * r, 0.05 + (0.3 + 0.5 * hash(i, 6)) * Math.sin(Math.PI * u), PANCAKE_AT[2] + 0.15], 0.06, 0.06); }
    }
  } else if (id === 6) {
    const hp = hopAt(f), up = sm(f, 404, 411), sal = sm(f, 417, 421) * (1 - sm(f, 425, 428));
    const air = hp.air;
    const pose: Pose = air
      ? { mode: "air", expr: "grin", L: { h: [0.5, -0.72], bend: -0.15 }, R: { h: [0.5, -0.66], bend: -0.15, front: true, prop: "clipboard" }, legs: [[-0.34, 0.86], [0.4, 0.8]], flap: (f * 0.2) % 1 }
      : { expr: f < 404 ? "smile" : f < 417 ? "smile_closed" : "grin", blink: lidAt(f, 8, [404, 417]), squash: hp.squash, headTilt: -3 * up,
        R: armMix(HANG, { h: [0.52, -0.2], bend: -0.28, front: true }, up), L: armMix(HANG, { h: [0.16, -0.64], bend: -0.42, front: true }, sal) };
    if (!air) pose.R = { ...pose.R!, front: true, prop: "clipboard" };
    put(c, GUS, pose, [hp.x, hp.y, hp.z], { noBlob: air && hp.y < -0.05, blob: air ? 0.5 : 1 });
    if (f >= 411 && f < 417) { const u = (f - 411) / 6; fx(c, "sparkle", 200, 200, fxSparkle, [GUS_STAND[0] + 0.52, 1.72, GUS_STAND[2] + 0.1], 0.2 * Math.sin(Math.PI * u), 0.2 * Math.sin(Math.PI * u), { rot: u }); }
  } else if (id === 13) {
    // seen from INSIDE the hole, straight up: a dark round rim framing the sky, two heads leaning in over the edge
    // from opposite sides, each with a hand cupped to an ear. The cards face the lens (it looks up), bodies outward.
    const q0 = f >= 895, sw = 0.012 * Math.sin(f * 0.16), A = 0.87; // lean-in angle from upright (rad)
    const pv = (hx: number, hz: number, side: number): [number, number] => [hx - side * 0.63 * Math.sin(A), hz - 0.63 * Math.cos(A)]; // card pivot for a head at (hx, hz); screen right = +x, screen up = +z
    const [wx, wz] = pv(-0.31 + sw, 0.0, 1), [nx, nz] = pv(0.34 - sw, 0.05, -1);
    put(c, WIFE, { expr: "neutral", look: 0, headTilt: -5, blink: lidAt(f, 9, [895]), L: { h: [0.3, -0.64], bend: -0.42, front: true }, R: { h: [0.24, 0.4], bend: 0.2 } },
      [wx, 0.95, wz], { face: true, roll: -A });
    neighbor(c, { expr: q0 ? "wow" : "neutral", look: 0, headTilt: 5, blink: lidAt(f, 10, [895]), R: { h: [0.3, -0.64], bend: -0.42, front: true }, L: { h: [0.24, 0.4], bend: 0.2 } },
      [nx, 1.1, nz], { face: true, roll: A });
    if (f >= 895) {
      const u = (f - 895) / 6, sc = u < 1 ? 1.25 * Math.sin((Math.PI / 2) * u) : 1 + 0.25 * Math.exp(-(u - 1) * 1.2) * Math.cos((u - 1) * 2.2);
      fx(c, "what", 300, 420, fxQuestion, [0.02, 0.62, 0.46 + 0.01 * Math.sin(f * 0.25)], 0.3 * sc, 0.42 * sc, { rot: 0.1 * Math.sin(f * 0.2) });
    }
    // one small cloud drifting high over the hole
    fx(c, "cloud3", 600, 300, (p) => fxCloud(p, 3), [-5 + 0.05 * (f - 861), 70, 9], 22, 11, { soft: true, gain: 1.05 });
  } else if (id === 20 || id === 21) {
    const y = gardenGusY(f), top1 = f >= HANG1 - 6 && f < DROP1, rise2 = f >= POP2 - 3 && f < DROP2;
    const visible = y > -2.2;
    // --- Gus: pops up, tips the fishbowl back like a lid with both hands, one big bite, chews, lid down, gone ---
    const acc = rise2 ? sm(f, POP2 + 7, BITE - 6) * (1 - sm(f, BITE + 10, BITE + 18)) : 0;
    const lean = (ff: number) => -10 * sm(ff, BITE - 8, BITE - 2) * (1 - sm(ff, BITE + 5, BITE + 13));
    if (visible) {
      const falling = (f >= DROP1 && f < POP2 - 3) || f >= DROP2;
      const up: Arm = { h: [0.62, -0.5], bend: -0.2 }, grab = sm(f, POP2 + 3, POP2 + 7);
      const gripL: Arm = { h: [lerp(0.04, -0.02, acc), lerp(-0.06, -1.15, acc)], bend: -0.3, front: true }, gripR: Arm = { h: [lerp(0.04, 0.035, acc), lerp(-0.06, -1.0, acc)], bend: -0.34, front: true }; // one hand on each end of the rim
      const pose: Pose = falling
        ? { mode: "air", expr: f >= DROP2 ? "chew" : "shock", chew: ((f - BITE) * 0.12) % 1, L: { h: [0.5, -0.8], bend: -0.12 }, R: { h: [0.52, -0.78], bend: -0.12 }, legs: [[-0.2, 1.3], [0.24, 1.28]], flap: f >= DROP2 ? undefined : (f * 0.25) % 1 }
        : rise2
          ? { expr: f >= BITE ? "chew" : f >= BITE - 6 ? "bite" : "smile", chew: ((f - BITE) * 0.12) % 1, facing: -1, look: -1, blink: lidAt(f, 11, [BITE]), acc, tilt: lean(f),
            L: armMix(HANG, gripL, grab), R: armMix(HANG, gripR, grab) }
          : { expr: top1 ? "relief_open" : "smile", facing: -1, look: -1, blink: lidAt(f, 11, [HANG1 - 6]), L: armMix(HANG, up, sm(f, POP1 + 6, HANG1 - 4)), R: armMix(HANG, up, sm(f, POP1 + 6, HANG1 - 4)) };
      put(c, GUS, pose, [0, y, 0], { noBlob: true, tall: acc > 0 });
    }
    for (const f0 of [POP1, POP2]) if (f >= f0 && f < f0 + 7) { const u = (f - f0) / 7; fx(c, `pop${q(u, 28)}`, 500, 300, (p) => fxPop(p, q(u, 28)), behind(c, [0, 0.2, 0]), 2.0, 1.2); }
    // --- his wife in the deck chair: winds the egg timer, then holds the plate exactly where his mouth will be ---
    // her left hand: the egg timer, lifted off her lap and wound (the dial turns, f1786-1812), ticking down until it
    // rings as he arrives (f1834); wound again after he has gone. Her right hand: the plate, on her lap, then held
    // out exactly where his mouth will be. Every change is eased: no single-frame jumps.
    const wind = f >= 1786 && f < 1812, rewind = f >= 1893 && f < 1922, offer = sm(f, 1812, 1826);
    const up = sm(f, 1779, 1787) * (1 - sm(f, 1812, 1821)) + sm(f, 1887, 1894), wob = wind || rewind ? 1 : 0;
    const dial = f < 1786 ? 0 : f < 1812 ? (300 * (f - 1786)) / 26 : f < 1834 ? 300 * (1 - (f - 1812) / 22) : f < 1893 ? 0 : Math.min(300, (300 * (f - 1893)) / 29);
    const timerArm: Arm = { h: [lerp(0.1, -0.18, up) + 0.02 * wob * Math.sin(f * 1.6), lerp(0.52, 0.36, up) + 0.02 * wob * Math.cos(f * 1.6)], bend: 0.3, front: true, prop: "timer", arg: dial };
    const bitten = f >= BITE ? 1 : 0;
    // where his mouth is at the bite (he leans in): the bitten end of the sandwich sits there, the hand 13 cm short and 17 cm lower
    const gm = where(c, GUS, { facing: -1, tilt: lean(BITE) }, [0, HANG_Y, 0]), mouth = gm.at(gm.A.mouth, 0);
    const hand: V3 = [mouth[0] - c.cam.right.x * 0.13, mouth[1] - 0.175, mouth[2] - c.cam.right.z * 0.13];
    const rest: Arm = { h: [0.2, 0.5], bend: 0.25, front: true, prop: "plate", arg: bitten };
    const out: Arm = { h: reach(c, CHAIR, 1, hand, 0.863, 1.2), bend: 0.04, front: true, prop: "plate", arg: bitten };
    const back = sm(f, 1884, 1894);
    const upK = sm(f, POP1 - 1, POP1 + 3) * (1 - sm(f, DROP1 + 5, DROP1 + 11)) + sm(f, POP2 - 3, POP2 + 1) * (1 - sm(f, DROP2 + 3, DROP2 + 9)); // looks up at him
    const downK = sm(f, 1783, 1789) * (1 - sm(f, 1809, 1816)) + sm(f, 1890, 1896) * (1 - sm(f, 1919, 1925));                                     // looks down at the timer
    const wpose: Pose = { mode: "chair", expr: "neutral", facing: 1, look: q(upK - downK, 20), headTilt: -6 * upK + 5 * downK, blink: lidAt(f, 12, [POP1, DROP1 + 8, 1786, 1812, POP2 - 2, DROP2 + 6]),
      L: timerArm, R: { ...armMix(rest, out, offer * (1 - back)), prop: "plate", arg: bitten, front: true } };
    const w = put(c, WIFE, wpose, CHAIR, { noBlob: true, wide: true });
    if (f >= BITE && f < BITE + 10) { const u = (f - BITE) / 10, at = w.at(w.A.propR, 0.06); fx(c, `crumbs${q(u, 20)}`, 300, 300, (p) => fxCrumbs(p, q(u, 20)), [at[0], at[1] - 0.02, at[2]], 0.5, 0.5); }
    if (f >= POP2 && f < POP2 + 12) { const u = (f - POP2) / 12, at = w.at(w.A.propL, 0.06), sc = 0.22 * Math.sin(Math.PI * u) ** 0.6; fx(c, "sparkle", 200, 200, fxSparkle, [at[0], at[1] + 0.16, at[2]], sc, sc, { rot: u }); }
    // --- the neighbor at the fence (the payoff) ---
    if (id === 21) {
      const seen = f >= POP2 + 3, jaw = f >= DROP2 + 5, fire = f >= 1905;
      const pose: Pose = { expr: jaw ? "jawdrop" : seen ? "shock" : "neutral", facing: -1, look: -1, blink: jaw || seen ? 0 : lidAt(f, 13), headTilt: jaw ? 3 : 0,
        L: { h: [0.45, 0.4], bend: 0.25, front: true }, R: { h: [0.5, jaw ? 0.02 : -0.12], bend: -0.3, front: true, prop: "fork", arg: fire ? 1 : 0 } };
      // he stands at his fence the whole time, out of the two-shot; the lens swings over to him from f1880
      const g = neighbor(c, pose);
      flame(c, g.at(g.A.propR, 0.04), 1905);
    }
  }
};

// ---------------- the Earth cutaway ----------------
const earth = (c: Ctx) => {
  const { id, f } = c;
  if (id === 3) {
    // the tunnel punches out through the ocean on the far side: a spark, a small splash, the tiny pipe rim (earth.ts)
    if (f >= FLAG_POP - 1 && f < FLAG_POP + 14) {
      const u = (f - (FLAG_POP - 1)) / 15;
      const at = earthPoint(1.16, 0.45), tip = earthPoint(1.3, 0.45);
      fx(c, `splashE${q(u, 30)}`, 800, 800, (p) => fxSplash(p, q(u, 30)), [(at[0] + tip[0]) / 2, (at[1] + tip[1]) / 2, at[2]], 2.6, 2.6, { rot: Math.PI + EARTH_ROLL });
      if (u < 0.5) fx(c, `sparkE${q(u * 2, 20)}`, 500, 500, (p) => fxBurst(p, q(u * 2, 20), "#fff3b0", 10, 40, 230), earthPoint(1.1, 0.7), 2.4, 2.4, { gain: 1.4 });
    }
  } else if (id === 10) {
    const s = earthGusS(id, f);
    earthMini(c, s, 1.15, 1, "o", 1, true);
    if (Math.abs(s) < 0.1) { const u = clamp01((s + 0.1) / 0.2); fx(c, `coreFlash${q(u, 12)}`, 500, 500, (p) => fxBurst(p, q(u, 12), "#ffffff", 12, 60, 240), earthPoint(0, 0.7), 3.2, 3.2, { gain: 1.6 }); }
  } else if (id === 14) {
    const s = earthGusS(id, f), speed = Math.sqrt(Math.max(0, 1 - (s / 0.93) ** 2));
    earthMini(c, s, 1.15, s < 0.6 ? 1 : 0, f > 1080 ? "smile" : "o", speed, true);
    if (f >= ARROW_POP - 1) {
      const u = (f - (ARROW_POP - 1)) / 6, pop = u < 1 ? 1.25 * Math.sin((Math.PI / 2) * u) : 1 + 0.25 * Math.exp(-(u - 1) * 1.0) * Math.cos((u - 1) * 2.0);
      // the pull: a big arrow beside Gus, outside the tunnel line, always pointing AT the centre. As he passes the
      // centre (f1022) it spins round in six frames, with a sparkle
      const spin = clamp01((f - (PASS - 3)) / 6), turn = Math.PI * spin * spin * (3 - 2 * spin);
      const kick = f >= PASS && f < PASS + 8 ? 1 + 0.2 * Math.sin((Math.PI * (f - PASS)) / 8) : 1;
      const size = (1.5 + 0.45 * Math.abs(s)) * pop * kick;
      const p = earthPoint(s - Math.sign(s) * 0.16, 0.9, 1.62);
      fx(c, "arrow", 300, 520, (pp) => fxArrow(pp), p, 1.0 * size, 1.75 * size, { rot: EARTH_ROLL + turn });
      if (f >= PASS - 1 && f < PASS + 12) { const v = (f - (PASS - 1)) / 13, ss = 1.5 * Math.sin(Math.PI * v) ** 0.6; fx(c, "sparkle", 200, 200, fxSparkle, earthPoint(s - 0.02, 1.1, 2.75), ss, ss, { rot: v * 2, gain: 1.3 }); }
      // the middle: a pulsing ring that the arrow points at
      const r = q(((f * 0.035) % 1), 30);
      fx(c, `ring${r}`, 600, 600, (pp) => fxRing(pp, r), earthPoint(0, 0.6), 1.9, 1.9);
    }
  }
};

// ---------------- the park swing (the kit's swing scene, timed by story.swingTheta) ----------------
const park = (c: Ctx) => swingScene(c, { angle: swingAngle(c.f), vel: Math.sin(swingTheta(c.f)), ampAt: (f) => (swingAmp(f) * Math.PI) / 180, pushes: PUSHES });

// ---------------- the ocean ----------------
const ocean = (c: Ctx) => {
  const { id, f } = c, y = seaGusY(f);
  const bobY = 0.025 * Math.sin(f * 0.07), fpos: V3 = [FISHER_SEAT[0], FISHER_SEAT[1] + bobY, FISHER_SEAT[2]];
  // --- Gus ---
  const out = y > PIPE_H - 1.75;
  if (out && f >= POP_SEA - 1) {
    let pose: Pose;
    if (id === 16) {
      const k = sm(f, POP_SEA + 30, STOP_SEA);
      pose = { expr: f < STOP_SEA - 20 ? "wow" : "nervous", look: f > STOP_SEA - 12 ? 1 : 0, facing: f > STOP_SEA - 12 ? 1 : 0, blink: lidAt(f, 14, [STOP_SEA - 20]),
        L: armMix({ h: [0.14, 0.92], bend: 0.05 }, { h: [0.5, 0.55], bend: 0.12 }, k), R: armMix({ h: [0.14, 0.92], bend: 0.05 }, { h: [0.5, 0.55], bend: 0.12 }, k) };
    } else if (f < SINK_SEA - 3) {
      const wave = f >= 1480 && f < 1530;
      pose = { expr: f < 1468 ? "nervous" : wave ? "relief_open" : "relief", facing: 1, look: 1, blink: lidAt(f, 14, [1468, 1480]), headTilt: wave ? 5 : 0,
        L: { h: [0.4, 0.62], bend: 0.12 }, R: wave ? { h: [0.62 + 0.12 * Math.sin((f - 1480) * 0.75), -0.6], bend: -0.25 } : armMix({ h: [0.5, 0.55], bend: 0.12 }, { h: [0.62, -0.6], bend: -0.25 }, sm(f, 1475, 1481) * (1 - sm(f, 1530, 1538))) };
    } else {
      const grab = sm(f, 1566, 1578), gone = f >= GONE_SEA - 2;
      pose = { mode: gone ? "air" : "stand", expr: gone ? "shock" : f < 1568 ? "sad" : "nervous", facing: 1, look: 1, blink: 0, tilt: 10 * grab * (gone ? 0.3 : 1),
        L: gone ? { h: [0.5, -0.8], bend: -0.12 } : { h: [0.45, 0.4], bend: 0.12 }, R: gone ? { h: [0.55, -0.78], bend: -0.12 } : armMix({ h: [0.5, 0.55], bend: 0.12 }, { h: [1.04, -0.22], bend: 0.02, front: true }, grab),
        legs: [[-0.26, 1.28], [0.3, 1.26]], flap: gone ? (f * 0.25) % 1 : undefined };
    }
    put(c, GUS, pose, [0, y, 0], { wide: true });
  }
  if (f >= POP_SEA && f < POP_SEA + 7) { const u = (f - POP_SEA) / 7; fx(c, `pop${q(u, 28)}`, 500, 300, (p) => fxPop(p, q(u, 28)), behind(c, [0, PIPE_H + 0.2, 0]), 2.1, 1.26); }
  // --- the fisherman ---
  const awake = f >= POP_SEA + 3, follow = clamp01((y - PIPE_H) / 1.6);
  let fp: Pose;
  if (!awake) fp = { mode: "chair", expr: "asleep", headTilt: 13 + 1.5 * Math.sin(f * 0.07), tilt: 3, L: { h: [0.2, 0.6], bend: 0.2 }, R: { h: [0.22, 0.6], bend: 0.2 } };
  else if (id === 16) fp = { mode: "chair", expr: "shock", facing: -1, look: -1, headTilt: -4 - 9 * follow, L: { h: [0.3, 0.5], bend: 0.2 }, R: { h: [0.3, 0.5], bend: 0.2 } };
  else {
    const wv = id === 17 ? sm(f, 1496, 1510) : 1, frozen = f >= SINK_SEA + 10;
    const ph = frozen ? 1.2 : (f - 1500) * 0.28;
    fp = { mode: "chair", expr: f >= GONE_SEA + 2 ? "wow" : id === 17 && f < 1492 ? "shock" : "wow", facing: -1, look: -1, headTilt: f >= GONE_SEA ? lerp(-13, 6, sm(f, GONE_SEA, GONE_SEA + 8)) : -13,
      blink: lidAt(f, 15, [1492]), R: { h: [0.3, 0.5], bend: 0.2 },
      L: armMix({ h: [0.3, 0.5], bend: 0.2 }, { h: [0.6 + 0.1 * Math.sin(ph), -0.52], bend: -0.25 }, wv) };
  }
  put(c, FISHER, fp, fpos);
  if (!awake) { // sleep bubble
    const k = q(0.5 - 0.5 * Math.cos((f - 1268) * 0.105), 24), s = 0.3;
    fx(c, `bubble${k}`, 200, 200, (p) => fxBubble(p, k), [fpos[0] - 0.2 - 0.07 * k, fpos[1] + 1.02 - 0.03 * k, fpos[2] + 0.06], s, s, { gain: 0.8 });
  } else if (f < POP_SEA + 9) { const u = (f - POP_SEA - 3) / 6; fx(c, `bpop${q(u, 20)}`, 500, 500, (p) => fxBurst(p, q(u, 20), "#d8eeff", 8, 30, 200), [fpos[0] - 0.25, fpos[1] + 1.0, fpos[2] + 0.06], 0.6, 0.6); }
  // --- rings on the water around the pipe and the boat ---
  for (let i = 0; i < 2; i++) { const u = q((((f + i * 33) % 66) / 66), 33); fx(c, `ring${u}`, 600, 600, (p) => fxRing(p, u), [i ? FISHER_SEAT[0] - 0.1 : 0, 0.03, i ? FISHER_SEAT[2] : 0], i ? 4.6 : 2.6, i ? 3.0 : 2.6, { flat: true, gain: 0.55 }); }
};

/** everything with a face (and every 2D effect card) of one frame */
export const stage = (c: Ctx) => {
  const place = c.shot.place;
  if (place === "shaft") shaft(c);
  else if (place === "garden") garden(c);
  else if (place === "earth") earth(c);
  else if (place === "park") park(c);
  else ocean(c);
};
