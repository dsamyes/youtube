// Scenes for "What If the Moon Was Twice as Close?" (merged over SHARED_SCENES).
import React from "react";
import { interpolate } from "remotion";
import { C } from "../../brand";
import { Globe } from "../../components/Globe";
import { Arrow, Panel, T } from "../../components/Svg";
import { clamp, prog, rand } from "../../timeline";
import { SceneEntry, SceneProps } from "../../types";

const val = (d: SceneProps["data"], k: string) => d.values[k]?.display ?? "?";
const num = (d: SceneProps["data"], k: string) => Number(d.values[k]?.value ?? 0);

const MoonDisk: React.FC<{ x: number; y: number; r: number; glow?: number; phase?: number }> = ({ x, y, r, glow = 1, phase }) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <radialGradient id={`mg${Math.round(r)}`} cx="40%" cy="38%" r="70%">
        <stop offset="0" stopColor="#F4F6FF" />
        <stop offset="0.7" stopColor="#C9CCDD" />
        <stop offset="1" stopColor="#8E92AE" />
      </radialGradient>
    </defs>
    <circle r={r * 1.9} fill="#F4F6FF" opacity={0.06 * glow} />
    <circle r={r * 1.35} fill="#F4F6FF" opacity={0.08 * glow} />
    <circle r={r} fill={`url(#mg${Math.round(r)})`} />
    <circle cx={-r * 0.3} cy={-r * 0.2} r={r * 0.18} fill="#9A9DB5" opacity={0.6} />
    <circle cx={r * 0.25} cy={r * 0.3} r={r * 0.12} fill="#9A9DB5" opacity={0.5} />
    <circle cx={r * 0.35} cy={-r * 0.35} r={r * 0.08} fill="#9A9DB5" opacity={0.5} />
    {phase !== undefined ? (
      <path d={`M 0 ${-r} A ${r} ${r} 0 0 ${phase < 0.5 ? 1 : 0} 0 ${r} A ${Math.abs(1 - 2 * ((phase * 2) % 1)) * r} ${r} 0 0 ${(phase * 2) % 1 < 0.5 ? 0 : 1} 0 ${-r}`}
        fill={C.deep} opacity={0.88} />
    ) : null}
  </g>
);

const Hills: React.FC<{ light?: number }> = ({ light = 0 }) => (
  <g>
    <path d="M -600 900 Q 100 760 500 850 T 1300 820 T 2600 860 L 2600 1200 L -600 1200 Z"
      fill={interpolate(light, [0, 1], [0, 1]) > 0.5 ? "#2C3570" : "#1A1F4A"} />
    <path d="M -600 960 Q 300 880 800 940 T 2600 930 L 2600 1200 L -600 1200 Z" fill="#141838" />
  </g>
);

/* ---------------- sky: the Moon over a horizon ---------------- */
const Sky: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const sky = data.extra.sky as { theta_old: number; theta_new: number };
  const PX = 190; // pixels per degree of sky
  const rOld = (sky.theta_old * PX) / 2;
  const rNew = (sky.theta_new * PX) / 2;
  if (phase === "compare") {
    return (
      <svg width={1920} height={1080}>
        <Hills />
        <MoonDisk x={560} y={560} r={rOld} />
        <MoonDisk x={1000} y={560} r={rOld + (rNew - rOld) * prog(pt, 0.5, 2)} />
        <T x={560} y={760} size={34} color={C.dim}>today · {val(data, "theta_old")}°</T>
        <T x={1000} y={760} size={34} color={C.amber} weight={800} opacity={prog(pt, 1.5, 2.2)}>twice as close · {val(data, "theta_new")}°</T>
      </svg>
    );
  }
  const r = phase === "night" ? rOld : rOld + (rNew - rOld) * prog(t, 0.6, 3);
  const glow = phase === "bright" ? 1 + 3 * prog(pt, 0.5, 3) : 1;
  const rise = phase === "night" ? interpolate(pt, [0, 4], [760, 520], clamp) : 470;
  return (
    <svg width={1920} height={1080}>
      <rect x={-600} y={0} width={3200} height={1080} fill="#3DE0FF" opacity={phase === "bright" ? 0.04 * prog(pt, 0.5, 3) : 0} />
      <MoonDisk x={960} y={rise} r={r} glow={glow} />
      <Hills light={phase === "bright" ? prog(pt, 0.5, 3) : 0} />
    </svg>
  );
};

/* ---------------- orbit: top-down Earth-Moon system ---------------- */
const Orbit: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const cx = 760, cy = 600, R1 = 400, R2 = 200;
  const w1 = 0.35; // rad/s visual for the old orbit
  const w2 = w1 * 2 ** 1.5; // Kepler: same scaling as the real orbits
  const showOld = phase !== "drift";
  const a1 = t * w1, a2 = t * w2;
  const drift = phase === "drift" ? prog(pt, 0.5, 6) * 30 : 0;
  return (
    <svg width={1920} height={1080}>
      {showOld ? <circle cx={cx} cy={cy} r={R1} fill="none" stroke={C.faint} strokeWidth={3} strokeDasharray="10 12" /> : null}
      <circle cx={cx} cy={cy} r={R2 + drift} fill="none" stroke={C.cyan} strokeWidth={3} opacity={phase === "halve" ? prog(pt, 0.8, 1.6) : 1} />
      <g transform={`translate(${cx} ${cy})`}><Globe r={60} rot={t * 30} glow={0.6} /></g>
      {showOld ? <MoonDisk x={cx + Math.cos(a1) * R1} y={cy + Math.sin(a1) * R1} r={18} /> : null}
      {phase === "fall" ? (
        <g>
          <path d={`M ${cx + R1} ${cy} A ${(R1 + R2) / 2} ${Math.sqrt(R1 * R2)} 0 0 1 ${cx - R2} ${cy}`} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray="12 8" />
          {(() => {
            const u = prog(pt, 0.5, 4, (x) => x) * Math.PI;
            const a = (R1 + R2) / 2, b = Math.sqrt(R1 * R2), c0 = (R1 - R2) / 2;
            return <MoonDisk x={cx + c0 + Math.cos(u) * a} y={cy + Math.sin(u) * b} r={18} />;
          })()}
          <T x={cx + R1 + 20} y={cy - 30} size={30} anchor="start" color={C.amber} weight={800}>1. slow down</T>
          <T x={cx - R2 - 30} y={cy + 70} size={30} anchor="end" color={C.cyan} weight={800}>2. fall in, end up faster</T>
        </g>
      ) : (
        <MoonDisk x={cx + Math.cos(a2) * (R2 + drift)} y={cy + Math.sin(a2) * (R2 + drift)} r={18} />
      )}
      {phase === "halve" ? (
        <g opacity={prog(pt, 0.3, 1)}>
          <Arrow x1={cx} y1={cy - 70} x2={cx} y2={cy - R1 + 10} color={C.dim} w={3} head={12} />
          <T x={cx + 20} y={cy - R1 + 50} size={30} anchor="start" color={C.dim}>{val(data, "d_old_km")} km</T>
          <T x={cx + 20} y={cy - R2 + 50} size={30} anchor="start" color={C.cyan} weight={800} opacity={prog(pt, 1, 1.6)}>{val(data, "d_new_km")} km</T>
        </g>
      ) : null}
      {phase === "phases" ? (
        <g transform="translate(1180 420)">
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i} opacity={prog(pt, i * 0.25, i * 0.25 + 0.3)}>
              <MoonDisk x={(i % 4) * 140} y={Math.floor(i / 4) * 150} r={48} phase={i / 8} />
            </g>
          ))}
          <T x={210} y={330} size={32} color={C.amber} weight={800}>full cycle: {val(data, "synodic_new_d")} days</T>
        </g>
      ) : null}
      {phase === "drift" ? (
        <g opacity={prog(pt, 0.4, 1)}>
          <Arrow x1={cx + R2 + 40} y1={cy} x2={cx + R2 + 150} y2={cy} color={C.amber} w={6} />
          <T x={1260} y={560} size={34} anchor="start" color={C.amber} weight={800}>today: +{val(data, "recession_cm")} cm per year</T>
          <T x={1260} y={610} size={28} anchor="start" color={C.dim}>a closer Moon gets pushed out faster</T>
        </g>
      ) : null}
    </svg>
  );
};

/* ---------------- eclipse: Sun and Moon disks + shadow ---------------- */
const Eclipse: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const sky = data.extra.sky as { theta_old: number; theta_new: number; theta_sun: number };
  if (phase === "shadow") {
    const w = Number(data.values.umbra_km?.value ?? 0);
    const spot = Math.min(260, (w / 12742) * 520);
    return (
      <svg width={1920} height={1080}>
        <circle cx={160} cy={560} r={60} fill={C.amber} />
        <circle cx={660} cy={560} r={34} fill="#C9CCDD" />
        <path d={`M 160 500 L 660 526 L 1100 ${560 - spot / 2} L 1100 ${560 + spot / 2} L 660 594 L 160 620 Z`} fill="#000" opacity={0.25} />
        <g transform="translate(1360 560)"><Globe r={260} rot={t * 8} /></g>
        <ellipse cx={1120 + 40} cy={560} rx={30} ry={spot / 2 * prog(pt, 0.3, 1.2)} fill="#000" opacity={0.75} />
        <T x={1160} y={560 - spot / 2 - 30} size={36} color={C.amber} weight={900} display opacity={prog(pt, 1, 1.6)}>≈ {val(data, "umbra_km")} km</T>
        <T x={660} y={680} size={26} color={C.dim}>Moon (not to scale)</T>
      </svg>
    );
  }
  const PX = 420;
  const rs = (sky.theta_sun * PX) / 2;
  const today = phase === "today" || phase === "ring";
  const ring = phase === "ring";
  // "ring" exaggerates the gap so the annulus is visible (labelled on screen)
  const rm = ring ? rs * 0.86 : today ? (sky.theta_old * PX) / 2 : (sky.theta_old * PX) / 2 + ((sky.theta_new - sky.theta_old) * PX) / 2 * prog(pt, 0.3, 2);
  const slide = phase === "today" ? interpolate(pt, [0, 9], [-330, -60], clamp) : 0;
  return (
    <svg width={1920} height={1080}>
      <circle cx={960} cy={580} r={rs * 1.6} fill={C.amber} opacity={0.12} />
      {phase === "total" ? <circle cx={960} cy={580} r={rm * 1.35} fill="#F4F6FF" opacity={0.35 * prog(pt, 1.5, 2.5)} /> : null}
      <circle cx={960} cy={580} r={rs} fill={C.amber} />
      <circle cx={960 + slide} cy={580} r={rm} fill={C.deep} />
      <T x={960} y={900} size={34} color={C.dim}>
        Sun {val(data, "theta_sun")}° · Moon {today ? val(data, "theta_old_precise") : val(data, "theta_new")}°
      </T>
      {ring ? <T x={960} y={330} size={34} color={C.amber} weight={800}>annular eclipse (gap exaggerated)</T> : null}
    </svg>
  );
};

/* ---------------- tides: Earth's ocean bulge and coastal sloshing ---------------- */
const Tides: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const tide = data.extra.tide as { old_cm: number; new_cm: number };
  if (phase === "coast" || phase === "slosh" || phase === "unknown") {
    const amp = phase === "slosh" ? 60 : 30;
    const pts = Array.from({ length: 41 }).map((_, i) => {
      const x = 200 + i * 30;
      const y = 600 + Math.sin(t * 1.6) * amp * (i / 40) * (phase === "unknown" ? 1.6 : 1);
      return `${x},${y.toFixed(1)}`;
    });
    return (
      <svg width={1920} height={1080}>
        <polygon points={`200,900 ${pts.join(" ")} 1400,900`} fill={C.ocean} opacity={0.85} />
        <path d="M 1400 380 L 1700 380 L 2600 380 L 2600 1100 L 1400 1100 Z" fill={C.land} />
        <path d="M -600 900 L 2600 900 L 2600 1100 L -600 1100 Z" fill={C.rock} />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={1430 + i * 60} y={340 - (i % 3) * 40} width={40} height={40 + (i % 3) * 40} fill="#2A3270" />
        ))}
        <T x={800} y={980} size={30} color={C.dim}>{phase === "coast" ? "where people live" : "a bay can resonate with the tide"}</T>
        {phase === "unknown" ? <T x={800} y={520} size={220} color={C.white} display weight={900} opacity={prog(pt, 0.3, 1)}>?</T> : null}
      </svg>
    );
  }
  const big = phase === "bulge8" || phase === "hook" || phase === "cube";
  const ex = (big ? tide.new_cm : tide.old_cm) / tide.new_cm; // relative bulge (exaggerated for display)
  const grow = phase === "bulge8" ? interpolate(pt, [0.3, 2], [tide.old_cm / tide.new_cm, 1], clamp) : ex;
  const R = 230;
  const b = 20 + 110 * grow;
  return (
    <svg width={1920} height={1080}>
      <g transform="translate(760 600)">
        <ellipse rx={R + b} ry={R - b * 0.4} fill={C.ocean} opacity={0.75} />
        <Globe r={R} rot={t * 6} glow={0} />
      </g>
      <MoonDisk x={phase === "hook" ? 1300 : 1560} y={600} r={phase === "hook" ? 70 : 46} />
      {phase === "diff" ? (
        <g opacity={prog(pt, 0.3, 1)}>
          <Arrow x1={530} y1={600} x2={610} y2={600} color={C.purple} w={8} />
          <Arrow x1={760} y1={600} x2={860} y2={600} color={C.purple} w={8} />
          <Arrow x1={990} y1={600} x2={1115} y2={600} color={C.purple} w={8} />
          <T x={760} y={300} size={32} color={C.purple} weight={800}>far side · center · near side: the pull differs</T>
        </g>
      ) : null}
      {phase === "cube" ? (
        <Panel x={1180} y={760} w={560} h={140} opacity={prog(pt, 0.5, 1)}>
          <T x={1460} y={815} size={28} color={C.dim}>TIDAL FORCE ∝ 1 ÷ distance³</T>
          <T x={1460} y={875} size={48} color={C.amber} display weight={900}>2³ = {val(data, "tide_ratio")}×</T>
        </Panel>
      ) : null}
      {phase === "bulge" || phase === "bulge8" ? (
        <T x={760} y={960} size={30} color={C.dim}>
          bulge {phase === "bulge" ? `${val(data, "bulge_old_cm")} cm` : `${val(data, "bulge_new_m")} m`} (shape exaggerated)
        </T>
      ) : null}
      {Array.from({ length: phase === "hook" ? 10 : 0 }).map((_, i) => (
        <circle key={i} cx={760 + R + b + 10} cy={600 + (rand(i) - 0.5) * 80} r={4} fill="#BFE9FF" opacity={0.6} />
      ))}
    </svg>
  );
};

/* ---------------- roche: to-scale distances ---------------- */
const Roche: React.FC<SceneProps> = ({ phase, pt, data }) => {
  const r = data.extra.roche as { roche_km: number; d_new_km: number; d_old_km: number; earth_km: number };
  const x0 = 170, y = 600;
  const S = 930 / r.d_new_km;
  const xr = x0 + r.roche_km * S;
  const xm = x0 + r.d_new_km * S;
  return (
    <svg width={1920} height={1080}>
      <g transform={`translate(${x0} ${y})`}><Globe r={Math.max(30, r.earth_km * S)} rot={0} glow={0.5} /></g>
      <line x1={x0} y1={y} x2={xm} y2={y} stroke={C.faint} strokeWidth={3} strokeDasharray="8 10" />
      {phase !== "question" ? (
        <g opacity={prog(pt, 0.3, 1)}>
          <line x1={xr} y1={y - 220} x2={xr} y2={y + 220} stroke={C.red} strokeWidth={5} strokeDasharray="14 10" />
          <T x={xr + 16} y={y - 230} size={30} anchor="start" color={C.red} weight={800}>Roche limit ≈ {val(data, "roche_km")} km</T>
        </g>
      ) : null}
      <MoonDisk x={xm} y={y} r={phase === "question" ? 40 + Math.sin(pt * 8) * 3 : 40} />
      <T x={xm} y={y + 100} size={30} color={C.cyan} weight={800}>{val(data, "d_new_km")} km</T>
      {phase === "safe" ? (
        <T x={(xr + xm) / 2} y={y - 120} size={52} color={C.amber} display weight={900} opacity={prog(pt, 0.4, 1)}>{val(data, "roche_margin")}× margin</T>
      ) : null}
      <T x={960} y={960} size={26} color={C.dim}>distances to scale</T>
    </svg>
  );
};

/* ---------------- daylength: tidal braking ---------------- */
const DayLength: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  if (phase === "power") {
    const n = 6;
    return (
      <svg width={1920} height={1080}>
        {Array.from({ length: n }).map((_, i) => {
          const v = 2 ** (i + 1);
          const h = (v / 64) * 520 * prog(pt, 0.2 + i * 0.25, 0.6 + i * 0.25);
          return (
            <g key={i}>
              <rect x={300 + i * 150} y={880 - h} width={100} height={h} fill={i === n - 1 ? C.amber : C.cyan} />
              <T x={350 + i * 150} y={930} size={28} color={C.dim}>2^{i + 1}</T>
            </g>
          );
        })}
        <T x={1050} y={330} size={60} color={C.amber} display weight={900} opacity={prog(pt, 1.8, 2.4)}>{val(data, "brake_ratio")}× the braking</T>
      </svg>
    );
  }
  if (phase === "myr") {
    const frac = Math.min(1, num(data, "myr_new_min") / 60);
    return (
      <svg width={1920} height={1080}>
        <g transform="translate(700 600)">
          <circle r={250} fill="none" stroke={C.faint} strokeWidth={40} />
          <circle r={250} fill="none" stroke={C.amber} strokeWidth={40} strokeDasharray={`${2 * Math.PI * 250 * frac * prog(pt, 0.3, 2)} 9999`} transform="rotate(-90)" />
          <T x={0} y={20} size={64} color={C.amber} display weight={900}>+{val(data, "myr_new_min")} min</T>
          <T x={0} y={80} size={28} color={C.dim}>of one hour, per million years</T>
        </g>
        <T x={1150} y={560} size={34} anchor="start" color={C.dim}>today: +{val(data, "myr_old_s")} s</T>
      </svg>
    );
  }
  // brake: Earth spins, bulge dragged ahead of the Moon direction
  return (
    <svg width={1920} height={1080}>
      <g transform="translate(760 600)">
        <g transform="rotate(-12)"><ellipse rx={300} ry={230} fill={C.ocean} opacity={0.7} /></g>
        <Globe r={230} rot={t * 20} glow={0} />
        <path d="M -150 -280 A 320 320 0 0 1 150 -280" fill="none" stroke={C.cyan} strokeWidth={6} />
        <T x={0} y={-320} size={28} color={C.cyan}>Earth's spin</T>
      </g>
      <MoonDisk x={1500} y={600} r={50} />
      <Arrow x1={1040} y1={520} x2={1000} y2={420} color={C.red} w={6} />
      <T x={1060} y={400} size={30} anchor="start" color={C.red} weight={800}>bulge pulled back: a brake</T>
    </svg>
  );
};

export const SCENES: Record<string, SceneEntry> = {
  sky: { C: Sky, shift: true },
  orbit: { C: Orbit, shift: true },
  eclipse: { C: Eclipse, shift: true },
  tides: { C: Tides, shift: true },
  roche: { C: Roche, shift: false },
  daylength: { C: DayLength, shift: true },
};
