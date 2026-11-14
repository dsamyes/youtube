// Entry: registers ONE composition, "Short" (1080x1920, 30 fps, length from shots.json). As the kit's template,
// plus `dress`: this video adds a garden table to the town place.
import { Composition, registerRoot } from "remotion";
import { makeShort } from "../../toon/kit";
import { T, camAt, dofAt, placeAt, tableOn } from "./story";
import { stage } from "./staging";
import { makeTable } from "./props";

const dress = (place: string, group: import("three").Group) => {
  if (place !== "town") return;
  const table = makeTable();
  group.add(table);
  return (c: { id: number }) => { table.visible = tableOn(c.id); };
};
const Short = makeShort({ total: T.total, shots: T.shots, xfade: T.xfade, flash: T.flash, cam: camAt, dof: dofAt, place: placeAt, stage, dress });
registerRoot(() => <Composition id="Short" component={Short} durationInFrames={T.total} fps={30} width={1080} height={1920} />);
