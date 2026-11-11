// Scene lab: builds IfEngineVideo props from a list of shots (scene + params + seconds) so the shared
// cinematic library can be previewed, benchmarked and QA'd without a video folder:
//   npx remotion render IfEngineLab out.mp4 --props=shots.json      (see pipeline/lab.py)
import React from "react";
import { IfEngineVideo } from "../IfEngineVideo";
import { VideoProps } from "../types";

export type LabShot = { scene: string; seconds: number; text?: string; kinetic?: string; [k: string]: unknown };
export type LabProps = { shots: LabShot[]; base: VideoProps };

export const labToVideo = ({ shots, base }: LabProps): VideoProps => {
  let t = 0;
  const beats = shots.map((s, i) => {
    const { seconds, text, kinetic, ...visual } = s;
    const b = { id: `b${String(i + 1).padStart(2, "0")}`, text: text ?? "", kinetic: kinetic ?? null, visual: visual as VideoProps["sections"][0]["beats"][0]["visual"] };
    const tb = { id: b.id, section: "lab", start: t, end: t + seconds };
    t += seconds;
    return { b, tb };
  });
  return {
    ...base, videoId: "lab", title: "Scene lab", hasAudio: false,
    sections: [{ id: "lab", chapter: "Scene lab", clock: null, beats: beats.map((x) => x.b) }],
    timing: { total: t, beats: beats.map((x) => x.tb), sections: [{ id: "lab", chapter: "Scene lab", start: 0, end: t, clock: null }] },
  };
};

export const IfEngineLab: React.FC<LabProps> = (props) => <IfEngineVideo {...labToVideo(props)} />;
