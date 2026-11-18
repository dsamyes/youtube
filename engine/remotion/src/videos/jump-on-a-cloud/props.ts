// This video's own drawings: 2D cards drawn with the kit's Pen on a canvas of the stated size and placed with fx().
// No letters anywhere: numbers on the weight, the tag and the inch scale only.
import { Pen, INK, P2, toon, hash } from "../../toon/kit";
const { ellPts, rrect, curve } = toon;
export const RED = "#e8452f", BLUE = "#2f8cf0", WATER = "#59b8f2", WATER_D = "#2f8cd8";
const IRON = "#4d5666", STEEL = "#c9d2e2";

const numberOn = (p: Pen, text: string, x: number, y: number, size: number, fill = "#ffffff", ink = true) => {
  const g = p.g; g.font = `900 ${size}px "Arial Black", Arial, Helvetica, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  if (ink) { g.lineJoin = "round"; g.lineWidth = size * 0.16; g.strokeStyle = INK; g.strokeText(text, x, y); }
  g.fillStyle = fill; g.fillText(text, x, y);
};

// ---------------- the fat cloud, 1000 x 600 ----------------
// back lobes (the rim behind someone who sinks in) and front lobes (they hide him); belly flat at y 480
type Lobe = [number, number, number];
const BACK: Lobe[] = [[340, 250, 150], [520, 200, 170], [690, 270, 140]];
const FRONT: Lobe[] = [[200, 360, 130], [820, 370, 110], [430, 330, 150], [610, 320, 150], [330, 400, 120], [680, 400, 120]];
const PAL = { day: ["#ffffff", "#c9dcf2"], dark: ["#6f7689", "#4a5064"], dusk: ["#8d8fa6", "#5d5f7a"] } as const;
export type CloudTone = keyof typeof PAL;
/** part: 0 = whole cloud, 1 = back lobes only, 2 = front lobes and belly only; face: 0 none, 1 content (eyes shut, smile) */
export const fxFat = (p: Pen, part = 0, tone: CloudTone = "day", face = 0) => {
  const [fill, shade] = PAL[tone];
  const lobes = (ls: Lobe[], base: boolean) => {
    for (const [x, y, r] of ls) p.dot(x, y, r + 13, INK);
    if (base) p.poly(rrect(110, 372, 900, 492, 56), INK, 0);
    for (const [x, y, r] of ls) p.dot(x, y, r, fill);
    if (base) p.poly(rrect(123, 385, 887, 479, 46), fill, 0);
    if (base) p.clip(rrect(123, 385, 887, 479, 46), () => p.poly([[110, 446], [900, 446], [900, 492], [110, 492]], shade, 0));
  };
  if (part !== 2) lobes(BACK, false);
  if (part !== 1) lobes(FRONT, true);
  if (face && part !== 1) {
    p.arc(430, 372, 30, 22, 200, 340, 11); p.arc(590, 372, 30, 22, 200, 340, 11);
    p.arc(510, 400, 46, 30, 20, 160, 11);
    p.ell(380, 410, 26, 14, "#f6b7c4", 0); p.ell(640, 410, 26, 14, "#f6b7c4", 0);
  }
};
/** a grey wisp, 400 x 120 */
export const fxWisp = (p: Pen, tone = 0) => {
  const col = tone === 2 ? "rgba(255,255,255,0.55)" : tone ? "rgba(255,255,255,0.9)" : "rgba(176,196,222,0.85)";
  p.ell(200, 60, 180, 30, col, 0); p.ell(130, 48, 70, 30, col, 0); p.ell(270, 66, 90, 34, col, 0);
};
/** a speed streak, 40 x 400 */
export const fxStreak = (p: Pen, tone = 0) => p.poly([[20, 6], [30, 394], [10, 394]], tone ? "rgba(255,255,255,0.9)" : "rgba(150,176,210,0.8)", 0);
/** the inside of the cloud: plain white, 64 x 64 */
export const fxWhite = (p: Pen) => { p.g.fillStyle = "#f2f6fb"; p.g.fillRect(0, 0, 64, 64); };

// ---------------- the hot-air balloon, 600 x 1040: envelope, ropes and the basket's back; the basket's front ----------------
const ENV = (): P2[] => [...ellPts(300, 290, 262, 270, 150, 390, 0, 40), [352, 636], [248, 636]];
export const fxBalloon = (p: Pen) => {
  const env = ENV();
  for (const [a, b] of [[252, 636], [348, 636]] as const) p.stroke([[a, b], [a < 300 ? 222 : 378, 884]], 7);
  p.poly(rrect(212, 878, 388, 1024, 14), "#8a5a2c", 11);
  p.poly(env, "#f4c531", 13);
  p.clip(env, () => {
    for (let i = 0; i < 4; i++) { const x0 = 38 + i * 150, k = (x: number): P2[] => curve([x, 20], [300 + (x - 300) * 1.08, 300], [300 + (x - 300) * 0.16, 640], 14); p.poly([...k(x0), ...k(x0 + 75).reverse()], RED, 0); }
    p.poly([[0, 560], [600, 560], [600, 650], [0, 650]], "rgba(60,30,10,0.16)", 0);
  });
  p.poly(env, null, 13);
  p.poly(rrect(244, 628, 356, 650, 6), "#7c8798", 8);
};
export const fxBasket = (p: Pen) => {
  const b = rrect(212, 896, 388, 1024, 14);
  p.poly(b, "#c98d47", 11);
  p.clip(b, () => { for (let y = 918; y < 1024; y += 24) p.stroke([[212, y], [388, y]], 5, "#8a5a2c"); for (let x = 240; x < 388; x += 30) p.stroke([[x, 896], [x, 1024]], 4, "#a8712f"); });
  p.poly(b, null, 11);
  p.poly(rrect(204, 882, 396, 908, 10), "#e0a85c", 10);
};

// ---------------- the parachute ----------------
/** the harness on his chest, 200 x 200 (centre = the middle of the chest) */
export const fxHarness = (p: Pen) => {
  for (const s of [-1, 1]) { p.stroke([[100 + s * 44, 8], [100 + s * 30, 192]], 30); p.stroke([[100 + s * 44, 8], [100 + s * 30, 192]], 16, RED); }
  p.stroke([[58, 104], [142, 104]], 28); p.stroke([[58, 104], [142, 104]], 14, RED);
  p.poly(rrect(84, 88, 116, 120, 6), STEEL, 7);
};
/** the pack on his back, 300 x 300 (seen from the front: it shows on both sides of the body) */
export const fxPack = (p: Pen) => { p.poly(rrect(40, 30, 260, 270, 46), "#b9342a", 12); p.stroke([[70, 150], [230, 150]], 8, "#7c1f18"); };
/** the open canopy, 800 x 700; the lines meet at (400, 690) */
export const fxChute = (p: Pen) => {
  const n = 6, y0 = 330, xs = Array.from({ length: n + 1 }, (_, i) => 40 + (720 * i) / n);
  for (const x of xs) p.stroke([[x, y0], [400, 690]], 6);
  const dome: P2[] = [...ellPts(400, y0, 360, 300, 180, 360, 0, 40)];
  for (let i = n - 1; i >= 0; i--) dome.push(...curve([xs[i + 1], y0], [(xs[i] + xs[i + 1]) / 2, y0 + 6], [xs[i], y0], 6).slice(1).map(([x, y], j, a): P2 => [x, y - 44 * Math.sin((Math.PI * (j + 1)) / a.length)]));
  p.poly(dome, "#ffffff", 13);
  p.clip(dome, () => { for (let i = 0; i < n; i += 2) p.poly([[xs[i], y0 + 10], [400 + (xs[i] - 400) * 0.1, -10], [400 + (xs[i + 1] - 400) * 0.1, -10], [xs[i + 1], y0 + 10]], RED, 0); });
  p.poly(dome, null, 13);
};

// ---------------- weights and elephants ----------------
/** the big iron weight marked 500, 640 x 560 */
export const fxTons = (p: Pen) => {
  p.arc(320, 120, 86, 76, 180, 360, 70, INK); p.arc(320, 120, 86, 76, 180, 360, 40, "#7c8798");
  const body: P2[] = [[150, 130], [490, 130], [610, 530], [30, 530]];
  p.poly(body, IRON, 20);
  p.clip(body, () => p.poly([[110, 130], [190, 130], [110, 530], [10, 530]], "#6b7688", 0));
  p.poly(body, null, 20);
  numberOn(p, "500", 320, 350, 170);
};
/** an elephant, 300 x 240, facing left; ghost = pale and see-through */
export const fxElephant = (p: Pen, ghost = false) => {
  const g = p.g; g.save(); if (ghost) g.globalAlpha = 0.4;
  const body = ghost ? "#dfe8f4" : "#9aa3b5", dark = ghost ? "#c3cfe0" : "#7f899d";
  for (const x of [112, 150, 208, 244]) p.poly(rrect(x - 17, 150, x + 17, 228, 8), x === 150 || x === 244 ? dark : body, 9);
  p.ell(178, 118, 92, 66, body, 10);
  p.stroke(curve([262, 96], [284, 120], [276, 150], 8), 7);
  const trunk = curve([62, 112], [34, 170], [58, 214], 10);
  p.stroke(trunk, 38); p.stroke(trunk, 22, body);
  p.ell(86, 96, 50, 48, body, 10);
  p.ell(122, 100, 30, 44, dark, 9);
  p.dot(66, 88, 7); p.poly([[70, 132], [50, 150], [78, 140]], "#ffffff", 5);
  g.restore();
};

// ---------------- the bed ----------------
export const fxPillow = (p: Pen) => { p.poly(rrect(20, 40, 280, 170, 50), "#eaf2ff", 11); p.arc(150, 105, 90, 36, 200, 340, 7, "#b9cdea"); };
export const fxBlanket = (p: Pen) => {
  const b: P2[] = [[30, 40], [470, 20], [490, 200], [380, 240], [240, 222], [110, 244], [14, 204]];
  p.poly(b, "#e8452f", 12);
  p.clip(b, () => { for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) p.poly([[i * 84, j * 64], [i * 84 + 84, j * 64], [i * 84 + 84, j * 64 + 64], [i * 84, j * 64 + 64]], "#ffd22e", 0); });
  p.poly(b, null, 12);
  p.stroke([[34, 62], [468, 44]], 12, "#ffffff");
};

// ---------------- the scale of things ----------------
/** a tiny house and a tree on a green hill, 600 x 300 */
export const fxLand = (p: Pen) => {
  p.poly([[0, 300], [0, 236], ...curve([0, 236], [300, 176], [600, 236], 16), [600, 300]], "#6aab4f", 10);
  p.poly(rrect(250, 150, 330, 218, 4), "#f1e3c2", 8); p.poly([[238, 154], [290, 104], [342, 154]], "#c8523a", 8); p.poly(rrect(280, 180, 300, 218, 2), "#7d4521", 5);
  p.poly(rrect(392, 170, 404, 214, 2), "#7d4521", 6); p.ell(398, 146, 34, 38, "#3f8f3a", 8);
};
/** dashed frame the size of a fridge, 300 x 520 */
export const fxDashFrame = (p: Pen) => {
  const g = p.g; g.save(); g.setLineDash([34, 22]); g.lineWidth = 14; g.strokeStyle = RED; g.lineJoin = "round";
  g.strokeRect(22, 22, 256, 476); g.restore();
};
/** a kitchen fridge, 460 x 520 (the body spans x 160..440); open 0..1 swings the door to the left and shows the empty inside */
export const fxFridge = (p: Pen, open = 0) => {
  const body = rrect(160, 16, 440, 504, 22);
  p.poly(body, "#f4f6fa", 12);
  if (open > 0.02) {
    const inner = rrect(178, 150, 422, 486, 10);
    p.poly(inner, "#bfe0f7", 8);
    p.clip(inner, () => { p.poly([[178, 150], [422, 150], [422, 196], [178, 196]], "#a7cdea", 0); });
    for (const y of [262, 372]) p.stroke([[182, y], [418, y]], 8, "#8fa5bd");
    // the door is hinged on the left: first it foreshortens over the opening, then it swings out to the left
    const a = Math.PI * open, w = 262 * Math.cos(a), sk = 40 * Math.sin(a) * (w < 0 ? 1 : 0.4);
    p.poly([[178, 150], [178 + w, 150 - sk], [178 + w, 486 + sk], [178, 486]], w < 0 ? "#dfe6ef" : "#f4f6fa", 11);
    if (open > 0.75) p.stroke([[178 + w + 22, 240], [178 + w + 22, 330]], 12, "#8e98ac");
  } else {
    p.stroke([[420, 180], [420, 280]], 16); p.stroke([[420, 180], [420, 280]], 7, "#8e98ac");
  }
  p.stroke([[164, 138], [436, 138]], 9);
  p.stroke([[420, 56], [420, 106]], 16); p.stroke([[420, 56], [420, 106]], 7, "#8e98ac");
  p.clip(body, () => p.poly([[160, 16], [196, 16], [196, 136], [160, 136]], "#dfe6ef", 0));
  p.poly(body, null, 12);
};
/** a water drop, 100 x 140 */
export const fxDrop = (p: Pen) => { const d: P2[] = [[50, 10], ...ellPts(50, 88, 36, 40, -40, 220, 0, 16)]; p.poly(d, WATER, 9); p.arc(40, 92, 16, 20, 100, 170, 7, "#ffffff"); };
/** a round cloud droplet, 300 x 300; face 0 none, 1 asleep, 2 awake and pleased */
export const fxDroplet = (p: Pen, face = 0) => {
  p.ell(150, 150, 128, 128, WATER, face ? 13 : 16);
  p.arc(150, 150, 96, 96, 200, 250, face ? 16 : 22, "#d8f1ff");
  if (face === 1) { p.arc(108, 150, 20, 14, 20, 160, 9); p.arc(192, 150, 20, 14, 20, 160, 9); p.ell(150, 196, 10, 12, INK, 0); }
  if (face === 2) { p.dot(108, 144, 11); p.dot(192, 144, 11); p.arc(150, 176, 34, 24, 20, 160, 9); }
};
/** an inch scale, 160 x 700: ticks every half inch, the numbers 0, 1, 2 (top to bottom) */
export const fxScale = (p: Pen) => {
  p.poly(rrect(40, 12, 150, 688, 12), "#f3d27a", 11);
  for (let i = 0; i <= 8; i++) { const y = 50 + i * 75; p.stroke([[44, y], [i % 4 === 0 ? 96 : i % 2 === 0 ? 82 : 66, y]], i % 4 === 0 ? 9 : 6); }
  ["0", "1", "2"].forEach((t, i) => numberOn(p, t, 120, 50 + i * 300, 54, INK, false));
};
/** a glass measuring cup, 320 x 300, handle on the right; level 0..1 of blue water */
export const fxCup = (p: Pen, level = 1) => {
  const glass: P2[] = [[40, 40], [240, 40], [222, 270], [58, 270]];
  p.stroke(curve([236, 90], [316, 150], [228, 220], 10), 34); p.stroke(curve([236, 90], [316, 150], [228, 220], 10), 16, "#eaf6ff");
  p.poly(glass, "#eaf6ff", 12);
  if (level > 0.03) p.clip(glass, () => p.poly([[0, 270 - 205 * level], [320, 270 - 205 * level], [320, 300], [0, 300]], WATER, 0));
  for (let i = 0; i < 4; i++) p.stroke([[60, 96 + i * 44], [i % 2 ? 96 : 116, 96 + i * 44]], 7, RED);
  p.poly(glass, null, 12);
  p.stroke([[30, 40], [250, 40]], 14);
};
/** rain streaks, 600 x 900, looping: phase 0..1 */
export const fxRain = (p: Pen, phase: number, n = 46) => {
  for (let i = 0; i < n; i++) {
    const x = 20 + 560 * hash(i, 71), y = ((hash(i, 72) + phase) % 1) * 1000 - 80, len = 70 + 50 * hash(i, 73);
    p.stroke([[x, y], [x - 8, y + len]], 6, "rgba(40,60,110,0.5)"); p.stroke([[x, y], [x - 8, y + len]], 3.4, "#cfe9ff");
  }
};
/** an umbrella, 500 x 520, open 0..1; the handle's grip is at (250, 500) */
export const fxUmbrella = (p: Pen, open = 1) => {
  p.stroke([[250, 96], [250, 492]], 13); p.stroke([[250, 96], [250, 492]], 5, "#7d4521");
  p.stroke(curve([250, 488], [268, 520], [290, 492], 8), 12);
  const w = 30 + 200 * open, h = 60 + 110 * open, y0 = 60 + h;
  const dome: P2[] = [...ellPts(250, y0, w, h, 180, 360, 0, 30)];
  for (let i = 3; i >= 0; i--) { const xa = 250 - w + (2 * w * (i + 1)) / 4, xb = 250 - w + (2 * w * i) / 4; dome.push(...curve([xa, y0], [(xa + xb) / 2, y0 - 26 * open], [xb, y0], 6).slice(1)); }
  p.poly(dome, RED, 12);
  p.clip(dome, () => { for (const k of [-0.5, 0.5]) p.stroke([[250, y0 - h], [250 + k * w, y0]], 7, "#b9342a"); });
  p.poly(dome, null, 12);
  p.poly(rrect(244, 36, 256, 62, 3), INK, 0);
};
