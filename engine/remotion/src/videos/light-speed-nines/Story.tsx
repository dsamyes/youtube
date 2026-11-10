// The bill, the galaxy map, the homecoming, deep time and the end card.
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Img, interpolate, staticFile, useVideoConfig } from "remotion";
import { C, DISPLAY, FONT } from "../../brand";
import { clamp, prog } from "../../timeline";
import { SceneProps } from "../../types";
import m31Img from "./assets/andromeda_PIA04921.jpg";
import earthImg from "./assets/earth_as17-148-22727.jpg";
import mwImg from "./assets/milkyway_PIA10748.jpg";
import { Big, easeIO, Glass, Label, levels, lvl, tripKey, val, introFade } from "./common";
import { Starfield } from "./Starfield";

/* ------------------------------------------------------------------ the bill */
export const Bill: React.FC<SceneProps> = (p) => {
  const L = lvl(p.data, p.params.level);
  const ls = levels(p.data).filter((l) => l.key !== "0");
  const upto = ls.findIndex((l) => l.key === L.key);
  const lo = Math.log10(1 / 12) - 0.2;
  const hi = 5.2;
  const x0 = 640;
  const x1 = 1640;
  const X = (years: number) => x0 + ((Math.log10(years) - lo) / (hi - lo)) * (x1 - x0);
  const ticks: [number, string][] = [[1 / 12, "1 month"], [1, "1 yr"], [10, "10"], [100, "100"], [1000, "1,000"], [10000, "10,000"], [100000, "100,000 yr"]];
  const rowH = 82;
  const top = 300;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 420, top: 150 }}>
        <Label color={C.amber} size={24}>The bill · minimum energy to reach each speed</Label>
        <div style={{ fontFamily: FONT, fontSize: 28, color: C.dim, marginTop: 8 }}>
          {`ISS-mass ship, perfect engine · in years of ALL human energy use (${val(p.data, "world_ej")} EJ per year)`}
        </div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {ticks.map(([y, s]) => (
          <g key={s}>
            <line x1={X(y)} x2={X(y)} y1={top - 20} y2={top + rowH * 7} stroke={C.faint} strokeWidth={2} />
            <text x={X(y)} y={top + rowH * 7 + 36} fill={C.dim} fontSize={22} fontFamily={FONT} fontWeight={700} textAnchor="middle">{s}</text>
          </g>
        ))}
        {ls.map((l, i) => {
          if (i > upto) return null;
          const yrs = Number(p.data.values[`kew_${l.key}`]?.value ?? 1);
          const isCur = i === upto;
          const g = isCur ? interpolate(p.pt, [0.3, 2.0], [0, 1], { ...clamp, easing: easeIO }) : 1;
          const w = (X(yrs) - x0) * g;
          const y = top + i * rowH;
          const lab = l.key === "10" ? `${val(p.data, "kemo_10")} months` : `${val(p.data, `kew_${l.key}`)} years`;
          return (
            <g key={l.key} opacity={isCur ? 1 : 0.75}>
              <text x={x0 - 24} y={y + 42} fill={isCur ? C.amber : C.white} fontSize={34} fontFamily={DISPLAY} fontWeight={900} textAnchor="end">{l.pct}%</text>
              <rect x={x0} y={y + 10} width={Math.max(4, w)} height={46} rx={10} fill={isCur ? "url(#billCur)" : "url(#billOld)"} />
              <text x={x0 + w + 18} y={y + 44} fill={isCur ? C.amber : C.white} fontSize={32} fontFamily={DISPLAY} fontWeight={800} opacity={g}>{lab}</text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="billCur" x1="0" x2="1"><stop offset="0" stopColor={C.cyan} /><stop offset="0.6" stopColor={C.purple} /><stop offset="1" stopColor={C.amber} /></linearGradient>
          <linearGradient id="billOld" x1="0" x2="1"><stop offset="0" stopColor="#2B3380" /><stop offset="1" stopColor="#5A4A9E" /></linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", left: 420, bottom: 120, fontFamily: FONT, fontSize: 20, color: C.dim }}>log scale · each gridline is 10× the one before</div>
    </div>
  );
};

/* ------------------------------------------------------------------ galaxy map */
const Credit: React.FC<{ s: string; vertical?: boolean }> = ({ s, vertical }) => (
  <div style={{ position: "absolute", right: vertical ? 130 : 70, top: vertical ? 1180 : 110, fontFamily: FONT, fontSize: 18, color: C.dim }}>{s}</div>
);

const TimeBox: React.FC<{ rows: [string, string, string][]; style: React.CSSProperties; pt: number; title: string }> = ({ rows, style, pt, title }) => (
  <Glass accent={C.cyan} style={{ padding: "22px 30px", ...style }}>
    <Label color={C.cyan} size={22}>{title}</Label>
    {rows.map(([l, v, c], i) => (
      <div key={i} style={{ marginTop: 12, opacity: prog(pt, 0.5 + i * 0.6, 1.0 + i * 0.6) }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 2.5, color: C.dim }}>{l}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: c, lineHeight: 1.05 }}>{v}</div>
      </div>
    ))}
  </Glass>
);

export const Galaxy: React.FC<SceneProps> = (p) => {
  const { width: W, height: H } = useVideoConfig();
  const vertical = H > W;
  const mode = String(p.params.mode ?? "gc");
  const L = lvl(p.data, p.params.level);
  const a = introFade(p, 0, 0.7);
  if (mode === "ac") {
    const tr = tripKey(p.data, "ac", L.key);
    const te = val(p.data, `te_ac_${L.key}`);
    const x0 = vertical ? 200 : 360;
    const x1 = vertical ? 880 : 1500;
    const y = vertical ? 640 : 470;
    const f = interpolate(p.pt, [0.4, 4.5], [0, 1], { ...clamp, easing: easeIO });
    return (
      <div style={{ position: "absolute", inset: 0, opacity: a }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="sunG"><stop offset="0" stopColor="#FFF6D8" /><stop offset="0.4" stopColor="#FFD27A" /><stop offset="1" stopColor="#FFB547" stopOpacity={0} /></radialGradient>
          </defs>
          <circle cx={x0} cy={y} r={70} fill="url(#sunG)" />
          <circle cx={x1} cy={y} r={60} fill="url(#sunG)" />
          <circle cx={x1 + 26} cy={y + 10} r={36} fill="url(#sunG)" opacity={0.8} />
          <line x1={x0 + 60} y1={y} x2={x1 - 60} y2={y} stroke={C.cyan} strokeWidth={4} strokeDasharray="16 14" opacity={0.7} />
          <circle cx={x0 + 60 + (x1 - x0 - 120) * f} cy={y} r={12} fill={C.white} />
          <text x={x0} y={y + 120} fill={C.white} fontSize={32} fontFamily={DISPLAY} fontWeight={900} textAnchor="middle">THE SUN</text>
          <text x={x1} y={y + 120} fill={C.white} fontSize={32} fontFamily={DISPLAY} fontWeight={900} textAnchor="middle">ALPHA CENTAURI</text>
          <text x={(x0 + x1) / 2} y={y - 40} fill={C.cyan} fontSize={34} fontFamily={DISPLAY} fontWeight={800} textAnchor="middle">{val(p.data, "d_ac")} light-years</text>
        </svg>
        <TimeBox title={`At ${L.pct}% of light speed`} pt={p.pt} style={vertical ? { left: 70, top: 820, width: 890 } : { left: 120, top: 640, width: 880 }}
          rows={[["ON YOUR CLOCK", `${tr.v} ${tr.u}`, C.cyan], ["ON EARTH", `${te} years`, C.amber]]} />
      </div>
    );
  }
  if (mode === "m31") {
    const f = interpolate(p.pt, [0.3, 5], [0, 1], { ...clamp, easing: easeIO });
    const zoom = interpolate(p.t, [0, 14], [1.06, 1], clamp);
    const peak = p.phase === "peak";
    const mx = 290;
    const ax = 900;
    const yy = 440;
    const midx = (mx + ax) / 2;
    const u = f;
    const bx = (1 - u) * (1 - u) * (mx + 150) + 2 * (1 - u) * u * midx + u * u * (ax - 200);
    const by = (1 - u) * (1 - u) * yy + 2 * (1 - u) * u * (yy - 220) + u * u * yy;
    return (
      <div style={{ position: "absolute", inset: 0, opacity: a }}>
        <div style={{ position: "absolute", inset: 0, scale: zoom, transformOrigin: "600px 440px" }}>
          <Img src={mwImg} style={{ position: "absolute", left: mx - 190, top: yy - 190, width: 380, height: 380, borderRadius: 190 }} />
          <Img src={m31Img} style={{ position: "absolute", left: ax - 290, top: yy - 290, width: 580, height: 580, maskImage: "radial-gradient(circle, #000 55%, transparent 72%)" }} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d={`M ${mx + 150} ${yy} Q ${midx} ${yy - 220} ${ax - 200} ${yy}`} fill="none" stroke={C.cyan} strokeWidth={4} strokeDasharray="16 14" opacity={0.75} />
            <circle cx={bx} cy={by} r={12} fill={C.white} />
            <text x={mx} y={yy + 240} fill={C.white} fontSize={28} fontFamily={DISPLAY} fontWeight={900} textAnchor="middle">MILKY WAY</text>
            <text x={ax} y={yy + 240} fill={C.white} fontSize={28} fontFamily={DISPLAY} fontWeight={900} textAnchor="middle">ANDROMEDA</text>
            <text x={midx} y={yy - 150} fill={C.cyan} fontSize={30} fontFamily={DISPLAY} fontWeight={800} textAnchor="middle">{val(p.data, "d_m31_mly")} million light-years</text>
            {peak ? <circle cx={midx} cy={yy - 110} r={16} fill={C.amber} opacity={prog(p.pt, 0.3, 1)} /> : null}
          </svg>
        </div>
        <TimeBox title="Ship at a steady 1 g, flip at halfway" pt={p.pt} style={{ left: 100, top: 730, width: 520 }}
          rows={[["ON YOUR CLOCK", `${val(p.data, "g1_ts_m31")} years`, C.cyan]]} />
        <Glass accent={C.amber} style={{ left: 660, top: 730, width: 500, padding: "22px 30px", opacity: prog(p.pt, 1.4, 2.0) }}>
          <Label color={C.amber} size={22}>Meanwhile</Label>
          <div style={{ marginTop: 12, fontSize: 20, fontWeight: 800, letterSpacing: 2.5, color: C.dim }}>ON EARTH</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 56, color: C.amber, lineHeight: 1.05 }}>{val(p.data, "g1_te_m31_my")} million years</div>
        </Glass>
        {peak ? (
          <Glass accent={C.amber} style={{ left: 1240, top: 300, width: 580, padding: "26px 32px", opacity: prog(p.pt, 0.3, 1.0) }}>
            <Label color={C.amber} size={22}>Peak speed, at the halfway point</Label>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, color: C.amber, marginTop: 10, lineHeight: 1.05 }}>{val(p.data, "m31_pct")}%</div>
            <div style={{ fontSize: 26, color: C.dim, marginTop: 14 }}>{`LHC protons (${val(p.data, "lhc_tev")} TeV): ${val(p.data, "lhc_pct")}%`}</div>
            <div style={{ fontSize: 26, color: C.dim, marginTop: 8 }}>{`Energy: ≈ ${val(p.data, "kew_m31_my")} million years of world use`}</div>
          </Glass>
        ) : null}
        <div style={{ position: "absolute", left: 100, top: 110, fontFamily: FONT, fontSize: 18, color: C.dim }}>Milky Way: NASA/JPL-Caltech/R. Hurt (illustration) · Andromeda: NASA/JPL/Caltech GALEX</div>
      </div>
    );
  }
  // galactic centre (constant cruise or the 1 g ship)
  const oneG = mode === "gc1g";
  const earthPhase = p.phase === "earth";
  const zoom = interpolate(p.t, [0, 16], [1.0, 1.12], clamp);
  const size = vertical ? 1300 : 1400;
  const gx = vertical ? 540 : 1180;
  const gy = vertical ? 700 : 500;
  const sunX = gx;
  const sunY = gy + size * 0.235;
  const f = interpolate(p.pt, [0.4, 4.5], [0, 1], { ...clamp, easing: easeIO });
  const tr = tripKey(p.data, "gc", L.key);
  const rows: [string, string, string][] = oneG
    ? [["ON YOUR CLOCK", `${val(p.data, "g1_ts_gc")} years`, C.cyan], ["ON EARTH", `${val(p.data, "g1_te_gc")} years`, C.amber]]
    : earthPhase
      ? [["ON EARTH, WHEN YOU ARRIVE", `+${val(p.data, `te_gc_${L.key}`)} years`, C.amber]]
      : [["ON YOUR CLOCK", `${tr.v} ${tr.u}`, C.cyan], ["ON EARTH", `${val(p.data, `te_gc_${L.key}`)} years`, C.amber]];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, scale: zoom, transformOrigin: `${gx}px ${gy}px` }}>
        <Img src={mwImg} style={{ position: "absolute", left: gx - size / 2, top: gy - size / 2, width: size, height: size, rotate: `${p.t * 0.25}deg` }} />
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <line x1={sunX} y1={sunY} x2={gx} y2={gy} stroke={C.amber} strokeWidth={5} strokeDasharray="18 12" />
          <circle cx={sunX + (gx - sunX) * f} cy={sunY + (gy - sunY) * f} r={13} fill={C.white} stroke={C.deep} strokeWidth={4} />
          <circle cx={sunX} cy={sunY} r={16} fill="none" stroke={C.cyan} strokeWidth={4} />
          <text x={sunX - 30} y={sunY + 10} fill={C.cyan} fontSize={30} fontFamily={DISPLAY} fontWeight={900} textAnchor="end" style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 6 }}>YOU ARE HERE</text>
          <text x={gx + 34} y={gy - 20} fill={C.white} fontSize={30} fontFamily={DISPLAY} fontWeight={900} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 6 }}>GALACTIC CENTER</text>
          <text x={gx + 34} y={gy + 18} fill={C.amber} fontSize={26} fontFamily={FONT} fontWeight={800} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 6 }}>{val(p.data, "d_gc")} light-years</text>
        </svg>
      </div>
      <TimeBox title={oneG ? "Ship at a steady 1 g, flip at halfway" : `At ${L.pct}% of light speed`} pt={p.pt}
        style={vertical ? { left: 70, top: 260, width: 890 } : { left: 100, top: 300, width: 640 }} rows={rows} />
      <Credit s="Milky Way illustration: NASA/JPL-Caltech/R. Hurt" vertical={vertical} />
    </div>
  );
};

/* ------------------------------------------------------------------ homecoming */
export const Home: React.FC<SceneProps> = (p) => {
  const ret = p.phase === "return";
  const a = prog(p.pt, 0, 0.6);
  if (!ret) {
    const f = interpolate(p.pt, [0.6, 7.5], [0, 1], { ...clamp, easing: easeIO });
    const ex = 420;
    const ax = 1500;
    const y = 500;
    const u = f < 0.5 ? f * 2 : 2 - f * 2;
    const bx = ex + (ax - ex) * u;
    const by = y - Math.sin(u * Math.PI) * 120 * (f < 0.5 ? 1 : -1);
    return (
      <div style={{ position: "absolute", inset: 0, opacity: prog(p.t, 0, 0.6) }}>
        <Img src={earthImg} style={{ position: "absolute", left: ex - 170, top: y - 170, width: 340, height: 340, borderRadius: 170 }} />
        <Img src={m31Img} style={{ position: "absolute", left: ax - 200, top: y - 200, width: 400, height: 400, maskImage: "radial-gradient(circle, #000 50%, transparent 70%)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d={`M ${ex + 180} ${y} Q ${(ex + ax) / 2} ${y - 240} ${ax - 200} ${y}`} fill="none" stroke={C.cyan} strokeWidth={4} strokeDasharray="14 12" opacity={0.6} />
          <path d={`M ${ax - 200} ${y} Q ${(ex + ax) / 2} ${y + 240} ${ex + 180} ${y}`} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray="14 12" opacity={0.6} />
          <circle cx={bx} cy={by} r={13} fill={C.white} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center", gap: 60 }}>
          {[["YOU LEAVE AT", val(p.data, "age_leave"), C.cyan, 0.5], ["TIME ON YOUR CLOCK", `${val(p.data, "rt_ship_m31")} years`, C.white, 2.5], ["YOU STEP OUT AT", val(p.data, "age_return"), C.amber, 5.5]].map(([l, v, c, d]) => (
            <div key={String(l)} style={{ textAlign: "center", opacity: prog(p.pt, Number(d), Number(d) + 0.6) }}>
              <Label size={22}>{String(l)}</Label>
              <Big size={88} color={String(c)}>{String(v)}</Big>
            </div>
          ))}
        </div>
      </div>
    );
  }
  const total = Number(p.data.values.rt_earth_m31_my?.value ?? 5) * 1e6;
  const f = interpolate(p.pt, [0.2, 3.2], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const shown = Math.round(total * f);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <Img src={earthImg} style={{ position: "absolute", left: 960 - 260, top: 215, width: 520, height: 520, borderRadius: 260, rotate: `${f * 40}deg`, boxShadow: "0 0 120px #3DE0FF55" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 755, textAlign: "center" }}>
        <Label size={26} color={C.cyan}>Earth's calendar while you were gone</Label>
        <Big size={140} color={C.amber} style={{ fontVariantNumeric: "tabular-nums", textShadow: "0 0 50px #FFB54755" }}>+{shown.toLocaleString("en-US")}</Big>
        <Label size={34} color={C.white} style={{ marginTop: 6 }}>years</Label>
      </div>
      <div style={{ position: "absolute", right: 70, top: 110, fontFamily: FONT, fontSize: 18, color: C.dim }}>Earth: NASA, Apollo 17 (AS17-148-22727)</div>
    </div>
  );
};

/* ------------------------------------------------------------------ deep time */
export const DeepTime: React.FC<SceneProps> = (p) => {
  const homo = Number(p.data.values.homo_my?.value ?? 2.8);
  const fut = Number(p.data.values.rt_earth_m31_my?.value ?? 5);
  const x0 = 200;
  const x1 = 1720;
  const span = 6;
  const X = (my: number) => (x0 + x1) / 2 + (my / span) * ((x1 - x0) / 2);
  const y = 560;
  const g = interpolate(p.pt, [0.2, 2.0], [0, 1], { ...clamp, easing: easeIO });
  const g2 = interpolate(p.pt, [2.0, 4.5], [0, 1], { ...clamp, easing: easeIO });
  return (
    <div style={{ position: "absolute", inset: 0, opacity: prog(p.t, 0, 0.6) }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <line x1={x0} y1={y} x2={x1} y2={y} stroke={C.faint} strokeWidth={6} />
        {Array.from({ length: 2 * span + 1 }).map((_, i) => (
          <line key={i} x1={X(i - span)} x2={X(i - span)} y1={y - 14} y2={y + 14} stroke={C.dim} strokeWidth={3} />
        ))}
        <line x1={X(0)} y1={y} x2={X(-homo * g)} y2={y} stroke={C.purple} strokeWidth={14} strokeLinecap="round" />
        <line x1={X(0)} y1={y} x2={X(fut * g2)} y2={y} stroke={C.amber} strokeWidth={14} strokeLinecap="round" />
        <circle cx={X(0)} cy={y} r={18} fill={C.white} />
        <text x={X(0)} y={y + 70} fill={C.white} fontSize={32} fontFamily={DISPLAY} fontWeight={900} textAnchor="middle">YOU LEAVE</text>
        <g opacity={g}>
          <circle cx={X(-homo)} cy={y} r={14} fill={C.purple} />
          <text x={X(-homo)} y={y - 110} fill={C.purple} fontSize={30} fontFamily={DISPLAY} fontWeight={900} textAnchor="middle">OLDEST FOSSIL OF HOMO</text>
          <text x={X(-homo)} y={y - 64} fill={C.white} fontSize={44} fontFamily={DISPLAY} fontWeight={900} textAnchor="middle">{val(p.data, "homo_my")} million years ago</text>
        </g>
        <g opacity={g2}>
          <circle cx={X(fut)} cy={y} r={14} fill={C.amber} />
          <text x={X(fut) - 40} y={y - 110} fill={C.amber} fontSize={30} fontFamily={DISPLAY} fontWeight={900} textAnchor="middle">YOU COME HOME</text>
          <text x={X(fut) - 40} y={y - 64} fill={C.white} fontSize={44} fontFamily={DISPLAY} fontWeight={900} textAnchor="middle">+{val(p.data, "rt_earth_m31_my")} million years</text>
        </g>
        <text x={x0} y={y + 140} fill={C.dim} fontSize={24} fontFamily={FONT} fontWeight={700}>← THE PAST</text>
        <text x={x1} y={y + 140} fill={C.dim} fontSize={24} fontFamily={FONT} fontWeight={700} textAnchor="end">EARTH'S FUTURE →</text>
        <text x={960} y={y + 210} fill={C.dim} fontSize={22} fontFamily={FONT} fontWeight={600} textAnchor="middle">each tick = 1 million years</text>
      </svg>
    </div>
  );
};

/* ------------------------------------------------------------------ end card */
export const EndCard: React.FC<SceneProps> = (p) => {
  const { width: W, height: H } = useVideoConfig();
  const ls = levels(p.data);
  const L = ls.find((l) => l.key === "9999") ?? ls[0];
  const a = prog(p.pt, 0.2, 1.2);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Starfield view={{ beta: L.beta, fov: 12 * Math.exp(-0.01 * p.t), roll: p.t * 0.8 }} width={W} height={H} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,5,20,0.55)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", flexDirection: "column", alignItems: "center", opacity: a }}>
        <Img src={staticFile("logo.svg")} style={{ width: 120, height: 120 }} />
        <Label color={C.cyan} size={30} style={{ marginTop: 40 }}>Next trip</Label>
        <Big size={92} style={{ marginTop: 22, textAlign: "center", textTransform: "uppercase", lineHeight: 1.1 }}>{p.data.nextVideo}</Big>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.dim, marginTop: 70, opacity: prog(p.pt, 4, 5) }}>
          Run the impossible. <span style={{ color: C.amber }}>Do the math.</span>
        </div>
      </div>
    </div>
  );
};
