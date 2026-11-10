// Persistent ship HUD (the video's OVERLAY): speed, gamma, and the two clocks.
// The clocks are a time-lapse: 1 day aboard per second of video; Earth's clock runs gamma times
// faster. All values are computed from calc.json (extra.levels) in code.
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useVideoConfig } from "remotion";
import { C, DISPLAY, FONT } from "../../brand";
import { prog } from "../../timeline";
import { OverlayProps, Slot, VideoProps } from "../../types";
import { lvl, ramp01 } from "./common";
import { gammaOf, lerpBeta } from "./physics";

const HUD_SCENES = new Set(["sky", "beam", "galaxy"]);
const RATE = 1; // ship days per video second

type Seg = { start: number; end: number; hud: boolean; scene: string; fromB: number; toB: number; ramp: number; g: number; reset: boolean; key: string; gDisp: string; pct: string };

const segments = (slots: Slot[], data: VideoProps): Seg[] => {
  let hud = false;
  let level = "l0";
  return slots.map((s) => {
    const v = s.visual as any;
    if (v.hud !== undefined) hud = !!v.hud;
    const from = lvl(data, v.from ?? level);
    if (v.level !== undefined) level = v.level;
    const to = lvl(data, level);
    const ramp = v.from !== undefined || from.key !== to.key ? Number(v.ramp ?? 3) : 0;
    return { start: s.start, end: s.showUntil, hud, scene: v.scene, fromB: from.beta, toB: to.beta, ramp, g: to.gamma, reset: !!v.clock_reset, key: to.key, gDisp: to.g_disp, pct: to.pct };
  });
};

const fmtDays = (d: number) => {
  if (d < 730) return `${Math.floor(d).toLocaleString("en-US")} days`;
  const y = d / 365.25;
  return y < 1000 ? `${y.toFixed(1)} years` : `${Math.floor(y).toLocaleString("en-US")} years`;
};

const pctOf = (b: number, target: string) => {
  const dec = (target.split(".")[1] ?? "").length;
  const v = b * 100;
  const s = v.toFixed(dec);
  return parseFloat(s) >= 100 ? target : s;
};

export const ShipHud: React.FC<OverlayProps> = ({ data, time, slots }) => {
  const { width: W, height: H } = useVideoConfig();
  const vertical = H > W;
  const segs = React.useMemo(() => segments(slots, data), [slots, data]);
  const i = segs.findIndex((s) => time >= s.start && time < s.end);
  if (i < 0) return null;
  const seg = segs[i];
  if (!seg.hud || !HUD_SCENES.has(seg.scene)) return null;
  // clocks: integrate since the last reset
  let r = 0;
  for (let j = i; j >= 0; j--) if (segs[j].reset) { r = j; break; }
  let ship = 0;
  let earth = 0;
  for (let j = r; j <= i; j++) {
    const a = segs[j].start;
    const b = j === i ? time : segs[j].end;
    ship += (b - a) * RATE;
    earth += (b - a) * RATE * segs[j].g;
  }
  const f = ramp01(time - seg.start, seg.ramp);
  const beta = lerpBeta(seg.fromB, seg.toB, f);
  const done = f >= 1;
  const pct = done ? seg.pct : pctOf(beta, seg.pct);
  const g = done ? seg.gDisp : gammaOf(beta).toPrecision(3);
  // fade in when the HUD first appears in a run of HUD segments
  let first = i;
  while (first > 0 && segs[first - 1].hud && HUD_SCENES.has(segs[first - 1].scene)) first--;
  const a = prog(time, segs[first].start + 0.2, segs[first].start + 0.8);
  const cell = (label: string, value: string, color: string, wide = false) => (
    <div style={{ display: "flex", flexDirection: "column", minWidth: wide ? 210 : 150 }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 17, letterSpacing: 2.5, color: C.dim }}>{label}</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 38, color, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
  const box: React.CSSProperties = vertical
    ? { left: 70, width: 890, top: 1470, padding: "16px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 6, columnGap: 20 }
    : { right: 60, bottom: 112, width: 520, padding: "18px 26px", flexWrap: "wrap", rowGap: 14, columnGap: 20 };
  return (
    <div style={{
      position: "absolute", display: "flex", background: "linear-gradient(160deg, rgba(14,18,58,0.86), rgba(5,6,22,0.9))",
      border: `2px solid ${C.cyan}66`, borderRadius: 22, boxShadow: "0 16px 50px #000a", opacity: a, ...box,
    }}>
      {cell("SPEED", `${pct}% c`, C.amber, true)}
      {cell("GAMMA γ", g, C.cyan)}
      {cell("YOUR CLOCK", `+${fmtDays(ship)}`, C.white, true)}
      {cell("EARTH CLOCK", `+${fmtDays(earth)}`, earth / Math.max(ship, 1e-9) > 1.5 ? C.red : C.white)}
      {!vertical ? <div style={{ width: "100%", fontFamily: FONT, fontSize: 15, color: C.dim, letterSpacing: 1.5 }}>TIME-LAPSE · 1 DAY ABOARD PER SECOND OF VIDEO</div> : null}
    </div>
  );
};
