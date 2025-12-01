import { logger, type RsbuildPlugin } from "@rsbuild/core";
import { rimrafSync } from "rimraf";

import { buildElectron } from "./electron-build";
import { buildElectronConfig } from "./electron-config-build";
import { startElectronDev } from "./electron-dev";

export const pluginElectron = (): RsbuildPlugin => ({
  name: "plugin-electron",
  setup(api) {
    api.onAfterDevCompile(async ({ isFirstCompile }) => {
      if (isFirstCompile) {
        logger.info("[electron] Bundle the typescript configuration for electron...");
        await buildElectronConfig("development");

        startElectronDev();
      }
    });

    if (process.env.BUILD_WEB !== "true") {
      api.onBeforeBuild(async () => {
        logger.info("Cleaning dist directory...");
        try {
          rimrafSync("dist");
        } catch (err) {
          logger.error(`Clean dist failed: ${String((err && (err as any).message) || err)}`);
        }

        logger.info("[electron] Bundling Electron TypeScript...");
        await buildElectronConfig();
      });

      api.onAfterBuild(async () => {
        await buildElectron();
      });
    }
  },
});
