// The relativistic sky: a real star catalogue (HYG v4.0) transformed per frame with aberration,
// Doppler colour and beaming (see physics.ts). Drawn on a <canvas> for speed; deterministic.
import React from "react";
import starData from "./stars.json";
import { aberrate, bbColor, gammaOf, lnVisible } from "./physics";

const raw = (starData as { stars: number[][] }).stars;
const N = raw.length;
const COS_TH = new Float64Array(N);
const COS_PH = new Float64Array(N);
const SIN_PH = new Float64Array(N);
const MAG = new Float64Array(N);
const TEMP = new Float64Array(N);
const LNV0 = new Float64Array(N);
const GLOW = new Uint8Array(N);
for (let i = 0; i < N; i++) {
  const [th, ph, m, T] = raw[i];
  COS_TH[i] = Math.cos(th);
  COS_PH[i] = Math.cos(ph);
  SIN_PH[i] = Math.sin(ph);
  MAG[i] = m;
  TEMP[i] = T;
  LNV0[i] = lnVisible(T);
  GLOW[i] = m >= 9 ? 1 : 0;
}
export const CATALOG_STARS = raw.filter((s) => s[2] < 9).length;

const LN10 = Math.log(10);
const CMB_T = 2.725;

export type SkyView = {
  beta: number;
  /** degrees of sky across the shorter screen side (360 = whole sky in a circle) */
  fov: number;
  /** look direction: 0 = ahead, 180 = behind (degrees, rotation about the vertical axis) */
  look?: number;
  roll?: number;
  /** screen position of the view axis as a fraction of width / height (default centre) */
  cx?: number;
  cy?: number;
};

type Proj = { k: number; cx: number; cy: number; scale: number; cyaw: number; syaw: number; cr: number; sr: number; g: number; b: number };

const makeProj = (v: SkyView, W: number, H: number): Proj => {
  const short = Math.min(W, H);
  const yaw = ((v.look ?? 0) * Math.PI) / 180;
  const roll = ((v.roll ?? 0) * Math.PI) / 180;
  return {
    k: short / 1080, cx: W * (v.cx ?? 0.5), cy: H * (v.cy ?? 0.5), scale: short / 2 / (((v.fov / 2) * Math.PI) / 180),
    cyaw: Math.cos(yaw), syaw: Math.sin(yaw), cr: Math.cos(roll), sr: Math.sin(roll), g: gammaOf(v.beta), b: v.beta,
  };
};

/** screen position for star i, or null; also observed magnitude and temperature */
const project = (i: number, P: Proj, out: number[]): boolean => {
  const cth = COS_TH[i];
  const cthp = aberrate(cth, P.b);
  const sthp = Math.sqrt(Math.max(0, 1 - cthp * cthp));
  const D = P.g * (1 + P.b * cth);
  const Tp = D * TEMP[i];
  const lnR = -2 * Math.log(D) + lnVisible(Tp) - LNV0[i];
  const mp = MAG[i] - (2.5 * lnR) / LN10;
  let x = sthp * COS_PH[i];
  const y0 = sthp * SIN_PH[i];
  const z = cthp;
  const xr = x * P.cyaw - z * P.syaw;
  const zr = x * P.syaw + z * P.cyaw;
  x = xr * P.cr - y0 * P.sr;
  const y = xr * P.sr + y0 * P.cr;
  const a = Math.acos(Math.max(-1, Math.min(1, zr)));
  const s = Math.hypot(x, y) || 1e-12;
  const r = a * P.scale;
  out[0] = P.cx + (r * x) / s;
  out[1] = P.cy - (r * y) / s;
  out[2] = mp;
  out[3] = Tp;
  return true;
};

const drawCmb = (ctx: CanvasRenderingContext2D, P: Proj, v: SkyView, W: number, H: number, ir: boolean) => {
  // forward direction on screen
  if (Math.abs(v.look ?? 0) > 60) return;
  const tMax = CMB_T * Math.sqrt((1 + v.beta) / (1 - v.beta));
  const visible = tMax > 900;
  if (!visible && !ir) return;
  const cx = P.cx;
  const cy = P.cy;
  // radius where the CMB has cooled to ~1/3 of its peak (in angle)
  const steps = 28;
  // angle where the Doppler factor has dropped to a third of its peak
  const dMax = Math.sqrt((1 + v.beta) / (1 - v.beta));
  const cEdge = (1 - 3 / (P.g * dMax)) / v.beta;
  const aEdge = cEdge >= 1 ? 1e-6 : cEdge <= -1 ? Math.PI : Math.acos(cEdge);
  const rMax = Math.min(Math.max(W, H), aEdge * 1.8 * P.scale);
  if (rMax < 1) return;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rMax);
  const lnRef = lnVisible(3000);
  for (let k = 0; k <= steps; k++) {
    const f = k / steps;
    const a = (f * rMax) / P.scale;
    const D = 1 / (P.g * (1 - v.beta * Math.cos(a)));
    const T = CMB_T * D;
    let rgb: [number, number, number];
    let alpha: number;
    if (visible) {
      const c0 = bbColor(T);
      alpha = Math.min(1, Math.exp((lnVisible(T) - lnRef) * 0.7));
      const w = Math.pow(alpha, 3) * 0.45; // hot core blooms toward white
      rgb = [c0[0] + (255 - c0[0]) * w, c0[1] + (255 - c0[1]) * w, c0[2] + (255 - c0[2]) * w];
    } else {
      // false colour (infrared view): temperature mapped to a magenta -> amber ramp
      const q = Math.max(0, Math.min(1, Math.log(T / CMB_T) / Math.log(tMax / CMB_T)));
      rgb = [110 + 120 * q, 50 + 40 * q, 230 + 25 * q];
      alpha = Math.pow(q, 3) * 0.75;
    }
    grad.addColorStop(f, `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${alpha.toFixed(3)})`);
  }
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, rMax, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
};

export const Starfield: React.FC<{
  view: SkyView;
  prev?: SkyView;
  width: number;
  height: number;
  cmb?: "off" | "auto" | "ir";
  exposure?: number;
}> = ({ view, prev, width, height, cmb = "auto", exposure = 0 }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = width;
    const H = height;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#02030c";
    ctx.fillRect(0, 0, W, H);
    const P = makeProj(view, W, H);
    const PP = prev ? makeProj(prev, W, H) : null;
    const allSky = view.fov >= 300;
    if (allSky) {
      // the whole sky as one disc: centre = straight ahead, rim = straight behind
      const R = Math.PI * P.scale;
      const bg = ctx.createRadialGradient(P.cx, P.cy, 0, P.cx, P.cy, R);
      bg.addColorStop(0, "#0a0d2a");
      bg.addColorStop(1, "#05061a");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(P.cx, P.cy, R, 0, Math.PI * 2);
      ctx.fill();
    }
    if (cmb !== "off") drawCmb(ctx, P, view, W, H, cmb === "ir");
    ctx.globalCompositeOperation = "lighter";
    const o = [0, 0, 0, 0];
    const q = [0, 0, 0, 0];
    const k = P.k;
    const margin = 40;
    for (let i = 0; i < N; i++) {
      const glow = GLOW[i] === 1;
      project(i, P, o);
      const mp = o[2] - exposure;
      if (glow ? mp > 12.2 : mp > 8.4) continue;
      const x = o[0];
      const y = o[1];
      if (x < -margin || y < -margin || x > W + margin || y > H + margin) continue;
      const [r, g, b] = bbColor(o[3]);
      let rad: number;
      let alpha: number;
      if (glow) {
        rad = 1.5 * k;
        alpha = Math.min(0.16, 0.05 * Math.pow(10, -0.4 * (mp - 9.6)));
      } else {
        const br = Math.max(0, 6.8 - mp);
        rad = (0.8 + 0.42 * Math.pow(br, 1.15)) * k;
        alpha = Math.max(0.1, Math.min(1, 0.22 + 0.16 * br));
      }
      // motion streak while the speed or the zoom is changing
      if (PP) {
        project(i, PP, q);
        const dx = x - q[0];
        const dy = y - q[1];
        const d = Math.hypot(dx, dy);
        if (d > 2.5 && !glow) {
          ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${(alpha * 0.55).toFixed(3)})`;
          ctx.lineWidth = Math.max(1, rad * 1.3);
          ctx.beginPath();
          ctx.moveTo(q[0], q[1]);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
      ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha.toFixed(3)})`;
      if (rad < 1.3) {
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
        if (mp < 2.2) {
          const hr = rad * (3.2 + (2.2 - mp) * 0.9);
          const hg = ctx.createRadialGradient(x, y, rad * 0.5, x, y, hr);
          hg.addColorStop(0, `rgba(${r | 0},${g | 0},${b | 0},0.32)`);
          hg.addColorStop(1, `rgba(${r | 0},${g | 0},${b | 0},0)`);
          ctx.fillStyle = hg;
          ctx.beginPath();
          ctx.arc(x, y, hr, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalCompositeOperation = "source-over";
    if (allSky) {
      const R = Math.PI * P.scale;
      ctx.strokeStyle = "rgba(61,224,255,0.55)";
      ctx.lineWidth = 3 * k;
      ctx.beginPath();
      ctx.arc(P.cx, P.cy, R, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
  return <canvas ref={ref} width={width} height={height} style={{ position: "absolute", left: 0, top: 0, width, height }} />;
};

/** helpers for overlays: screen radius (px) of an observed angle (deg) for a view */
export const angleToPx = (deg: number, view: SkyView, W: number, H: number) =>
  ((deg * Math.PI) / 180) * (Math.min(W, H) / 2 / (((view.fov / 2) * Math.PI) / 180));

/** observed angle (deg) of the starbow ring: where D = 1 */
export const ringDeg = (beta: number) => {
  const g = gammaOf(beta);
  if (beta <= 0) return 90;
  return (Math.acos(Math.min(1, (1 - 1 / g) / beta)) * 180) / Math.PI;
};

/** observed angle (deg) where a source that was exactly sideways (90 deg) now appears */
export const sideDeg = (beta: number) => (Math.acos(beta) * 180) / Math.PI;
