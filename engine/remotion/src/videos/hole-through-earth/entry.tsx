// Entry of the hole-through-earth short: registers ONE composition, "Short" (the kit's shell around this story).
import { Composition, registerRoot } from "remotion";
import { makeShort } from "../../toon/kit";
import { T, camAt, dofAt, placeAt } from "./story";
import { stage } from "./staging";

const Short = makeShort({ total: T.total, shots: T.shots, xfade: T.xfade, flash: T.flash, cam: camAt, dof: dofAt, place: placeAt, stage });
registerRoot(() => <Composition id="Short" component={Short} durationInFrames={T.total} fps={30} width={1080} height={1920} />);
