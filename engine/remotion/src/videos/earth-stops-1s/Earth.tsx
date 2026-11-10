import React from "react";
import { interpolate } from "remotion";
import { C } from "../../brand";
import { Globe, latCircle } from "../../components/Globe";
import { Arrow, Panel, T } from "../../components/Svg";
import { clamp, prog } from "../../timeline";
import { SceneProps } from "../../types";

const SPIN = 14; // visual degrees per second (stylised; real rotation is 0.0042 deg/s)

/* ---------------- earth_spin: hook / sidereal / equator ---------------- */
export const EarthSpin: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const stopped = phase === "stop";
  const tStop = t - pt;
  const rot = stopped ? tStop * SPIN : t * SPIN;
  const cloud = t * SPIN;
  const shake = stopped ? Math.sin(pt * 90) * 14 * (1 - prog(pt, 0, 0.6)) : 0;
  const flash = stopped ? 1 - prog(pt, 0, 0.5) : 0;
  const v = data.values;
  const scaleIn = interpolate(t, [0, 1.2], [0.85, 1], clamp);
  return (
    <svg width={1920} height={1080}>
      <g transform={`translate(${960 + shake} 600) scale(${scaleIn})`}>
        <Globe r={330} rot={rot} cloudRot={cloud} showEquator={phase === "equator" || phase === "spin"} />
        {phase === "spin" || phase === "equator" ? (
          <g opacity={prog(pt, 0.4, 1.2)}>
            <Arrow x1={-150} y1={360} x2={170} y2={360} color={C.amber} w={10} />
            <T x={10} y={430} size={44} color={C.amber} display weight={800}>{v.v_eq_ms.display} m/s at the equator</T>
          </g>
        ) : null}
        {phase === "sidereal" ? (
          <g opacity={prog(pt, 0.2, 1)}>
            <circle r={400} fill="none" stroke={C.purple} strokeWidth={4} strokeDasharray="14 14"
              strokeDashoffset={-t * 40} />
            <Arrow x1={380} y1={-140} x2={330} y2={-235} color={C.purple} w={6} />
            <circle cx={640} cy={-380} r={6} fill="#fff" />
            <line x1={0} y1={0} x2={640} y2={-380} stroke="#fff" strokeOpacity={0.25} strokeDasharray="6 10" strokeWidth={2} />
            <T x={650} y={-400} size={26} color={C.dim} anchor="start">distant star</T>
          </g>
        ) : null}
        {stopped ? (
          <g opacity={prog(pt, 0.3, 0.8)}>
            <Panel x={-620} y={-120} w={300} h={130} stroke={C.red}>
              <T x={-470} y={-70} size={26} color={C.dim}>GROUND</T>
              <T x={-470} y={-22} size={46} color={C.red} display weight={900}>0 m/s</T>
            </Panel>
            <Panel x={330} y={-120} w={300} h={130} stroke={C.cyan}>
              <T x={480} y={-70} size={26} color={C.dim}>AIR · OCEANS · YOU</T>
              <T x={480} y={-22} size={46} color={C.cyan} display weight={900}>{v.v_eq_ms.display} m/s</T>
            </Panel>
          </g>
        ) : null}
      </g>
      <rect width={1920} height={1080} fill="#fff" opacity={flash * 0.35} />
    </svg>
  );
};

/* ---------------- latitude: speeds by city ---------------- */
const CITIES = ["Singapore", "Cairo", "New York", "London", "North Pole"];
export const Latitude: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const r = 220;
  const tilt = 16;
  const cs = data.extra.city_speeds as Record<string, { lat: number; v_ms: number; v_kmh: number }>;
  const showBars = phase !== "circles";
  const together = phase === "together" || phase === "break";
  return (
    <svg width={1920} height={1080}>
      <g transform="translate(330 600)">
        <Globe r={r} rot={t * 6} tilt={tilt} />
        {CITIES.map((c, i) => {
          const lat = cs[c].lat;
          const e = latCircle(lat, tilt, r);
          const p = prog(t, 0.3 + i * 0.35, 1.0 + i * 0.35);
          if (lat > 89) {
            return <circle key={c} cx={0} cy={e.cy} r={9} fill={C.amber} opacity={p} />;
          }
          return (
            <path key={c} d={`M ${-e.rx} ${e.cy} A ${e.rx} ${e.ry} 0 0 0 ${e.rx} ${e.cy}`} fill="none"
              stroke={i === 0 ? C.amber : C.cyan} strokeWidth={4} strokeOpacity={0.9}
              strokeDasharray={`${p * 2000} 2000`} />
          );
        })}
      </g>
      {/* bar chart */}
      {!together ? (
        <g transform="translate(640 330)" opacity={showBars ? prog(pt, 0, 0.5) : 0}>
          <T x={0} y={-30} size={28} color={C.dim} anchor="start" weight={700} spacing={2}>SPEED OF THE GROUND · m/s</T>
          {CITIES.map((c, i) => {
            const v = cs[c].v_ms;
            const grow = prog(pt, 0.3 + i * 0.8, 1.1 + i * 0.8);
            const w = (v / 466) * 340 * grow;
            return (
              <g key={c} transform={`translate(0 ${i * 100 + 20})`}>
                <T x={0} y={34} size={32} anchor="start" weight={600}>{c}</T>
                <rect x={0} y={50} width={Math.max(4, w)} height={26} rx={13} fill={i === 4 ? C.purple : C.cyan} />
                <T x={w + 16} y={74} size={32} anchor="start" color={C.amber} display weight={800} opacity={grow}>
                  {Math.round(v * grow)}
                </T>
              </g>
            );
          })}
        </g>
      ) : (
        <g transform="translate(860 340)">
          {["Ground", "Air", "Oceans", "You"].map((n, i) => {
            const broken = phase === "break" && i === 0;
            const len = broken ? interpolate(pt, [0.6, 1.2], [520, 0], clamp) : 520;
            const drift = (t * 120) % 60;
            return (
              <g key={n} transform={`translate(0 ${i * 120})`} opacity={prog(pt, i * 0.2, i * 0.2 + 0.4) || (phase === "break" ? 1 : 0)}>
                <T x={0} y={48} size={36} anchor="start" weight={700} color={broken ? C.red : C.white}>{n}</T>
                <Arrow x1={200 + drift} y1={36} x2={200 + drift + len} y2={36} color={broken ? C.red : i === 0 ? C.land : C.cyan} w={12} />
              </g>
            );
          })}
          <T x={480} y={540} size={34} color={C.dim} weight={600}>same speed, same direction</T>
        </g>
      )}
    </svg>
  );
};

/* ---------------- safe: airliner + ISS ---------------- */
export const Safe: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  if (phase === "iss") {
    const ang = t * 0.9;
    const rx = 520, ry = 170;
    const x = Math.cos(ang) * rx, y = Math.sin(ang) * ry;
    const front = Math.sin(ang) > 0;
    return (
      <svg width={1920} height={1080}>
        <g transform="translate(960 610)" opacity={prog(pt, 0, 0.6)}>
          <ellipse rx={rx} ry={ry} fill="none" stroke={C.cyan} strokeOpacity={0.5} strokeWidth={3} strokeDasharray="10 10" transform="rotate(-12)" />
          {!front ? <g transform={`rotate(-12) translate(${x} ${y})`}><rect x={-22} y={-6} width={44} height={12} fill={C.white} /><rect x={-6} y={-26} width={12} height={52} fill={C.cyan} /></g> : null}
          <Globe r={260} rot={t * 6} />
          {front ? <g transform={`rotate(-12) translate(${x} ${y})`}><rect x={-26} y={-7} width={52} height={14} fill={C.white} /><rect x={-7} y={-30} width={14} height={60} fill={C.cyan} /></g> : null}
          <T x={0} y={-330} size={36} color={C.dim} weight={600}>orbit set by gravity + the station's own speed</T>
          <T x={0} y={360} size={44} color={C.amber} display weight={900}>{data.values.iss_kmh.display} km/h</T>
        </g>
      </svg>
    );
  }
  // airliner above a stopping ground
  const groundStop = prog(pt, 1.2, 1.6);
  const gx = (t * 600 * (1 - groundStop)) % 240;
  return (
    <svg width={1920} height={1080}>
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1B2157" stopOpacity="0" />
          <stop offset="1" stopColor="#3DE0FF" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <rect x={0} y={300} width={1920} height={560} fill="url(#sky)" />
      {Array.from({ length: 9 }).map((_, i) => {
        const x = ((i * 260 + t * 160) % 2100) - 100;
        return <Arrow key={i} x1={x} y1={380 + (i % 3) * 110} x2={x + 140} y2={380 + (i % 3) * 110} color={C.cyan} w={4} head={14} opacity={0.45} />;
      })}
      <g transform={`translate(960 ${520 + Math.sin(t * 2) * 6})`}>
        <path d="M-170 0 L150 -6 Q190 0 150 8 L-170 6 Z" fill={C.white} />
        <path d="M-20 0 L-90 -90 L-60 -90 L40 -2 Z" fill={C.white} />
        <path d="M-20 4 L-90 90 L-60 90 L40 6 Z" fill="#C9CEF0" />
        <path d="M-160 0 L-190 -50 L-170 -50 L-130 -2 Z" fill={C.white} />
      </g>
      <T x={960} y={650} size={36} weight={700} color={C.cyan}>The air keeps moving, and so does the plane</T>
      <rect x={0} y={880} width={1920} height={200} fill="#232A3F" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={i * 240 - gx} y={880} width={120} height={14} fill={C.land} />
      ))}
      <T x={960} y={960} size={34} weight={700} color={groundStop > 0.5 ? C.red : C.dim}>
        {groundStop > 0.5 ? "ground: stopped" : "ground"}
      </T>
    </svg>
  );
};

