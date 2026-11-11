/**
 * 2D "data" shots: short, bold, one idea each (telemetry flatline, strike-through, speed race, bar
 * race, TNT grid, end card). They replace the old long-held cards: every card here lives 1.5-3 s and
 * animates from its first frame. Candidates for shared code (components/cards/).
 */
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { C, DISPLAY, FONT } from "../../brand";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

/** deterministic star field with slow drift (parallax layer for 2D shots) */
export const Stars: React.FC<{ t: number; seed?: number; drift?: number; count?: number; opacity?: number }> = ({ t, seed = 1, drift = 18, count = 260, opacity = 1 }) => {
  const stars = React.useMemo(() => {
    let s = seed * 9301 + 49297;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: count }, () => ({ x: r() * 2000, y: r() * 1100, z: 0.3 + r() * 0.7, b: r() }));
  }, [seed, count]);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
      {stars.map((p, i) => (
        <circle key={i} cx={((p.x - t * drift * p.z) % 2000 + 2000) % 2000 - 40} cy={p.y} r={0.6 + p.z * 1.3} fill="#fff" opacity={0.25 + p.b * 0.75 * p.z} />
      ))}
    </svg>
  );
};

const Bg: React.FC<{ t: number; tint?: string }> = ({ t, tint = "#0b0f2a" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${tint} 0%, #03040b 75%)` }}>
    <Stars t={t} drift={22} />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ signal: Galileo telemetry flatlines */
const Signal: React.FC<{ t: number; len: number }> = ({ t, len }) => {
  const cut = len * 0.62; // the line dies here
  const pts: string[] = [];
  for (let x = 0; x <= 1400; x += 6) {
    const ts = t - (1400 - x) / 700; // the signal at this x was received ts seconds into the shot
    const alive = ts < cut;
    const beat = (((ts * 2.6) % 1) + 1) % 1;
    const y = alive ? Math.sin(ts * 19) * 22 + Math.sin(ts * 47 + 1) * 10 - 120 * Math.exp(-beat * 14) + 60 * Math.exp(-Math.abs(beat - 0.08) * 40) : 0;
    pts.push(`${260 + x},${560 + y}`);
  }
  const mins = Math.min(58, Math.floor(interpolate(t, [0, cut], [41, 58], clamp)));
  const secs = Math.floor(interpolate(t, [0, cut], [0, 59 * 17], clamp)) % 60;
  const dead = t >= cut;
  const blink = dead && Math.floor((t - cut) * 6) % 2 === 0;
  return (
    <AbsoluteFill>
      <Bg t={t} tint="#0d1330" />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 15 }, (_, i) => <line key={i} x1={260 + i * 100} y1={360} x2={260 + i * 100} y2={760} stroke="rgba(61,224,255,0.10)" />)}
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={260} y1={360 + i * 100} x2={1660} y2={360 + i * 100} stroke="rgba(61,224,255,0.10)" />)}
        <polyline points={pts.join(" ")} fill="none" stroke={dead ? C.red : C.cyan} strokeWidth={5} style={{ filter: `drop-shadow(0 0 10px ${dead ? C.red : C.cyan})` }} />
      </svg>
      <div style={{ position: "absolute", left: 260, top: 250, fontFamily: FONT, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: C.dim }}>GALILEO PROBE · DOWNLINK · 1995</div>
      <div style={{ position: "absolute", right: 260, top: 236, fontFamily: DISPLAY, fontWeight: 800, fontSize: 64, color: dead ? C.red : C.white, fontVariantNumeric: "tabular-nums" }}>
        T+{String(mins).padStart(2, "0")}:{String(dead ? 0 : secs).padStart(2, "0")}
      </div>
      {dead ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontFamily: DISPLAY, fontWeight: 900, fontSize: 92, letterSpacing: 14, color: C.red, opacity: blink ? 1 : 0.35, textShadow: "0 0 30px rgba(255,94,94,0.8)" }}>SIGNAL LOST</div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ nope: a word struck through */
const Nope: React.FC<{ t: number; len: number; label: string }> = ({ t, label }) => {
  const s = ease(t / 0.18);
  const strike = ease((t - 0.22) / 0.16);
  return (
    <AbsoluteFill>
      <Bg t={t} tint="#1a0d18" />
      <Img src={staticFile("lib/photos/jupiter_globe_PIA02873.jpg")} style={{ position: "absolute", right: -260, top: 120, width: 900, height: 900, objectFit: "cover", borderRadius: "50%", opacity: 0.22, filter: "blur(2px)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 900, fontSize: 230, letterSpacing: 8, color: C.white, scale: String(1.25 - 0.25 * s), opacity: s, textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
          <span style={{ fontSize: 120, color: C.dim, marginRight: 40, verticalAlign: "middle" }}>NO</span>
          <span style={{ position: "relative", display: "inline-block" }}>
            {label}
            <div style={{ position: "absolute", left: -24, right: -24, top: "50%", height: 24, background: C.red, transformOrigin: "0 50%", scale: `${strike} 1`, rotate: "-4deg", boxShadow: "0 0 30px rgba(255,94,94,0.7)" }} />
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ bullet: 1 km/s vs 57 km/s */
const Bullet: React.FC<{ t: number; len: number }> = ({ t }) => {
  const bx = 200 + t * 60; // a bullet crawls
  const you = interpolate(t, [0.25, 0.75], [-400, 2400], { ...clamp, easing: (x) => x });
  return (
    <AbsoluteFill>
      <Bg t={t} tint="#101632" />
      <div style={{ position: "absolute", left: 200, top: 330, fontFamily: FONT, fontWeight: 700, fontSize: 36, letterSpacing: 4, color: C.dim }}>RIFLE BULLET · ~1 km/s</div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${bx},400)`}>
          <path d="M0,0 L90,0 Q140,0 160,22 Q140,44 90,44 L0,44 Z" fill="#c9a66b" />
          <rect x={-40} y={2} width={40} height={40} fill="#8d7246" />
        </g>
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={bx - 60 - i * 30} y1={410 + i * 4} x2={bx - 140 - i * 30} y2={410 + i * 4} stroke="rgba(255,255,255,0.25)" strokeWidth={2} />)}
        <defs>
          <linearGradient id="trail" x1="0" x2="1">
            <stop offset="0" stopColor="#ff4a1a" stopOpacity={0} />
            <stop offset="0.7" stopColor="#ffb070" stopOpacity={0.9} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={1} />
          </linearGradient>
        </defs>
        <rect x={you - 1600} y={640} width={1600} height={26} rx={13} fill="url(#trail)" style={{ filter: "blur(2px)" }} />
        <circle cx={you} cy={653} r={34} fill="#fff" style={{ filter: "drop-shadow(0 0 30px #ffb070) drop-shadow(0 0 60px #ff6a2a)" }} />
      </svg>
      <div style={{ position: "absolute", left: 200, top: 720, fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: 4, color: C.amber, opacity: interpolate(t, [0.5, 0.7], [0, 1], clamp) }}>YOU · 57 km/s</div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ race: bars (bullet, Galileo, you) */
const Race: React.FC<{ t: number; len: number }> = ({ t }) => {
  const rows = [
    { label: "Rifle bullet", v: 1, c: "#9aa3c7" },
    { label: "Galileo probe, 1995", v: 47.4, c: C.cyan },
    { label: "You", v: 57.4, c: C.amber },
  ];
  const max = 60;
  return (
    <AbsoluteFill>
      <Bg t={t} tint="#0c1230" />
      <div style={{ position: "absolute", left: 200, top: 210, fontFamily: FONT, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: C.dim }}>ENTRY SPEED · km/s</div>
      {rows.map((r, i) => {
        const k = ease((t - 0.1 - i * 0.28) / 0.55);
        const w = 1300 * (r.v / max) * k;
        return (
          <div key={i} style={{ position: "absolute", left: 200, top: 330 + i * 190 }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.white, marginBottom: 14, opacity: Math.min(1, k * 3) }}>{r.label}</div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: Math.max(8, w), height: 64, borderRadius: 10, background: r.c, boxShadow: `0 0 30px ${r.c}66` }} />
              <div style={{ marginLeft: 26, fontFamily: DISPLAY, fontWeight: 900, fontSize: 64, color: r.c, fontVariantNumeric: "tabular-nums", opacity: Math.min(1, k * 3) }}>
                {(r.v * k).toFixed(r.v < 2 ? 0 : 1)}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ tnt: 390 blocks fill a grid */
const Tnt: React.FC<{ t: number; len: number }> = ({ t, len }) => {
  const n = 390;
  const cols = 30;
  const shown = Math.floor(interpolate(t, [0.4, len * 0.62], [0, n], clamp));
  const flash = Math.max(0, 1 - Math.abs(t - len * 0.72) / 0.12);
  return (
    <AbsoluteFill>
      <Bg t={t} tint="#1d0c08" />
      <div style={{ position: "absolute", left: 170, top: 400, width: 300, textAlign: "center" }}>
        <div style={{ width: 200, height: 200, margin: "0 auto", borderRadius: 22, background: "linear-gradient(160deg,#ffcf8a,#ff8a3a)", boxShadow: "0 0 50px rgba(255,140,60,0.6)", scale: String(0.6 + 0.4 * ease(t / 0.3)) }} />
        <div style={{ marginTop: 26, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.white }}>1 kg of you</div>
      </div>
      <div style={{ position: "absolute", left: 520, top: 470, fontFamily: DISPLAY, fontWeight: 900, fontSize: 110, color: C.dim }}>=</div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: shown }, (_, i) => {
          const x = 650 + (i % cols) * 38;
          const y = 270 + Math.floor(i / cols) * 38;
          return <rect key={i} x={x} y={y} width={30} height={30} rx={4} fill={i % 13 === 0 ? "#ff6a3a" : "#d8342a"} stroke="#ffb08a" strokeWidth={1.5} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 650, top: 800, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: "#ffb08a", fontVariantNumeric: "tabular-nums" }}>{shown} kg of TNT</div>
      <AbsoluteFill style={{ background: "#fff2dc", opacity: flash * 0.85 }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ end: brand + glitch */
const End: React.FC<{ t: number; len: number }> = ({ t }) => {
  const g = t < 0.25 ? Math.sin(t * 90) * 18 : 0;
  return (
    <AbsoluteFill>
      <Bg t={t} tint="#141a4a" />
      <Img src={staticFile("logo.svg")} style={{ position: "absolute", left: 960 - 130 + g, top: 120, width: 260, height: 260, opacity: ease(t / 0.3) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, letterSpacing: 16, color: C.dim, opacity: ease((t - 0.1) / 0.3) }}>THE IF ENGINE</div>
    </AbsoluteFill>
  );
};

export const Card: React.FC<{ card: string; t: number; len: number; label?: string }> = ({ card, t, len, label }) => {
  switch (card) {
    case "signal": return <Signal t={t} len={len} />;
    case "nope": return <Nope t={t} len={len} label={label ?? ""} />;
    case "bullet": return <Bullet t={t} len={len} />;
    case "race": return <Race t={t} len={len} />;
    case "tnt": return <Tnt t={t} len={len} />;
    case "end": return <End t={t} len={len} />;
    default: return <Bg t={t} />;
  }
};
