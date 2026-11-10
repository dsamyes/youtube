// Scenes for "What If You Traveled at 99.9999% the Speed of Light?" (merged over SHARED_SCENES).
// The differentiator: `sky` renders a real star catalogue through relativistic aberration,
// Doppler colour and beaming every frame (Starfield.tsx, physics.ts).
import { SceneEntry } from "../../types";
import { Beam } from "./Beam";
import { Clocks } from "./Clocks";
import { ShipHud } from "./Hud";
import { Sky } from "./Sky";
import { Bill, DeepTime, EndCard, Galaxy, Home } from "./Story";

export const SCENES: Record<string, SceneEntry> = {
  sky: { C: Sky, shift: false },
  clocks: { C: Clocks, shift: false },
  beam: { C: Beam, shift: false },
  bill: { C: Bill, shift: true },
  galaxy: { C: Galaxy, shift: false },
  home: { C: Home, shift: false },
  deeptime: { C: DeepTime, shift: false },
  endcard: { C: EndCard, shift: false },
};

/** persistent ship HUD drawn above every scene (see Hud.tsx) */
export const OVERLAY = ShipHud;
