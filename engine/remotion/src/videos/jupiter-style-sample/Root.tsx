/**
 * Separate Remotion root for the style sample, so the shared Root.tsx stays untouched.
 *   npx remotion render src/videos/jupiter-style-sample/index.ts JupiterStyleSample out.mp4 --props=<build/props.json>
 * The props (cut list, keywords, captions) are written by engine/videos/jupiter-style-sample/build.py.
 */
import React from "react";
import { CalculateMetadataFunction, Composition, continueRender, delayRender } from "remotion";
import { fontsReady } from "../../brand";
import { JupiterStyleSample, SampleProps } from "./Sample";

const fontHandle = delayRender("Loading Inter fonts");
fontsReady.then(() => continueRender(fontHandle));

const placeholder: SampleProps = {
  fps: 30, total: 3, durationInFrames: 90, kws: [{ from: 10, dur: 60, text: "RUN build.py", style: "title" }], caps: [],
  shots: [{ id: "s01", from: 0, dur: 90, kind: "3d", line: "l01", scene: "meteor", seed: 1 }],
};

const calc: CalculateMetadataFunction<SampleProps> = ({ props }) => ({ durationInFrames: props.durationInFrames, fps: props.fps });

export const SampleRoot: React.FC = () => (
  <Composition id="JupiterStyleSample" component={JupiterStyleSample} durationInFrames={90} fps={30} width={1920} height={1080}
    defaultProps={placeholder} calculateMetadata={calc} />
);
