/**
 * Light, elegant HTML overlays for the cinematic scenes (shared, protected):
 * a small caption label, glass readouts (label + value), photo credit, letterbox/vignette and
 * POV frames (spacecraft window, helmet visor). Numbers arrive as strings from params, which the
 * script renders from {{calc_keys}} and factcheck.py traces.
 */
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { C, DISPLAY, FONT } from "../brand";
import { prog } from "../timeline";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Readout = { label: string; value: string; accent?: boolean };

/** caption label: small tracked caps with a thin rule, lower-left (portrait: above captions) */
export const SceneLabel: React.FC<{ text?: string; sub?: string; t: number }> = ({ text, sub, t }) => {
  const { width, height } = useVideoConfig();
  if (!text) return null;
  const a = prog(t, 0.2, 1.1);
  const portrait = height > width;
  return (
    <div style={{
      position: "absolute", left: portrait ? 70 : 96, top: portrait ? 330 : undefined, bottom: portrait ? undefined : 150,
      fontFamily: FONT, color: C.white, opacity: a, translate: `${(1 - a) * -20}px 0px`, textShadow: "0 2px 16px #000c",
    }}>
      <div style={{ width: 54 * a, height: 2, background: C.amber, marginBottom: 14 }} />
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: portrait ? 40 : 34, letterSpacing: 6, textTransform: "uppercase" }}>{text}</div>
      {sub ? <div style={{ fontSize: portrait ? 30 : 26, fontWeight: 500, color: "rgba(244,246,255,0.75)", marginTop: 8, letterSpacing: 1 }}>{sub}</div> : null}
    </div>
  );
};

/** stacked glass readouts (max ~3), lower-right (portrait: upper area) */
export const Readouts: React.FC<{ items?: Readout[]; t: number }> = ({ items, t }) => {
  const { width, height } = useVideoConfig();
  if (!items || !items.length) return null;
  const portrait = height > width;
  return (
    <div style={{
      position: "absolute", right: portrait ? 120 : 96, top: portrait ? 330 : undefined, bottom: portrait ? undefined : 150,
      display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14, fontFamily: FONT,
    }}>
      {items.map((r, i) => {
        const a = prog(t, 0.35 + i * 0.25, 1.1 + i * 0.25);
        return (
          <div key={i} style={{
            opacity: a, translate: `${(1 - a) * 24}px 0px`, padding: "12px 20px 12px 22px", borderRadius: 14,
            background: "rgba(6,8,22,0.38)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.14)",
            display: "flex", alignItems: "baseline", gap: 16, boxShadow: "0 10px 30px #0006",
          }}>
            <span style={{ fontSize: portrait ? 24 : 20, fontWeight: 700, letterSpacing: 3, color: "rgba(244,246,255,0.7)", textTransform: "uppercase" }}>{r.label}</span>
            <span style={{ fontFamily: DISPLAY, fontSize: portrait ? 46 : 40, fontWeight: 800, color: r.accent ? C.amber : C.white }}>{r.value}</span>
          </div>
        );
      })}
    </div>
  );
};

export const Credit: React.FC<{ text?: string }> = ({ text }) => {
  const { width, height } = useVideoConfig();
  if (!text) return null;
  const portrait = height > width;
  return (
    <div style={{
      position: "absolute", right: portrait ? 130 : 40, top: portrait ? 176 : undefined, bottom: portrait ? undefined : 108, fontFamily: FONT, fontSize: portrait ? 20 : 16,
      color: "rgba(244,246,255,0.62)", textShadow: "0 1px 6px #000", letterSpacing: 0.5, maxWidth: portrait ? 700 : 900, textAlign: "right",
    }}>Image: {text}</div>
  );
};

/** cinematic grade: vignette, slight letterbox fade at the edges, optional warm/cold tint, film grain-free */
export const Grade: React.FC<{ vignette?: number; tint?: string; tintK?: number }> = ({ vignette = 0.55, tint, tintK = 0 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {tint && tintK > 0 ? <AbsoluteFill style={{ background: tint, mixBlendMode: "soft-light", opacity: tintK }} /> : null}
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)` }} />
  </AbsoluteFill>
);

/** POV frames. window: spacecraft porthole; visor: helmet visor edge + faint reflections */
export const PovFrame: React.FC<{ kind?: string; t: number; shakeX?: number; shakeY?: number; heat?: number }> = ({ kind, t, shakeX = 0, shakeY = 0, heat = 0 }) => {
  const { width, height } = useVideoConfig();
  if (!kind) return null;
  const cx = width / 2 + shakeX;
  const cy = height / 2 + shakeY;
  if (kind === "window") {
    const rx = Math.min(width, height * 1.7) * 0.46;
    const ry = Math.min(height * 0.44, rx * 0.62);
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <mask id="win">
              <rect x={-50} y={-50} width={width + 100} height={height + 100} fill="white" />
              <rect x={cx - rx} y={cy - ry} width={rx * 2} height={ry * 2} rx={ry * 0.5} fill="black" />
            </mask>
            <linearGradient id="frameg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1a1d26" /><stop offset="0.5" stopColor="#0b0d12" /><stop offset="1" stopColor="#050608" />
            </linearGradient>
            <radialGradient id="glass" cx="0.3" cy="0.2" r="0.9">
              <stop offset="0" stopColor="rgba(255,255,255,0.10)" /><stop offset="0.4" stopColor="rgba(255,255,255,0.02)" /><stop offset="1" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <rect x={-50} y={-50} width={width + 100} height={height + 100} fill="url(#frameg)" mask="url(#win)" />
          <rect x={cx - rx} y={cy - ry} width={rx * 2} height={ry * 2} rx={ry * 0.5} fill="none" stroke="#2a2f3c" strokeWidth={18} />
          <rect x={cx - rx - 10} y={cy - ry - 10} width={rx * 2 + 20} height={ry * 2 + 20} rx={ry * 0.5 + 10} fill="none" stroke="#0e1016" strokeWidth={6} />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return <circle key={i} cx={cx + Math.cos(a) * (rx + 26)} cy={cy + Math.sin(a) * (ry + 26)} r={5} fill="#3a404e" />;
          })}
          <rect x={cx - rx} y={cy - ry} width={rx * 2} height={ry * 2} rx={ry * 0.5} fill="url(#glass)" opacity={0.9} />
          {heat > 0 ? <rect x={cx - rx + 8} y={cy - ry + 8} width={rx * 2 - 16} height={ry * 2 - 16} rx={ry * 0.5 - 8} fill="none" stroke="#ff7a2a" strokeWidth={14 * heat} opacity={0.3 * heat + 0.08 * Math.sin(t * 9)} /> : null}
        </svg>
      </AbsoluteFill>
    );
  }
  // visor
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 72% 80% at ${50 + (shakeX / width) * 100}% ${52 + (shakeY / height) * 100}%, rgba(0,0,0,0) 62%, rgba(4,6,10,0.75) 86%, rgba(2,3,5,0.98) 100%)` }} />
      <AbsoluteFill style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 70%, rgba(160,200,255,0.05) 100%)" }} />
      {heat > 0 ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 120%, rgba(255,110,40,${0.45 * heat}) 0%, rgba(255,80,20,0) 60%)` }} /> : null}
    </AbsoluteFill>
  );
};

/**
 * Depth gauge for "Fall Into..." videos: a thin vertical scale on the right with layer marks, a
 * moving "you" marker and up to 3 live values next to it. Use it from a per-video OVERLAY:
 *   export const OVERLAY: React.FC<OverlayProps> = (o) => <GaugeOverlay {...o} marks={[...]} />;
 * and give beats `visual.gauge = {frac: 0..1, items: [{label, value: "{{key}}"}]}` (frac is layout).
 */
export type GaugeMark = { f: number; label: string };
export const DepthGauge: React.FC<{ frac: number; items?: Readout[]; marks?: GaugeMark[]; title?: string; opacity?: number }> = ({ frac, items = [], marks = [], title, opacity = 1 }) => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const x = portrait ? 990 : 1830;
  const y0 = portrait ? 420 : 250;
  const y1 = portrait ? 1150 : 900;
  const y = y0 + (y1 - y0) * Math.min(1, Math.max(0, frac));
  return (
    <div style={{ position: "absolute", inset: 0, opacity, fontFamily: FONT, pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <line x1={x} y1={y0} x2={x} y2={y1} stroke="rgba(244,246,255,0.28)" strokeWidth={2} />
        <line x1={x} y1={y0} x2={x} y2={y} stroke={C.amber} strokeWidth={2.5} opacity={0.85} />
        {marks.map((m, i) => {
          const my = y0 + (y1 - y0) * m.f;
          const passed = frac >= m.f - 1e-3;
          // the live readout sits next to the marker: hide mark labels it would cover
          const near = Math.abs(my - y) < 26 + 26 * items.length;
          return (
            <g key={i} opacity={near ? 0 : passed ? 0.95 : 0.45}>
              <line x1={x - 8} y1={my} x2={x + 8} y2={my} stroke={C.white} strokeWidth={1.5} />
              {!portrait ? <text x={x - 16} y={my + 6} textAnchor="end" fontSize={17} fontWeight={600} letterSpacing={1.5} fill={C.white} style={{ textShadow: "0 1px 6px #000" } as React.CSSProperties}>{m.label.toUpperCase()}</text> : null}
            </g>
          );
        })}
        <circle cx={x} cy={y} r={9} fill={C.amber} />
        <circle cx={x} cy={y} r={18} fill="none" stroke={C.amber} strokeWidth={1.5} opacity={0.5} />
        {title ? <text x={x} y={y0 - 44} textAnchor="middle" fontSize={16} fontWeight={700} letterSpacing={3} fill="rgba(244,246,255,0.7)">{title}</text> : null}
      </svg>
      <div style={{ position: "absolute", right: width - x + 34, top: y - 22 - (items.length - 1) * 26, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        {items.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, textShadow: "0 2px 10px #000" }}>
            <span style={{ fontSize: portrait ? 22 : 16, fontWeight: 700, letterSpacing: 2.5, color: "rgba(244,246,255,0.7)", textTransform: "uppercase" }}>{r.label}</span>
            <span style={{ fontFamily: DISPLAY, fontSize: portrait ? 40 : 32, fontWeight: 800, color: i === 0 ? C.amber : C.white }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** OVERLAY helper: reads the current beat's visual.gauge and eases the marker between beats */
export const GaugeOverlay: React.FC<{ time: number; slots: { start: number; showUntil: number; visual: Record<string, unknown> }[]; marks?: GaugeMark[]; title?: string }> = ({ time, slots, marks, title }) => {
  const i = slots.findIndex((s) => time >= s.start && time < s.showUntil);
  if (i < 0) return null;
  const g = (k: number) => (slots[k]?.visual as any)?.gauge as { frac?: number; items?: Readout[]; hide?: boolean } | undefined;
  // sticky: the last beat that set a gauge rules until another one does (or sets hide)
  let ki = i;
  while (ki >= 0 && !g(ki)) ki--;
  if (ki < 0) return null;
  const cur = g(ki)!;
  if (cur.hide) return null;
  // the Math Card sits on the right: the gauge steps aside while one is on screen
  const card = (slots[i] as any).card ? 1 - prog(time, slots[i].start, slots[i].start + 0.5) : 1;
  let pk = ki - 1;
  while (pk >= 0 && !g(pk)) pk--;
  const prev = pk >= 0 ? g(pk) : undefined;
  const f0 = prev?.frac ?? cur.frac ?? 0;
  const f1 = cur.frac ?? f0;
  const s = slots[ki];
  const k = prog(time, s.start, Math.min(s.showUntil, s.start + 3.5));
  const fade = prev && !prev.hide ? 1 : prog(time, s.start, s.start + 0.8);
  return <DepthGauge frac={f0 + (f1 - f0) * k} items={cur.items} marks={marks} title={title} opacity={fade * card} />;
};
