import React from "react";
import { C, DISPLAY, FONT } from "../brand";

export const Arrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number; color?: string; w?: number; head?: number; opacity?: number; dash?: string;
}> = ({ x1, y1, x2, y2, color = C.cyan, w = 8, head = 22, opacity = 1, dash }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 2) return null;
  const hx = x2 - Math.cos(a) * head * 0.8;
  const hy = y2 - Math.sin(a) * head * 0.8;
  const p1 = [x2 - head * Math.cos(a - 0.45), y2 - head * Math.sin(a - 0.45)];
  const p2 = [x2 - head * Math.cos(a + 0.45), y2 - head * Math.sin(a + 0.45)];
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
      <polygon points={`${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill={color} />
    </g>
  );
};

export const T: React.FC<{
  x: number; y: number; children: React.ReactNode; size?: number; color?: string; weight?: number; anchor?: "start" | "middle" | "end";
  display?: boolean; opacity?: number; spacing?: number;
}> = ({ x, y, children, size = 36, color = C.white, weight = 700, anchor = "middle", display, opacity = 1, spacing = 0 }) => (
  <text x={x} y={y} fontSize={size} fill={color} fontWeight={weight} textAnchor={anchor} opacity={opacity}
    fontFamily={display ? DISPLAY : FONT} letterSpacing={spacing}>
    {children}
  </text>
);

export const Person: React.FC<{ x: number; y: number; s?: number; rot?: number; color?: string }> = ({ x, y, s = 1, rot = 0, color = C.white }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} stroke={color} strokeWidth={9} strokeLinecap="round" fill="none">
    <circle cx={0} cy={-150} r={20} fill={color} stroke="none" />
    <line x1={0} y1={-128} x2={0} y2={-60} />
    <line x1={0} y1={-115} x2={-34} y2={-80} />
    <line x1={0} y1={-115} x2={34} y2={-84} />
    <line x1={0} y1={-60} x2={-22} y2={0} />
    <line x1={0} y1={-60} x2={22} y2={0} />
  </g>
);

export const Skyline: React.FC<{ y: number; x0?: number; x1?: number; color?: string; seed?: number }> = ({ y, x0 = 0, x1 = 1920, color = "#1E2560", seed = 1 }) => {
  const rects = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    const w = 50 + ((Math.sin((i + seed) * 12.9898) * 43758.5453) % 1 + 1) % 1 * 90;
    const h = 80 + ((Math.sin((i + seed) * 78.233) * 12345.678) % 1 + 1) % 1 * 260;
    rects.push(<rect key={i} x={x} y={y - h} width={w - 8} height={h} fill={color} />);
    x += w;
    i++;
  }
  return <g>{rects}</g>;
};

export const Panel: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; stroke?: string; opacity?: number }> = ({ x, y, w, h, children, stroke = C.cyan, opacity = 1 }) => (
  <g opacity={opacity}>
    <rect x={x} y={y} width={w} height={h} rx={24} fill="rgba(10,13,44,0.85)" stroke={stroke} strokeWidth={2.5} />
    {children}
  </g>
);
