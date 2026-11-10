import React from "react";
import { C } from "../../brand";
import { Globe } from "../../components/Globe";
import { T } from "../../components/Svg";
import { prog } from "../../timeline";
import { SceneProps } from "../../types";

/* ---------------- leap: clock + leap seconds ---------------- */
// leap seconds per year 1972-2016 (IERS list): 1972 had two (Jun + Dec)
const LEAP_YEARS = [1972, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1981, 1982, 1983, 1985, 1987, 1989, 1990,
  1992, 1993, 1994, 1995, 1997, 1998, 2005, 2008, 2012, 2015, 2016];

export const Leap: React.FC<SceneProps> = ({ t, phase, pt, data }) => {
  const v = data.values;
  if (phase === "leap" || phase === "plusone") {
    const n = LEAP_YEARS.length;
    const plus = phase === "plusone";
    return (
      <svg width={1920} height={1080}>
        <T x={960} y={330} size={30} color={C.dim} weight={700} spacing={2}>LEAP SECONDS ADDED TO UTC, 1972–2016</T>
        {LEAP_YEARS.map((y, i) => {
          const x = 260 + (i % 14) * 100;
          const yy = 400 + Math.floor(i / 14) * 160;
          const on = plus ? 1 : prog(pt, 0.3 + i * 0.12, 0.5 + i * 0.12);
          return (
            <g key={i} opacity={on}>
              <rect x={x} y={yy} width={84} height={84} rx={14} fill={C.navy2} stroke={C.cyan} strokeWidth={2.5} />
              <T x={x + 42} y={yy + 56} size={34} display weight={900} color={C.cyan}>+1</T>
              <T x={x + 42} y={yy + 116} size={20} color={C.dim}>{y}</T>
            </g>
          );
        })}
        {plus ? (
          <g opacity={prog(pt, 0.2, 0.8)}>
            <rect x={860} y={760} width={200} height={140} rx={20} fill={C.amber} />
            <T x={960} y={850} size={64} display weight={900} color={C.deep}>+1</T>
            <T x={960} y={950} size={32} color={C.amber} weight={800}>#{n + 1}: the stopped second</T>
          </g>
        ) : (
          <T x={960} y={830} size={52} display weight={900} color={C.amber} opacity={prog(pt, 3.5, 4.2)}>{v.leap_count.display} in total</T>
        )}
      </svg>
    );
  }
  // lag / angle: clock + exaggerated rotation wedge
  const sweep = phase === "angle" ? prog(pt, 0.5, 2) : 0;
  return (
    <svg width={1920} height={1080}>
      <g transform="translate(680 600)">
        <circle r={260} fill={C.navy2} stroke={C.cyan} strokeWidth={6} />
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const r1 = i % 5 === 0 ? 220 : 236;
          return <line key={i} x1={Math.sin(a) * r1} y1={-Math.cos(a) * r1} x2={Math.sin(a) * 250} y2={-Math.cos(a) * 250} stroke={C.white} strokeWidth={i % 5 === 0 ? 5 : 2} />;
        })}
        {(() => {
          const sec = Math.floor(t) % 60;
          const a = (sec / 60) * Math.PI * 2;
          return <line x1={0} y1={0} x2={Math.sin(a) * 210} y2={-Math.cos(a) * 210} stroke={C.amber} strokeWidth={6} strokeLinecap="round" />;
        })()}
        <circle r={12} fill={C.amber} />
        <T x={0} y={340} size={34} color={C.dim}>atomic time keeps ticking…</T>
      </g>
      <g transform="translate(1320 600)">
        <Globe r={220} rot={-20} />
        <line x1={0} y1={0} x2={0} y2={-300} stroke={C.white} strokeWidth={3} strokeDasharray="8 8" />
        <line x1={0} y1={0} x2={Math.sin(-0.35 * sweep) * 300} y2={-Math.cos(-0.35 * sweep) * 300} stroke={C.amber} strokeWidth={5} />
        {sweep > 0 ? (
          <>
            <path d={`M 0 -260 A 260 260 0 0 0 ${Math.sin(-0.35 * sweep) * 260} ${-Math.cos(-0.35 * sweep) * 260}`} fill="none" stroke={C.amber} strokeWidth={4} />
            <T x={-120} y={-320} size={36} color={C.amber} weight={900} display>{v.rot_arcsec.display}″ behind</T>
            <T x={0} y={330} size={26} color={C.dim}>(angle exaggerated)</T>
          </>
        ) : (
          <T x={0} y={330} size={34} color={C.dim}>…but Earth's spin lost 1 second</T>
        )}
      </g>
    </svg>
  );
};

