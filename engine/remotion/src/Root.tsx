import { CalculateMetadataFunction, Composition, continueRender, delayRender } from "remotion";
import { fontsReady } from "./brand";
import { IfEngineVideo } from "./IfEngineVideo";
import { VideoProps } from "./types";
// Written by pipeline/render.py from the video's script.json / timing.json / calc.json.
import generated from "./generated/props.json";

const fontHandle = delayRender("Loading Inter fonts");
fontsReady.then(() => continueRender(fontHandle));

const FPS = 30;

const calculateMetadata: CalculateMetadataFunction<VideoProps> = ({ props }) => ({
  durationInFrames: Math.ceil(props.timing.total * FPS),
  defaultOutName: props.videoId,
});

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
        defaultProps={generated as unknown as VideoProps}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
