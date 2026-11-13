// usage: node scripts/toon-frames.mjs <entry> <compId> <outDir> <from> <to> [every=1] [scale=0.25]
// Renders a frame range as a continuous sequence (one page per tab, far cheaper per frame than stills) for motion checks.
import { bundle } from "@remotion/bundler";
import { renderFrames, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [entry, comp, outDir, from, to, every = "1", scale = "0.25"] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_CHROME && process.env.REMOTION_CHROME !== "bundled" ? process.env.REMOTION_CHROME : undefined;
const chromiumOptions = { gl: process.env.REMOTION_GL || "swangle" };
const inputProps = process.env.TOON_PROPS ? JSON.parse(process.env.TOON_PROPS) : {};
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: path.resolve(process.env.TOON_PUBLIC || "public-toon") });
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable, chromiumOptions, inputProps });
const t0 = Date.now();
let n = 0;
await renderFrames({ composition, serveUrl, inputProps, outputDir: path.resolve(outDir), imageFormat: "jpeg", jpegQuality: 85, frameRange: [Number(from), Number(to)], everyNthFrame: Number(every),
  scale: Number(scale), concurrency: Number(process.env.TOON_CONC || 4), browserExecutable, chromiumOptions, timeoutInMilliseconds: 300000, onStart: () => {}, onFrameUpdate: () => { n++; } });
console.log("frames", n, "in", ((Date.now() - t0) / 1000).toFixed(0) + "s");
