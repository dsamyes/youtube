// "What If You Fell Into Jupiter?" composes the shared cinematic library only (space, descent,
// cutaway, photo); this file adds the depth gauge that follows you down (beats set visual.gauge).
import React from "react";
import { GaugeOverlay } from "../../components/Cinema";
import { OverlayProps, SceneEntry } from "../../types";

export const SCENES: Record<string, SceneEntry> = {};

const MARKS = [
  { f: 0.05, label: "Ammonia" },
  { f: 0.3, label: "Rust" },
  { f: 0.41, label: "Water" },
  { f: 0.53, label: "Galileo" },
  { f: 0.72, label: "Black heat" },
  { f: 0.85, label: "Ocean" },
  { f: 1, label: "Float" },
];

export const OVERLAY: React.FC<OverlayProps> = ({ time, slots }) => <GaugeOverlay time={time} slots={slots} marks={MARKS} title="DEPTH" />;
