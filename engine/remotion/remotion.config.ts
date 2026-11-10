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
// Browser: by default Remotion downloads its own headless shell (CI). Where that download is
// blocked, set REMOTION_CHROME=/path/to/chrome (e.g. /usr/bin/google-chrome) to use a local Chrome.
if (process.env.REMOTION_CHROME && process.env.REMOTION_CHROME !== "bundled") {
  Config.setBrowserExecutable(process.env.REMOTION_CHROME);
  Config.setChromeMode("chrome-for-testing");
}
