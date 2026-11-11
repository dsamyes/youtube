import { CalculateMetadataFunction, Composition, continueRender, delayRender } from "remotion";
import { fontsReady } from "./brand";
import { IfEngineVideo } from "./IfEngineVideo";
import { IfEngineShort } from "./ShortVideo";
import { IfEngineThumb } from "./ThumbStill";
import { IfEngineLab, LabProps, labToVideo } from "./lab/Lab";
import { ShortProps, ThumbProps, VideoProps } from "./types";
// Written by pipeline/render.py from the video's script.json / timing.json / calc.json.
import generated from "./generated/props.json";

const fontHandle = delayRender("Loading Inter fonts");
fontsReady.then(() => continueRender(fontHandle));

const FPS = 30;

const calculateMetadata: CalculateMetadataFunction<VideoProps> = ({ props }) => ({
  durationInFrames: Math.ceil(props.timing.total * FPS),
  defaultOutName: props.videoId,
});

const calculateShort: CalculateMetadataFunction<ShortProps> = ({ props }) => ({
  durationInFrames: Math.ceil(props.timing.total * FPS),
  defaultOutName: `${props.videoId}_${props.shortId}`,
});

const base = generated as unknown as VideoProps;

const calculateLab: CalculateMetadataFunction<LabProps> = ({ props }) => {
  const v = labToVideo(props);
  const vertical = (props as LabProps & { vertical?: boolean }).vertical;
  return { durationInFrames: Math.ceil(v.timing.total * FPS), ...(vertical ? { width: 1080, height: 1920 } : {}) };
};
const labDefaults: LabProps = { base, shots: [{ scene: "space", seconds: 6, shot: "approach" }] };
// Shorts and thumbnails get their real props with --props (pipeline/shorts.py, thumbnail.py)
const shortDefaults: ShortProps = { ...base, shortId: "preview", hook: "", end: "", words: [] };
const thumbDefaults: ThumbProps = { ...base, thumb: { scene: "title", params: {}, headline: "" } };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="IfEngineVideo"
        component={IfEngineVideo}
        durationInFrames={300}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={base}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="IfEngineShort"
        component={IfEngineShort}
        durationInFrames={300}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={shortDefaults}
        calculateMetadata={calculateShort}
      />
      <Composition
        id="IfEngineThumb"
        component={IfEngineThumb}
        durationInFrames={1}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={thumbDefaults}
      />
      <Composition
        id="IfEngineLab"
        component={IfEngineLab}
        durationInFrames={300}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={labDefaults}
        calculateMetadata={calculateLab}
      />
    </>
  );
};
