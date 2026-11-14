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
  // far wing (behind the body) when hovering
  if (wing) {
    const up = wing > 0;
    const far: P2[] = up ? [[bx - 6, by - 30], [bx - 70, by - 140], [bx - 30, by - 150], [bx + 26, by - 44]] : [[bx - 6, by - 10], [bx - 96, by + 76], [bx - 60, by + 96], [bx + 22, by + 4]];
    p.poly(far, "#cfeee0", ol * 0.8);
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
  else { p.dot(hx + 14, hy - 8, 10, INK); p.dot(hx + 17, hy - 11, 3.4, "#ffffff"); if (lid > 0.2) p.poly([[hx + 2, hy - 20], [hx + 28, hy - 20], [hx + 28, hy - 20 + 16 * lid], [hx + 2, hy - 20 + 16 * lid]], G, 0); if (lid > 0.2) p.stroke([[hx + 3, hy - 20 + 16 * lid], [hx + 27, hy - 20 + 16 * lid]], 5); }
  // near wing
  if (wing) {
    const up = wing > 0;
    const near: P2[] = up ? [[bx + 6, by - 20], [bx - 36, by - 152], [bx + 14, by - 164], [bx + 50, by - 34]] : [[bx + 4, by - 4], [bx - 62, by + 98], [bx - 18, by + 118], [bx + 44, by + 10]];
    p.poly(near, "#e4f7ee", ol * 0.8);
    for (const k of [0.35, 0.6, 0.85]) p.stroke([[near[0][0] + (near[1][0] - near[0][0]) * k + 16, near[0][1] + (near[1][1] - near[0][1]) * k], [near[3][0] + (near[2][0] - near[3][0]) * k - 10, near[3][1] + (near[2][1] - near[3][1]) * k]], 4, "#9fd9c0");
    // blur arcs between the two wing positions
    for (const r of [96, 128]) p.arc(bx + 6, by - 14, r, r, up ? 205 : 110, up ? 240 : 140, 5, "#ffffff");
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
/** white steam on a 300 x 400 canvas (soft card): puffs rising and thinning; t = phase 0..1 (looping), a = strength */
export const fxSteam = (p: Pen, t: number, a = 1) => {
  for (let i = 0; i < 5; i++) {
    const u = (t + i / 5) % 1, x = 150 + 44 * Math.sin(u * 5 + i * 2.1), y = 360 - 300 * u, r = 34 + 46 * u;
    p.ell(x, y, r, r * 0.9, `rgba(255,255,255,${(0.85 * a * Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 0.8).toFixed(3)})`, 0);
  }
};
/** one burst of steam on a 500 x 500 canvas (soft card): a cloud swelling and fading; t = 0..1 */
export const fxSteamBurst = (p: Pen, t: number) => {
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + 0.4, d = 40 + 150 * (1 - (1 - t) ** 2), r = (70 + 40 * (i % 3)) * (0.6 + 0.6 * t);
    p.ell(250 + d * Math.cos(a), 270 + d * 0.6 * Math.sin(a) - 90 * t, r, r * 0.85, `rgba(255,255,255,${(0.9 * (1 - t) ** 1.3).toFixed(3)})`, 0);
  }
};
/** wavy heat lines rising on a 300 x 400 canvas (soft card); t = phase 0..1, a = strength */
export const fxHeat = (p: Pen, t: number, a = 1) => {
  const g = p.g;
  for (let i = 0; i < 3; i++) {
    const x0 = 70 + i * 80, pts: P2[] = [];
    for (let k = 0; k <= 20; k++) { const v = k / 20; pts.push([x0 + 22 * Math.sin(v * 9 - t * TAU + i * 1.7), 380 - 340 * v]); }
    g.lineCap = "round"; g.lineJoin = "round";
    p.path(pts, false); g.strokeStyle = `rgba(255,110,40,${(0.9 * a).toFixed(3)})`; g.lineWidth = 16; g.stroke();
    p.path(pts, false); g.strokeStyle = `rgba(255,214,120,${(0.9 * a).toFixed(3)})`; g.lineWidth = 6; g.stroke();
  }
};
/** soft orange glow on a 256 x 256 canvas (soft card, HDR with gain) */
export const fxGlow = (p: Pen, col = "255,140,50") => {
  const g = p.g, gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, `rgba(${col},0.85)`); gr.addColorStop(0.5, `rgba(${col},0.35)`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
};
/** fog inside the fishbowl on a 300 x 300 canvas (soft card): fills the glass from the bottom up to k (0..1) */
export const fxFog = (p: Pen, k: number) => {
  const g = p.g, top = 290 - 250 * k;
  p.clip(ellPts(150, 150, 142, 142), () => {
    const gr = g.createLinearGradient(0, top - 40, 0, top + 30);
    gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(255,255,255,0.93)");
    g.fillStyle = gr; g.fillRect(0, top - 40, 300, 340);
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
/** red heart on a 260 x 260 canvas; k = buzz phase (0 or 1): tick marks alternate around it */
export const fxHeart = (p: Pen, k: number) => {
  const pts: P2[] = [];
  for (let i = 0; i < 60; i++) { const t = (i / 60) * TAU; pts.push([130 + 5.4 * 16 * Math.sin(t) ** 3, 124 - 5.4 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); }
  p.poly(pts, "#e2332d", 10);
  p.arc(96, 96, 26, 22, 190, 260, 9, "#ff9a90");
  for (let i = 0; i < 8; i++) { const a = rad(i * 45 + (k ? 22 : 0)), r0 = 112, r1 = 126; p.stroke([[130 + r0 * Math.cos(a), 124 + r0 * 0.95 * Math.sin(a)], [130 + r1 * Math.cos(a), 124 + r1 * 0.95 * Math.sin(a)]], 7); }
};

// ---------------- fry and potato ----------------
const plate = (p: Pen, cx: number, cy: number, rx: number) => { p.ell(cx, cy, rx, rx * 0.2, "#f7f6f1", 8); p.ell(cx, cy - 3, rx * 0.72, rx * 0.12, "#e3e6e8", 0); };
/** one french fry on a plate, 420 x 300 canvas; cold 0..1 turns it pale blue */
export const fxFry = (p: Pen, cold: number) => {
  plate(p, 210, 236, 190);
  const c = (a: string, b: string) => toon.mix(a, b, cold);
  const side: P2[] = [[76, 196], [318, 96], [338, 132], [96, 232]];
  p.poly(side, c("#e9b021", "#b9c8dc"), 9);
  p.poly([[76, 196], [318, 96], [326, 110], [84, 210]], c("#ffd95a", "#e1eaf5"), 0);
  p.poly([[318, 96], [344, 104], [362, 140], [338, 132]], c("#c98f14", "#95a8c2"), 9);
  p.poly(side, null, 9);
  if (cold > 0.5) for (const [x, y] of [[150, 150], [250, 110]] as const) for (let i = 0; i < 3; i++) { const a = rad(i * 60); p.stroke([[x - 13 * Math.cos(a), y - 13 * Math.sin(a)], [x + 13 * Math.cos(a), y + 13 * Math.sin(a)]], 4, "#ffffff"); }
};
/** a baked potato in foil on a plate, split open, 460 x 360 canvas; butter 0..1 = how far the pat has melted;
 *  rim 0..1 lights its outline */
export const fxPotato = (p: Pen, butter = 0) => {
  plate(p, 230, 306, 212);
  p.poly(ellPts(230, 232, 186, 92), "#c7d0d9", 9);
  for (const [x0, y0, x1, y1] of [[70, 250, 110, 290], [150, 290, 180, 318], [300, 300, 330, 276], [366, 262, 396, 240]] as const) p.stroke([[x0, y0], [x1, y1]], 5, "#8e99a6");
  const skin = ellPts(230, 204, 168, 92);
  p.poly(skin, "#a9713a", 9);
  p.clip(skin, () => p.ell(200, 150, 150, 40, "#c08a4e", 0));
  p.poly(skin, null, 9);
  const open: P2[] = [...curve([98, 190], [230, 118], [362, 190], 14), ...curve([362, 190], [230, 236], [98, 190], 14)];
  p.poly(open, "#f7e08c", 8);
  p.clip(open, () => p.ell(230, 196, 120, 22, "#fff3bf", 0));
  const m = butter;
  p.poly(rrect(196 - 22 * m, 150 + 20 * m, 264 + 22 * m, 190 + 6 * m, 8 + 10 * m), "#ffe24a", 7);
  if (m > 0.3) p.ell(286, 196, 16 * m, 9 * m, "#ffe24a", 6);
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
