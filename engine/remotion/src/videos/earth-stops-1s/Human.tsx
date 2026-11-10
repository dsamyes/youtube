import React from "react";
import { interpolate } from "remotion";
import { C } from "../../brand";
import { Arrow, Panel, Person, T } from "../../components/Svg";
import { clamp, prog } from "../../timeline";
import { SceneProps } from "../../types";

/* ---------------- person ---------------- */
export const PersonScene: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const v = data.values;
  const groundY = 820;
  if (phase === "distance") {
    const p = prog(pt, 0.2, 3.2, (x) => x);
    const scale = 1500 / 500;
    const x = 210 + 465 * scale * p;
    return (
      <svg width={1920} height={1080}>
        <line x1={210} y1={groundY} x2={1710} y2={groundY} stroke={C.white} strokeWidth={4} />
        {Array.from({ length: 11 }).map((_, i) => (
          <g key={i}>
            <line x1={210 + i * 150} y1={groundY} x2={210 + i * 150} y2={groundY + 24} stroke={C.white} strokeWidth={3} />
            <T x={210 + i * 150} y={groundY + 64} size={28} color={C.dim}>{i * 50}</T>
          </g>
        ))}
        <T x={1760} y={groundY + 64} size={28} color={C.dim} anchor="start">m</T>
        <line x1={210} y1={groundY - 40} x2={x} y2={groundY - 40} stroke={C.amber} strokeWidth={6} />
        <Person x={x} y={groundY} s={0.7} rot={p * 720} color={C.amber} />
        <T x={x} y={groundY - 210} size={44} color={C.amber} display weight={900}>{Math.round(465 * p)} m</T>
        <T x={960} y={430} size={36} color={C.dim} weight={600}>distance covered in the 1-second stop (equator)</T>
      </svg>
    );
  }
  const launched = phase !== "launch" || pt > 0.6;
  // camera follows the person; before the stop the ground moves with them (static ticks)
  const rel = launched ? (phase === "launch" ? pt - 0.6 : t) * 900 : 0;
  const tick = rel % 200;
  const wallIn = phase === "wall" || phase === "energy";
  const wallX = phase === "wall" ? interpolate(pt, [0, 2.5], [1900, 1300], clamp) : 1300;
  const hit = phase === "energy";
  const px = hit ? 1240 : 760;
  return (
    <svg width={1920} height={1080}>
      <rect x={-600} y={groundY} width={3200} height={260} fill="#1A1F4A" />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={i * 200 - tick - 400} y={groundY} width={100} height={10} fill={C.land} />
      ))}
      {launched && !hit ? Array.from({ length: 7 }).map((_, i) => (
        <Arrow key={i} x1={((i * 300 - rel * 0.4) % 2100 + 2100) % 2100 - 100} y1={300 + i * 60} x2={((i * 300 - rel * 0.4) % 2100 + 2100) % 2100 - 260}
          y2={300 + i * 60} color={C.faint} w={4} head={12} />
      )) : null}
      {wallIn ? (
        <g>
          <rect x={wallX} y={groundY - 330} width={90} height={330} fill="#3B3F6E" stroke={C.dim} strokeWidth={3} />
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1={wallX} y1={groundY - 330 + i * 55} x2={wallX + 90} y2={groundY - 330 + i * 55} stroke={C.dim} strokeWidth={2} />
          ))}
        </g>
      ) : null}
      <Person x={px} y={groundY - (launched && !hit ? 30 : 0)} s={1.3} rot={launched ? (hit ? 0 : 35) : 0} color={C.white} />
      {phase === "friction" ? (
        <g>
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1={px - 20} y1={groundY - 4} x2={px - 60 - ((i * 37 + t * 600) % 120)} y2={groundY - 20 - (i % 4) * 12}
              stroke={C.amber} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
          ))}
        </g>
      ) : null}
      {hit ? (
        <g opacity={1 - prog(pt, 0.2, 1.4)}>
          <circle cx={1300} cy={groundY - 150} r={40 + pt * 260} fill="none" stroke={C.amber} strokeWidth={10} />
          <circle cx={1300} cy={groundY - 150} r={20 + pt * 160} fill={C.amber} opacity={0.4} />
        </g>
      ) : null}
      {phase === "launch" || phase === "friction" ? (
        <Panel x={300} y={330} w={420} h={170} stroke={C.cyan}>
          <T x={510} y={385} size={26} color={C.dim}>YOUR SPEED vs GROUND</T>
          <T x={510} y={462} size={64} color={C.amber} display weight={900}>
            {phase === "friction" ? Math.round(interpolate(pt, [0.5, 3.5], [465, 458], clamp)) : launched ? v.v_eq_ms.display : "0"} m/s
          </T>
        </Panel>
      ) : null}
      {phase === "launch" ? (
        <T x={960} y={980} size={34} color={launched ? C.red : C.dim} weight={700}>{launched ? "ground: stopped" : "ground and you: moving together"}</T>
      ) : null}
    </svg>
  );
};

/* ---------------- fall: equivalent drop height ---------------- */
export const Fall: React.FC<SceneProps> = ({ phase, pt, data }) => {
  const v = data.values;
  const top = 260, bottom = 900;
  const kmToY = (km: number) => bottom - (km / 12) * (bottom - top);
  const h = phase === "london" ? Number(v.fall_height_london_km.value) : Number(v.fall_height_km.value);
  const everest = Number(v.everest_km.value);
  const p = prog(pt, 0.2, 1.4);
  const x0 = 420;
  return (
    <svg width={1920} height={1080}>
      <line x1={x0} y1={top} x2={x0} y2={bottom} stroke={C.white} strokeWidth={3} />
      {Array.from({ length: 13 }).map((_, i) => (
        <g key={i}>
          <line x1={x0 - 14} y1={kmToY(i)} x2={x0} y2={kmToY(i)} stroke={C.white} strokeWidth={2} />
          <T x={x0 - 26} y={kmToY(i) + 10} size={24} color={C.dim} anchor="end">{i} km</T>
        </g>
      ))}
      <path d={`M ${x0 + 40} ${bottom} L ${x0 + 260} ${kmToY(everest)} L ${x0 + 330} ${kmToY(everest * 0.82)} L ${x0 + 480} ${bottom} Z`} fill="#4B5590" />
      <path d={`M ${x0 + 225} ${kmToY(everest * 0.9)} L ${x0 + 260} ${kmToY(everest)} L ${x0 + 300} ${kmToY(everest * 0.88)} Z`} fill={C.white} />
      <T x={x0 + 260} y={kmToY(everest) - 20} size={28} color={C.dim}>Everest {v.everest_km.display} km</T>
      <line x1={x0} y1={kmToY(h * p)} x2={1300} y2={kmToY(h * p)} stroke={C.amber} strokeWidth={4} strokeDasharray="12 10" />
      <Person x={720} y={kmToY(h * p) - 6} s={0.45} color={C.amber} />
      <T x={1000} y={kmToY(h * p) - 24} size={44} color={C.amber} display weight={900} anchor="start" opacity={p}>
        {phase === "london" ? v.fall_height_london_km.display : v.fall_height_km.display} km
      </T>
      <T x={1000} y={kmToY(h * p) + 34} size={28} color={C.dim} anchor="start" opacity={p}>
        {phase === "london" ? `London, ${v.v_london_ms.display} m/s` : `equator, ${v.v_eq_ms.display} m/s`} · h = v² ÷ 2g
      </T>
    </svg>
  );
};

/* ---------------- restart ---------------- */
export const Restart: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const groundY = 760;
  if (phase === "two") {
    const p = prog(pt, 0.2, 1.2);
    return (
      <svg width={1920} height={1080}>
        <line x1={360} y1={600} x2={1560} y2={600} stroke={C.white} strokeWidth={4} />
        {[0, 1].map((s) => (
          <g key={s} opacity={prog(pt, 0.2 + s * 0.6, 0.6 + s * 0.6)}>
            <circle cx={460 + s * 1000} cy={600} r={60} fill={s ? C.purple : C.red} />
            <T x={460 + s * 1000} y={615} size={40} display weight={900}>HIT {s + 1}</T>
            <T x={460 + s * 1000} y={720} size={40} color={C.amber} display weight={800}>T + {s}.00 s</T>
            <T x={460 + s * 1000} y={500} size={30} color={C.dim}>{s ? "ground restarts" : "ground stops"}</T>
          </g>
        ))}
        <line x1={520} y1={600} x2={520 + 880 * p} y2={600} stroke={C.amber} strokeWidth={8} />
      </svg>
    );
  }
  const running = phase !== "snap" || pt > 0.6;
  const rel = running ? t * 900 : 0;
  const tick = rel % 200;
  const reverse = phase === "reverse";
  return (
    <svg width={1920} height={1080}>
      <rect x={-600} y={groundY} width={3200} height={320} fill="#1A1F4A" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={((i * 200 + tick) % 2400) - 200} y={groundY} width={100} height={10} fill={C.land} />
      ))}
      <T x={960} y={groundY + 110} size={38} color={running ? C.cyan : C.red} weight={800}>
        {running ? `ground: back to ${data.values.v_eq_ms.display} m/s →` : "ground: stopped"}
      </T>
      {/* a stopped crate / person gets swept by the restarting ground */}
      <rect x={reverse ? 1100 - prog(pt, 0.3, 1.0) * 120 : 1100} y={groundY - 140} width={140} height={140} fill="#3B3F6E" stroke={C.dim} strokeWidth={3} />
      <T x={1170} y={groundY - 160} size={28} color={C.dim}>stopped object</T>
      {phase === "mismatch" || reverse ? (
        <g opacity={prog(pt, 0.3, 0.9)}>
          <Arrow x1={900} y1={430} x2={1400} y2={430} color={C.cyan} w={10} />
          <T x={1150} y={400} size={30} color={C.cyan}>ground</T>
          <Arrow x1={900} y1={520} x2={960} y2={520} color={C.amber} w={10} />
          <T x={1150} y={530} size={30} color={C.amber} anchor="start">slowed object</T>
        </g>
      ) : null}
      {reverse ? (
        <g opacity={prog(pt, 0.4, 0.9)}>
          <circle cx={1100} cy={groundY - 70} r={30 + prog(pt, 0.4, 1.4) * 200} fill="none" stroke={C.red} strokeWidth={8} opacity={1 - prog(pt, 1.0, 1.6)} />
          <Arrow x1={700} y1={300} x2={300} y2={300} color={C.red} w={12} />
          <T x={500} y={270} size={34} color={C.red} weight={800}>hit from the other side</T>
        </g>
      ) : null}
    </svg>
  );
};
