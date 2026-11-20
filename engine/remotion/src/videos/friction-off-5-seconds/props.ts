// This video's own drawings: 2D cards drawn with the kit's Pen on a canvas of the stated size and placed with fx().
// No letters anywhere: only numbers (12 and a half on the ruler triangle).
import { Pen, INK, P2, toon } from "../../toon/kit";

const { ellPts, rrect } = toon;
const CLAY = "#cf6f3f", CLAY_D = "#a8512a", LEAF = "#4fa64a", LEAF_D = "#327a36", WOOD = "#d9a55c", WOOD_D = "#a8743a", STEEL = "#c9d2e2";

const numberOn = (p: Pen, text: string, x: number, y: number, size: number, fill = "#ffffff", ink = true) => {
  const g = p.g; g.font = `900 ${size}px "Arial Black", Arial, Helvetica, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; if (ink) { g.lineWidth = size * 0.16; g.strokeStyle = INK; g.strokeText(text, x, y); } g.fillStyle = fill; g.fillText(text, x, y);
};

/** the big terracotta pot with a round bush in it, 400 x 640 (its foot on y = 624) */
export const fxPot = (p: Pen) => {
  p.stroke([[200, 400], [200, 300]], 34); p.stroke([[200, 400], [200, 300]], 18, "#8a5a33");
  const bush: P2[] = [...ellPts(200, 190, 168, 164)];
  p.poly(bush, LEAF, 13);
  p.clip(bush, () => { p.ell(250, 250, 170, 150, LEAF_D, 0); p.ell(180, 160, 150, 130, LEAF, 0); });
  p.poly(bush, null, 13);
  for (const [x, y] of [[110, 130], [220, 80], [290, 190], [150, 250], [250, 290], [90, 220]] as P2[]) { p.dot(x, y, 22, INK); p.dot(x, y, 14, "#f0483a"); p.dot(x, y, 5, "#ffd84a"); }
  const body: P2[] = [[78, 430], [322, 430], [284, 624], [116, 624]];
  p.poly(body, CLAY, 13);
  p.clip(body, () => p.poly([[250, 430], [330, 430], [300, 630], [236, 630]], CLAY_D, 0));
  p.poly(body, null, 13);
  const rim = rrect(52, 380, 348, 438, 12);
  p.poly(rim, CLAY, 13); p.clip(rim, () => p.poly([[270, 370], [360, 370], [360, 450], [262, 450]], CLAY_D, 0)); p.poly(rim, null, 13);
};
/** the clay saucer seen from above at a slant, 320 x 110 */
export const fxSaucer = (p: Pen) => { p.ell(160, 55, 146, 42, CLAY, 11); p.ell(160, 50, 108, 26, CLAY_D, 7); };
/** a white teacup with tea in it, 220 x 200 */
export const fxCup = (p: Pen) => {
  p.arc(150, 104, 34, 30, -90, 90, 30, INK); p.arc(150, 104, 34, 30, -90, 90, 12, "#ffffff");
  const body: P2[] = [[30, 56], [150, 56], [136, 170], [44, 170]];
  p.poly(body, "#ffffff", 11);
  p.clip(body, () => p.poly([[120, 50], [160, 50], [150, 180], [112, 180]], "#d3dbe8", 0));
  p.poly(body, null, 11);
  p.ell(90, 56, 60, 15, "#b9743a", 10);
  p.stroke([[42, 112], [138, 112]], 8, "#e8452f");
};
/** a wooden ladder seen from the front, 260 x 900 */
export const fxLadder = (p: Pen) => {
  for (let y = 90; y < 860; y += 96) { p.stroke([[50, y], [210, y]], 26); p.stroke([[50, y], [210, y]], 12, WOOD_D); }
  for (const x of [50, 210]) { p.stroke([[x, 20], [x, 880]], 34); p.stroke([[x, 20], [x, 880]], 18, WOOD); }
};
/** a white speed streak, 300 x 40 (soft card) */
export const fxStreakH = (p: Pen) => { const g = p.g; const gr = g.createLinearGradient(0, 0, 300, 0); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.ellipse(150, 20, 150, 9, 0, 0, Math.PI * 2); g.fill(); };

// ---------------- the diagram: a house and its lawn from the side ----------------
export const SLOPE_W = 1400, SLOPE_H = 900, DROP = 150, HX = 1000, GY = 620, LX = 80;
/** lawn surface height (canvas y) at canvas x for tilt t */
export const lawnY = (x: number, t: number) => GY + (DROP * t * Math.max(0, HX - x)) / (HX - LX);
/** house on the right, lawn running off to the left; t 0..1 = how far the lawn is tipped (exaggerated) */
export const fxSlope = (p: Pen, t: number) => {
  const g = p.g, yl = lawnY(LX, t);
  const soil: P2[] = [[LX - 40, yl + 40], [LX - 40, yl], [HX, GY], [1340, GY], [1340, 860], [LX - 40, 860]];
  p.poly(soil, "#b98a5a", 13);
  p.clip(soil, () => { p.poly([[LX - 60, yl - 20], [HX, GY - 20], [1360, GY - 20], [1360, GY + 46], [HX, GY + 46], [LX - 60, yl + 46]], "#63b84f", 0); p.stroke([[LX - 60, yl + 46], [HX, GY + 46], [1360, GY + 46]], 8); });
  p.poly(soil, null, 13);
  // the house
  const wall = rrect(1030, 340, 1290, GY, 4);
  p.poly(wall, "#f3e3bd", 13); p.clip(wall, () => p.poly([[1210, 330], [1300, 330], [1300, GY + 10], [1200, GY + 10]], "#d9c394", 0)); p.poly(wall, null, 13);
  p.poly([[996, 348], [1160, 200], [1324, 348]], "#d8553c", 13);
  p.poly(rrect(1070, 420, 1140, 500, 4), "#8fd0f4", 9); p.stroke([[1105, 420], [1105, 500]], 6); p.stroke([[1070, 460], [1140, 460]], 6);
  p.poly(rrect(1180, 470, 1250, GY, 4), "#9a6336", 10); p.dot(1196, 548, 7, "#ffd84a");
  p.poly(rrect(1220, 210, 1262, 300, 3), "#b9743a", 10);
  // the spirit level lying on the lawn
  const a = Math.atan2(-DROP * t, HX - LX), cx = 520, cy = lawnY(cx, t);
  g.save(); g.translate(cx, cy); g.rotate(a);
  p.poly(rrect(-190, -64, 190, -6, 10), "#ffd22e", 12);
  p.poly(rrect(-56, -54, 56, -16, 14), "#dff6d0", 8);
  p.stroke([[-22, -52], [-22, -18]], 5); p.stroke([[22, -52], [22, -18]], 5);
  p.ell(26 * t, -35, 17, 12, "#ffffff", 7);
  g.restore();
};
/** the ruler triangle that lies over the tipped lawn, 1000 x 330: level line at y = 110 from x = 960 to 40, drop at x = 40 */
export const fxRule = (p: Pen) => {
  for (let x = 960; x > 60; x -= 60) p.stroke([[x, 110], [x - 34, 110]], 9);
  p.stroke([[40, 104], [40, 110 + DROP]], 22); p.stroke([[40, 104], [40, 110 + DROP]], 10, "#e8452f");
  numberOn(p, "12", 500, 52, 92);
  numberOn(p, "½", 136, 196, 104, "#ffd84a");
};
/** a grey rain cloud, 440 x 260 */
export const fxRainCloud = (p: Pen) => {
  const parts: [number, number, number, number][] = [[130, 160, 100, 70], [230, 110, 110, 86], [320, 160, 96, 70], [220, 180, 150, 56]];
  for (const [x, y, rx, ry] of parts) p.ell(x, y, rx + 9, ry + 9, INK, 0);
  for (const [x, y, rx, ry] of parts) p.ell(x, y, rx, ry, "#aeb8c8", 0);
  p.ell(230, 196, 140, 34, "#8d98ab", 0);
};

// ---------------- the brushes ----------------
/** a scrubbing brush, bristles down, 600 x 260: thirteen bristles at x = 60 + 40 i, tips at y = 236 */
export const fxBrush = (p: Pen, col = WOOD) => {
  for (let i = 0; i < 13; i++) { const x = 60 + 40 * i; p.stroke([[x, 80], [x, 236]], 17); p.stroke([[x, 80], [x, 232]], 7, "#f4ecd8"); }
  const back = rrect(24, 16, 576, 96, 30);
  p.poly(back, col, 13); p.clip(back, () => p.poly([[10, 66], [590, 66], [590, 110], [10, 110]], WOOD_D, 0)); p.poly(back, null, 13);
};

// ---------------- the magnifying glass ----------------
/** magnifying glass, 600 x 720, lens centre (300, 300) radius 250. Inside: the slipper sole above, the grass below,
 *  as two rows of teeth that fit into each other; teeth 1..0 = how tall they are, shift = the sole slid left (px) */
export const fxLens = (p: Pen, teeth: number, shift: number, shut = 0) => {
  p.stroke([[470, 480], [566, 668]], 58); p.stroke([[470, 480], [566, 668]], 36, "#8a5a33");
  const ring = ellPts(300, 300, 250, 250);
  p.poly(ring, "#eaf6ff", 0);
  const A = 62 * teeth, P = 84, gap = 16 * (1 - shut) + 5;
  p.clip(ring, () => {
    const sole: P2[] = [[-200, 20], [900, 20]], grass: P2[] = [[900, 620], [-200, 620]];
    for (let x = 900; x >= -400; x -= P / 2) { const k = Math.round(x / (P / 2)); sole.push([x - shift, 300 - gap / 2 + (k % 2 ? A / 2 : -A / 2)]); }
    for (let x = -400; x <= 900; x += P / 2) { const k = Math.round(x / (P / 2)); grass.push([x, 300 + gap / 2 + (k % 2 ? A / 2 : -A / 2)]); }
    p.poly(grass, "#63b84f", 10); p.poly(sole, "#3d6fd0", 10);
    p.poly([[-200, 20], [900, 20], [900, 120], [-200, 120]], "#2f55a8", 0);
    p.poly([[-200, 520], [900, 520], [900, 620], [-200, 620]], "#3f8f3a", 0);
  });
  p.poly(ring, null, 30); p.g.strokeStyle = STEEL; p.g.lineWidth = 12; p.path(ring, true); p.g.stroke();
  p.arc(300, 300, 214, 214, 200, 250, 12, "#ffffff");
};
