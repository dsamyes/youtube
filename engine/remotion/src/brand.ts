import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const C = {
  navy: "#11153A",
  deep: "#070920",
  navy2: "#1B2157",
  cyan: "#3DE0FF",
  purple: "#B66BFF",
  amber: "#FFB547",
  white: "#F4F6FF",
  red: "#FF5E5E",
  ocean: "#1E6FD9",
  oceanDeep: "#0B2E6B",
  land: "#3FAF8A",
  rock: "#5A4A6E",
  dim: "rgba(244,246,255,0.55)",
  faint: "rgba(244,246,255,0.14)",
};

export const FONT = "Inter, sans-serif";
export const DISPLAY = "'Inter Display', Inter, sans-serif";

const faces: [string, string, string][] = [
  ["Inter", "Inter-Medium.otf", "500"],
  ["Inter", "Inter-SemiBold.otf", "600"],
  ["Inter", "Inter-Bold.otf", "700"],
  ["Inter", "Inter-Black.otf", "900"],
  ["Inter Display", "InterDisplay-Bold.otf", "700"],
  ["Inter Display", "InterDisplay-ExtraBold.otf", "800"],
  ["Inter Display", "InterDisplay-Black.otf", "900"],
];

export const fontsReady = Promise.all(
  faces.map(([family, file, weight]) =>
    loadFont({ family, url: staticFile(`fonts/${file}`), weight, display: "block" }),
  ),
);
