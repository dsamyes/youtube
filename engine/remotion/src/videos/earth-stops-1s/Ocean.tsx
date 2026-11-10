import React from "react";
import { interpolate } from "remotion";
import { C } from "../../brand";
import { Arrow, Panel, T } from "../../components/Svg";
import { clamp, prog } from "../../timeline";
import { SceneProps } from "../../types";

/* ---------------- ocean cross-section ---------------- */
export const Ocean: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const v = data.values;
  const sea = 520; // sea surface y
  const floor = 860;
  const leftCoast = 260;
  const rightCoast = 1660;
  const slide = phase === "slide" ? prog(pt, 0.5, 3) : 1;
  const pile = slide * 120; // exaggerated surface hump against the east coast
  const draw = slide * 90;
  // water surface path: lower near west coast, piled up near east coast
  const surface = Array.from({ length: 41 }).map((_, i) => {
    const x = leftCoast + ((rightCoast - leftCoast) * i) / 40;
    const u = i / 40;
    const y = sea + draw * Math.exp(-u * 8) - pile * Math.exp(-(1 - u) * 8) + Math.sin(u * 30 + t * 3) * 4;
    return `${x.toFixed(0)},${y.toFixed(1)}`;
  });
  const hammer = phase === "hammer";
  return (
    <svg width={1920} height={1080}>
      {/* water */}
      <polygon points={`${leftCoast},${floor} ${surface.join(" ")} ${rightCoast},${floor}`} fill={C.ocean} opacity={0.85} />
      {/* flow arrows */}
      {phase !== "pullback" ? Array.from({ length: 8 }).map((_, i) => {
        const x = leftCoast + 120 + ((i * 170 + t * 260) % 1250);
        return <Arrow key={i} x1={x} y1={600 + (i % 3) * 80} x2={x + 90} y2={600 + (i % 3) * 80} color="#BFE9FF" w={5} head={14} opacity={0.7} />;
      }) : null}
      {/* sea floor + continents */}
      <path d={`M -600 ${floor} L 2600 ${floor} L 2600 1080 L -600 1080 Z`} fill={C.rock} />
      <path d={`M -600 400 L ${leftCoast - 60} 420 L ${leftCoast} ${floor} L -600 ${floor} Z`} fill={C.land} />
      <path d={`M 2600 400 L ${rightCoast + 60} 420 L ${rightCoast} ${floor} L 2600 ${floor} Z`} fill={C.land} />
      <T x={120} y={380} size={28} color={C.dim}>WEST</T>
      <T x={1800} y={380} size={28} color={C.dim}>EAST</T>
      <T x={960} y={floor + 70} size={28} color={C.dim}>sea floor: stopped with the rock</T>
      {phase === "slide" ? (
        <Panel x={700} y={260} w={520} h={150} opacity={prog(pt, 0.4, 1)}>
          <T x={960} y={315} size={28} color={C.dim}>{v.ocean_depth_km.display} km of water, sliding east</T>
          <T x={960} y={380} size={52} color={C.amber} display weight={900}>up to {v.one_sec_distance.display} m</T>
        </Panel>
      ) : null}
      {phase === "volume" ? (
        <g opacity={prog(pt, 0.2, 0.8)}>
          {Array.from({ length: 48 }).map((_, i) => (
            <rect key={i} x={360 + (i % 12) * 52} y={300 + Math.floor(i / 12) * 40} width={44} height={26} rx={4}
              fill={i < prog(pt, 0.4, 3.5) * 48 ? "#59B4FF" : C.faint} stroke="#BFE9FF" strokeWidth={1.5} />
          ))}
          <T x={360} y={270} size={26} anchor="start" color={C.dim}>Olympic pools (~{v.olympic_pools.display} per metre of coast)</T>
        </g>
      ) : null}
      {hammer ? (
        <g>
          {[0, 1, 2].map((k) => {
            const ph = ((pt * 0.8 + k / 3) % 1);
            return <circle key={k} cx={rightCoast} cy={sea + 120} r={30 + ph * 360} fill="none" stroke={C.amber} strokeWidth={8} opacity={1 - ph} />;
          })}
          <T x={rightCoast - 420} y={sea - 180} size={44} anchor="end" color={C.amber} display weight={900}>
            Δp ≈ {v.hammer_mpa.display} MPa
          </T>
        </g>
      ) : null}
      {phase === "pullback" ? (
        <g opacity={prog(pt, 0.3, 1)}>
          <path d={`M ${leftCoast} ${sea + 60} L ${leftCoast + 220} ${sea + draw * 0.4} `} stroke={C.amber} strokeWidth={6} strokeDasharray="10 8" />
          <T x={leftCoast + 40} y={sea - 40} size={32} anchor="start" color={C.amber} weight={800}>water pulls away · sea floor exposed</T>
          <Arrow x1={leftCoast + 260} y1={sea + 150} x2={leftCoast + 520} y2={sea + 150} color={C.amber} w={8} />
        </g>
      ) : null}
    </svg>
  );
};

/* ---------------- tsunami map ---------------- */
export const Tsunami: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const v = data.values;
  const unknown = phase === "unknown";
  const x0 = 340, x1 = 1580, y0 = 360, y1 = 880;
  const front = ((pt * 0.18) % 1) * (x1 - x0);
  const hours = interpolate(front, [0, x1 - x0], [0, Number(v.ocean_cross_h.value)], clamp);
  return (
    <svg width={1920} height={1080}>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={30} fill={C.oceanDeep} stroke={C.cyan} strokeOpacity={0.4} strokeWidth={3} />
      <rect x={x0 - 140} y={y0} width={130} height={y1 - y0} rx={20} fill={C.land} />
      <rect x={x1 + 10} y={y0} width={130} height={y1 - y0} rx={20} fill={C.land} />
      {[0, 1, 2].map((k) => {
        const f = ((pt * 0.18 + k * 0.33) % 1) * (x1 - x0);
        return (
          <path key={k} d={`M ${x1 - f} ${y0 + 10} Q ${x1 - f - 120} ${(y0 + y1) / 2} ${x1 - f} ${y1 - 10}`} fill="none"
            stroke={C.cyan} strokeWidth={6} opacity={(1 - f / (x1 - x0)) * (unknown ? 0.35 : 0.9)} />
        );
      })}
      <path d={`M ${x0 + front} ${y0 + 10} Q ${x0 + front + 120} ${(y0 + y1) / 2} ${x0 + front} ${y1 - 10}`} fill="none"
        stroke={C.amber} strokeWidth={6} opacity={unknown ? 0.35 : 0.9} />
      {!unknown ? (
        <g>
          <T x={960} y={y1 + 70} size={34} color={C.dim}>{v.ocean_cross_km.display} km of ocean</T>
          <Panel x={760} y={420} w={400} h={170}>
            <T x={960} y={480} size={28} color={C.dim}>c = √(g·d)</T>
            <T x={960} y={555} size={56} color={C.amber} display weight={900}>{hours.toFixed(1)} h</T>
          </Panel>
        </g>
      ) : (
        <g opacity={prog(pt, 0.2, 0.8)}>
          <T x={960} y={680} size={300} color={C.white} display weight={900}>?</T>
          <T x={960} y={y1 + 70} size={34} color={C.dim}>height depends on coastline shape + sea-floor depth</T>
        </g>
      )}
    </svg>
  );
};
