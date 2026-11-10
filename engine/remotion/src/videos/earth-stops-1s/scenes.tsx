// Scene registry for "What If Earth Stopped Spinning for 1 Second?".
// Merged over SHARED_SCENES (src/scenes/shared.tsx); keys here win.
import { SceneEntry } from "../../types";
import { EarthSpin, Latitude, Safe } from "./Earth";
import { Fall, PersonScene, Restart } from "./Human";
import { Leap } from "./Leap";
import { Ocean, Tsunami } from "./Ocean";
import { Air, AtmEnergy, Building } from "./Physics";

export const SCENES: Record<string, SceneEntry> = {
  earth_spin: { C: EarthSpin, shift: true },
  latitude: { C: Latitude, shift: false },
  safe: { C: Safe, shift: true },
  person: { C: PersonScene, shift: true },
  fall: { C: Fall, shift: true },
  restart: { C: Restart, shift: true },
  building: { C: Building, shift: false },
  air: { C: Air, shift: true },
  atm_energy: { C: AtmEnergy, shift: true },
  ocean: { C: Ocean, shift: true },
  tsunami: { C: Tsunami, shift: true },
  leap: { C: Leap, shift: true },
};
