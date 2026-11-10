// The window: the relativistic star field plus explanatory marks and panels.
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Img, interpolate, spring, useVideoConfig } from "remotion";
import { C, DISPLAY, FONT } from "../../brand";
import { clamp, prog } from "../../timeline";
import { SceneProps } from "../../types";
import issImg from "./assets/iss_iss066e081130.jpg";
import { Big, Glass, Label, levels, lvl, skyState, toView, val } from "./common";
import { angleToPx, CATALOG_STARS, sideDeg, Starfield } from "./Starfield";

const Marks: React.FC<{ p: SceneProps; s: ReturnType<typeof skyState>; W: number; H: number; vertical: boolean }> = ({ p, s, W, H, vertical }) => {
  const mark = String(p.params.mark ?? "none");
  const view = toView(s, vertical);
  const cx = W * (view.cx ?? 0.5);
  const cy = H * (view.cy ?? 0.5);
  const a = prog(p.pt, 0.6, 1.6);
  const key = s.to.key;
  const allSky = s.fov >= 300;
  const k = Math.min(W, H) / 1080;
  const txt = (x: number, y: number, str: string, color: string = C.white, size = 30, anchor: "start" | "middle" | "end" = "middle") => (
    <text x={x} y={y} fill={color} fontSize={size * k} fontFamily={FONT} fontWeight={800} letterSpacing={2 * k} textAnchor={anchor}
      style={{ paintOrder: "stroke", stroke: "#02030c", strokeWidth: 6 * k }}>{str}</text>
  );
  const els: React.ReactNode[] = [];
  if (allSky) {
    const R = angleToPx(180, view, W, H);
    els.push(<g key="as" opacity={prog(p.t, 0.3, 1.2)}>
      <circle cx={cx} cy={cy} r={6 * k} fill="none" stroke={C.cyan} strokeWidth={2 * k} />
      {txt(cx, cy - 18 * k, "AHEAD", C.cyan, 22)}
      {txt(cx - R - 20 * k, cy + 8 * k, "EDGE = BEHIND YOU", C.cyan, 22, "end")}
    </g>);
  }
  if (mark === "side" || mark === "half") {
    const r1 = angleToPx(sideDeg(s.beta), view, W, H);
    const r0 = angleToPx(90, view, W, H);
    const lab = mark === "side" ? `BESIDE YOU → ${val(p.data, `side_${key}`)}° AHEAD` : `HALF THE SKY: ${val(p.data, `circle_${key}`)}° WIDE`;
    els.push(<g key="sd" opacity={a}>
      {mark === "side" && r0 < Math.max(W, H) ? <circle cx={cx} cy={cy} r={r0} fill="none" stroke={C.dim} strokeWidth={2 * k} strokeDasharray={`${8 * k} ${10 * k}`} /> : null}
      <circle cx={cx} cy={cy} r={r1} fill={mark === "half" ? "rgba(61,224,255,0.06)" : "none"} stroke={C.cyan} strokeWidth={3 * k} strokeDasharray={`${14 * k} ${10 * k}`} />
      {txt(cx, cy + r1 + 44 * k, s.f >= 1 ? lab : "", C.cyan, 30)}
    </g>);
  }
  if (mark === "patch") {
    // every star image now sits inside the circle where a sideways star appears (half the sky) or
    // closer; label the patch, not a ring (the "starbow" ring does not survive the real physics)
    const r = Math.max(40 * k, angleToPx(sideDeg(s.beta), view, W, H) * 1.6);
    if (r < Math.max(W, H)) {
      const ang = -0.7;
      const x1 = cx + r * Math.cos(ang);
      const y1 = cy + r * Math.sin(ang);
      const x2 = x1 + 110 * k;
      const y2 = y1 - 70 * k;
      els.push(<g key="pt" opacity={a * (s.f >= 1 ? 1 : 0)}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.amber} strokeWidth={2.5 * k} />
        {txt(x2 + 10 * k, y2 - 8 * k, String(p.params.patchLabel ?? "EVERY STAR: HERE"), C.amber, 28, "start")}
      </g>);
    }
  }
  if (mark === "split" && allSky) {
    const R = angleToPx(180, view, W, H);
    els.push(<g key="sp" opacity={a}>
      {txt(cx, cy + 120 * k, "BLUER AHEAD", "#9cc4ff", 28)}
      {txt(cx, cy + R * 0.86, "REDDER BEHIND", "#ff8a6a", 28)}
    </g>);
  }
  if (mark === "center") {
    els.push(<g key="ce" opacity={a}>
      <circle cx={cx} cy={cy} r={70 * k} fill="none" stroke={C.purple} strokeWidth={3 * k} strokeDasharray={`${10 * k} ${8 * k}`} />
      {txt(cx, cy - 92 * k, `SUN-LIKE STAR AHEAD: ${val(p.data, `tfront_${key}`)} K`, C.purple, 28)}
      {txt(cx, cy + 116 * k, "LIGHT PUSHED INTO ULTRAVIOLET", C.dim, 22)}
    </g>);
  }
  if (mark === "cmb") {
    const tKey = `cmbf_${key}`;
    const visible = Number(p.data.values[tKey]?.value ?? 0) > 900;
    els.push(<g key="cm" opacity={a}>
      {txt(cx, cy + (vertical ? 250 : 200) * k, visible ? `BIG BANG AFTERGLOW AHEAD: ${val(p.data, tKey)} K` : `INFRARED VIEW (FALSE COLOUR): ${val(p.data, tKey)} K`, visible ? C.amber : C.purple, 30)}
    </g>);
  }
  if (mark === "catalog") {
    els.push(<g key="ct" opacity={a}>{txt(cx, H - (vertical ? 420 : 150) * k, `${CATALOG_STARS.toLocaleString("en-US")} CATALOG STARS · HYG v4.0 · RELATIVITY APPLIED PER FRAME`, C.dim, 22)}</g>);
  }
  if (mark === "back") {
    els.push(<g key="bk" opacity={prog(p.pt, 2.6, 3.4)}>
      {txt(cx, cy - 10 * k, `SUN-LIKE STARS BEHIND YOU: ${val(p.data, `tback_${key}`)} K`, "#ff8a6a", 32)}
      {txt(cx, cy + 36 * k, "SHIFTED INTO INFRARED · INVISIBLE TO YOUR EYES", C.dim, 24)}
    </g>);
  }
  if (Math.abs(s.look) > 90) {
    els.push(<g key="lb" opacity={prog(p.pt, 0.8, 1.6)}>{txt(cx, 230 * k, "LOOKING BACK", C.dim, 24)}</g>);
  }
  return <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>{els}</svg>;
};

const LevelCard: React.FC<{ p: SceneProps; vertical: boolean }> = ({ p, vertical }) => {
  const { fps } = useVideoConfig();
  const L = lvl(p.data, p.params.level);
  const n = levels(p.data).findIndex((l) => l.key === L.key);
  const enter = spring({ frame: Math.round(p.pt * fps), fps, config: { damping: 15, stiffness: 120 } });
  const out = prog(p.pt, 2.9, 3.6);
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: vertical ? 560 : 290, display: "flex", flexDirection: "column", alignItems: "center",
      background: "radial-gradient(ellipse 42% 62% at 50% 50%, rgba(2,3,12,0.93) 0%, rgba(2,3,12,0.8) 55%, rgba(2,3,12,0) 100%)", padding: "40px 0",
      opacity: Math.min(1, enter) * (1 - out), scale: interpolate(enter, [0, 1], [1.25, 1]) * (1 + out * 0.15),
    }}>
      <Label color={C.cyan} size={vertical ? 30 : 30}>{`Dial position ${n} of 7`}</Label>
      <Big size={vertical ? 170 : 210} color={C.amber} style={{ textShadow: `0 0 60px ${C.amber}55, 0 10px 40px #000`, marginTop: 10 }}>{L.pct}<span style={{ fontSize: "0.5em" }}>% c</span></Big>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.white, marginTop: 14, textShadow: "0 4px 20px #000" }}>
        {val(p.data, `kms_${L.key}`)} km every second · γ = {L.g_disp}
      </div>
    </div>
  );
};

const NinesPanel: React.FC<{ p: SceneProps }> = ({ p }) => {
  const ls = levels(p.data).filter((l) => l.key !== "0");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center", gap: 18 }}>
      {ls.map((l, i) => {
        const a = prog(p.pt, 0.3 + i * 0.55, 0.8 + i * 0.55);
        return (
          <div key={l.key} style={{
            fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, color: i < 3 ? C.white : C.amber, padding: "18px 26px", borderRadius: 20,
            background: "rgba(7,9,32,0.8)", border: `2px solid ${i < 3 ? C.cyan : C.amber}`, opacity: a, translate: `0px ${(1 - a) * 40}px`,
          }}>{l.pct}%</div>
        );
      })}
    </div>
  );
};

const FourPanel: React.FC<{ p: SceneProps }> = ({ p }) => {
  const items: [string, string, string][] = [
    ["YOUR CLOCK", "vs Earth's", C.cyan], ["THE VIEW", "out the window", C.purple], ["WHAT HITS YOU", "at the front", C.red], ["THE BILL", "in energy", C.amber],
  ];
  const icon = (i: number, c: string) => {
    const st = { fill: "none", stroke: c, strokeWidth: 6, strokeLinecap: "round" as const };
    if (i === 0) return <g {...st}><circle cx={50} cy={50} r={38} /><line x1={50} y1={50} x2={50} y2={24} /><line x1={50} y1={50} x2={68} y2={60} /></g>;
    if (i === 1) return <g {...st}><path d="M8 50 Q50 10 92 50 Q50 90 8 50 Z" /><circle cx={50} cy={50} r={14} /></g>;
    if (i === 2) return <g {...st}><path d="M50 10 L84 24 V52 Q84 78 50 92 Q16 78 16 52 V24 Z" /><path d="M58 28 L42 54 H58 L44 76" /></g>;
    return <g {...st}><path d="M58 8 L26 56 H50 L42 92 L76 40 H52 Z" /></g>;
  };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", gap: 30 }}>
      {items.map(([h, d, c], i) => {
        const a = prog(p.pt, 0.9 + i * 1.1, 1.4 + i * 1.1);
        return (
          <Glass key={h} accent={c} style={{ position: "relative", width: 330, height: 330, padding: 32, opacity: a, translate: `0px ${(1 - a) * 50}px`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <svg width={120} height={120} viewBox="0 0 100 100">{icon(i, c)}</svg>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 38, marginTop: 22, textAlign: "center" }}>{h}</div>
            <div style={{ fontSize: 26, color: C.dim, marginTop: 8 }}>{d}</div>
          </Glass>
        );
      })}
    </div>
  );
};

const IssPanel: React.FC<{ p: SceneProps }> = ({ p }) => {
  const a = prog(p.pt, 0.2, 1.0);
  return (
    <Glass accent={C.cyan} style={{ left: 140, top: 250, width: 900, padding: 0, overflow: "hidden", opacity: a, translate: `${(1 - a) * -60}px 0px` }}>
      <div style={{ position: "relative", width: 900, height: 520, overflow: "hidden" }}>
        <Img src={issImg} style={{ width: 900, height: 600, objectFit: "cover", scale: interpolate(p.pt, [0, 12], [1.04, 1.16], clamp), translate: "0px -20px" }} />
        <div style={{ position: "absolute", right: 14, bottom: 10, fontSize: 18, color: C.dim }}>NASA/ESA – T. Pesquet</div>
      </div>
      <div style={{ padding: "22px 30px 26px" }}>
        <Label color={C.cyan}>Your ship</Label>
        <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 52, marginTop: 6 }}>
          <span style={{ color: C.amber }}>{val(p.data, "ship_mass_t")} tonnes</span> · the mass of the ISS
        </div>
      </div>
    </Glass>
  );
};

export const Sky: React.FC<SceneProps> = (p) => {
  const { width: W, height: H } = useVideoConfig();
  const vertical = H > W;
  const s = skyState(p);
  const cxp = p.params.cx !== undefined ? Number(p.params.cx) : undefined;
  const view = { ...toView(s, vertical), ...(cxp !== undefined ? { cx: cxp } : {}) };
  const exposure = Number(p.params.streak ?? 1); // >1 = longer shutter (thumbnails)
  const prev = s.changing ? { ...toView(skyState(p, exposure / 30), vertical), ...(cxp !== undefined ? { cx: cxp } : {}) } : undefined;
  const panel = String(p.params.panel ?? "none");
  const own = p.run.slots[p.idx].visual as any;
  const showPanel = own.panel !== undefined; // panels belong to the beat that names them
  const mark = String(p.params.mark ?? "none");
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Starfield view={view} prev={prev} width={W} height={H} cmb={mark === "cmb" ? "ir" : "auto"} />
      {/* soft vignette for depth */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(2,3,12,0.65) 100%)" }} />
      <Marks p={p} s={s} W={W} H={H} vertical={vertical} />
      {showPanel && panel === "level" ? <LevelCard p={p} vertical={vertical} /> : null}
      {showPanel && panel === "nines" ? <NinesPanel p={p} /> : null}
      {showPanel && panel === "four" ? <FourPanel p={p} /> : null}
      {showPanel && panel === "iss" ? <IssPanel p={p} /> : null}
    </div>
  );
};
