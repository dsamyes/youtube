// Entry for the hole-through-earth short (cartoon-3d-short skill): renders src/videos/hole.
import React from "react";
import { Composition, registerRoot } from "remotion";
import { HoleShort, HOLE_FRAMES } from "../videos/hole/Hole";

const Root: React.FC = () => <Composition id="HoleShort" component={HoleShort} durationInFrames={HOLE_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
