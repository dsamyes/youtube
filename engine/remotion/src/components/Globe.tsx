import React from "react";
import { C } from "../brand";

// Coarse continent outlines [lat, lon] (deg). Stylised on purpose: brand vector look, not a map.
const CONTINENTS: [number, number][][] = [
  // North America
  [[70, -160], [72, -125], [68, -95], [62, -80], [55, -60], [47, -53], [44, -66], [35, -76], [25, -80], [30, -90],
   [26, -97], [19, -96], [16, -88], [9, -79], [15, -92], [20, -105], [30, -115], [40, -124], [50, -128], [58, -138], [60, -150], [65, -168]],
  // Greenland
  [[82, -40], [80, -20], [72, -22], [65, -38], [60, -44], [68, -54], [76, -68], [80, -60]],
  // South America
  [[11, -73], [8, -60], [3, -50], [-5, -35], [-15, -39], [-23, -42], [-34, -53], [-40, -62], [-52, -68], [-55, -70],
   [-46, -75], [-30, -71], [-18, -70], [-5, -81], [2, -79]],
  // Europe + Asia
  [[36, -9], [43, -9], [48, -4], [51, 2], [54, 8], [57, 10], [60, 5], [70, 20], [70, 40], [73, 60], [76, 100],
   [72, 140], [66, 180], [60, 163], [55, 156], [52, 141], [40, 140], [35, 129], [31, 122], [22, 114], [20, 106],
   [10, 106], [1, 104], [8, 98], [17, 95], [22, 90], [15, 80], [8, 77], [20, 72], [25, 62], [25, 57], [12, 44],
   [20, 40], [30, 32], [36, 36], [37, 27], [41, 29], [40, 20], [45, 13], [39, 16], [44, 8], [43, 3], [36, -5]],
  // Africa
  [[35, -6], [37, 10], [32, 20], [31, 32], [22, 37], [12, 43], [11, 51], [0, 42], [-10, 40], [-25, 35], [-34, 26],
   [-35, 19], [-29, 16], [-17, 12], [-6, 12], [4, 9], [5, -4], [5, -9], [10, -15], [20, -17], [28, -13]],
  // Australia
  [[-11, 132], [-12, 142], [-19, 146], [-28, 153], [-38, 147], [-38, 140], [-32, 133], [-35, 117], [-22, 113], [-15, 125]],
  // Antarctica (rim)
  [[-70, -180], [-66, -120], [-72, -60], [-64, -58], [-70, 0], [-67, 60], [-66, 120], [-70, 180], [-90, 180], [-90, -180]],
];

const rad = (d: number) => (d * Math.PI) / 180;

/** Orthographic projection; points on the far side are pushed to the limb. */
function project(lat: number, lon: number, rotDeg: number, tiltDeg: number, r: number) {
  const la = rad(lat);
  const lo = rad(lon + rotDeg);
  const t = rad(tiltDeg);
  // point on unit sphere (x right, y up, z toward viewer)
  let x = Math.cos(la) * Math.sin(lo);
  let y = Math.sin(la);
  let z = Math.cos(la) * Math.cos(lo);
  // tilt the axis toward the viewer
  const y2 = y * Math.cos(t) - z * Math.sin(t);
  const z2 = y * Math.sin(t) + z * Math.cos(t);
  y = y2;
  z = z2;
  if (z < 0) {
    const n = Math.hypot(x, y) || 1;
    x /= n;
    y /= n;
  }
  return { x: x * r, y: -y * r, front: z >= 0 };
}

export const latCircle = (lat: number, tiltDeg: number, r: number) => {
  // ellipse for a latitude circle under orthographic projection with tilt
  const t = rad(tiltDeg);
  const cy = -Math.sin(rad(lat)) * Math.cos(t) * r;
  const rx = Math.cos(rad(lat)) * r;
  const ry = Math.cos(rad(lat)) * Math.sin(t) * r;
  return { cy, rx, ry };
};

type Props = {
  r: number;
  rot: number; // degrees of rotation of the solid Earth
  cloudRot?: number; // degrees of rotation of the atmosphere layer
  tilt?: number;
  glow?: number;
  showEquator?: boolean;
  children?: React.ReactNode;
};

export const Globe: React.FC<Props> = ({ r, rot, cloudRot, tilt = 18, glow = 1, showEquator, children }) => {
  const id = `g${Math.round(r)}`;
  const crot = cloudRot ?? rot;
  const eq = latCircle(0, tilt, r);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-sea`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#59B4FF" />
          <stop offset="0.5" stopColor={C.ocean} />
          <stop offset="1" stopColor={C.oceanDeep} />
        </radialGradient>
        <radialGradient id={`${id}-shade`} cx="35%" cy="30%" r="80%">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#030418" stopOpacity="0.75" />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0.82" stopColor={C.cyan} stopOpacity="0.0" />
          <stop offset="0.9" stopColor={C.cyan} stopOpacity="0.35" />
          <stop offset="1" stopColor={C.cyan} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle r={r} />
        </clipPath>
      </defs>
      <circle r={r * 1.22} fill={`url(#${id}-glow)`} opacity={glow} />
      <circle r={r} fill={`url(#${id}-sea)`} />
      <g clipPath={`url(#${id}-clip)`}>
        {CONTINENTS.map((poly, i) => {
          const pts = poly.map(([la, lo]) => project(la, lo, rot, tilt, r));
          if (!pts.some((p) => p.front)) return null;
          return (
            <path
              key={i}
              d={"M" + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("L") + "Z"}
              fill={C.land}
              stroke="#2C8A6C"
              strokeWidth={1.5}
            />
          );
        })}
        {/* cloud streaks: part of the atmosphere, they keep moving when the ground stops */}
        {Array.from({ length: 14 }).map((_, i) => {
          const lat = -60 + ((i * 37) % 120);
          const lon = (i * 73) % 360;
          const a = project(lat, lon, crot, tilt, r);
          const b = project(lat, lon + 22, crot, tilt, r);
          if (!a.front || !b.front) return null;
          return (
            <line key={`c${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#FFFFFF" strokeOpacity={0.55}
              strokeWidth={r * 0.035} strokeLinecap="round" />
          );
        })}
        {showEquator ? (
          <path
            d={`M ${-eq.rx} ${eq.cy} A ${eq.rx} ${eq.ry} 0 0 0 ${eq.rx} ${eq.cy}`}
            fill="none" stroke={C.amber} strokeWidth={5} strokeDasharray="18 10"
          />
        ) : null}
      </g>
      <circle r={r} fill={`url(#${id}-shade)`} />
      <circle r={r} fill="none" stroke={C.cyan} strokeOpacity={0.45} strokeWidth={2} />
      {children}
    </g>
  );
};
