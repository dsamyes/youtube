// Twin clocks: your year against Earth's. The Earth dial spins gamma times faster.
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Img, interpolate, useVideoConfig } from "remotion";
import { C, DISPLAY, FONT } from "../../brand";
import { clamp, prog } from "../../timeline";
import { SceneProps } from "../../types";
import earthImg from "./assets/earth_as17-148-22727.jpg";
import { easeIO, Label, lvl, val, introFade } from "./common";

const Dial: React.FC<{ x: number; y: number; r: number; turns: number; earth?: boolean; color: string }> = ({ x, y, r, turns, earth, color }) => {
  const ang = turns * 360;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r + 26} fill="rgba(7,9,32,0.75)" stroke={color} strokeWidth={4} />
      {earth ? (
        <g>
          <clipPath id="earthclip"><circle r={r - 6} /></clipPath>
          <foreignObject x={-r} y={-r} width={2 * r} height={2 * r} clipPath="url(#earthclip)">
            <Img src={earthImg} style={{ width: 2 * r, height: 2 * r, rotate: `${ang * 0.02}deg`, opacity: 0.55 }} />
          </foreignObject>
        </g>
      ) : (
        <circle r={r - 6} fill="url(#faceGrad)" />
      )}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={Math.sin(a) * (r - 4)} y1={-Math.cos(a) * (r - 4)} x2={Math.sin(a) * (r - 30)} y2={-Math.cos(a) * (r - 30)} stroke={C.white} strokeWidth={i % 3 === 0 ? 6 : 3} opacity={0.8} />;
      })}
      {/* progress arc: how much of the year has passed (one full turn = one year) */}
      <circle r={r + 13} fill="none" stroke={color} strokeWidth={10} strokeDasharray={`${Math.min(1, turns) * 2 * Math.PI * (r + 13)} 99999`} transform="rotate(-90)" opacity={0.9} />
      {turns > 1.02 ? (
        // motion-blurred sweep when the hand turns faster than the eye can follow
        <circle r={r * 0.5} fill="none" stroke={color} strokeWidth={r * 0.92} opacity={Math.min(0.32, (turns - 1) * 0.08)} />
      ) : null}
      <line x1={0} y1={0} x2={Math.sin((ang * Math.PI) / 180) * (r - 40)} y2={-Math.cos((ang * Math.PI) / 180) * (r - 40)} stroke={color} strokeWidth={10} strokeLinecap="round" />
      <circle r={14} fill={color} />
    </g>
  );
};

export const Clocks: React.FC<SceneProps> = (p) => {
  const { width: W, height: H } = useVideoConfig();
  const vertical = H > W;
  let L = lvl(p.data, p.params.level);
  let pt = p.pt;
  let span = 5.0;
  if (p.phase === "climb") {
    // walk through 90% -> 99% within one beat
    const seq = ["l90", "l99"];
    const per = 3.0;
    const k = Math.min(seq.length - 1, Math.floor(p.pt / per));
    L = lvl(p.data, seq[k]);
    pt = p.pt - k * per;
    span = 2.4;
  }
  const f = interpolate(pt, [0.3, 0.3 + span], [0, 1], { ...clamp, easing: easeIO });
  const shipYears = f;
  const earthYears = f * L.gamma;
  const doneShip = f >= 1;
  const r = vertical ? 200 : 196;
  const yx = vertical ? [290, 790] : [560, 1360];
  const cy = vertical ? 860 : 585;
  const a = introFade(p, 0, 0.6);
  const xd = L.gamma < 2 ? val(p.data, `xdays_${L.key}`) : "";
  const fmt = (y: number, final: string) => (f >= 1 ? final : y < 10 ? y.toFixed(2) : y < 100 ? y.toFixed(1) : Math.round(y).toLocaleString("en-US"));
  const lab = (x: number, title: string, value: string, unit: string, color: string, sub = "") => (
    <div style={{ position: "absolute", left: x - 260, width: 520, top: cy + r + 36, textAlign: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: C.dim }}>{title}</div>
      {sub ? <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 26, color: C.cyan }}>{sub}</div> : null}
      <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: vertical ? 76 : 72, color, fontVariantNumeric: "tabular-nums", lineHeight: 1.05 }}>
        {value} <span style={{ fontSize: "0.5em" }}>{unit}</span>
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="faceGrad" cx="40%" cy="35%" r="75%">
            <stop offset="0" stopColor="#2A3180" />
            <stop offset="1" stopColor="#0B0E33" />
          </radialGradient>
        </defs>
        <Dial x={yx[0]} y={cy} r={r} turns={shipYears} color={C.cyan} />
        <Dial x={yx[1]} y={cy} r={r} turns={earthYears} earth color={C.amber} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: vertical ? cy - r - 210 : 236, textAlign: "center" }}>
        <Label color={C.dim} size={26}>{`At ${L.pct}% of light speed`}</Label>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: vertical ? 60 : 56, color: C.white, marginTop: 4 }}>
          1 year aboard = <span style={{ color: C.amber }}>{val(p.data, `ey_${L.key}`)}</span> on Earth
        </div>
        
      </div>
      {lab(yx[0], "YOUR CLOCK", fmt(shipYears, "1"), doneShip ? "year" : "yr", C.cyan)}
      {lab(yx[1], "EARTH", fmt(earthYears, val(p.data, `ey_${L.key}`)), "years", C.amber, xd && f >= 1 ? `+${xd} days` : "")}
      {!vertical ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: cy - 40, textAlign: "center", fontFamily: DISPLAY, fontWeight: 900, fontSize: 70, color: C.white, opacity: prog(pt, 0.6, 1.2) }}>
          ×{L.g_disp}
        </div>
      ) : null}
      {!vertical ? <div style={{ position: "absolute", right: 70, bottom: 120, fontSize: 18, color: C.dim, fontFamily: FONT }}>Earth: NASA, Apollo 17 (AS17-148-22727)</div> : null}
    </div>
  );
};
