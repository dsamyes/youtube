import type React from "react";
export type Beat = {
  id: string;
  text: string;
  kinetic?: string | null;
  card?: string;
  retention?: string;
  visual: { scene: string; phase?: string; [k: string]: unknown };
};

export type Section = { id: string; chapter: string; clock: string | null; beats: Beat[] };

export type TimedBeat = { id: string; section: string; start: number; end: number };

export type Card = { title: string; formula: string; sub: string; result: string; note: string; src: string };

export type VideoProps = {
  videoId: string;
  title: string;
  nextVideo: string;
  hasAudio: boolean;
  audioFile: string;
  sections: Section[];
  timing: {
    total: number;
    beats: TimedBeat[];
    sections: { id: string; chapter: string; start: number; end: number; clock: string | null }[];
  };
  cards: Record<string, Card>;
  values: Record<string, { value: number | string; display: string; unit: string }>;
  /** free-form data from the calc module (calc.json "extra") */
  extra: Record<string, unknown>;
  /** short source names for the recap "sources" phase */
  sources: string[];
};

/** A beat with its on-screen window (from its start to the next beat's start). */
export type Slot = Beat & { section: string; start: number; end: number; showUntil: number };

export type SceneRun = { scene: string; start: number; end: number; slots: Slot[] };

export type SceneProps = {
  /** seconds since this scene run began */
  t: number;
  /** current phase (beat's visual.phase) */
  phase: string;
  /** seconds since the current phase began */
  pt: number;
  /** index of current slot within run */
  idx: number;
  run: SceneRun;
  data: VideoProps;
  /** the beat's visual params merged over earlier beats of the same run */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>;
};

export type SceneEntry = { C: React.FC<SceneProps>; shift: boolean };
