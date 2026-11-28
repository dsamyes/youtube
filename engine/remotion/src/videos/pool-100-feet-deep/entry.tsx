// Entry: registers ONE composition, "Short" (1080x1920, 30 fps, length from shots.json). As the kit's template, plus
// `dress` (the pool is added to the town place) and `places`: "deep" (this video's under-water place) and the open
// sky of plane-door-midflight, used twice ("street" with its ground for the dump trucks, "board" for the scale).
import { Composition, registerRoot } from "remotion";
import { makeShort } from "../../toon/kit";
import { T, camAt, dofAt, placeAt } from "./story";
import { stage } from "./staging";
import { makePool } from "./props";
import { deep } from "./places";
import { sky } from "../plane-door-midflight/places";

const dress = (place: string, group: import("three").Group) => { if (place === "town") group.add(makePool()); };
const Short = makeShort({ total: T.total, shots: T.shots, xfade: T.xfade, flash: T.flash, cam: camAt, dof: dofAt, place: placeAt, stage, dress, places: { deep, street: sky, board: sky } });
registerRoot(() => <Composition id="Short" component={Short} durationInFrames={T.total} fps={30} width={1080} height={1920} />);
