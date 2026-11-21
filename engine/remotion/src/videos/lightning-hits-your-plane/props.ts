// This video's own drawings: 2D cards drawn with the kit's Pen on a canvas of the stated size and placed with fx().
import { Pen, INK, P2, toon, hash } from "../../toon/kit";

const { rad, ellPts, rrect, curve } = toon;
const BOLT = "#ffdd22", BOLT_HI = "#fff59a", STEEL = "#c9d2e2", STEEL_D = "#8e98ac", RED = "#e0352c", CREAM = "#f4f1e6";

/** white text with an ink rim (numbers only) */
const numberOn = (p: Pen, text: string, x: number, y: number, size: number, fill = "#ffffff") => {
  const g = p.g; g.font = `900 ${size}px "Arial Black", Arial, Helvetica, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.lineWidth = size * 0.16; g.strokeStyle = INK; g.strokeText(text, x, y); g.fillStyle = fill; g.fillText(text, x, y);
};

// ---------------- lightning ----------------
/** zigzag bolt on a w x h box: from the top right down to its tip at the bottom left */
const boltPts = (w: number, h: number): P2[] => ([[0.97, 0], [0.63, 0.37], [0.87, 0.37], [0.43, 0.69], [0.63, 0.69], [0.07, 1], [0.33, 0.6], [0.13, 0.6], [0.5, 0.28], [0.27, 0.28], [0.67, 0]] as P2[]).map(([x, y]) => [x * w, y * h]);
/** the big bolt, 300 x 900; tip at the bottom left corner */
export const fxBolt = (p: Pen, col = BOLT) => {
  const pts = boltPts(300, 900).map(([x, y]) => [10 + x * 0.93, 10 + y * 0.975] as P2);
  p.poly(pts, col, 14);
  p.clip(pts, () => p.line([[262, 0], [196, 300], [226, 330], [128, 600], [150, 640], [40, 880]], BOLT_HI, 20, false));
};
/** a small bolt token, 200 x 300 (grey = not lit) */
export const fxBoltIcon = (p: Pen, on = true) => p.poly(boltPts(200, 300).map(([x, y]) => [12 + x * 0.88, 12 + y * 0.92] as P2), on ? BOLT : "#7d8496", 12);
/** the glow running along the outside of the airliner: same 1400 x 560 canvas as the plane card (plane-door-midflight
 *  fxPlane). u0..u1 = lit part of the way from the nose (0) to the tail (1), on the top and the bottom line at once */
export const fxSkinGlow = (p: Pen, u0: number, u1: number) => {
  const top: P2[] = [...ellPts(1186, 260, 124, 78, 0, -90, 0, 12), [1150, 182], [300, 182], [86, 204]];
  const bot: P2[] = [...ellPts(1186, 260, 124, 78, 0, 90, 0, 12), [1150, 338], [430, 338], [86, 236]];
  const part = (pts: P2[]) => {
    const len: number[] = [0];
    for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = len[len.length - 1], at = (d: number): P2 => { let i = 1; while (i < pts.length - 1 && len[i] < d) i++; const t = (d - len[i - 1]) / Math.max(1e-6, len[i] - len[i - 1]); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; };
    const out: P2[] = [];
    for (let k = 0; k <= 40; k++) out.push(at(L * (u0 + ((u1 - u0) * k) / 40)));
    return out;
  };
  if (u1 - u0 < 0.01) return;
  for (const side of [top, bot]) { const pts = part(side); p.stroke(pts, 34, "rgba(255,214,60,0.55)"); p.stroke(pts, 18, BOLT); p.stroke(pts, 7, BOLT_HI); }
};

// ---------------- the hook: a worried little sun, 400 x 400 ----------------
export const fxSun = (p: Pen, sweat = false) => {
  for (let i = 0; i < 12; i++) { const a = rad(i * 30), b = rad(i * 30 + 15), c = rad(i * 30 - 15); p.poly([[200 + 190 * Math.cos(a), 200 + 190 * Math.sin(a)], [200 + 128 * Math.cos(b), 200 + 128 * Math.sin(b)], [200 + 128 * Math.cos(c), 200 + 128 * Math.sin(c)]], "#ffcf3f", 8); }
  p.ell(200, 200, 132, 132, "#ffb02e", 11);
  p.dot(158, 180, 13); p.dot(242, 180, 13);
  p.stroke([[136, 150], [176, 140]], 8); p.stroke([[264, 150], [224, 140]], 8);
  p.arc(200, 262, 34, 20, 200, 340, 9);
  if (sweat) for (const [x, y] of [[92, 150], [312, 132], [330, 220]] as const) p.poly([[x, y - 22], [x + 13, y + 4], [x, y + 16], [x - 13, y + 4]], "#8ecbf7", 6);
};

// ---------------- storm cloud, 900 x 500 (lit = flickering from inside; signs = plus and minus on it) ----------------
export const fxStorm = (p: Pen, seed: number, lit = false, signs = false) => {
  const blobs: [number, number, number, number][] = [];
  for (let i = 0; i < 7; i++) blobs.push([130 + i * 106 + 30 * (hash(i, seed) - 0.5), 250 - 70 * Math.sin((i / 6) * Math.PI) - 40 * hash(i, seed + 1), 120 + 40 * hash(i, seed + 2), 100 + 30 * hash(i, seed + 3)]);
  blobs.push([450, 330, 400, 110]);
  for (const [x, y, rx, ry] of blobs) p.ell(x, y, rx + 11, ry + 11, INK, 0);
  for (const [x, y, rx, ry] of blobs) p.ell(x, y, rx, ry, lit ? "#c7cdf0" : "#454c70", 0);
  for (const [x, y, rx, ry] of blobs.slice(0, 7)) p.ell(x - rx * 0.1, y - ry * 0.25, rx * 0.7, ry * 0.55, lit ? "#eef0ff" : "#596188", 0);
  if (signs) {
    const plus = (x: number, y: number) => { p.stroke([[x - 26, y], [x + 26, y]], 22); p.stroke([[x, y - 26], [x, y + 26]], 22); p.stroke([[x - 26, y], [x + 26, y]], 11, "#ffe95c"); p.stroke([[x, y - 26], [x, y + 26]], 11, "#ffe95c"); };
    const minus = (x: number, y: number) => { p.stroke([[x - 26, y], [x + 26, y]], 22); p.stroke([[x - 26, y], [x + 26, y]], 11, "#8ecbf7"); };
    plus(250, 170); plus(520, 130); plus(700, 210); minus(200, 330); minus(430, 350); minus(650, 340);
  }
};

// ---------------- the comparison: a tag, a glass fuse, a little house ----------------
/** white tag with a number, 520 x 220 */
export const fxTag = (p: Pen, text: string, bolt = false) => {
  p.poly(rrect(10, 14, 510, 206, 40), "#ffffff", 13);
  if (bolt) { p.g.save(); p.g.translate(40, 34); p.g.scale(0.5, 0.5); fxBoltIcon(p, true); p.g.restore(); }
  numberOn(p, text, bolt ? 300 : 260, 114, 112, "#ffd84a");
};
/** a glass fuse, 600 x 260 */
export const fxFuse = (p: Pen, blown = false) => {
  const glass = rrect(118, 78, 482, 182, 22);
  p.poly(glass, blown ? "#8a8794" : "#e4f6ff", 11);
  p.clip(glass, () => {
    if (blown) { for (let i = 0; i < 9; i++) p.dot(230 + 140 * hash(i, 3), 100 + 60 * hash(i, 4), 20 + 22 * hash(i, 5), "#3d3a45"); }
    else p.poly([[150, 78], [240, 78], [200, 104], [130, 104]], "#ffffff", 0);
  });
  if (blown) { p.stroke([[130, 130], [215, 132], [236, 108]], 8); p.stroke([[470, 130], [392, 128], [368, 154]], 8); }
  else p.stroke([[130, 130], ...curve([200, 130], [300, 110], [400, 130], 8), [470, 130]], 8, "#b06a2a");
  p.poly(glass, null, 11);
  p.poly(rrect(22, 64, 132, 196, 16), STEEL, 11); p.poly(rrect(468, 64, 578, 196, 16), STEEL, 11);
  p.stroke([[48, 84], [48, 176]], 7, "#ffffff"); p.stroke([[494, 84], [494, 176]], 7, "#ffffff");
};
/** Gus's house, 400 x 400: the windows are lit until the fuse goes */
export const fxHouse = (p: Pen, lit = true) => {
  p.poly([[70, 180], [330, 180], [330, 380], [70, 380]], "#f0d9a8", 11);
  p.poly([[36, 190], [200, 46], [364, 190]], "#c9553f", 11);
  p.poly(rrect(262, 60, 300, 130, 4), "#a8483a", 9);
  for (const x of [104, 236]) { p.poly(rrect(x, 220, x + 62, 290, 6), lit ? "#ffe27a" : "#2b3350", 8); p.stroke([[x + 31, 222], [x + 31, 288]], 5); }
  p.poly(rrect(176, 300, 226, 380, 6), "#7a4b2a", 8);
};

// ---------------- the lazy spark ----------------
/** a spark with a face, 320 x 420: mood 0 awake, 1 yawning, 2 pleased */
export const fxSparky = (p: Pen, mood = 0) => {
  const body: P2[] = [[214, 14], [300, 14], [226, 150], [306, 150], [110, 404], [150, 230], [40, 230]];
  p.poly(body, BOLT, 13);
  p.clip(body, () => p.poly([[214, 14], [250, 14], [100, 230], [40, 230]], BOLT_HI, 0));
  p.poly(body, null, 13);
  if (mood === 1) { p.arc(150, 172, 16, 10, 20, 160, 8); p.arc(214, 172, 16, 10, 20, 160, 8); p.ell(182, 214, 17, 22, "#5a1e28", 7); }
  else if (mood === 2) { p.arc(150, 176, 16, 12, 200, 340, 8); p.arc(214, 176, 16, 12, 200, 340, 8); p.arc(182, 200, 26, 18, 20, 160, 8); }
  else { p.dot(150, 172, 11); p.dot(214, 172, 11); p.stroke([[132, 152], [166, 158]], 7); p.stroke([[232, 152], [198, 158]], 7); p.stroke([[166, 208], [200, 208]], 8); }
};
/** two roads from one fork, 900 x 1200: up to the left a steep rocky climb, down to the right a smooth metal slide.
 *  The fork is at (372, 468); the slide ends at (860, 1090) */
export const fxRoads = (p: Pen) => {
  // the rocky climb
  const hill: P2[] = [[372, 500], [300, 430], [250, 330], [170, 300], [130, 180], [40, 150], [20, 60], [20, 560], [372, 560]];
  p.poly(hill, "#7a6a5c", 13);
  p.clip(hill, () => { for (let i = 0; i < 16; i++) { const x = 40 + 300 * hash(i, 7), y = 120 + 400 * hash(i, 8); p.poly([[x, y], [x + 40, y - 30], [x + 78, y + 6], [x + 50, y + 40], [x + 8, y + 34]], i % 2 ? "#94826f" : "#5f5248", 6); } });
  p.poly(hill, null, 13);
  for (const [x, y, s] of [[236, 300, 1], [122, 150, 0.8], [318, 420, 0.7]] as const) p.poly([[x - 26 * s, y], [x, y - 52 * s], [x + 26 * s, y]], "#5f5248", 8);
  // the fork: a little platform
  p.poly(rrect(300, 468, 470, 512, 12), "#b8a58d", 11);
  // the metal slide
  const top = curve([440, 474], [640, 880], [860, 1076], 18), bottom = curve([860, 1128], [600, 950], [420, 520], 18);
  const slide: P2[] = [...top, ...bottom];
  p.poly(slide, STEEL, 13);
  p.clip(slide, () => p.stroke(curve([452, 500], [640, 902], [858, 1092], 18), 12, "#ffffff"));
  p.poly(slide, null, 13);
  p.poly(rrect(800, 1076, 890, 1132, 10), STEEL_D, 11);
  for (const x of [560, 716]) { const y = x === 560 ? 800 : 1010; p.poly(rrect(x - 12, y, x + 12, 1160, 4), STEEL_D, 9); }
  p.poly(rrect(380, 1150, 890, 1184, 10), "#6aab4f", 10);
};

// ---------------- skin and dime: a magnifying glass, 760 x 860 ----------------
export const fxLens = (p: Pen, coin = false) => {
  p.line([[560, 560], [700, 800]], "#7a4b2a", 46);
  const glass = ellPts(360, 340, 300, 300);
  p.poly(glass, "#dff3ff", 0);
  p.clip(glass, () => {
    p.poly([[0, 470], [760, 470], [760, 700], [0, 700]], "#b9d7ee", 0);
    // the skin, edge on: a thin strip standing on the table line
    p.poly(rrect(196, 150, 222, 470, 6), STEEL, 9);
    p.stroke([[204, 160], [204, 460]], 5, "#ffffff");
    p.stroke([[160, 120], [258, 120]], 8, RED); p.stroke([[196, 104], [196, 136]], 8, RED); p.stroke([[222, 104], [222, 136]], 8, RED);
    if (coin) {
      // a dime on its edge, turned a little: its rim is a bit thicker than the strip
      p.ell(452, 310, 96, 160, "#aeb6c4", 10); p.ell(418, 310, 96, 160, "#dfe4ec", 10);
      p.ell(418, 310, 72, 130, null, 5);
      p.ell(410, 290, 30, 44, "#b9c0cd", 0); p.poly([[380, 380], [398, 330], [430, 330], [446, 380]], "#b9c0cd", 0);
      p.stroke([[392, 120], [494, 120]], 8, RED); p.stroke([[418, 104], [418, 136]], 8, RED); p.stroke([[452, 104], [452, 136]], 8, RED);
    }
  });
  p.poly(glass, null, 26);
  p.arc(360, 340, 250, 250, 200, 250, 14, "#ffffff");
};

// ---------------- the meter ----------------
const onDial = (deg: number, r: number): P2 => [480 + r * Math.sin(rad(deg)), 560 - r * Math.cos(rad(deg))];
/** dial, 960 x 660: pivot at (480, 560), zero at -72 degrees, the scale runs to +72 */
export const fxMeter = (p: Pen) => {
  p.poly([...ellPts(480, 560, 450, 450, 180, 360), [930, 640], [30, 640]], CREAM, 16);
  const band: P2[] = []; for (let a = -72; a <= 72; a += 4) band.push(onDial(a, 400)); for (let a = 72; a >= -72; a -= 4) band.push(onDial(a, 340));
  p.poly(band, "#ffffff", 8);
  const zone: P2[] = []; for (let a = -72; a <= -52; a += 4) zone.push(onDial(a, 400)); for (let a = -52; a >= -72; a -= 4) zone.push(onDial(a, 340));
  p.poly(zone, "#7fd88f", 0);
  for (let i = 0; i <= 12; i++) { const a = -72 + i * 12; p.stroke([onDial(a, 404), onDial(a, i % 3 ? 368 : 336)], i % 3 ? 7 : 11); }
  p.poly(rrect(30, 600, 930, 650, 14), "#59606e", 12);
};
/** needle, 900 x 900, pointing up, pivot at the centre */
export const fxNeedle = (p: Pen) => { p.poly([[434, 470], [450, 96], [466, 470]], RED, 10); p.dot(450, 450, 34, INK); p.dot(450, 450, 21, STEEL_D); };
/** a wall socket, 300 x 380 (glow = it blinks) */
export const fxSocket = (p: Pen, glow = false) => {
  if (glow) p.ell(150, 190, 148, 186, "#fff3a0", 0);
  p.poly(rrect(34, 30, 266, 350, 26), "#fbf8ef", 13);
  p.poly(rrect(78, 84, 222, 296, 60), "#e9e4d6", 8);
  p.poly(rrect(112, 124, 128, 188, 4), INK, 0); p.poly(rrect(172, 124, 188, 188, 4), INK, 0);
  p.poly([...ellPts(150, 236, 17, 17, 180, 360), [167, 258], [133, 258]], INK, 0);
  p.dot(150, 58, 7, STEEL_D); p.dot(150, 324, 7, STEEL_D);
};

// ---------------- once a year: a calendar of twelve squares, one of them struck, 440 x 480 ----------------
export const fxCalendar = (p: Pen) => {
  p.poly(rrect(20, 50, 420, 460, 24), "#ffffff", 13);
  p.clip(rrect(20, 50, 420, 460, 24), () => p.poly([[0, 40], [440, 40], [440, 140], [0, 140]], RED, 0));
  p.stroke([[20, 140], [420, 140]], 9);
  p.poly(rrect(20, 50, 420, 460, 24), null, 13);
  for (const x of [120, 320]) { p.poly(rrect(x - 13, 16, x + 13, 92, 12), STEEL, 9); }
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = 52 + c * 88, y = 166 + r * 92, hit = r === 1 && c === 2;
    p.poly(rrect(x, y, x + 72, y + 76, 10), hit ? "#fff3a0" : "#e6ebf3", 6);
    if (hit) { p.g.save(); p.g.translate(x + 14, y + 4); p.g.scale(0.23, 0.23); fxBoltIcon(p, true); p.g.restore(); }
  }
};

// ---------------- the umbrella, 760 x 800: the hand holds it at (380, 700) ----------------
export const fxUmbrella = (p: Pen, open = true) => {
  p.line([[380, 130], [380, 730]], "#8a6a4a", 13);
  p.arc(408, 730, 28, 30, 0, 180, 13, INK); p.arc(408, 730, 28, 30, 0, 180, 7, "#8a6a4a");
  if (open) {
    const rim: P2[] = [];
    for (let i = 0; i < 4; i++) rim.push(...ellPts(650 - i * 180, 300, 90, 34, 0, -180, 0, 8));
    const dome: P2[] = [...ellPts(380, 300, 360, 230, 180, 360, 0, 30), ...rim];
    p.poly(dome, RED, 13);
    p.clip(dome, () => { p.poly([...ellPts(380, 300, 180, 230, 180, 360, 0, 20), [560, 340], [200, 340]], "#ff6b5e", 0); for (const x of [200, 380, 560]) p.stroke(curve([380, 70], [(380 + x) / 2 + (x - 380) * 0.25, 170], [x, 280], 8), 6); });
    p.poly(dome, null, 13);
    p.poly([[368, 76], [380, 30], [392, 76]], "#8a6a4a", 8);
  } else {
    p.poly([[380, 60], [420, 300], [404, 560], [356, 560], [340, 300]], RED, 12);
    p.stroke([[380, 90], [380, 540]], 6); p.poly(rrect(346, 430, 414, 456, 6), "#ffd84a", 7);
  }
};
/** water pouring off the rim, 90 x 600 (ph = phase 0..3) */
export const fxStream = (p: Pen, ph: number) => {
  const pts: P2[] = []; for (let i = 0; i <= 20; i++) pts.push([45 + 10 * Math.sin(i * 0.9 + ph * 1.57), i * 30]);
  p.stroke(pts, 30, "rgba(60,110,190,0.9)"); p.stroke(pts, 20, "#8ecbf7"); p.stroke(pts.map(([x, y]) => [x - 4, y] as P2), 6, "#e4f6ff");
};
/** one streak of rain, 24 x 200 */
export const fxRain = (p: Pen) => { const g = p.g, gr = g.createLinearGradient(0, 0, 0, 200); gr.addColorStop(0, "rgba(190,225,255,0)"); gr.addColorStop(0.6, "rgba(190,225,255,0.85)"); gr.addColorStop(1, "rgba(230,245,255,0.95)"); g.fillStyle = gr; g.fillRect(8, 0, 8, 200); };

// ---------------- the cabin ----------------
/** a water drop behind a red bar: dry air, 320 x 320 */
export const fxNoDrop = (p: Pen) => {
  p.ell(160, 160, 138, 138, "#ffffff", 0);
  p.poly([[160, 54], ...ellPts(160, 190, 62, 62, -30, 210, 0, 20)], "#8ecbf7", 10);
  p.arc(150, 196, 34, 34, 100, 170, 9, "#e4f6ff");
  p.ell(160, 160, 138, 138, null, 22); p.arc(160, 160, 138, 138, 0, 360, 14, RED);
  p.stroke([[66, 254], [254, 66]], 30); p.stroke([[66, 254], [254, 66]], 18, RED);
};
/** a plus sign: charge, 120 x 120 */
export const fxPlus = (p: Pen) => { for (const [w, col] of [[30, INK], [16, BOLT]] as const) { p.stroke([[26, 60], [94, 60]], w, col); p.stroke([[60, 26], [60, 94]], w, col); } };
/** the little spark between knob and fingertip, 400 x 200: a jagged blue-white line from left to right */
export const fxArc = (p: Pen, seed: number) => {
  const pts: P2[] = [[14, 100]]; for (let i = 1; i < 7; i++) pts.push([14 + i * 53, 100 + 70 * (hash(i, seed) - 0.5) * (i % 2 ? 1 : -1) * 1.6]); pts.push([386, 100]);
  p.stroke(pts, 30); p.stroke(pts, 18, "#8fd0ff"); p.stroke(pts, 7, "#ffffff");
};
/** a white veil over the picture, 16 x 16 (a = strength 0..1) */
export const fxVeil = (p: Pen, a: number) => { p.g.fillStyle = `rgba(244,248,255,${a.toFixed(3)})`; p.g.fillRect(0, 0, 16, 16); };
