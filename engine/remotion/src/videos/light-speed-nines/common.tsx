// Shared helpers for the light-speed-nines scenes: level lookup, sky state, small UI pieces.
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Easing, interpolate } from "remotion";
import { C, DISPLAY, FONT } from "../../brand";
import { clamp } from "../../timeline";
import { SceneProps, VideoProps } from "../../types";
import { lerpBeta } from "./physics";
import { SkyView } from "./Starfield";

export type Lvl = { key: string; beta: number; gamma: number; pct: string; g_disp: string };

export const levels = (d: VideoProps) => (d.extra.levels as Lvl[]) ?? [];
export const lvl = (d: VideoProps, k?: unknown): Lvl => {
  const ls = levels(d);
  return ls.find((l) => "l" + l.key === k) ?? ls[0];
};
export const val = (d: VideoProps, k: string) => d.values[k]?.display ?? "";
export const has = (d: VideoProps, k: string) => k in d.values;

export const easeIO = Easing.bezier(0.65, 0, 0.35, 1);
export const ramp01 = (t: number, len: number) => (len <= 0 ? 1 : interpolate(t, [0, len], [0, 1], { ...clamp, easing: easeIO }));

/** sky view (speed, zoom, look direction) at time pt into the current beat, with smooth ramps */
export const skyState = (p: SceneProps, dt = 0) => {
  const own = p.run.slots[p.idx].visual as any;
  const before: any = Object.assign({}, ...p.run.slots.slice(0, p.idx).map((s) => s.visual));
  const pt = Math.max(0, p.pt - dt);
  const t = Math.max(0, p.t - dt);
  const to = lvl(p.data, p.params.level);
  const fromKey = own.from ?? (p.idx > 0 ? before.level : p.params.level);
  const from = lvl(p.data, fromKey);
  const ramp = own.ramp ?? (from.key !== to.key ? 3 : 0);
  const f = ramp01(pt, ramp);
  const beta = lerpBeta(from.beta, to.beta, f);
  const fov1 = Number(p.params.fov ?? 100);
  const fov0 = p.idx > 0 ? Number(before.fov ?? fov1) : Number(own.fov0 ?? fov1);
  const fr = ramp01(pt, Number(own.zoom ?? Math.max(2.4, ramp * 0.9)));
  let fov = Math.exp(Math.log(fov0) + (Math.log(fov1) - Math.log(fov0)) * fr);
  if (fov1 < 300) fov *= Math.max(0.93, Math.exp(-0.005 * t)); // slow push-in (never on the all-sky disc)
  const look1 = Number(p.params.look ?? 0);
  const look0 = p.idx > 0 ? Number(before.look ?? 0) : look1;
  const look = look0 + (look1 - look0) * ramp01(pt, 2.6);
  const changing = f < 1 || fr < 1 || look0 !== look1;
  return { beta, fov, look, to, from, f, changing, roll: t * 0.8 };
};

export const toView = (s: ReturnType<typeof skyState>, vertical: boolean): SkyView => ({
  beta: s.beta, fov: s.fov, look: s.look, roll: s.roll, cx: 0.5, cy: vertical ? 0.42 : 0.5,
});

/** glass panel */
export const Glass: React.FC<{ style?: React.CSSProperties; children: React.ReactNode; accent?: string }> = ({ style, children, accent = C.faint }) => (
  <div style={{
    position: "absolute", background: "linear-gradient(160deg, rgba(27,33,87,0.82), rgba(7,9,32,0.86))", border: `2px solid ${accent}`,
    borderRadius: 26, boxShadow: "0 24px 60px #0009", fontFamily: FONT, color: C.white, boxSizing: "border-box", ...style,
  }}>{children}</div>
);

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = C.dim, size = 22, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: 3, color, textTransform: "uppercase", ...style }}>{children}</div>
);

export const Big: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = C.white, size = 72, style }) => (
  <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: size, color, lineHeight: 1, letterSpacing: -1, ...style }}>{children}</div>
);

/** format a time in years for counters (computed in code from calc values) */
export const fmtYears = (y: number) => {
  if (y < 2 / 12) return `${Math.round(y * 365.25).toLocaleString("en-US")} days`;
  if (y < 2) return `${(y * 12).toFixed(1)} months`;
  if (y < 100) return `${y.toFixed(1)} years`;
  return `${Math.round(y).toLocaleString("en-US")} years`;
};

/** the right display key for a trip time at a level: years, months or days (matches narration) */
export const tripKey = (d: VideoProps, dest: string, key: string) => {
  const y = Number(d.values[`ts_${dest}_${key}`]?.value ?? 0);
  if (y >= 1) return { v: val(d, `ts_${dest}_${key}`), u: "years" };
  if (y >= 0.2) return { v: val(d, `tsm_${dest}_${key}`), u: "months" };
  return { v: val(d, `tsd_${dest}_${key}`), u: "days" };
};

/** scene intro fade; none for the very first frame of a video (a Short's hook frame must be full) */
export const introFade = (p: SceneProps, a = 0.2, b = 0.8) => (p.run.start < 0.05 ? 1 : interpolate(p.t, [a, b], [0, 1], clamp));
