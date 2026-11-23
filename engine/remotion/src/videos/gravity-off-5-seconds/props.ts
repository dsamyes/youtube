// This video's own drawings: 2D cards drawn with the kit's Pen on a canvas of the stated size and placed with fx().
// No letters anywhere: only numbers on tags.
import { Pen, INK, P2, toon } from "../../toon/kit";

const { ellPts, rrect } = toon;
export const RED = "#e8452f", BLUE = "#2f8cf0", WATER = "#59b8f2", WATER_D = "#2f8cd8", STEEL = "#c9d2e2", YELLOW = "#ffd22e";

const numberOn = (p: Pen, text: string, x: number, y: number, size: number, fill = "#ffffff", ink = true) => {
  const g = p.g; g.font = `900 ${size}px "Arial Black", Arial, Helvetica, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; if (ink) { g.lineWidth = size * 0.16; g.strokeStyle = INK; g.strokeText(text, x, y); } g.fillStyle = fill; g.fillText(text, x, y);
};
/** a white tag with a red number, 360 x 260 (its point at 180, 252) */
export const fxNum = (p: Pen, text: string) => {
  p.poly([[180, 252], [146, 196], [24, 196], [24, 20], [336, 20], [336, 196], [214, 196]], "#ffffff", 12);
  numberOn(p, text, 180, 110, text.length > 2 ? 104 : 124, RED);
};

/** Gus's house from the front, 800 x 1000: ground on y = 990, roof ridge at y = 150, chimney top at y = 40 */
export const fxHouse = (p: Pen) => {
  const ch = rrect(540, 40, 630, 300, 4);
  p.poly(ch, "#b9643c", 12); p.clip(ch, () => { p.poly([[600, 30], [640, 30], [640, 310], [596, 310]], "#96492a", 0); for (let y = 86; y < 300; y += 44) p.stroke([[540, y], [630, y]], 4, "#7d3b20"); }); p.poly(ch, null, 12);
  p.poly(rrect(524, 26, 646, 62, 6), "#8a8f9c", 11);
  const wall = rrect(110, 470, 690, 990, 4);
  p.poly(wall, "#f3e3bd", 13); p.clip(wall, () => p.poly([[560, 460], [700, 460], [700, 1000], [540, 1000]], "#d9c394", 0)); p.poly(wall, null, 13);
  const roof: P2[] = [[40, 490], [400, 150], [760, 490]];
  p.poly(roof, "#d8553c", 14); p.clip(roof, () => { p.poly([[400, 150], [760, 490], [560, 490]], "#b53f2b", 0); for (let y = 220; y < 490; y += 62) p.stroke([[40, y], [760, y]], 5, "#a23422"); }); p.poly(roof, null, 14);
  for (const [x, y] of [[180, 560], [470, 560], [470, 780]] as P2[]) { const w = rrect(x, y, x + 150, y + 130, 4); p.poly(w, "#8fd0f4", 10); p.stroke([[x + 75, y], [x + 75, y + 130]], 7); p.stroke([[x, y + 65], [x + 150, y + 65]], 7); }
  p.poly(rrect(190, 760, 320, 990, 4), "#9a6336", 11); p.dot(296, 880, 9, YELLOW);
  p.ell(400, 360, 44, 44, "#8fd0f4", 10); p.stroke([[356, 360], [444, 360]], 6); p.stroke([[400, 316], [400, 404]], 6);
};

// ---------------- the diagram: a ball and a hill ----------------
export const HILL_W = 1600, HILL_H = 1000, FLOOR = 500, SL0 = 700, SL1 = 1260, HILL_UP = 400, BALL_R = 62;
const s3 = (u: number) => { const v = Math.min(1, Math.max(0, u)); return v * v * (3 - 2 * v); };
/** surface height (canvas y) at canvas x, for hill size t 0..1 */
export const hillY = (x: number, t: number) => FLOOR - HILL_UP * t * (x < SL1 ? s3((x - SL0) / (SL1 - SL0)) : 1 - s3((x - SL1) / 330));
/** a level green floor that runs off both edges, with a hill on it (t = 1) or not (t = 0) */
export const fxHill = (p: Pen, t: number) => {
  const top: P2[] = []; for (let x = -30; x <= HILL_W + 30; x += 20) top.push([x, hillY(x, t)]);
  const soil: P2[] = [...top, [HILL_W + 30, HILL_H + 30], [-30, HILL_H + 30]];
  p.poly(soil, "#b98a5a", 0);
  p.clip(soil, () => { p.g.lineJoin = "round"; p.stroke(top.map(([x, y]) => [x, y + 26] as P2), 64, "#63b84f"); p.stroke(top.map(([x, y]) => [x, y + 60] as P2), 7); });
  p.stroke(top, 13);
};
/** the red ball, 200 x 200 (turn the card to roll it) */
export const fxBall = (p: Pen) => {
  const c = ellPts(100, 100, 84, 84);
  p.poly(c, RED, 12); p.clip(c, () => { p.ell(128, 132, 80, 76, "#c2321f", 0); p.ell(92, 88, 78, 74, RED, 0); p.stroke([[100, 10], [100, 190]], 20, "#ffffff"); }); p.poly(c, null, 12);
};
/** a white post with a red band, 80 x 300 (foot on y = 292) */
export const fxPost = (p: Pen) => { const b = rrect(22, 12, 58, 292, 8); p.poly(b, "#ffffff", 10); p.clip(b, () => p.poly([[10, 50], [70, 50], [70, 110], [10, 110]], RED, 0)); p.poly(b, null, 10); };
/** a white speed streak, vertical, 40 x 300 (soft card) */
export const fxStreakV = (p: Pen) => { const g = p.g, gr = g.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,0.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.beginPath(); g.ellipse(20, 150, 8, 150, 0, 0, Math.PI * 2); g.fill(); };

// ---------------- measures ----------------
/** a yellow ruler standing upright, 120 x 420 */
export const fxRuler = (p: Pen) => { p.poly(rrect(20, 10, 100, 410, 8), YELLOW, 11); for (let i = 0; i <= 10; i++) { const y = 30 + 36 * i; p.stroke([[24, y], [i % 5 ? 52 : 70, y]], i % 5 ? 5 : 8); } };
/** a yellow measuring tape running up from the ground, 120 x 1200; u 0..1 = how far it has run */
export const fxTape = (p: Pen, u: number) => {
  const y0 = 1190 - 1170 * u, b = rrect(34, y0, 86, 1190, 4);
  p.poly(b, YELLOW, 10); p.clip(b, () => { for (let y = 1170; y > 0; y -= 36) p.stroke([[34, y], [(Math.round((1170 - y) / 36) % 4) ? 56 : 70, y]], 5); }); p.poly(b, null, 10);
  p.poly(rrect(22, y0 - 16, 98, y0 + 8, 5), STEEL, 9);
};
/** a bracket that spans a gap, 160 x 600 */
export const fxBracket = (p: Pen) => { for (const [w, col] of [[26, INK], [12, "#ffffff"]] as const) { p.stroke([[40, 24], [110, 24]], w, col); p.stroke([[40, 576], [110, 576]], w, col); p.stroke([[110, 24], [110, 576]], w, col); } };
/** a dashed red line, 1000 x 40; u 0..1 = how far it is drawn from the left */
export const fxDashed = (p: Pen, u: number) => { for (let x = 10; x < 990 * u - 40; x += 80) { p.stroke([[x, 20], [x + 46, 20]], 20); p.stroke([[x, 20], [x + 46, 20]], 10, RED); } };

/** a little globe, 300 x 300; ph 0..1 = how far it has turned */
export const fxGlobe = (p: Pen, ph: number) => {
  const c = ellPts(150, 150, 118, 118);
  p.poly(c, "#3f8fe0", 12);
  p.clip(c, () => { for (const k of [0, 1, 2]) { const x = ((k / 3 + ph) % 1) * 420 - 60; p.ell(x, 110 + 46 * (k % 2), 54, 40, "#63b84f", 0); p.ell(x + 30, 190 - 60 * (k % 2), 34, 26, "#63b84f", 0); } p.ell(190, 196, 120, 112, "rgba(20,40,110,0.22)", 0); });
  p.poly(c, null, 12);
  p.arc(150, 150, 142, 40, 20, 160, 14); p.arc(150, 150, 142, 40, 20, 160, 6, "#ffffff"); p.poly([[286, 150], [262, 196], [300, 190]], "#ffffff", 7);
};

/** an Olympic diving tower with a pool at its foot, 600 x 1300: top platform at y = 150 (its edge at x = 560), ground at y = 1250 */
export const fxTower = (p: Pen) => {
  p.poly(rrect(250, 1196, 596, 1262, 10), "#eef3f8", 11); p.poly(rrect(270, 1206, 580, 1244, 6), WATER, 6);
  for (const x of [120, 260]) { p.stroke([[x, 160], [x, 1250]], 30); p.stroke([[x, 160], [x, 1250]], 16, "#f4f6fa"); }
  for (let y = 250; y < 1230; y += 110) { p.stroke([[120, y], [260, y]], 9); }
  for (const [y, x1] of [[150, 560], [480, 500], [810, 450]] as P2[]) { const d = rrect(70, y, x1, y + 44, 6); p.poly(d, "#f4f6fa", 11); p.clip(d, () => p.poly([[60, y + 26], [x1 + 10, y + 26], [x1 + 10, y + 50], [60, y + 50]], "#c9d2e2", 0)); p.poly(d, null, 11); }
  p.stroke([[80, 150], [80, 70], [330, 70], [330, 150]], 11); p.stroke([[80, 150], [80, 70], [330, 70], [330, 150]], 4, STEEL);
  p.poly(rrect(40, 1236, 340, 1262, 6), "#aeb6c4", 9);
};

// ---------------- the neighbor's pool (800 x 520; the water lies around y = 110) ----------------
const RIM: P2[] = ellPts(400, 110, 372, 84), WATR: P2[] = ellPts(400, 114, 340, 66);
/** the whole pool: wall, rim, water */
export const fxPoolBack = (p: Pen) => {
  const wall: P2[] = [[28, 110], [28, 440], ...ellPts(400, 440, 372, 70, 180, 0, 0, 20), [772, 110]];
  p.poly(wall, BLUE, 13);
  p.clip(wall, () => { for (let x = 90; x < 780; x += 110) p.stroke([[x, 100], [x, 520]], 26, "#5aa7f5"); p.poly([[600, 90], [790, 90], [790, 520], [640, 520]], "rgba(10,40,120,0.25)", 0); });
  p.poly(wall, null, 13);
  p.poly(RIM, "#f4f6fa", 13); p.poly(WATR, WATER, 9);
  p.clip(WATR, () => { p.ell(480, 150, 300, 60, WATER_D, 0); p.arc(300, 100, 90, 16, 180, 330, 7, "#ffffff"); p.arc(520, 128, 70, 12, 190, 320, 6, "#ffffff"); });
  p.poly(WATR, null, 9);
};
/** the near half only: what hides a swimmer's body (wall and near rim, water line across the top) */
export const fxPoolFront = (p: Pen) => {
  const wall: P2[] = [[28, 110], [28, 440], ...ellPts(400, 440, 372, 70, 180, 0, 0, 20), [772, 110], ...ellPts(400, 110, 372, 84, 0, 180, 0, 20)];
  p.poly(wall, BLUE, 13);
  p.clip(wall, () => { for (let x = 90; x < 780; x += 110) p.stroke([[x, 100], [x, 520]], 26, "#5aa7f5"); p.poly([[600, 90], [790, 90], [790, 520], [640, 520]], "rgba(10,40,120,0.25)", 0); });
  p.poly(wall, null, 13);
  const band: P2[] = [...ellPts(400, 110, 372, 84, 0, 180, 0, 20), ...ellPts(400, 114, 340, 66, 0, 180, 0, 20).reverse()];
  p.poly(band, "#f4f6fa", 11);
};
/** a wet ring of ripples round a swimmer's neck, 300 x 90 */
export const fxWake = (p: Pen) => { p.ell(150, 45, 132, 30, WATER_D, 8); p.ell(150, 42, 104, 20, WATER, 0); p.arc(150, 45, 132, 30, 200, 300, 6, "#ffffff"); };
