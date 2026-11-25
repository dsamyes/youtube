// This video's own drawings: 2D cards drawn with the kit's Pen on a canvas of the stated size and placed with fx().
import { Pen, INK, P2, toon, hash } from "../../toon/kit";

const { rad, ellPts, rrect, curve } = toon;
const WHITE = "#f4f6fa", NAVY = "#39527f", RED = "#e0352c", STEEL = "#c9d2e2", STEEL_D = "#8e98ac", SKINC = "#ffe2c2", YEL = "#ffd84a";

/** white number with an ink rim (numbers and signs only) */
const numberOn = (p: Pen, text: string, x: number, y: number, size: number, fill = "#ffffff") => {
  const g = p.g; g.font = `900 ${size}px "Arial Black", Arial, Helvetica, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.lineWidth = size * 0.16; g.strokeStyle = INK; g.strokeText(text, x, y); g.fillStyle = fill; g.fillText(text, x, y);
};
/** a white tag with a yellow number, 520 x 220 */
export const fxTag = (p: Pen, text: string) => { p.poly(rrect(10, 14, 510, 206, 40), "#ffffff", 13); numberOn(p, text, 260, 114, 118, YEL); };
/** mix two #rrggbb colours */
const mixCol = (a: string, b: string, k: number) => {
  const h = (s: string, i: number) => parseInt(s.slice(1 + 2 * i, 3 + 2 * i), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(h(a, i) + (h(b, i) - h(a, i)) * k).toString(16).padStart(2, "0")).join("");
};

// ---------------- sky ----------------
/** a hard-edged white cloud, 600 x 300 */
export const fxCloud = (p: Pen, seed: number) => {
  const blobs: [number, number, number][] = [[150, 190, 80], [250, 150, 105], [360, 160, 95], [450, 195, 70], [300, 210, 90]];
  for (const [x, y, r] of blobs) p.ell(x + ((seed * 37) % 20) - 10, y, r, r * 0.8, "#ffffff", 0);
  p.ell(300, 235, 230, 40, "#ffffff", 0);
  p.ell(300, 246, 200, 22, "#dbe9f8", 0);
};
/** a friendly afternoon sun, 400 x 400 */
export const fxSun = (p: Pen) => {
  for (let i = 0; i < 12; i++) { const a = rad(i * 30), b = rad(i * 30 + 15), c = rad(i * 30 - 15); p.poly([[200 + 190 * Math.cos(a), 200 + 190 * Math.sin(a)], [200 + 128 * Math.cos(b), 200 + 128 * Math.sin(b)], [200 + 128 * Math.cos(c), 200 + 128 * Math.sin(c)]], "#ffcf3f", 8); }
  p.ell(200, 200, 132, 132, "#ffb02e", 11);
  p.arc(160, 186, 16, 14, 190, 350, 9); p.arc(240, 186, 16, 14, 190, 350, 9);
  p.arc(200, 224, 44, 34, 20, 160, 9);
};
/** the engine's exhaust, 400 x 120: two white streaks from the right edge to the left; len 0..1, ph = wobble phase */
export const fxExhaust = (p: Pen, len: number, ph: number) => {
  if (len <= 0.02) return;
  for (const [y, k] of [[42, 1], [84, 0.8]] as const) {
    const L = 370 * len * k, pts: P2[] = [];
    for (let i = 0; i <= 10; i++) pts.push([392 - (L * i) / 10, y + 7 * Math.sin(i * 1.1 + ph * 1.57 + y) * (i / 10)]);
    p.line(pts, "#ffffff", 15 * (0.5 + 0.5 * len));
  }
};
/** a puff of smoke, 300 x 300; u 0..1 grows and thins out; dark = black engine smoke */
export const fxSmoke = (p: Pen, u: number, dark = true) => {
  const s = Math.sin(Math.PI * Math.min(1, u * 1.05)) ** 0.5, col = dark ? "#3b3a46" : "#b9bfcc", hi = dark ? "#5a5968" : "#dfe4ec";
  const blobs: [number, number, number][] = [[150, 160, 78], [96, 150, 56], [204, 140, 60], [150, 100, 52], [118, 204, 46], [196, 200, 48]];
  for (const [x, y, r] of blobs) p.ell(150 + (x - 150) * (0.6 + 0.6 * u), 150 + (y - 150) * (0.6 + 0.6 * u), (r + 8) * s, (r + 8) * s, INK, 0);
  for (const [x, y, r] of blobs) p.ell(150 + (x - 150) * (0.6 + 0.6 * u), 150 + (y - 150) * (0.6 + 0.6 * u), r * s, r * s, col, 0);
  p.ell(132, 132, 34 * s, 28 * s, hi, 0);
};
/** the land far below, 1400 x 220 */
export const fxLand = (p: Pen) => {
  p.poly([[0, 220], [0, 120], ...curve([0, 120], [220, 40], [470, 120], 10), ...curve([470, 120], [760, 30], [1020, 124], 10), ...curve([1020, 124], [1230, 60], [1400, 110], 8), [1400, 220]], "#6aab4f", 10);
  for (const [x, y] of [[250, 96], [320, 110], [830, 92], [1180, 104]] as const) { p.poly([[x, y + 34], [x, y], [x + 44, y], [x + 44, y + 34]], "#f0d9a8", 6); p.poly([[x - 8, y + 4], [x + 22, y - 24], [x + 52, y + 4]], "#c9553f", 6); }
  for (const [x, y] of [[560, 118], [610, 124], [990, 120]] as const) { p.poly([[x, y + 10], [x + 14, y - 40], [x + 28, y + 10]], "#3f8a45", 6); }
};
/** a dashed upright line with n ticks counted from the bottom (of 7), 200 x 1400 */
export const fxRuler = (p: Pen, n: number) => {
  for (let y = 20; y < 1380; y += 56) p.line([[100, y], [100, y + 28]], "#ffffff", 12);
  for (let i = 0; i < n; i++) { const y = 1380 - (i + 0.5) * (1360 / 7) - 90; p.line([[56, y], [144, y]], YEL, 16); }
};
/** red cross, 300 x 300 */
export const fxCross = (p: Pen) => { p.line([[60, 60], [240, 240]], RED, 44); p.line([[240, 60], [60, 240]], RED, 44); };
/** dashed arrow pointing down, 240 x 700 */
export const fxDashArrow = (p: Pen) => {
  for (let y = 20; y < 480; y += 100) p.line([[120, y], [120, y + 56]], "#ffffff", 26);
  p.poly([[40, 500], [200, 500], [120, 680]], "#ffffff", 12);
};
/** thought bubble with a falling rock, 460 x 460 */
export const fxRockThought = (p: Pen) => {
  const blobs: [number, number, number][] = [[150, 170, 92], [250, 130, 104], [340, 180, 88], [300, 240, 84], [190, 244, 86]];
  for (const [x, y, r] of blobs) p.ell(x, y, r + 9, (r + 9) * 0.82, INK, 0);
  for (const [x, y, r] of blobs) p.ell(x, y, r, r * 0.82, "#ffffff", 0);
  p.ell(112, 340, 30, 25, "#ffffff", 8); p.ell(62, 392, 17, 14, "#ffffff", 7);
  for (const x of [200, 245, 290]) p.stroke([[x, 76], [x, 136]], 9, "#9aa3b2");
  p.poly([[180, 190], [214, 150], [282, 146], [320, 186], [306, 242], [232, 258], [188, 236]], "#8b8f9c", 10);
  p.stroke([[214, 150], [240, 196], [306, 242]], 5); p.stroke([[240, 196], [188, 236]], 5);
};
/** a lightbulb, 300 x 400 */
export const fxBulb = (p: Pen) => {
  for (const a of [-150, -120, -90, -60, -30]) p.stroke([[150 + 150 * Math.cos(rad(a)), 160 + 150 * Math.sin(rad(a))], [150 + 184 * Math.cos(rad(a)), 160 + 184 * Math.sin(rad(a))]], 10, YEL);
  p.poly([...ellPts(150, 160, 104, 104, 130, 410), [186, 300], [114, 300]], "#ffe95c", 11);
  p.poly(rrect(112, 296, 188, 356, 10), STEEL, 10); p.stroke([[116, 318], [184, 318]], 5); p.stroke([[116, 338], [184, 338]], 5);
};
/** a little heart, 200 x 200 */
export const fxHeart = (p: Pen) => p.poly([[100, 176], [24, 96], ...ellPts(62, 70, 40, 40, 150, 350), ...ellPts(138, 70, 40, 40, 190, 390), [176, 96]], "#ff5a6e", 10);

// ---------------- the slope, 1400 x 1500: starts at pixel (40, 120) and falls to the right by `deg` degrees.
// air 0 = a green hill with a road on it, 1 = a pale wedge of air; in between they blend ----------------
export const fxSlope = (p: Pen, deg: number, air: number) => {
  const y1 = 120 + 1320 * Math.tan(rad(deg)), body: P2[] = [[40, 120], [1360, y1], [1360, 1500], [40, 1500]];
  p.poly(body, mixCol("#6aab4f", "#cfe9ff", air), 0);
  p.clip(body, () => {
    if (air < 0.5) {
      for (let i = 0; i < 26; i++) { const x = 90 + hash(i, 5) * 1220, y = 120 + (x - 40) * Math.tan(rad(deg)) + 90 + hash(i, 6) * 900; p.stroke([[x, y], [x + 8, y - 26], [x + 18, y]], 6, mixCol("#4f9440", "#cfe9ff", air * 2)); }
    } else {
      for (let i = 0; i < 16; i++) { const x = 120 + hash(i, 7) * 1160, y = 120 + (x - 40) * Math.tan(rad(deg)) + 110 + hash(i, 8) * 800; p.arc(x, y, 40, 26, 160, 420, 9, mixCol("#cfe9ff", "#ffffff", (air - 0.5) * 2)); p.arc(x + 20, y, 16, 11, 0, 300, 8, mixCol("#cfe9ff", "#ffffff", (air - 0.5) * 2)); }
    }
  });
  if (air < 0.5) { p.poly(body, null, 12); p.line([[40, 120], [1360, y1]], mixCol("#8b8f9c", "#6aab4f", air * 2), 20); }
  else { const n = 34; for (let i = 0; i < n; i += 2) p.stroke([[40 + (1320 * i) / n, 120 + ((y1 - 120) * i) / n], [40 + (1320 * (i + 1)) / n, 120 + ((y1 - 120) * (i + 1)) / n]], 13, mixCol("#cfe9ff", "#4a8fe0", (air - 0.5) * 2)); }
};
/** a red bicycle from the side, heading right, 500 x 340; ph 0..1 = wheel turn */
export const fxBike = (p: Pen, ph: number) => {
  const wheel = (cx: number) => {
    p.ell(cx, 232, 94, 94, null, 20); p.ell(cx, 232, 94, 94, null, 0);
    p.g.beginPath(); p.g.arc(cx, 232, 94, 0, Math.PI * 2); p.g.strokeStyle = "#3a3f4b"; p.g.lineWidth = 12; p.g.stroke();
    for (let i = 0; i < 4; i++) { const a = ph * Math.PI * 2 + (i * Math.PI) / 4; p.stroke([[cx - 86 * Math.cos(a), 232 - 86 * Math.sin(a)], [cx + 86 * Math.cos(a), 232 + 86 * Math.sin(a)]], 4, STEEL_D); }
    p.dot(cx, 232, 12, INK);
  };
  wheel(110); wheel(390);
  p.line([[110, 232], [200, 110], [340, 110], [240, 232], [110, 232]], RED, 13);
  p.line([[200, 110], [240, 232]], RED, 13);
  p.line([[390, 232], [336, 76]], RED, 13);
  p.line([[300, 60], [356, 70]], "#3a3f4b", 13);
  p.line([[170, 92], [226, 92]], "#3a3f4b", 16);
  p.stroke([[190, 96], [200, 110]], 9);
  const a = ph * Math.PI * 2; p.dot(240, 232, 18, STEEL_D);
  p.line([[240 - 34 * Math.cos(a), 232 - 34 * Math.sin(a)], [240 + 34 * Math.cos(a), 232 + 34 * Math.sin(a)]], STEEL, 8);
};
/** short white speed streaks, 400 x 200 */
export const fxStreaks = (p: Pen, ph: number) => { for (let i = 0; i < 4; i++) { const x = (hash(i, 9) * 260 + ph * 90) % 260, y = 30 + i * 46; p.stroke([[20 + x, y], [120 + x, y]], 12, "#ffffff"); } };

// ---------------- the true-scale triangle, 1400 x 400: one mile down (86 px), fifteen miles along (1290 px) ----------------
export const fxTri = (p: Pen, n: number, one: boolean) => {
  const A: P2 = [60, 120], B: P2 = [60, 206], C: P2 = [1350, 206];
  p.poly([A, C, B], "#cfe9ff", 0);
  p.line([B, C], "#ffffff", 12);
  for (let i = 1; i <= n; i++) p.line([[60 + i * 86, 196], [60 + i * 86, 250]], YEL, 13);
  const m = 30; for (let i = 0; i < m; i += 2) p.stroke([[60 + (1290 * i) / m, 120 + (86 * i) / m], [60 + (1290 * (i + 1)) / m, 120 + (86 * (i + 1)) / m]], 11, "#4a8fe0");
  if (one) p.line([A, B], "#ff8a3c", 20);
};

// ---------------- the wheelchair ramp against the glide (both drawn four times steeper than they are) ----------------
/** a wedge 1200 x 520: rise (px) over 1080 px; kind 0 = air with a dashed blue top, 1 = concrete ramp with a handrail */
export const fxWedge = (p: Pen, rise: number, kind: number) => {
  const A: P2 = [60, 470 - rise], B: P2 = [60, 470], C: P2 = [1140, 470];
  if (kind === 0) {
    p.poly([A, C, B], "#cfe9ff", 0);
    const m = 26; for (let i = 0; i < m; i += 2) p.stroke([[60 + (1080 * i) / m, A[1] + (rise * i) / m], [60 + (1080 * (i + 1)) / m, A[1] + (rise * (i + 1)) / m]], 12, "#4a8fe0");
    p.line([B, C], "#ffffff", 10);
  } else {
    p.poly([A, C, B], "#b9bfcc", 12);
    for (const x of [140, 480, 820]) { const y = A[1] + (rise * (x - 60)) / 1080; p.line([[x, y], [x, y - 110]], STEEL_D, 10); }
    p.line([[100, A[1] + (rise * 40) / 1080 - 112], [860, A[1] + (rise * 800) / 1080 - 112]], STEEL, 12);
  }
};
/** the blue wheelchair sign, 300 x 300 */
export const fxChairSign = (p: Pen) => {
  p.poly(rrect(14, 14, 286, 286, 36), "#2f67c8", 12);
  const W = "#ffffff";
  p.dot(128, 70, 24, W);
  p.stroke([[128, 104], [134, 170], [200, 170], [228, 236]], 22, W);
  p.stroke([[132, 132], [190, 132]], 18, W);
  p.arc(140, 196, 62, 62, 20, 250, 18, W);
};
/** a clock, 400 x 400; k 0..1 = how much of the twenty-minute wedge is swept */
export const fxClock = (p: Pen, k: number) => {
  p.ell(200, 200, 186, 186, "#ffffff", 14);
  if (k > 0.01) p.poly([[200, 200], ...ellPts(200, 200, 150, 150, -90, -90 + 120 * k, 0, 24)], "#ff6b5e", 0);
  for (let i = 0; i < 12; i++) { const a = rad(i * 30); p.stroke([[200 + 150 * Math.cos(a), 200 + 150 * Math.sin(a)], [200 + 172 * Math.cos(a), 200 + 172 * Math.sin(a)]], i % 3 ? 6 : 11); }
  const a = rad(-90 + 120 * k); p.stroke([[200, 200], [200 + 138 * Math.cos(a), 200 + 138 * Math.sin(a)]], 12); p.stroke([[200, 200], [200, 96]], 9, STEEL_D);
  p.dot(200, 200, 16);
};
/** the ground with a runway at its right end, 1400 x 200 */
export const fxGround = (p: Pen) => {
  p.poly([[0, 60], [1400, 60], [1400, 200], [0, 200]], "#6aab4f", 10);
  p.poly(rrect(1000, 44, 1380, 84, 8), "#59606e", 9);
  for (let x = 1030; x < 1360; x += 60) p.stroke([[x, 64], [x + 30, 64]], 7, "#ffffff");
  for (const x of [120, 400, 700]) { p.poly([[x, 60], [x, 26], [x + 40, 26], [x + 40, 60]], "#f0d9a8", 6); p.poly([[x - 8, 30], [x + 20, 4], [x + 48, 30]], "#c9553f", 6); }
};
/** a dashed white line across a 1400 x 40 canvas */
export const fxDash = (p: Pen, col = "#ffffff") => { for (let x = 20; x < 1380; x += 70) p.line([[x, 20], [x + 36, 20]], col, 11); };
/** an upright double-headed arrow, 160 x 900 */
export const fxSpan = (p: Pen) => { p.line([[80, 90], [80, 810]], "#ff8a3c", 18); p.poly([[80, 14], [140, 110], [20, 110]], "#ff8a3c", 11); p.poly([[80, 886], [140, 790], [20, 790]], "#ff8a3c", 11); };

// ---------------- the night glide ----------------
/** fuel gauge, 400 x 400: k 1 = full .. 0 = empty; red = the warning lamp is on */
export const fxFuel = (p: Pen, k: number, red: boolean) => {
  p.ell(200, 200, 186, 186, "#e9edf4", 14); p.ell(200, 200, 150, 150, "#ffffff", 7);
  const on = (deg: number, r: number): P2 => [200 + r * Math.sin(rad(deg)), 210 - r * Math.cos(rad(deg))];
  const band = (a0: number, a1: number, col: string) => { const pts: P2[] = []; for (let a = a0; a <= a1; a += 5) pts.push(on(a, 140)); for (let a = a1; a >= a0; a -= 5) pts.push(on(a, 108)); p.poly(pts, col, 0); };
  band(-70, -40, "#ff6b5e"); band(-40, 70, "#5fd07a");
  // a little pump
  p.poly(rrect(170, 236, 216, 300, 6), NAVY, 6); p.poly(rrect(178, 244, 208, 264, 3), "#ffffff", 0); p.stroke([[216, 252], [234, 252], [234, 292]], 6, NAVY);
  p.dot(92, 300, 22, INK); p.dot(92, 300, 15, red ? "#ff2a1f" : "#6a2a2a");
  const a = -70 + 140 * k; p.line([[200, 210], on(a, 128)], RED, 11); p.dot(200, 210, 20, INK);
};
/** the island with its lit runway, 900 x 320 */
export const fxIsland = (p: Pen) => {
  p.poly([[20, 300], ...curve([20, 300], [120, 170], [300, 150], 10), [640, 150], ...curve([640, 150], [800, 160], [880, 300], 10)], "#35505a", 11);
  p.poly(rrect(250, 132, 700, 162, 8), "#6b7284", 9);
  for (let x = 270; x < 690; x += 38) p.dot(x, 147, 7, "#ffe95c");
  p.poly(rrect(150, 84, 184, 156, 4), "#c9d2e2", 8); p.poly(rrect(138, 60, 196, 92, 6), "#ffe27a", 8);
  for (const [x, h] of [[760, 60], [800, 44]] as const) { p.stroke([[x, 186], [x + 6, 186 - h]], 8, "#5a4630"); p.ell(x + 6, 180 - h, 26, 16, "#2f6b3c", 6); }
};

// ---------------- the little propeller (ram air turbine), 300 x 420: arm from the top, hub at (150, 300) ----------------
export const fxRat = (p: Pen, ph: number, speed: number) => {
  p.line([[150, 0], [150, 290]], STEEL_D, 22);
  p.poly(rrect(118, 250, 182, 330, 18), STEEL, 9);
  const blade = (a: number, col: string, ol: number) => { const c = Math.cos(a), s = Math.sin(a), n: P2 = [-s, c]; p.poly([[150 + 16 * n[0], 300 + 16 * n[1]], [150 + 112 * c + 26 * n[0], 300 + 112 * s + 26 * n[1]], [150 + 124 * c, 300 + 124 * s], [150 + 112 * c - 20 * n[0], 300 + 112 * s - 20 * n[1]], [150 - 16 * n[0], 300 - 16 * n[1]]], col, ol); };
  const a = ph * Math.PI;
  if (speed > 0.6) { p.ell(150, 300, 124, 124, "#eef3fa", 7); for (let i = 0; i < 3; i++) { blade(a + (i * Math.PI) / 3, "#d3dbe8", 0); blade(a + (i * Math.PI) / 3 + Math.PI, "#d3dbe8", 0); } }
  else { blade(a, WHITE, 9); blade(a + Math.PI, WHITE, 9); }
  p.dot(150, 300, 30, INK); p.dot(150, 300, 21, YEL);
};
/** a round control wheel symbol, 300 x 300 */
export const fxYoke = (p: Pen, lit: boolean) => {
  p.ell(150, 150, 136, 136, lit ? "#fff3a0" : "#dfe4ec", 12);
  p.g.lineCap = "round"; p.g.lineJoin = "round";
  p.line([[84, 110], [84, 170], [216, 170], [216, 110]], NAVY, 22, false);
  p.line([[150, 170], [150, 232]], NAVY, 22, false);
};

// ---------------- the throttle, 700 x 620: k 0 = levers forward (toward the top right), 1 = pulled back ----------------
export const fxThrottle = (p: Pen, k: number) => {
  p.poly(rrect(210, 360, 600, 600, 30), "#4d5666", 13);
  for (const x of [330, 470]) p.poly(rrect(x - 16, 384, x + 16, 580, 14), "#2b2f3a", 7);
  const a = rad(lerpN(24, -34, k)), tip = (x: number): P2 => [x + 250 * Math.sin(a), 520 - 250 * Math.cos(a)];
  // the pilot's arm comes in from the lower left and holds both knobs
  const t0 = tip(330), t1 = tip(470), hand: P2 = [(t0[0] + t1[0]) / 2, (t0[1] + t1[1]) / 2 + 6];
  for (const x of [330, 470]) { const t = tip(x); p.line([[x, 520], t], STEEL, 22); p.poly(rrect(t[0] - 46, t[1] - 30, t[0] + 46, t[1] + 30, 16), WHITE, 10); }
  p.line([[20, 610], [hand[0] - 90, hand[1] + 60]], "#27314f", 84);
  for (const u of [0.45, 0.6, 0.75]) { const x = 20 + (hand[0] - 110) * u, y = 610 + (hand[1] + 60 - 610) * u; p.stroke([[x - 30, y - 34], [x + 30, y + 34]], 9, YEL); }
  p.ell(hand[0] - 6, hand[1] + 8, 96, 52, SKINC, 11);
  for (let i = 0; i < 4; i++) p.arc(hand[0] - 62 + i * 38, hand[1] - 8, 20, 30, 200, 340, 7);
};
const lerpN = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------------- Gus's point of view: the seat back in front of him with its screen, 900 x 1600 ----------------
export type Screen = { mode: "movie" | "line" | "off"; ph?: number; prog?: number; face?: "" | "wow" | "sad" | "stern"; blink?: boolean; icon?: boolean; line?: number; fade?: number };
const SCR: [number, number, number, number] = [150, 520, 750, 900];
export const fxSeatBack = (p: Pen, s: Screen) => {
  const g = p.g, [x0, y0, x1, y1] = SCR, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  g.fillStyle = "#3f72d6"; g.fillRect(0, 0, 900, 1600);
  g.fillStyle = "#3566c4"; g.fillRect(0, 0, 70, 1600); g.fillRect(830, 0, 70, 1600);
  p.poly(rrect(60, -40, 840, 330, 50), "#f3eee0", 12); p.stroke([[110, 290], [790, 290]], 6, "#cfc8b6");
  for (const y of [400, 1010]) p.stroke([[90, y], [810, y]], 6, "#2c55aa");
  p.poly(rrect(110, 1090, 790, 1640, 30), "#dfe4ec", 12); p.poly(rrect(400, 1066, 500, 1120, 14), STEEL_D, 9);
  p.poly(rrect(x0 - 34, y0 - 34, x1 + 34, y1 + 60, 30), "#2b2f3a", 13);
  for (const x of [cx - 60, cx, cx + 60]) p.dot(x, y1 + 30, 9, "#59606e");
  const scr = rrect(x0, y0, x1, y1, 12);
  p.clip(scr, () => {
    if (s.mode === "movie") {
      const ph = s.ph ?? 0, t = ph * Math.PI * 2;
      g.fillStyle = "#ffcf7a"; g.fillRect(x0, y0, 600, 380);
      p.ell(x0 + 470, y0 + 120, 62, 62, "#ff8a3c", 0);
      p.poly([[x0, y0 + 210], ...curve([x0, y0 + 210], [x0 + 200, y0 + 150], [x0 + 380, y0 + 215], 8), ...curve([x0 + 380, y0 + 215], [x0 + 500, y0 + 170], [x1, y0 + 205], 6), [x1, y1], [x0, y1]], "#e0995a", 0);
      g.fillStyle = "#5a5560"; g.fillRect(x0, y0 + 262, 600, 70);
      for (let i = -1; i < 6; i++) { const x = x0 + i * 130 - ((ph * 4) % 1) * 130 + 130; g.fillStyle = "#ffe27a"; g.fillRect(x, y0 + 292, 64, 9); }
      for (const cxx of [x0 + 90 - ((ph * 2) % 1) * 40, x0 + 560 - ((ph * 2) % 1) * 40]) { p.poly(rrect(cxx - 9, y0 + 180, cxx + 9, y0 + 262, 8), "#3f8a45", 5); p.poly(rrect(cxx - 34, y0 + 204, cxx - 9, y0 + 220, 6), "#3f8a45", 5); }
      const car = (x: number, y: number, col: string) => {
        p.poly([[x - 52, y - 30], [x - 30, y - 62], [x + 34, y - 62], [x + 58, y - 30]], col, 6);
        p.poly(rrect(x - 92, y - 32, x + 96, y + 14, 16), col, 7);
        p.poly([[x - 24, y - 34], [x - 14, y - 54], [x + 26, y - 54], [x + 40, y - 34]], "#cfeaff", 4);
        for (const wx of [x - 52, x + 54]) { p.dot(wx, y + 14, 22, INK); p.dot(wx, y + 14, 9, STEEL); }
      };
      car(x0 + 170 + 16 * Math.sin(t), y0 + 268 - 9 * Math.abs(Math.sin(t * 2 + 1)), "#3f72d6");
      car(x0 + 420 + 12 * Math.sin(t + 2), y0 + 268 - 11 * Math.abs(Math.sin(t * 2)), RED);
      for (let i = 0; i < 3; i++) p.ell(x0 + 40 - i * 4 + 22 * ((ph * 4 + i * 0.3) % 1), y0 + 276 - i * 16, 16 + 6 * i, 12 + 4 * i, "#f0d9b8", 0);
      g.fillStyle = "#12141c"; g.fillRect(x0, y0, 600, 30); g.fillRect(x0, y1 - 44, 600, 44);
      g.fillStyle = "#59606e"; g.fillRect(x0 + 40, y1 - 26, 520, 9); g.fillStyle = RED; g.fillRect(x0 + 40, y1 - 26, 520 * (s.prog ?? 0.5), 9);
      p.dot(x0 + 40 + 520 * (s.prog ?? 0.5), y1 - 22, 10, "#ffffff");
    } else {
      g.fillStyle = "#12141c"; g.fillRect(x0, y0, 600, 380);
      p.poly([[x0 + 60, y1], [x0 + 250, y0], [x0 + 330, y0], [x0 + 140, y1]], "#1b1f2b", 0);
      if (s.mode === "line") { const w = 290 * (s.line ?? 1); g.fillStyle = "#ffffff"; g.fillRect(cx - w, cy - 4, 2 * w, 8); p.dot(cx, cy, 10 + 8 * (s.line ?? 1), "#ffffff"); }
      else if (s.face) {
        const fy = cy + 30, fd = s.fade ?? 1, dim = mixCol("#12141c", "#4c4a5e", fd), line = mixCol("#12141c", "#9aa0b8", fd);
        g.beginPath(); g.arc(cx, fy - 6, 150, 0, Math.PI * 2); g.strokeStyle = mixCol("#12141c", "#3a4058", fd); g.lineWidth = 9; g.stroke();
        g.fillStyle = mixCol("#12141c", "#2a3350", fd); g.fillRect(cx - 90, fy + 126, 180, 60);
        p.ell(cx, fy, 112, 104, dim, 0);
        g.lineCap = "round";
        const brow = (sx: number, inner: number, outer: number) => p.stroke([[cx + sx * 26, fy - 52 + inner], [cx + sx * 70, fy - 52 + outer]], 9, line);
        if (s.face === "wow") { brow(-1, -12, -16); brow(1, -12, -16); if (!s.blink) { p.dot(cx - 44, fy - 12, 15, line); p.dot(cx + 44, fy - 12, 15, line); } p.ell(cx, fy + 46, 20, 26, line, 0); }
        else if (s.face === "sad") { brow(-1, -10, 8); brow(1, -10, 8); if (!s.blink) { p.dot(cx - 44, fy - 10, 11, line); p.dot(cx + 44, fy - 10, 11, line); } p.arc(cx, fy + 62, 30, 20, 200, 340, 9, line); }
        else { brow(-1, 10, -12); brow(1, 10, -12); if (!s.blink) { p.stroke([[cx - 62, fy - 12], [cx - 28, fy - 12]], 11, line); p.stroke([[cx + 28, fy - 12], [cx + 62, fy - 12]], 11, line); } p.arc(cx, fy + 64, 34, 18, 205, 335, 9, line); }
        if (s.blink) { p.stroke([[cx - 60, fy - 10], [cx - 30, fy - 10]], 7, line); p.stroke([[cx + 30, fy - 10], [cx + 60, fy - 10]], 7, line); }
      }
      if (s.icon) {
        const ix = x0 + 492, iy = y0 + 86;
        p.ell(ix, iy, 62, 62, "#12141c", 0);
        p.poly(rrect(ix - 24, iy - 12, ix + 24, iy + 26, 8), "#c9d2e2", 0); g.fillStyle = "#c9d2e2"; g.fillRect(ix - 16, iy - 34, 9, 24); g.fillRect(ix + 7, iy - 34, 9, 24); g.fillRect(ix - 4, iy + 24, 8, 20);
        g.beginPath(); g.arc(ix, iy, 58, 0, Math.PI * 2); g.strokeStyle = RED; g.lineWidth = 11; g.stroke(); p.stroke([[ix - 40, iy - 40], [ix + 40, iy + 40]], 11, RED);
      }
    }
  });
  p.poly(scr, null, 8);
};
/** Gus's pointing hand in its pyjama sleeve, 300 x 700: the index finger (tip at (118, 30)) beside a fist with
 *  three curled fingers and a thumb, so it reads as pointing */
export const fxFinger = (p: Pen) => {
  const sl: P2[] = [[70, 720], [84, 420], [226, 420], [240, 720]];
  p.poly(sl, "#8ecbf7", 12);
  p.clip(sl, () => { for (let x = 84; x < 240; x += 44) p.poly([[x, 400], [x + 20, 400], [x + 26, 720], [x - 2, 720]], "#3f8fe0", 0); });
  p.poly(sl, null, 12);
  p.poly(rrect(74, 400, 236, 440, 12), "#ffffff", 10);
  p.poly(rrect(92, 26, 144, 320, 26), SKINC, 11);                                   // index finger
  p.poly(rrect(80, 236, 236, 412, 46), SKINC, 11);                                  // fist
  p.clip(rrect(86, 250, 230, 406, 40), () => { p.g.fillStyle = SKINC; p.g.fillRect(97, 226, 42, 70); });
  for (const x of [150, 186, 220]) p.arc(x + 4, 262, 22, 30, 185, 355, 8);          // three curled fingers
  p.stroke([[158, 262], [158, 318]], 7); p.stroke([[194, 262], [194, 312]], 7);
  p.poly([[84, 330], [40, 300], [22, 318], [34, 350], [92, 392]], SKINC, 11);       // thumb
};
/** a small runway seen from the side, 400 x 80 */
export const fxRunway = (p: Pen) => { p.poly(rrect(8, 20, 392, 62, 10), "#59606e", 9); for (let x = 36; x < 370; x += 62) p.stroke([[x, 41], [x + 30, 41]], 7, "#ffffff"); };
