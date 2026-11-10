// Thumbnail still (1280x720): ONE strong frame from the video's own scene + 2-4 big words.
// thumbnail.py renders it when script.json "thumbnail" names a scene.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, DISPLAY } from "./brand";
import { SCENES } from "./IfEngineVideo";
import { SceneRun, Slot, ThumbProps } from "./types";

export const IfEngineThumb: React.FC<ThumbProps> = (data) => {
  const th = data.thumb;
  const entry = SCENES[th.scene];
  if (!entry) throw new Error(`thumbnail scene "${th.scene}" is not registered`);
  const t = th.t ?? 6;
  const slot = { id: "thumb", text: "", visual: { scene: th.scene, ...th.params }, section: "thumb", start: 0, end: 10, showUntil: 10 } as Slot;
  const run: SceneRun = { scene: th.scene, start: 0, end: 10, slots: [slot] };
  const S = entry.C;
  const parts = th.headline.split(/(\+?\d[\d,.]*)/);
  return (
    <AbsoluteFill style={{ background: C.deep, overflow: "hidden" }}>
      <S t={t} phase={String(th.params.phase ?? "default")} pt={t} idx={0} run={run} data={data} params={slot.visual} />
      {/* left-side darkening so the words hold contrast at feed size */}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(4,5,20,0.92) 0%, rgba(4,5,20,0.6) 38%, rgba(4,5,20,0) 62%)" }} />
      <Img src={staticFile("logo.svg")} style={{ position: "absolute", left: 40, top: 36, width: 70, height: 70 }} />
      <div id="words" style={{ position: "absolute", left: 56, top: 150, width: 640, fontFamily: DISPLAY, fontWeight: 900, color: C.white, textTransform: "uppercase", lineHeight: 0.92, letterSpacing: -2, textShadow: "0 10px 40px #000" }}>
        {th.kicker ? <div style={{ fontSize: 86, color: C.white }}>{th.kicker}</div> : null}
        <div style={{ fontSize: 168 }}>
          {parts.map((p, i) => (<span key={i} style={{ color: /\d/.test(p) ? C.amber : C.white }}>{p}</span>))}
        </div>
        {th.sub ? <div style={{ fontSize: 64, color: C.cyan, marginTop: 22, letterSpacing: 0 }}>{th.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
