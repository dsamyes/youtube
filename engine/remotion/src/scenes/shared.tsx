/**
 * Shared scene library. Every scene is driven by `params` (the beat's `visual` object from
 * script.json, merged across the scene run) and by `data` (calc values, title, sources...).
 * Numbers shown on screen must arrive through params/data (rendered from calc.json), never be
 * hard-coded here, so factcheck.py can trace them.
 *
 * Scenes: title, rules, recap, outro, bars, number, compare, clock, globe, blank
 */
import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { C, DISPLAY, FONT } from "../brand";
import { Globe } from "../components/Globe";
import { Panel, T } from "../components/Svg";
import { clamp, prog } from "../timeline";
import { SceneEntry, SceneProps } from "../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type P = Record<string, any>;
const num = (s: unknown) => parseFloat(String(s ?? "0").replace(/,/g, "")) || 0;
const decimals = (s: unknown) => (String(s ?? "").split(".")[1] ?? "").length;

/* ---------------- title ---------------- */
export const Title: React.FC<SceneProps> = ({ t, data }) => {
  const a = prog(t, 0, 0.8);
  const b = prog(t, 0.6, 1.4);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, color: C.white }}>
      <Img src={staticFile("logo.svg")} style={{ width: 150, height: 150, opacity: a, marginBottom: 18 }} />
      <div style={{ fontSize: 40, letterSpacing: 10, color: C.cyan, fontWeight: 800, opacity: a, marginBottom: 20 }}>THE IF ENGINE</div>
      <div style={{ fontSize: 104, fontWeight: 900, textAlign: "center", lineHeight: 1.0, opacity: a, scale: interpolate(a, [0, 1], [0.94, 1]), textTransform: "uppercase", maxWidth: 1500 }}>
        {data.title.replace(/\?$/, "")}<span style={{ color: C.amber }}>?</span>
      </div>
      <div style={{ fontFamily: FONT, fontSize: 38, fontWeight: 600, color: C.dim, marginTop: 34, opacity: b }}>
        Run the impossible. <span style={{ color: C.amber }}>Do the math.</span>
      </div>
    </div>
  );
};

/* ---------------- rules: scenario rule cards; phase = "0".."n" (highlight) or "law" ---------------- */
export const Rules: React.FC<SceneProps> = ({ t, phase, pt, params }) => {
  const items: { n: string; h: string; d: string }[] = params.items ?? [];
  const law = phase === "law";
  const active = law ? -1 : parseInt(phase, 10) || 0;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT, color: C.white }}>
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 48,
        opacity: law ? interpolate(pt, [0, 0.5], [1, 0.25], clamp) : 1, scale: law ? interpolate(pt, [0, 0.5], [1, 0.8], clamp) : 1 }}>
        {items.map((r, i) => {
          const shown = prog(t, i * 0.15, i * 0.15 + 0.5);
          const on = active === i + 1;
          return (
            <div key={i} style={{
              width: 480, height: 400, borderRadius: 32, padding: 40, boxSizing: "border-box",
              background: on ? "linear-gradient(160deg, #2A2F7A, #141A4D)" : "rgba(10,13,44,0.8)",
              border: `3px solid ${on ? C.amber : C.faint}`, opacity: shown * (active >= i + 1 || law ? 1 : 0.35),
              translate: `0px ${on ? -12 : 0}px`, boxShadow: on ? `0 0 50px ${C.amber}44` : "none",
            }}>
              <div style={{ fontFamily: DISPLAY, fontSize: 120, fontWeight: 900, color: on ? C.amber : C.cyan, lineHeight: 1 }}>{r.n}</div>
              <div style={{ fontFamily: DISPLAY, fontSize: 58, fontWeight: 900, marginTop: 20, letterSpacing: 2 }}>{r.h}</div>
              <div style={{ fontSize: 34, fontWeight: 600, color: C.dim, marginTop: 16, lineHeight: 1.25 }}>{r.d}</div>
            </div>
          );
        })}
      </div>
      {law ? (
        <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center", opacity: prog(pt, 0.4, 1.0) }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 110, fontWeight: 900, color: C.cyan }}>{params.law}</div>
          <div style={{ fontSize: 40, fontWeight: 600, color: C.dim, marginTop: 20 }}>{params.caption}</div>
        </div>
      ) : null}
    </div>
  );
};

/* ---------------- recap: phase list (items) | moral (lines) | sources ---------------- */
export const Recap: React.FC<SceneProps> = ({ phase, pt, params, data }) => {
  if (phase === "moral") {
    const lines: string[] = params.lines ?? [];
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", fontFamily: DISPLAY, color: C.white }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: 110, fontWeight: 900, textAlign: "center", color: i % 2 ? C.amber : C.white, opacity: prog(pt, i * 1.2, i * 1.2 + 0.6) }}>{l}</div>
        ))}
      </div>
    );
  }
  if (phase === "sources") {
    return (
      <div style={{ position: "absolute", left: 200, right: 200, top: 300, fontFamily: FONT, color: C.white }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 64, fontWeight: 900, opacity: prog(pt, 0, 0.5) }}>Check our math</div>
        <div style={{ fontSize: 32, color: C.dim, marginTop: 24, lineHeight: 1.6, opacity: prog(pt, 0.5, 1.2) }}>
          {data.sources.slice(0, 12).join(" · ")}
        </div>
        <div style={{ fontSize: 34, color: C.cyan, marginTop: 30, fontWeight: 700, opacity: prog(pt, 1.2, 1.8) }}>Full source list in the description</div>
      </div>
    );
  }
  const items: { label: string; value?: string }[] = params.items ?? [];
  const step = Math.max(0.8, Math.min(1.6, 7 / Math.max(1, items.length)));
  return (
    <svg width={1920} height={1080}>
      {items.map((it, i) => {
        const a = prog(pt, 0.6 + i * step, 1.1 + i * step);
        return (
          <g key={i} opacity={a} transform={`translate(${360 + (1 - a) * 60} ${300 + i * 120})`}>
            <circle cx={0} cy={-12} r={34} fill={i === items.length - 1 ? C.purple : C.cyan} />
            <T x={0} y={0} size={30} color={C.deep} weight={900}>{i + 1}</T>
            <T x={70} y={0} size={48} anchor="start" weight={800}>{it.label}</T>
            {it.value ? <T x={1200} y={0} size={44} anchor="end" color={C.amber} display weight={900}>{it.value}</T> : null}
          </g>
        );
      })}
    </svg>
  );
};

/* ---------------- outro: next-video card; art = "banded" | "sphere", colors[] ---------------- */
export const Outro: React.FC<SceneProps> = ({ t, params, data }) => {
  const a = prog(t, 0.2, 1.2);
  const colors: string[] = params.colors ?? ["#E9C9A0", "#C88B5A", "#F1DDBF", "#B5703E", "#EED5B0", "#A86A3F", "#E3C298"];
  const banded = (params.art ?? "banded") === "banded";
  return (
    <svg width={1920} height={1080}>
      <defs>
        <clipPath id="outro-planet"><circle r={250} /></clipPath>
        <radialGradient id="outro-shade" cx="35%" cy="30%" r="80%">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id="outro-sphere" cx="35%" cy="35%" r="75%">
          {colors.slice(0, 3).map((c, i) => <stop key={i} offset={i / 2} stopColor={c} />)}
        </radialGradient>
      </defs>
      <g transform={`translate(560 560) scale(${interpolate(a, [0, 1], [0.8, 1])})`} opacity={a}>
        {banded ? (
          <g clipPath="url(#outro-planet)">
            {colors.map((c, i) => (
              <rect key={i} x={-260} y={-260 + i * (520 / colors.length)} width={520} height={520 / colors.length + 1} fill={c} />
            ))}
            {params.spot ? <ellipse cx={((t * 40) % 600) - 300} cy={110} rx={60} ry={34} fill={params.spot} /> : null}
          </g>
        ) : (
          <circle r={250} fill="url(#outro-sphere)" />
        )}
        <circle r={250} fill="url(#outro-shade)" />
      </g>
      <g opacity={prog(t, 0.8, 1.6)}>
        <T x={960} y={420} size={34} anchor="start" color={C.cyan} weight={800} spacing={6}>NEXT ON THE IF ENGINE</T>
        <foreignObject x={960} y={440} width={860} height={260}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 76, color: C.white, lineHeight: 1.0, textTransform: "uppercase" }}>
            {data.nextVideo}
          </div>
        </foreignObject>
        <rect x={960} y={730} width={330} height={84} rx={42} fill={C.amber} />
        <T x={1125} y={785} size={36} color={C.deep} weight={900} display>SUBSCRIBE</T>
        <T x={960} y={880} size={34} anchor="start" color={C.dim} weight={600}>Run the impossible. Do the math.</T>
      </g>
    </svg>
  );
};

/* ---------------- bars: horizontal bar chart; params {title, unit, items:[{label, value, color?}]} ---------------- */
export const Bars: React.FC<SceneProps> = ({ pt, params }) => {
  const items: { label: string; value: string; color?: string }[] = params.items ?? [];
  const max = Math.max(...items.map((i) => num(i.value)), 1e-9);
  const rowH = Math.min(110, 560 / Math.max(1, items.length));
  return (
    <svg width={1920} height={1080}>
      <g transform="translate(260 300)">
        <T x={0} y={-30} size={30} color={C.dim} anchor="start" weight={700} spacing={2}>{(params.title ?? "").toUpperCase()}</T>
        {items.map((it, i) => {
          const g = prog(pt, 0.3 + i * 0.5, 1.1 + i * 0.5);
          const w = (num(it.value) / max) * 900 * g;
          return (
            <g key={i} transform={`translate(0 ${i * rowH + 10})`}>
              <T x={0} y={36} size={34} anchor="start" weight={600}>{it.label}</T>
              <rect x={0} y={52} width={Math.max(4, w)} height={30} rx={15} fill={it.color ?? (i % 2 ? C.purple : C.cyan)} />
              <T x={w + 18} y={78} size={34} anchor="start" color={C.amber} display weight={800} opacity={g}>
                {it.value} {params.unit ?? ""}
              </T>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/* ---------------- number: big number reveal; params {value, unit, label, sub} ---------------- */
export const NumberReveal: React.FC<SceneProps> = ({ pt, params }) => {
  const target = num(params.value);
  const d = decimals(params.value);
  const p = prog(pt, 0.2, 1.6);
  const shown = (target * p).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.white, fontFamily: DISPLAY }}>
      <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 700, color: C.dim, letterSpacing: 3, textTransform: "uppercase", opacity: prog(pt, 0, 0.4) }}>{params.label}</div>
      <div style={{ fontSize: 230, fontWeight: 900, color: C.amber, lineHeight: 1.05 }}>
        {p >= 1 ? params.value : shown}<span style={{ fontSize: 90, color: C.white, marginLeft: 24 }}>{params.unit}</span>
      </div>
      {params.sub ? <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 600, color: C.cyan, opacity: prog(pt, 1.4, 2) }}>{params.sub}</div> : null}
    </div>
  );
};

/* ---------------- compare: two vertical bars; params {a:{label,sub,value,unit}, b:{...}, ratio} ---------------- */
export const Compare: React.FC<SceneProps> = ({ pt, params }) => {
  const A: P = params.a ?? {}, B: P = params.b ?? {};
  const va = num(A.value), vb = num(B.value);
  const mx = Math.max(va, vb, 1e-9);
  const H = 520, base = 880;
  const p1 = prog(pt, 0.3, 1.2), p2 = prog(pt, 1.4, 3.4);
  const bar = (x: number, v: number, p: number, s: P, color: string) => (
    <g>
      <rect x={x} y={base - (v / mx) * H * p} width={200} height={(v / mx) * H * p} fill={color} />
      <T x={x + 100} y={base - (v / mx) * H - 24} size={38} color={color} weight={900} opacity={p}>{s.value} {s.unit}</T>
      <T x={x + 100} y={base + 50} size={30} color={C.dim}>{s.label}</T>
      {s.sub ? <T x={x + 100} y={base + 88} size={26} color={C.dim}>{s.sub}</T> : null}
    </g>
  );
  return (
    <svg width={1920} height={1080}>
      <line x1={260} y1={base} x2={1120} y2={base} stroke={C.white} strokeWidth={3} />
      {bar(360, va, p1, A, C.purple)}
      {bar(760, vb, p2, B, C.amber)}
      {params.ratio ? <T x={660} y={300} size={72} color={C.white} display weight={900} opacity={prog(pt, 3.4, 4)}>{params.ratio}</T> : null}
    </svg>
  );
};

/* ---------------- clock: analog clock + label; params {label, time, sub, speed} ---------------- */
export const Clock: React.FC<SceneProps> = ({ t, pt, params }) => {
  const speed = num(params.speed ?? 6);
  const a = ((t * speed) / 60) * Math.PI * 2;
  return (
    <svg width={1920} height={1080}>
      <g transform="translate(700 600)" opacity={prog(pt, 0, 0.4)}>
        <circle r={260} fill={C.navy2} stroke={C.cyan} strokeWidth={6} />
        {Array.from({ length: 60 }).map((_, i) => {
          const q = (i / 60) * Math.PI * 2;
          const r1 = i % 5 === 0 ? 220 : 236;
          return <line key={i} x1={Math.sin(q) * r1} y1={-Math.cos(q) * r1} x2={Math.sin(q) * 250} y2={-Math.cos(q) * 250} stroke={C.white} strokeWidth={i % 5 === 0 ? 5 : 2} />;
        })}
        <line x1={0} y1={0} x2={Math.sin(a) * 210} y2={-Math.cos(a) * 210} stroke={C.amber} strokeWidth={6} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin(a / 12) * 150} y2={-Math.cos(a / 12) * 150} stroke={C.white} strokeWidth={9} strokeLinecap="round" />
        <circle r={12} fill={C.amber} />
      </g>
      <g opacity={prog(pt, 0.4, 1)}>
        <T x={1080} y={520} size={34} anchor="start" color={C.dim} weight={700} spacing={2}>{(params.label ?? "").toUpperCase()}</T>
        <T x={1080} y={640} size={110} anchor="start" color={C.amber} display weight={900}>{params.time}</T>
        {params.sub ? <T x={1080} y={710} size={34} anchor="start" color={C.cyan} weight={600}>{params.sub}</T> : null}
      </g>
    </svg>
  );
};

/* ---------------- globe: rotating Earth; params {spin, label, sub, equator, moon:{dist, r, color, speed}} ---------------- */
export const GlobeScene: React.FC<SceneProps> = ({ t, pt, params }) => {
  const moon: P | undefined = params.moon;
  const r = num(params.r ?? 300);
  const ang = t * num(moon?.speed ?? 0.4);
  const md = num(moon?.dist ?? 520);
  const mx = Math.cos(ang) * md, my = Math.sin(ang) * md * 0.28;
  const behind = Math.sin(ang) < 0;
  const moonEl = moon ? <circle cx={mx} cy={my} r={num(moon.r ?? 60)} fill={moon.color ?? "#C9CCDD"} /> : null;
  return (
    <svg width={1920} height={1080}>
      <g transform="translate(960 600)">
        {moon ? <ellipse rx={md} ry={md * 0.28} fill="none" stroke={C.faint} strokeWidth={3} strokeDasharray="10 10" /> : null}
        {behind ? moonEl : null}
        <Globe r={r} rot={t * num(params.spin ?? 10)} showEquator={!!params.equator} />
        {!behind ? moonEl : null}
      </g>
      {params.label ? (
        <Panel x={660} y={890} w={600} h={110} opacity={prog(pt, 0.3, 0.9)}>
          <T x={960} y={945} size={40} color={C.amber} display weight={900}>{params.label}</T>
          {params.sub ? <T x={960} y={985} size={24} color={C.dim}>{params.sub}</T> : null}
        </Panel>
      ) : null}
    </svg>
  );
};

/* ---------------- blank: background only (kinetic text / Math Card carry the beat) ---------------- */
export const Blank: React.FC<SceneProps> = () => null;

export const SHARED_SCENES: Record<string, SceneEntry> = {
  title: { C: Title, shift: false },
  rules: { C: Rules, shift: false },
  recap: { C: Recap, shift: false },
  outro: { C: Outro, shift: false },
  bars: { C: Bars, shift: true },
  number: { C: NumberReveal, shift: true },
  compare: { C: Compare, shift: false },
  clock: { C: Clock, shift: true },
  globe: { C: GlobeScene, shift: true },
  blank: { C: Blank, shift: false },
};
