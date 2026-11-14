// Stills of a cartoon short (src/toon/kit).
// usage: node scripts/toon-stills.mjs <id> <frame,frame,...> [scale=0.5]
//   <id>   the video: src/videos/<id>/entry.tsx (composition "Short"), engine/videos/<id>/shots.json
//   output out/<id>/stills/f<frame>.jpg  (1080x1920 x scale)
// Bundles once, then renders each frame with software WebGL, like the GitHub runner. The picture is always rendered
// at 1080x1920 and scaled down for the file, so a still shows exactly what the final will show.
// env: REMOTION_CHROME (browser binary; "bundled" or unset = see below), REMOTION_GL (default swangle),
//      TOON_PROPS (JSON input props, e.g. '{"post":{"lens":false}}'), TOON_LOG_ALL=1 (browser console),
//      TOON_ENTRY / TOON_COMP (another entry file / composition id, e.g. the bridge template).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [id, frames, scale = "0.5"] = process.argv.slice(2);
if (!id || !frames) { console.error("usage: node scripts/toon-stills.mjs <id> <frame,frame,...> [scale]"); process.exit(2); }
const entry = path.resolve(ROOT, process.env.TOON_ENTRY || `src/videos/${id}/entry.tsx`);
if (!fs.existsSync(entry)) { console.error(`no entry file ${entry}`); process.exit(2); }
/** $REMOTION_CHROME when it is an existing file, else the Playwright headless shell under /opt/pw-browsers when
 *  there is one, else undefined = Remotion's own bundled shell (CI sets REMOTION_CHROME=bundled) */
const chrome = () => {
  const e = process.env.REMOTION_CHROME;
  if (e && fs.existsSync(e) && fs.statSync(e).isFile()) return e;
  const base = "/opt/pw-browsers";
  if (fs.existsSync(base)) for (const d of fs.readdirSync(base).filter((n) => n.startsWith("chromium_headless_shell-")).sort().reverse()) {
    const p = path.join(base, d, "chrome-headless-shell-linux64", "chrome-headless-shell");
    if (fs.existsSync(p)) return p;
  }
  return undefined;
};
const browserExecutable = chrome();
const chromiumOptions = { gl: process.env.REMOTION_GL || "swangle" };
const s = Number(scale);
const inputProps = process.env.TOON_PROPS ? JSON.parse(process.env.TOON_PROPS) : {};
const pub = path.resolve(ROOT, process.env.TOON_PUBLIC || "public-toon");
const outDir = path.resolve(ROOT, "out", id, "stills");
fs.mkdirSync(pub, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });
const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: entry, publicDir: pub, rootDir: ROOT });
const composition = await selectComposition({ serveUrl, id: process.env.TOON_COMP || "Short", browserExecutable, chromiumOptions, inputProps });
console.log("bundle", ((Date.now() - t0) / 1000).toFixed(1) + "s", composition.width + "x" + composition.height, composition.durationInFrames + "f");
const onBrowserLog = (l) => { if (process.env.TOON_LOG_ALL || l.type === "error" || l.type === "warning") console.log(`[${l.type}]`, l.text.slice(0, 300)); };
for (const f of frames.split(",").map(Number)) {
  const t = Date.now();
  const output = path.join(outDir, `f${f}.jpg`);
  await renderStill({ composition, serveUrl, frame: f, output, imageFormat: "jpeg", jpegQuality: 90, scale: s, inputProps,
    browserExecutable, chromiumOptions, timeoutInMilliseconds: 300000, onBrowserLog });
  console.log("still", f, ((Date.now() - t) / 1000).toFixed(1) + "s", path.relative(ROOT, output));
}
