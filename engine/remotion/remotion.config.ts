/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// WebGL for the 3D scene library. CI runners have no GPU: "swangle" = SwiftShader through ANGLE
// (software, multi-threaded). On a machine with a GPU, REMOTION_GL=angle is much faster.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL || "swangle") as any);
// Browser: by default Remotion downloads its own headless shell (CI). Where that download is
// blocked, set REMOTION_CHROME=/path/to/chrome (a chrome-headless-shell binary, or e.g.
// /usr/bin/google-chrome) to use a local browser.
if (process.env.REMOTION_CHROME && process.env.REMOTION_CHROME !== "bundled") {
  Config.setBrowserExecutable(process.env.REMOTION_CHROME);
  Config.setChromeMode(/headless-shell/.test(process.env.REMOTION_CHROME) ? "headless-shell" : "chrome-for-testing");
}
