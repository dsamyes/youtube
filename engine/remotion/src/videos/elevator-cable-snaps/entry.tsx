// Entry: registers ONE composition, "Short" (1080x1920, 30 fps, length from shots.json). As the kit's template,
// plus `places`: this video brings its own lift car and shaft (one build, two names) and borrows the open sky of
// plane-door-midflight as the board for its diagrams.
import { Composition, registerRoot } from "remotion";
import { makeShort } from "../../toon/kit";
import { T, camAt, dofAt, placeAt } from "./story";
import { stage } from "./staging";
import { lift } from "./places";
import { sky } from "../plane-door-midflight/places";

const Short = makeShort({ total: T.total, shots: T.shots, xfade: T.xfade, flash: T.flash, cam: camAt, dof: dofAt, place: placeAt, stage, places: { lift, hoistway: lift, sky } });
registerRoot(() => <Composition id="Short" component={Short} durationInFrames={T.total} fps={30} width={1080} height={1920} />);
