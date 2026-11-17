// Entry: registers ONE composition, "Short" (1080x1920, 30 fps, length from shots.json). As the kit's template,
// plus `places`: the open sky of plane-door-midflight (the stage for the diagrams and the airliner) and this
// video's own beach.
import { Composition, registerRoot } from "remotion";
import { makeShort } from "../../toon/kit";
import { T, camAt, dofAt, placeAt } from "./story";
import { stage } from "./staging";
import { sky } from "../plane-door-midflight/places";
import { beach } from "./places";

const Short = makeShort({ total: T.total, shots: T.shots, xfade: T.xfade, flash: T.flash, cam: camAt, dof: dofAt, place: placeAt, stage, places: { sky, beach } });
registerRoot(() => <Composition id="Short" component={Short} durationInFrames={T.total} fps={30} width={1080} height={1920} />);
