// This video's own drawings and its one 3D prop (the garden table). 2D cards are drawn with the kit's Pen on a
// canvas of the stated size and placed with fx(); the hand props are registered in PROPS.
import * as THREE from "three";
import { Pen, INK, PROPS, P2, build, toon } from "../../toon/kit";
import { TABLE, TABLE_H } from "./story";

const { rad, ellPts, rrect, curve } = toon;
const TAU = Math.PI * 2;

// ---------------- hamburger ----------------
/** one hamburger centred on (cx, cy), 240 s wide and 190 s tall: bun, lettuce, cheese, patty, bun */
export const burger = (p: Pen, cx: number, cy: number, s = 1, ol = 9) => {
  const X = (x: number) => cx + x * s, Y = (y: number) => cy + y * s, w = ol * s;
  p.poly(rrect(X(-108), Y(38), X(108), Y(88), 24 * s), "#d9953c", w);                                  // bottom bun
  p.poly(rrect(X(-118), Y(4), X(118), Y(46), 18 * s), "#5c3423", w);                                    // patty
  p.poly([[X(-124), Y(-4)], [X(124), Y(-4)], [X(98), Y(10)], [X(64), Y(34)], [X(34), Y(10)], [X(-66), Y(10)], [X(-98), Y(26)]], "#ffc62e", w * 0.8); // cheese
  { const pts: P2[] = []; for (let i = 0; i <= 14; i++) pts.push([X(-122 + (244 * i) / 14), Y(-6 + (i % 2 ? 9 : 0))]); pts.push([X(122), Y(-20)], [X(-122), Y(-20)]); p.poly(pts, "#6fb24a", w * 0.8); } // lettuce
  const top = ellPts(X(0), Y(-14), 116 * s, 84 * s, 180, 360);
  p.poly(top, "#e6a548", w);                                                                            // top bun
  p.clip(top, () => p.ell(X(-28), Y(-58), 70 * s, 22 * s, "#f2bd6a", 0, 0, 360, -12));
  p.poly(top, null, w);
  for (const [x, y, r] of [[-52, -62, -30], [-8, -78, 10], [40, -64, 35], [-22, -44, 20], [66, -40, -20], [14, -52, -40]] as const) p.ell(X(x), Y(y), 9 * s, 4.5 * s, "#fff4d6", 0, 0, 360, r);
};
/** a single hamburger on a 300 x 240 canvas */
export const fxBurger = (p: Pen) => burger(p, 150, 126, 1, 10);
/** a heap of hamburgers on a 640 x 420 canvas (rows of 4, 3, 2, 1) */
export const fxPile = (p: Pen) => {
  const s = 0.6;
  [[4, 340], [3, 262], [2, 184], [1, 106]].forEach(([n, y]) => { for (let i = 0; i < n; i++) burger(p, 320 + (i - (n - 1) / 2) * 150, y, s, 11); });
};
/** small heap (2 + 1) on a 360 x 260 canvas */
export const fxPileSmall = (p: Pen) => {
  const s = 0.62;
  burger(p, 105, 190, s, 11); burger(p, 255, 190, s, 11); burger(p, 180, 106, s, 11);
};
/** hand prop: a hamburger held in the hand (arg unused) */
PROPS.burger = (p, hx, hy, side, u) => { burger(p, hx + side * 6 * u, hy - 14 * u, 0.27 * u, 8); return [hx + side * 6 * u, hy - 16 * u]; };
/** hand prop: the neighbor's grill fork with nothing on it (the kit's fork always carries a sausage) */
PROPS.forkEmpty = (p, hx, hy, side, u) => {
  const tip: P2 = [hx + side * 13 * u, hy - 78 * u], base: P2 = [hx - side * 2 * u, hy + 9 * u];
  const dx = tip[0] - base[0], dy = tip[1] - base[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const at = (t: number, s = 0): P2 => [base[0] + ux * t * L + nx * s * u, base[1] + uy * t * L + ny * s * u];
  p.band([at(0.2), at(0.86)], "#aab2bb", 2.2 * u, 1.2 * u, "round");
  for (const s of [-3.2, 3.2]) p.band([at(0.84, s), at(1.02, s)], "#aab2bb", 1.6 * u, 1.1 * u, "round");
  p.band([at(0.84, -3.2), at(0.84, 3.2)], "#aab2bb", 1.6 * u, 1.1 * u, "round");
  p.band([at(-0.02), at(0.24)], "#7a4b2a", 5 * u, 1.5 * u, "round");
  return at(0.95);
};
/** a sausage end sticking out of a mouth, 200 x 120 canvas (pointing right) */
export const fxSausage = (p: Pen) => {
  p.stroke([[40, 60], [150, 56]], 52, INK); p.stroke([[40, 60], [150, 56]], 36, "#cf6a45");
  p.stroke([[70, 48], [140, 46]], 7, "#f0a783");
};

// ---------------- the hummingbird ----------------
/** hummingbird on a 420 x 320 canvas, beak to the right. wing: 1 up / -1 down (hovering: alternate every frame),
 *  0 folded (perched). lid 0..1 eyelid. fluff 0..1 puffed into a ball. droop 0..1 tired head */
export const fxHummer = (p: Pen, wing: number, lid = 0, fluff = 0, droop = 0) => {
  const G = "#27a871", GD = "#1c7f55", BELLY = "#eef5e6", RUBY = "#d62f63", ol = 9;
  const bx = 196, by = 172, rx = 80 - 14 * fluff, ry = 50 + 22 * fluff, rot = -14 * (1 - fluff);
  // tail
  p.poly([[bx - 58, by + 4], [bx - 150, by + 44 + 20 * fluff], [bx - 128, by + 14], [bx - 156, by - 4], [bx - 60, by - 26]], GD, ol);
  // wings: a pointed blade from the shoulder; hovering draws the stroke's other end as a pale ghost, so the pair reads as a blur
  const blade = (sx: number, sy: number, ang: number, len: number, wd: number): P2[] => {
    const a = rad(ang), dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
    const tip: P2 = [sx + dx * len, sy + dy * len], m1: P2 = [sx + dx * len * 0.45 + nx * wd, sy + dy * len * 0.45 + ny * wd], m2: P2 = [sx + dx * len * 0.5 - nx * wd * 0.55, sy + dy * len * 0.5 - ny * wd * 0.55];
    return [...curve([sx - nx * 8, sy - ny * 8], m2, tip, 10), ...curve(tip, m1, [sx + nx * 14, sy + ny * 14], 10)];
  };
  const UP = -112, DOWN = 118;
  if (wing) {
    const far = blade(bx + 6, by - 22, wing > 0 ? UP + 14 : DOWN - 14, 150, 30);
    p.poly(far, "#bfe6d4", ol * 0.7);
  }
  const body = ellPts(bx, by, rx, ry, 0, 360, rot);
  p.poly(body, G, ol);
  p.clip(body, () => p.ell(bx + 14, by + 34 + 8 * fluff, rx * 0.95, ry * 0.7, BELLY, 0, 0, 360, rot));
  p.poly(body, null, ol);
  // head
  const hx = bx + 66 - 8 * fluff, hy = by - 42 + 14 * fluff + 10 * droop;
  p.ell(hx - 4, hy + 34, 27, 22, RUBY, ol * 0.8);
  p.ell(hx, hy, 40, 38, G, ol);
  // beak
  const tilt = 10 * droop + 4 * fluff;
  p.stroke([[hx + 34, hy + 2], [hx + 138, hy - 8 + tilt * 2.4]], 10, INK);
  // eye
  if (lid > 0.6) p.arc(hx + 14, hy - 6, 10, 7, 20, 160, 6);
  else { p.dot(hx + 14, hy - 8, 12, INK); p.dot(hx + 18, hy - 12, 4.2, "#ffffff"); if (lid > 0.2) p.poly([[hx + 2, hy - 20], [hx + 28, hy - 20], [hx + 28, hy - 20 + 16 * lid], [hx + 2, hy - 20 + 16 * lid]], G, 0); if (lid > 0.2) p.stroke([[hx + 3, hy - 20 + 16 * lid], [hx + 27, hy - 20 + 16 * lid]], 5); }
  // near wing
  if (wing) {
    const ang = wing > 0 ? UP : DOWN, ghost = blade(bx + 16, by - 12, wing > 0 ? UP - 34 : DOWN + 34, 150, 30), near = blade(bx + 16, by - 12, ang, 172, 36);
    p.poly(ghost, "#f4fbf7", 0);
    p.poly(near, "#e2f6ec", ol * 0.8);
    const a = rad(ang);
    for (const k of [0.3, 0.5, 0.7]) p.stroke([[bx + 16 + Math.cos(a) * 172 * k - Math.sin(a) * -10, by - 12 + Math.sin(a) * 172 * k + Math.cos(a) * -10], [bx + 16 + Math.cos(a) * 172 * (k + 0.16) - Math.sin(a) * 14 * (1 - k), by - 12 + Math.sin(a) * 172 * (k + 0.16) + Math.cos(a) * 14 * (1 - k)]], 4, "#9fd9c0");
    for (const r of [120, 150]) p.arc(bx + 16, by - 12, r, r, wing > 0 ? 196 : 128, wing > 0 ? 226 : 158, 5, "#ffffff");
  } else {
    p.ell(bx - 14, by + 6, 62 - 10 * fluff, 24 + 6 * fluff, GD, ol * 0.8, 0, 360, 18);
    // feet
    for (const dx of [-8, 22]) p.stroke([[bx + dx, by + ry - 6], [bx + dx + 2, by + ry + 18]], 6, INK);
  }
};
/** hanging feeder on a 260 x 900 canvas: wire from the top, glass bottle with nectar (level 0..1), red base with a
 *  yellow flower port on the LEFT at (36, 792) */
export const fxFeeder = (p: Pen, level: number) => {
  p.stroke([[130, 0], [130, 470]], 7, INK);
  p.ell(130, 478, 16, 16, null, 7);
  const glass = rrect(66, 500, 194, 760, 26);
  p.poly(glass, "#e9f6fb", 9);
  const y = 752 - 240 * Math.max(0, Math.min(1, level));
  p.clip(glass, () => { p.poly([[60, y], [200, y], [200, 770], [60, 770]], "#e8413c", 0); p.poly([[60, y], [200, y], [200, y + 10], [60, y + 10]], "#ff8a80", 0); });
  p.poly(glass, null, 9);
  p.stroke([[88, 530], [88, 720]], 9, "#ffffff");
  p.poly(rrect(84, 480, 176, 506, 8), "#d6332e", 8);
  p.poly(rrect(30, 752, 230, 822, 22), "#d6332e", 9);
  for (let i = 0; i < 5; i++) { const a = rad(i * 72 - 90); p.ell(36 + 15 * Math.cos(a), 792 + 15 * Math.sin(a), 11, 11, "#ffd84a", 5); }
  p.dot(36, 792, 8, "#7a4b2a");
  p.stroke([[130, 822], [130, 860]], 8, INK); p.poly(rrect(96, 852, 164, 872, 8), "#d6332e", 7);
};

// ---------------- heat ----------------
const softPuff = (p: Pen, x: number, y: number, r: number, a: number) => {
  const g = p.g, gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(255,255,255,${a.toFixed(3)})`); gr.addColorStop(0.55, `rgba(255,255,255,${(a * 0.75).toFixed(3)})`); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
};
/** white steam on a 300 x 400 canvas (soft card): a wavering column of soft puffs that rise, swell and thin out;
 *  t = phase 0..1 (looping), a = strength */
export const fxSteam = (p: Pen, t: number, a = 1) => {
  for (let i = 0; i < 7; i++) {
    const u = (t + i / 7) % 1, x = 150 + (18 + 30 * u) * Math.sin(u * 6.5 + i * 2.4), y = 372 - 318 * u, r = 26 + 50 * u;
    softPuff(p, x, y, r, 0.95 * a * Math.sin(Math.PI * Math.min(1, u * 1.1 + 0.08)) ** 0.9);
  }
};
/** one burst of steam on a 500 x 500 canvas (soft card): a cloud swelling and fading; t = 0..1 */
export const fxSteamBurst = (p: Pen, t: number) => {
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * TAU + 0.4, d = 30 + 150 * (1 - (1 - t) ** 2), r = (76 + 40 * (i % 3)) * (0.6 + 0.6 * t);
    softPuff(p, 250 + d * Math.cos(a), 280 + d * 0.6 * Math.sin(a) - 100 * t, r, 0.95 * (1 - t) ** 1.2 * Math.min(1, t * 7));
  }
  softPuff(p, 250, 290 - 100 * t, 120 * (0.6 + 0.6 * t), 0.95 * (1 - t) ** 1.2 * Math.min(1, t * 7));
};
/** wavy heat lines rising on a 300 x 400 canvas (soft card); t = phase 0..1, a = strength; red = stronger colour
 *  for busy or yellow backgrounds */
export const fxHeat = (p: Pen, t: number, a = 1, red = false) => {
  const g = p.g, outer = red ? "232,52,30" : "255,96,30", inner = red ? "255,196,110" : "255,214,120";
  for (let i = 0; i < 3; i++) {
    const x0 = 70 + i * 80, pts: P2[] = [];
    for (let k = 0; k <= 20; k++) { const v = k / 20; pts.push([x0 + 22 * Math.sin(v * 9 - t * TAU + i * 1.7), 380 - 340 * v]); }
    g.lineCap = "round"; g.lineJoin = "round";
    p.path(pts, false); g.strokeStyle = `rgba(${outer},${(0.95 * a).toFixed(3)})`; g.lineWidth = red ? 24 : 20; g.stroke();
    p.path(pts, false); g.strokeStyle = `rgba(${inner},${(0.95 * a).toFixed(3)})`; g.lineWidth = 7; g.stroke();
  }
};
/** soft orange glow on a 256 x 256 canvas (soft card); a = strength 0..1. Fade it with `a`, never with the card's
 *  gain: gain only darkens the colour, the card stays as opaque as its drawing and shows as a dark blob */
export const fxGlow = (p: Pen, col = "255,140,50", a = 1) => {
  const g = p.g, gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, `rgba(${col},${(0.85 * a).toFixed(3)})`); gr.addColorStop(0.5, `rgba(${col},${(0.35 * a).toFixed(3)})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
};
/** fog inside the fishbowl on a 300 x 300 canvas (soft card; the glass is the circle of radius 142 about the
 *  centre, the collar cuts it off at y 262): fills the glass from the collar up to k (0..1) */
export const fxFog = (p: Pen, k: number) => {
  const g = p.g, top = 262 - 232 * k;
  const inside: P2[] = ellPts(150, 150, 134, 134).filter(([, y]) => y <= 262);
  p.clip(inside, () => {
    const gr = g.createLinearGradient(0, top - 34, 0, top + 26);
    gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(255,255,255,0.9)");
    g.fillStyle = gr; g.fillRect(0, top - 34, 300, 340);
  });
};
/** space heater on a 300 x 420 canvas; glow 0..1 lights the coils */
export const fxHeater = (p: Pen, glow: number) => {
  p.poly(rrect(48, 372, 108, 400, 8), "#4a4d57", 8); p.poly(rrect(192, 372, 252, 400, 8), "#4a4d57", 8);
  p.poly(rrect(34, 50, 266, 380, 28), "#ece7dc", 10);
  p.poly(rrect(60, 78, 240, 300, 14), "#2c2f38", 8);
  const hot = toon.mix("#7d828d", "#ff7a1a", glow), core = toon.mix("#9aa0aa", "#ffe08a", glow);
  for (let i = 0; i < 5; i++) { const y = 108 + i * 41; p.stroke([[78, y], [222, y]], 17, hot); p.stroke([[82, y], [218, y]], 6, core); }
  for (const x of [105, 150, 195]) p.stroke([[x, 84], [x, 296]], 5, "#11131a");
  p.dot(150, 340, 15, INK); p.dot(150, 340, 9, glow > 0.5 ? "#ff5a2a" : "#b9bec7");
  p.arc(150, 30, 60, 18, 180, 360, 9);
};
/** red heart on a 460 x 300 canvas; k = buzz phase (0 or 1): tick marks alternate round it; hum = true adds
 *  vibration arcs on both sides that alternate with k (it hums) */
export const fxHeart = (p: Pen, k: number, hum = false) => {
  const cx = 230, cy = 146, pts: P2[] = [];
  for (let i = 0; i < 60; i++) { const t = (i / 60) * TAU; pts.push([cx + 5.4 * 16 * Math.sin(t) ** 3, cy - 5.4 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); }
  p.poly(pts, "#e2332d", 10);
  p.arc(cx - 34, cy - 28, 26, 22, 190, 260, 9, "#ff9a90");
  // white marks with an ink rim: they have to read on dark blue stripes
  const old = p.ol; p.ol = 5;
  if (hum) for (const r of k ? [134, 186] : [160, 212]) { p.line(ellPts(cx, cy - 6, r, r * 0.8, -30, 30), "#ffffff", 9); p.line(ellPts(cx, cy - 6, r, r * 0.8, 150, 210), "#ffffff", 9); }
  else for (let i = 0; i < 8; i++) { const a = rad(i * 45 + (k ? 22 : 0)), r0 = 110, r1 = 130; p.line([[cx + r0 * Math.cos(a), cy + r0 * 0.95 * Math.sin(a)], [cx + r1 * Math.cos(a), cy + r1 * 0.95 * Math.sin(a)]], "#ffffff", 8); }
  p.ol = old;
};

// ---------------- fry and potato ----------------
const plate = (p: Pen, cx: number, cy: number, rx: number) => { p.ell(cx, cy, rx, rx * 0.2, "#f7f6f1", 8); p.ell(cx, cy - 3, rx * 0.72, rx * 0.12, "#e3e6e8", 0); };
/** one french fry on a plate, its red carton behind it, 420 x 300 canvas; cold 0..1 turns the fries pale blue */
export const fxFry = (p: Pen, cold: number, rim = 0) => {
  const c = (a: string, b: string) => toon.mix(a, b, cold);
  // the carton with the rest of the fries
  for (const [x, h, r] of [[62, 62, -8], [82, 84, -3], [102, 70, 2], [122, 88, 6], [142, 60, 11]] as const) p.poly(rotBox(x, 104, 17, h, r), c("#f0bb2a", "#c3d0e2"), 7);
  p.poly([[40, 96], [164, 96], [150, 214], [54, 214]], "#d6332e", 9);
  p.poly(ellPts(102, 150, 26, 26), "#ffd84a", 0);
  plate(p, 236, 240, 178);
  // the fry: a long golden stick with a browned end and a few grains of salt
  const side: P2[] = [[104, 208], [330, 118], [348, 152], [122, 242]];
  // rim: the fry's whole skin lit up (it is nearly all skin)
  if (rim > 0.05) { const g = p.g; g.lineJoin = "round"; p.path([[104, 208], [330, 118], [354, 124], [372, 158], [348, 152], [122, 242]], true); g.strokeStyle = "#fff06a"; g.lineWidth = 9 + 26 * rim; g.stroke(); }
  p.poly(side, c("#e9b021", "#b9c8dc"), 9);
  p.poly([[104, 208], [330, 118], [337, 131], [111, 221]], c("#ffe06a", "#e6eef8"), 0);
  p.poly([[330, 118], [354, 124], [372, 158], [348, 152]], c("#b97a12", "#8fa2bd"), 9);
  p.poly(side, null, 9);
  for (const [x, y] of [[170, 196], [226, 170], [282, 150], [200, 204], [258, 178]] as const) p.dot(x, y, 3.5, "#ffffff");
};
const rotBox = (x: number, yBase: number, w: number, h: number, deg: number): P2[] => {
  const a = rad(deg), cs = Math.cos(a), sn = Math.sin(a), R = (dx: number, dy: number): P2 => [x + dx * cs - dy * sn, yBase + dx * sn + dy * cs];
  return [R(-w / 2, 0), R(-w / 2, -h), R(w / 2, -h), R(w / 2, 0)];
};
/** a baked potato on a plate, 460 x 360 canvas: an oblong brown potato seen from the side, foil round its lower
 *  half, split on top with the fluffy inside bulging out; butter 0..1 = how far the pat on top has melted */
export const fxPotato = (p: Pen, butter = 0, rim = 0) => {
  plate(p, 230, 320, 214);
  const body: P2[] = [];
  for (let i = 0; i < 56; i++) { const a = (i / 56) * TAU, cx = Math.cos(a), sy = Math.sin(a); body.push([230 + 192 * Math.sign(cx) * Math.abs(cx) ** 0.72, 226 + 90 * Math.sign(sy) * Math.abs(sy) ** 0.82]); }
  // rim: its skin lit up (a thin line round a lot of potato)
  if (rim > 0.05) { const g = p.g; g.lineJoin = "round"; p.path(body, true); g.strokeStyle = "#fff06a"; g.lineWidth = 9 + 26 * rim; g.stroke(); }
  p.poly(body, "#a8672f", 9);
  p.clip(body, () => { p.ell(190, 160, 170, 26, "#c58a4c", 0); for (const [x, y, r] of [[70, 200, 6], [104, 176, 5], [372, 190, 6], [400, 222, 5], [340, 168, 4], [62, 232, 4]] as const) p.ell(x, y, r * 1.5, r, "#6f431c", 0); });
  p.poly(body, null, 9);
  // foil round the lower half, torn zig-zag edge
  const foil: P2[] = [];
  for (let i = 0; i <= 16; i++) foil.push([36 + (388 * i) / 16, 244 + (i % 2 ? -15 : 9)]);
  for (let i = 0; i <= 14; i++) { const a = (Math.PI * i) / 14, cx = Math.cos(a), sy = Math.sin(a); foil.push([230 + 198 * Math.sign(cx) * Math.abs(cx) ** 0.72, 230 + 94 * sy ** 0.82]); }
  p.poly(foil, "#cfd6dd", 9);
  for (const [x0, y0, x1, y1] of [[74, 262, 104, 292], [150, 272, 176, 306], [296, 304, 326, 272], [370, 284, 396, 258], [222, 280, 238, 310]] as const) p.stroke([[x0, y0], [x1, y1]], 5, "#8e99a6");
  // the split: fluffy flesh bulging out of the top
  const fl: [number, number, number][] = [[150, 152, 36], [196, 132, 44], [248, 126, 46], [300, 136, 42], [338, 156, 32]];
  for (const [x, y, r] of fl) p.ell(x, y, r + 9, (r + 9) * 0.86, INK, 0);
  for (const [x, y, r] of fl) p.ell(x, y, r, r * 0.86, "#fbe7a0", 0);
  for (const [x, y, r] of fl) p.ell(x - 6, y - 8, r * 0.55, r * 0.4, "#fff6cf", 0);
  const m = butter;
  p.poly(rrect(206 - 26 * m, 78 + 26 * m, 282 + 26 * m, 118 + 6 * m, 8 + 8 * m), "#ffdf3a", 8);
  p.poly(rrect(214 - 22 * m, 84 + 26 * m, 262, 96 + 22 * m, 5), "#fff3a8", 0);
  if (m > 0.3) { p.stroke([[190, 130], [184, 130 + 36 * m]], 20, INK); p.stroke([[190, 130], [184, 130 + 36 * m]], 10, "#ffdf3a"); }
};
/** a pat of butter on a 220 x 200 canvas; melt 0..1: it slumps and drips */
export const fxButter = (p: Pen, melt: number) => {
  const m = melt;
  if (m > 0.15) { p.stroke([[60, 120], [56, 120 + 60 * m]], 22, INK); p.stroke([[60, 120], [56, 120 + 60 * m]], 12, "#ffe24a"); p.stroke([[160, 120], [166, 120 + 40 * m]], 20, INK); p.stroke([[160, 120], [166, 120 + 40 * m]], 10, "#ffe24a"); }
  p.poly(rrect(40 - 14 * m, 62 + 34 * m, 180 + 14 * m, 130, 12 + 12 * m), "#ffe24a", 9);
  p.poly(rrect(52 - 10 * m, 70 + 34 * m, 150, 86 + 30 * m, 6), "#fff3a8", 0);
};
/** thought bubble with a hamburger on a 460 x 420 canvas (its tail of small bubbles runs to the lower left) */
export const fxThought = (p: Pen) => {
  const blobs: [number, number, number][] = [[150, 170, 92], [250, 130, 104], [340, 180, 88], [300, 240, 84], [190, 244, 86]];
  for (const [x, y, r] of blobs) p.ell(x, y, r + 9, (r + 9) * 0.82, INK, 0);
  for (const [x, y, r] of blobs) p.ell(x, y, r, r * 0.82, "#ffffff", 0);
  p.ell(112, 340, 30, 25, "#ffffff", 8); p.ell(62, 392, 17, 14, "#ffffff", 7);
  burger(p, 246, 196, 0.66, 10);
};
/** frost star for the cold fry on a 200 x 200 canvas */
export const fxFrost = (p: Pen) => {
  for (let i = 0; i < 3; i++) { const a = rad(i * 60 + 30); p.stroke([[100 - 80 * Math.cos(a), 100 - 80 * Math.sin(a)], [100 + 80 * Math.cos(a), 100 + 80 * Math.sin(a)]], 22, INK); }
  for (let i = 0; i < 3; i++) { const a = rad(i * 60 + 30); p.stroke([[100 - 80 * Math.cos(a), 100 - 80 * Math.sin(a)], [100 + 80 * Math.cos(a), 100 + 80 * Math.sin(a)]], 11, "#d8efff"); }
};

// ---------------- the garden table (3D, added to the town place) ----------------
const gingham = () => {
  const cv = document.createElement("canvas"); cv.width = cv.height = 256;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#fbf6ee"; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(214,51,46,0.55)";
  for (let i = 0; i < 4; i++) { g.fillRect(i * 64, 0, 32, 256); g.fillRect(0, i * 64, 256, 32); }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
};
/** a wooden table with a red gingham cloth: top 1.8 x 0.8 m at TABLE_H, centred on TABLE */
export const makeTable = () => {
  const G = new THREE.Group(), V = build.V, [x, , z] = TABLE, W = 0.9, D = 0.4;
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; G.add(m); };
  const cloth = build.lam("hbCloth", () => ({ map: gingham() })), wood = build.lam("hbWood", () => ({ color: "#9a6a3c" }));
  add(build.boxGeo(V(x - W, TABLE_H - 0.05, z - D), V(x + W, TABLE_H, z + D), 0.32), cloth);
  add(build.boxGeo(V(x - W - 0.012, TABLE_H - 0.2, z - D - 0.012), V(x + W + 0.012, TABLE_H - 0.045, z + D + 0.012), 0.32), cloth); // the cloth hangs over the edge
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(build.boxGeo(V(x + sx * (W - 0.1) - 0.04, 0, z + sz * (D - 0.08) - 0.04), V(x + sx * (W - 0.1) + 0.04, TABLE_H - 0.05, z + sz * (D - 0.08) + 0.04)), wood);
  return G;
};
