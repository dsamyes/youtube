import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, Hud, Kinetic, MathCard } from "./components/Overlays";
import { VIDEO_OVERLAY, VIDEO_SCENES } from "./generated/registry";
import { SHARED_SCENES } from "./scenes/shared";
import { buildRuns, buildSlots, clamp } from "./timeline";
import { SceneEntry, SceneRun, Slot, VideoProps } from "./types";

// per-video scenes (src/videos/<id>/scenes.tsx, selected by render.py via generated/registry.ts) win
export const SCENES: Record<string, SceneEntry> = { ...SHARED_SCENES, ...VIDEO_SCENES };

const FADE = 0.4;

/** Renders one scene run; owns the frame subscription for that run only. */
export const RunView: React.FC<{ run: SceneRun; data: VideoProps; cardShift: (t: number) => number; noFadeIn?: boolean; bg?: boolean }> = ({ run, data, cardShift, noFadeIn, bg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const abs = run.start + t;
  let idx = run.slots.findIndex((s) => abs < s.showUntil);
  if (idx < 0) idx = run.slots.length - 1;
  const slot = run.slots[idx];
  const phaseStart = idx === 0 ? run.start : slot.start;
  const len = run.end - run.start;
  const opacity = Math.min(noFadeIn ? 1 : interpolate(t, [0, FADE], [0, 1], clamp), interpolate(t, [len - FADE, len], [1, 0], clamp));
  const entry = SCENES[run.scene];
  if (!entry) throw new Error(`Unknown scene "${run.scene}" - add it to SCENES`);
  const shift = entry.shift ? cardShift(abs) : 0;
  const S = entry.C;
  return (
    <AbsoluteFill style={{ opacity, translate: `${-shift * 330}px 0px`, scale: 1 - shift * 0.1 }}>
      {bg && !entry.opaque ? <Background /> : null}
      <S t={t} phase={slot.visual.phase ?? "default"} pt={abs - phaseStart} idx={idx} run={run} data={data}
        params={Object.assign({}, ...run.slots.slice(0, idx + 1).map((s) => s.visual))} />
    </AbsoluteFill>
  );
};

const Overlay: React.FC<{ slots: Slot[]; data: VideoProps; cardShift: (t: number) => number }> = ({ slots, data, cardShift }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const cur = slots.find((s) => time >= s.start && time < s.showUntil);
  const VO = VIDEO_OVERLAY;
  return (
    <AbsoluteFill>
      {VO ? <VO data={data} time={time} slots={slots} slot={cur} /> : null}
      {cur?.kinetic ? (
        <Kinetic key={cur.id} text={cur.kinetic} t={time - cur.start} len={cur.showUntil - cur.start} shifted={0} />
      ) : null}
      {cur?.card && data.cards[cur.card] ? (
        <MathCard key={cur.id + "c"} card={data.cards[cur.card]} t={time - cur.start} len={cur.showUntil - cur.start} />
      ) : null}
      <Hud data={data} time={time} slot={cur} />
    </AbsoluteFill>
  );
};

export const IfEngineVideo: React.FC<VideoProps> = (data) => {
  const { fps } = useVideoConfig();
  const slots = React.useMemo(() => buildSlots(data), [data]);
  const runs = React.useMemo(() => buildRuns(slots), [slots]);
  const cardShift = React.useCallback(
    (time: number) => {
      // smooth 0..1 "a Math Card is on screen" signal so scenes slide left to make room
      let v = 0;
      for (const s of slots) {
        if (!s.card) continue;
        const a = interpolate(time, [s.start - 0.1, s.start + 0.5], [0, 1], clamp);
        const b = interpolate(time, [s.showUntil - 0.5, s.showUntil], [1, 0], clamp);
        v = Math.max(v, Math.min(a, b));
      }
      return v;
    },
    [slots],
  );
  return (
    <AbsoluteFill>
      <style>{"svg { overflow: visible; }"}</style>
      {runs.map((run, i) => (
        <Sequence key={i} name={`${run.scene} · ${run.slots[0].id}`} from={Math.round(run.start * fps)}
          durationInFrames={Math.max(1, Math.round((run.end - run.start) * fps))}>
          <RunView run={run} data={data} cardShift={cardShift} noFadeIn={i === 0} bg />
        </Sequence>
      ))}
      <Overlay slots={slots} data={data} cardShift={cardShift} />
      {data.hasAudio ? <Audio src={staticFile(data.audioFile)} /> : null}
    </AbsoluteFill>
  );
};
