// What hits you: interstellar hydrogen arriving at the bow as a proton beam.
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { interpolate, useVideoConfig } from "remotion";
import { C, DISPLAY, FONT } from "../../brand";
import { Person } from "../../components/Svg";
import { clamp, prog, rand } from "../../timeline";
import { SceneProps } from "../../types";
import { Glass, Label, lvl, val, introFade } from "./common";

const CY = 450; // local centre line
const HALF = 230; // half height of the hull
const BOW = 1000; // x where the bow plate starts
const TIP = 1150;
const surfaceX = (dy: number) => BOW + (TIP - BOW) * (1 - Math.min(1, Math.abs(dy) / HALF));

const Mosquito: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={C.white} strokeWidth={3} fill="none" strokeLinecap="round">
    <ellipse cx={0} cy={0} rx={30} ry={8} fill={C.white} opacity={0.9} />
    <circle cx={36} cy={-2} r={8} fill={C.white} />
    <line x1={44} y1={-2} x2={78} y2={6} />
    <path d="M -6 -6 Q -20 -50 10 -60 Q 14 -30 4 -6" fill="rgba(244,246,255,0.25)" />
    <path d="M 6 -6 Q 10 -46 40 -50 Q 34 -24 14 -6" fill="rgba(244,246,255,0.18)" />
    {[-14, 0, 14].map((dx) => <path key={dx} d={`M ${dx} 6 L ${dx - 10} 28 L ${dx - 22} 44`} />)}
  </g>
);

export const Beam: React.FC<SceneProps> = (p) => {
  const { width: W, height: H } = useVideoConfig();
  const vertical = H > W;
  const L = lvl(p.data, p.params.level);
  const key = L.key;
  const phase = p.phase;
  const t = p.t;
  const hi = L.beta >= 0.99;
  const tank = (key === "50" && phase === "stop") || L.beta >= 0.9;
  const shower = L.beta >= 0.9;
  const heat = phase === "heat" || L.beta >= 0.9999;
  const dust = phase === "dust";
  const color = key === "10" ? "#7FD8FF" : key === "50" ? "#BFF3FF" : L.beta < 0.99 ? "#E0C8FF" : "#FFE6B0";
  const n = key === "10" ? 26 : key === "50" ? 34 : hi ? 64 : 46;
  const speed = 1500 + Math.min(1600, Math.log10(L.gamma + 0.001) * 700);
  const lw = key === "10" ? 3 : key === "50" ? 4 : hi ? 6 : 5;

  const particles: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const dy = (rand(i + 11) - 0.5) * 2 * (HALF - 20);
    const sx = surfaceX(dy);
    let stopX: number;
    if (key === "10") stopX = sx - 3;
    else if (key === "50" && phase === "stop") stopX = sx - 60 - rand(i + 5) * 70;
    else if (key === "50") stopX = 120;
    else stopX = 120;
    const startX = 2200;
    const len = startX - stopX;
    const cycle = len / speed + 0.35;
    const local = (t + rand(i) * cycle) % cycle;
    const x = startX - local * speed;
    const y = CY + dy;
    if (x > stopX) {
      particles.push(<line key={`p${i}`} x1={x} y1={y} x2={x + 70 + lw * 10} y2={y} stroke={color} strokeWidth={lw} strokeLinecap="round" opacity={0.95} />);
      particles.push(<circle key={`h${i}`} cx={x} cy={y} r={lw * 1.4} fill="#fff" />);
    } else {
      const since = local - len / speed;
      if (since < 0.25 && stopX > 300) {
        particles.push(<circle key={`f${i}`} cx={stopX} cy={y} r={6 + since * 60} fill="none" stroke={color} strokeWidth={3} opacity={1 - since * 4} />);
      }
    }
    // nuclear showers inside the shielding at GeV energies
    if (shower && i % 3 === 0) {
      const hitX = BOW - 20 - rand(i + 3) * 380;
      if (x < hitX) {
        const since = (hitX - x) / speed;
        const fade = Math.max(0, 1 - since * 2.2);
        for (let b = 0; b < 4; b++) {
          const ang = Math.PI + (rand(i * 7 + b) - 0.5) * 1.1;
          const l = (130 + rand(i + b * 3) * 200) * Math.min(1, since * 6);
          particles.push(<line key={`s${i}-${b}`} x1={hitX} y1={y} x2={hitX + Math.cos(ang) * l} y2={y + Math.sin(ang) * l} stroke={C.purple} strokeWidth={3} opacity={fade} />);
        }
        particles.push(<circle key={`n${i}`} cx={hitX} cy={y} r={8} fill={C.white} opacity={fade} />);
      }
    }
  }

  // dust grain impact (repeats every 3.6 s)
  let dustEl: React.ReactNode = null;
  if (dust) {
    const c = (p.pt % 3.6);
    const hitT = 1.1;
    if (c < hitT) {
      const x = interpolate(c, [0, hitT], [2100, surfaceX(0)]);
      dustEl = <g><circle cx={x} cy={CY} r={14} fill="#c9b79a" stroke="#fff" strokeWidth={2} /><line x1={x} y1={CY} x2={x + 220} y2={CY} stroke="#fff" strokeWidth={4} opacity={0.6} /></g>;
    } else {
      const s = c - hitT;
      dustEl = (
        <g>
          <circle cx={surfaceX(0)} cy={CY} r={40 + s * 900} fill="none" stroke={C.amber} strokeWidth={10} opacity={Math.max(0, 1 - s * 1.3)} />
          <circle cx={surfaceX(0)} cy={CY} r={30 + s * 420} fill="#FFF3D6" opacity={Math.max(0, 0.95 - s * 2.2)} />
        </g>
      );
    }
  }

  const hull = `M 260 ${CY - HALF} L ${BOW} ${CY - HALF} L ${TIP} ${CY} L ${BOW} ${CY + HALF} L 260 ${CY + HALF} Z`;
  const glow = heat ? 0.55 + 0.25 * Math.sin(t * 6) : 0;
  const graphics = (
    <g>
      <defs>
        <linearGradient id="hullG" x1="0" x2="1">
          <stop offset="0" stopColor="#141A4D" />
          <stop offset="1" stopColor="#2B3380" />
        </linearGradient>
        <radialGradient id="heatG" cx="1" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#FFB547" stopOpacity={0.9} />
          <stop offset="1" stopColor="#FF5E5E" stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={hull} fill="url(#hullG)" stroke={C.cyan} strokeWidth={4} />
      {tank ? <rect x={BOW - 200} y={CY - HALF + 8} width={190} height={2 * HALF - 16} fill="rgba(30,111,217,0.45)" stroke={C.ocean} strokeWidth={3} /> : null}
      {tank ? <text x={BOW - 105} y={CY - HALF + 44} fill="#9cc4ff" fontSize={24} fontFamily={FONT} fontWeight={800} textAnchor="middle">WATER</text> : null}
      {heat ? <path d={`M ${BOW - 30} ${CY - HALF} L ${TIP} ${CY} L ${BOW - 30} ${CY + HALF} Z`} fill="url(#heatG)" opacity={glow} /> : null}
      {!vertical ? <g transform={`translate(560 ${CY + 150}) scale(1.6)`}><Person x={0} y={0} /></g> : null}
      {particles}
      {dustEl}
    </g>
  );

  // info panel
  const lines: [string, string, string][] = [];
  const add = (l: string, v: string, c: string = C.amber) => lines.push([l, v, c]);
  if (key === "10") {
    add("each hydrogen atom", `${val(p.data, "ep_10")} MeV`);
    add("stops within", `${val(p.data, "range5_mm")} mm of water`, C.cyan);
  } else if (key === "50") {
    add("each hydrogen atom", `${val(p.data, "ep_50")} MeV`);
    if (phase === "stop") add("stopped by", `< ${val(p.data, "range150_cm")} cm of water`, C.cyan);
    else add("proton therapy beams", `${val(p.data, "therapy_lo")}–${val(p.data, "therapy_hi")} MeV`, C.cyan);
  } else if (key === "90") {
    add("each hydrogen atom", `${val(p.data, "epg_90")} GeV`);
    if (phase === "shower") add("water before a nuclear hit", `≈ ${val(p.data, "lambda_int_cm")} cm`, C.purple);
    else if (phase === "dose") {
      add("unshielded dose rate", `≥ ${val(p.data, "dose_90")} Gy/s`, C.red);
      add(`lethal dose (${val(p.data, "ld50")} Sv)`, `in ${val(p.data, "tlethal_90")} s`, C.red);
    } else add("its own rest energy", `${val(p.data, "rest_mev")} MeV`, C.cyan);
  } else if (key === "99") {
    add("heat on the bow", `${val(p.data, "heatkw_99")} kW/m²`);
    add("the sunlight on Earth", `${val(p.data, "suns_99")}×`, C.cyan);
  } else if (key === "9999") {
    add("1 µg speck of dust", `${val(p.data, "dust_t_9999")} t of TNT`);
  } else {
    if (dust) {
      add("heat on the bow", `${val(p.data, "heatmw_999999")} MW/m²`);
      add("1 µg speck of dust", `${val(p.data, "dust_t_999999")} t of TNT`, C.red);
    } else {
      add("each hydrogen atom", `${val(p.data, "epg_999999")} GeV`);
      add("of a flying mosquito's energy", `≈ ${val(p.data, "mosq_frac_999999")}`, C.cyan);
    }
  }
  const showMosq = key === "999999" && !dust;
  const a = introFade(p, 0.2, 0.9);
  const panelStyle: React.CSSProperties = vertical
    ? { left: 70, top: 330, width: 890, padding: "22px 30px" }
    : { left: 90, bottom: 118, width: 860, padding: "20px 30px" };

  // dose timer (slowed down 4x so it can be read)
  let doseEl: React.ReactNode = null;
  if (phase === "dose") {
    const tl = Number(p.data.values.tlethal_90?.value ?? 0.5);
    const shown = Math.min(tl, Math.max(0, (p.pt - 1.0) / 4));
    const fr = shown / tl;
    doseEl = (
      <Glass accent={C.red} style={{ left: vertical ? 70 : 1150, top: vertical ? 610 : 300, width: vertical ? 890 : 640, padding: "20px 26px" }}>
        <Label color={C.red}>Dose, unshielded (slowed 4×)</Label>
        <div style={{ height: 28, borderRadius: 14, background: C.faint, marginTop: 10, overflow: "hidden" }}>
          <div style={{ width: `${fr * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.amber}, ${C.red})` }} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 54, color: fr >= 1 ? C.red : C.white, marginTop: 8 }}>
          {shown.toFixed(2)} s {fr >= 1 ? "· LETHAL" : ""}
        </div>
      </Glass>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0, opacity: a }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {vertical ? <g transform={`translate(540 ${930}) scale(0.82) rotate(-90) translate(${-700} ${-CY})`}>{graphics}</g> : <g transform="translate(0 20)">{graphics}</g>}
        {vertical ? <g transform="translate(540 1110) scale(1.05)"><Person x={0} y={0} /></g> : null}
        {showMosq ? <Mosquito x={vertical ? 820 : 1060} y={vertical ? 470 : 905} s={vertical ? 1.3 : 1.3} /> : null}
      </svg>
      <Glass accent={C.cyan} style={panelStyle}>
        <Label color={C.cyan} size={20}>{`What hits you at ${L.pct}% c · about 1 atom per cm³`}</Label>
        {lines.map(([l, v, c], i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 8, opacity: p.run.start < 0.05 && p.idx === 0 ? 1 : prog(p.pt, 0.4 + i * 0.5, 0.9 + i * 0.5) }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: vertical ? 56 : 52, color: c, whiteSpace: "nowrap" }}>{v}</div>
            <div style={{ fontSize: 26, color: C.dim, fontWeight: 600 }}>{l}</div>
          </div>
        ))}
      </Glass>
      {doseEl}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, pointerEvents: "none",
        background: phase === "dose" ? `rgba(255,94,94,${0.12 * interpolate(Math.sin(p.pt * 5), [-1, 1], [0, 1], clamp)})` : "transparent" }} />
    </div>
  );
};
