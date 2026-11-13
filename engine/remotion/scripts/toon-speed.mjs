// usage: node scripts/toon-speed.mjs <entry> <compId> <from> <to> '<json props>' ['<json props>' ...]
// Renders the frame range once per props set (concurrency 1) and prints the steady per-frame time (first frame excluded).
import { bundle } from "@remotion/bundler";
import { renderFrames, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [entry, comp, from, to, ...sets] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_CHROME && process.env.REMOTION_CHROME !== "bundled" ? process.env.REMOTION_CHROME : undefined;
const chromiumOptions = { gl: process.env.REMOTION_GL || "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve(entry), publicDir: path.resolve(process.env.TOON_PUBLIC || "public-toon") });
for (const set of sets.length ? sets : ["{}"]) {
  const inputProps = JSON.parse(set);
  const composition = await selectComposition({ serveUrl, id: comp, browserExecutable, chromiumOptions, inputProps });
  const outputDir = fs.mkdtempSync("/tmp/toon-speed-");
  const times = [];
  await renderFrames({ composition, serveUrl, inputProps, outputDir, imageFormat: "jpeg", frameRange: [Number(from), Number(to)], concurrency: Number(process.env.TOON_CONC || 1),
    browserExecutable, chromiumOptions, timeoutInMilliseconds: 300000, onStart: () => {}, onFrameUpdate: () => times.push(Date.now()) });
  fs.rmSync(outputDir, { recursive: true, force: true });
  const n = times.length - 1;
  console.log(set, "frames", times.length, "steady ms/frame", n > 0 ? ((times[n] - times[0]) / n).toFixed(0) : "-");
}
