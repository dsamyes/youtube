import React from "react";
import { C } from "../../brand";
import { Globe, latCircle } from "../../components/Globe";
import { Arrow, Panel, Skyline, T } from "../../components/Svg";
import { prog, rand } from "../../timeline";
import { SceneProps } from "../../types";

/* ---------------- building: shear wave ---------------- */
export const Building: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const v = data.values;
  const floors = 14;
  const fh = 40;
  const base = 860;
  const bx = 640;
  const bw = 220;
  const waveH = phase === "anchor" ? -1 : phase === "wave" ? ((pt * 0.6) % 1.2) * floors * fh : floors * fh * 2;
  const fail = phase === "fail";
  return (
    <svg width={1920} height={1080}>
      {/* rock */}
      <rect x={-600} y={base} width={3200} height={220} fill={C.rock} />
      {Array.from({ length: 30 }).map((_, i) => (
        <line key={i} x1={i * 70} y1={base + 20} x2={i * 70 + 40} y2={base + 200} stroke="#00000033" strokeWidth={6} />
      ))}
      <rect x={bx - 20} y={base - 6} width={bw + 40} height={70} fill="#2C2440" stroke={C.amber} strokeWidth={3} />
      <T x={bx + bw / 2} y={base + 120} size={28} color={C.amber} weight={700}>foundation: stopped with the rock</T>
      {Array.from({ length: floors }).map((_, i) => {
        const y = base - (i + 1) * fh;
        const hfromBase = i * fh;
        // floors above the wave front have not been told yet: they keep drifting right (east)
        const notYet = hfromBase > waveH;
        const drift = phase === "anchor" ? 0 : notYet ? Math.min(60, (i + 1) * 4) : 0;
        const crack = fail && rand(i) > 0.55 ? (rand(i + 9) - 0.5) * 40 * prog(pt, 0.2, 0.8) : 0;
        const inWave = Math.abs(hfromBase - waveH) < fh * 1.2 && phase === "wave";
        return (
          <g key={i} transform={`translate(${drift + crack} 0)`}>
            <rect x={bx} y={y} width={bw} height={fh - 4} fill={inWave ? C.purple : fail ? "#5B2340" : "#2A3270"} stroke={fail ? C.red : C.cyan} strokeOpacity={0.6} strokeWidth={2} />
            {Array.from({ length: 4 }).map((_, j) => (
              <rect key={j} x={bx + 18 + j * 50} y={y + 10} width={30} height={16} fill={C.amber} opacity={0.5} />
            ))}
          </g>
        );
      })}
      {phase === "wave" ? (
        <g>
          <Arrow x1={bx + bw + 60} y1={base - 40} x2={bx + bw + 60} y2={base - floors * fh} color={C.purple} w={8} />
          <T x={bx + bw + 90} y={base - floors * fh / 2} size={34} anchor="start" color={C.purple} weight={800}>shear wave ↑ {v.c_steel.display} m/s</T>
          <Arrow x1={bx - 60} y1={base - floors * fh + 20} x2={bx + 40} y2={base - floors * fh + 20} color={C.cyan} w={6} head={16} />
          <T x={bx - 70} y={base - floors * fh + 30} size={26} anchor="end" color={C.cyan}>upper floors still moving east</T>
        </g>
      ) : null}
      {fail ? (
        <g transform="translate(1080 330)" opacity={prog(pt, 0, 0.5)}>
          <T x={0} y={0} size={28} anchor="start" color={C.dim} weight={700} spacing={2}>STRESS (GPa)</T>
          <rect x={0} y={30} width={14 * prog(pt, 0.3, 0.8)} height={60} fill={C.land} />
          <T x={30} y={72} size={30} anchor="start" color={C.land} weight={700}>steel shear yield ≈ {v.steel_yield_mpa.display} MPa</T>
          <rect x={0} y={120} width={Math.min(700, 14 * Number(v.steel_ratio.value) * prog(pt, 0.6, 1.6) * 0.62)} height={60} fill={C.red} />
          <T x={0} y={230} size={40} anchor="start" color={C.amber} weight={900} display>{v.steel_stress_gpa.display} GPa ≈ {v.steel_ratio.display}×</T>
        </g>
      ) : null}
    </svg>
  );
};

/* ---------------- air: supersonic wind ---------------- */
export const Air: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const v = data.values;
  const lines = 26;
  const speed = phase === "tease" ? 120 : 1400;
  const showShocks = phase === "shocks" || phase === "pressure" || phase === "mach";
  if (phase === "mach") {
    const lat = Number(v.supersonic_lat.value);
    const r = 260;
    const tilt = 12;
    const top = latCircle(lat, tilt, r);
    const bot = latCircle(-lat, tilt, r);
    return (
      <svg width={1920} height={1080}>
        <g transform="translate(860 600)">
          <Globe r={r} rot={t * 6} tilt={tilt} />
          <g opacity={prog(pt, 3, 4)}>
            <path d={`M ${-top.rx} ${top.cy} A ${top.rx} ${top.ry} 0 0 0 ${top.rx} ${top.cy} L ${bot.rx} ${bot.cy} A ${bot.rx} ${bot.ry} 0 0 1 ${-bot.rx} ${bot.cy} Z`}
              fill={C.amber} fillOpacity={0.28} stroke={C.amber} strokeWidth={3} />
            <T x={r + 30} y={top.cy + 10} size={30} anchor="start" color={C.amber}>{v.supersonic_lat.display}°N</T>
            <T x={r + 30} y={bot.cy + 10} size={30} anchor="start" color={C.amber}>{v.supersonic_lat.display}°S</T>
            <T x={0} y={r + 70} size={34} color={C.amber} weight={800}>supersonic band · {v.supersonic_area_pct.display}% of the surface</T>
          </g>
        </g>
        <g transform="translate(860 230)" opacity={prog(pt, 0, 0.6)}>
          <T x={0} y={0} size={68} color={C.white} display weight={900}>MACH {v.mach.display}</T>
        </g>
      </svg>
    );
  }
  return (
    <svg width={1920} height={1080}>
      {Array.from({ length: lines }).map((_, i) => {
        const y = 300 + rand(i) * 520;
        const len = 120 + rand(i + 3) * 220;
        const x = ((rand(i + 7) * 2400 + t * speed * (0.6 + rand(i + 11) * 0.6)) % 2400) - 300;
        return <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke={C.cyan} strokeWidth={3 + rand(i + 2) * 3} strokeLinecap="round" opacity={phase === "tease" ? 0.25 : 0.6} />;
      })}
      <Skyline y={880} x0={-600} x1={2600} seed={3} color="#2A3270" />
      {showShocks
        ? [180, 520, 900, 1260, 1620].map((x, i) => (
            <path key={i} d={`M ${x - 10} ${880 - 360} Q ${x - 120} ${880 - 120} ${x - 30} ${880}`} fill="none" stroke={C.white}
              strokeOpacity={0.75 * prog(pt, 0.2 + i * 0.12, 0.6 + i * 0.12)} strokeWidth={5} />
          ))
        : null}
      <rect x={-600} y={880} width={3200} height={200} fill="#1A1F4A" />
      {phase === "wind" ? (
        <Panel x={660} y={330} w={600} h={160} opacity={prog(pt, 0.4, 1)}>
          <T x={960} y={390} size={28} color={C.dim}>WIND AT THE EQUATOR</T>
          <T x={960} y={460} size={64} color={C.amber} display weight={900}>{v.v_eq_ms.display} m/s →</T>
        </Panel>
      ) : null}
      {phase === "pressure" ? (
        <g opacity={prog(pt, 0.3, 1)}>
          <rect x={760} y={420} width={60} height={460} fill="#3B3F6E" stroke={C.dim} strokeWidth={3} />
          {Array.from({ length: 6 }).map((_, i) => (
            <Arrow key={i} x1={540} y1={460 + i * 72} x2={750} y2={460 + i * 72} color={C.amber} w={8} head={18} />
          ))}
          <T x={790} y={400} size={40} color={C.amber} weight={800}>≥ {v.q_kpa.display} kPa</T>
        </g>
      ) : null}
      {phase === "twist" ? (
        <g opacity={prog(pt, 0.3, 1)}>
          <line x1={1700} y1={880} x2={1700} y2={300} stroke={C.white} strokeWidth={3} />
          <T x={1680} y={290} size={26} color={C.dim} anchor="end">altitude</T>
          <rect x={0} y={790} width={1920} height={90} fill={C.red} opacity={0.18} />
          <T x={80} y={780} size={30} anchor="start" color={C.red} weight={700}>air that actually hits things</T>
          <T x={80} y={420} size={34} anchor="start" color={C.cyan} weight={700}>most of the air: no obstacle within {v.one_sec_distance.display} m</T>
          <Arrow x1={80} y1={470} x2={80 + Number(v.one_sec_distance.value) * 1.4} y2={470} color={C.cyan} w={8} />
          <T x={80 + Number(v.one_sec_distance.value) * 0.7} y={520} size={28} color={C.cyan}>{v.one_sec_distance.display} m in 1 s</T>
        </g>
      ) : null}
    </svg>
  );
};

/* ---------------- energy of the atmosphere ---------------- */
export const AtmEnergy: React.FC<SceneProps> = ({ t, pt, data }) => {
  const v = data.values;
  const years = Number(v.atm_ke_years.display.replace(/,/g, ""));
  const n = Math.round(years / 10); // 1 square = 10 years
  const cols = 15;
  const fill = prog(pt, 0.8, 4.5, (x) => x);
  return (
    <svg width={1920} height={1080}>
      <g transform="translate(600 600)">
        <Globe r={230} rot={t * 6} glow={2} />
        <circle r={262} fill="none" stroke={C.cyan} strokeWidth={14} strokeOpacity={0.35 + 0.25 * Math.sin(t * 4)} />
        <T x={0} y={330} size={32} color={C.cyan} weight={700}>the moving atmosphere</T>
      </g>
      <g transform="translate(1000 330)">
        <T x={0} y={-20} size={26} color={C.dim} anchor="start" weight={600}>■ = 10 years of all human energy use</T>
        {Array.from({ length: n }).map((_, i) => {
          const on = i < fill * n;
          return <rect key={i} x={(i % cols) * 28} y={Math.floor(i / cols) * 28} width={22} height={22} rx={4} fill={on ? C.amber : C.faint} />;
        })}
        <T x={0} y={Math.ceil(n / cols) * 28 + 60} size={48} anchor="start" color={C.amber} display weight={900}>≈ {Math.round(years * fill)} years</T>
      </g>
    </svg>
  );
};
