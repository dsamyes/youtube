// usage: node scripts/toon-stills.mjs <entry> <compId> <outPrefix> <frame,frame,...> [scale]
// Bundles once, renders stills with software WebGL (swangle) so it behaves like the GitHub runner.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [entry, comp, prefix, frames, scale = "0.5"] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_CHROME && process.env.REMOTION_CHROME !== "bundled" ? process.env.REMOTION_CHROME : undefined;
const chromiumOptions = { gl: process.env.REMOTION_GL || "swangle" };
const inputProps = process.env.TOON_PROPS ? JSON.parse(process.env.TOON_PROPS) : {};
const pub = path.resolve(process.env.TOON_PUBLIC || "public-toon");
fs.mkdirSync(pub, { recursive: true });
fs.mkdirSync(path.dirname(path.resolve(prefix + "x")), { recursive: true });
const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: pub });
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable, chromiumOptions, inputProps });
console.log("bundle", ((Date.now() - t0) / 1000).toFixed(1) + "s", composition.width + "x" + composition.height, composition.durationInFrames + "f");
const onBrowserLog = (l) => { if (process.env.TOON_LOG_ALL || l.type === "error" || l.type === "warning") console.log(`[${l.type}]`, l.text.slice(0, 300)); };
for (const f of frames.split(",").map(Number)) {
  const t = Date.now();
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 88, scale: Number(scale), inputProps,
    browserExecutable, chromiumOptions, timeoutInMilliseconds: 300000, onBrowserLog });
  console.log("still", f, ((Date.now() - t) / 1000).toFixed(1) + "s");
}
