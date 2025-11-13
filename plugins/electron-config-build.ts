import { nodeResolve } from "@rollup/plugin-node-resolve";
import { logger } from "@rsbuild/core";
import path from "node:path";
import { rollup, watch, type RollupOptions, type OutputOptions, type RollupWatcher } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import tsconfigPaths from "rollup-plugin-tsconfig-paths";

const ELECTRON_OUT_DIR = path.resolve(".electron");
const MAIN_ENTRY = path.resolve("electron/main.ts");
const PRELOAD_ENTRY = path.resolve("electron/preload.ts");

function createRollupOptions(input: string): RollupOptions {
  return {
    input,
    treeshake: true,
    external: [/node_modules/],
    plugins: [
      tsconfigPaths(),
      nodeResolve({
        extensions: [".mjs", ".js", ".ts", ".tsx", ".json"],
        exportConditions: ["node"],
        preferBuiltins: true,
      }),
      esbuild({
        platform: "node",
        target: "node18",
        tsconfig: "tsconfig.json",
        sourceMap: false,
      }),
    ],
    onwarn(warning, warn) {
      if (warning.code === "THIS_IS_UNDEFINED") return;
      warn(warning);
    },
  };
}

function createOutput(format: "es" | "cjs", entryName: "main" | "preload"): OutputOptions {
  return {
    dir: ELECTRON_OUT_DIR,
    format,
    sourcemap: false,
    // 保持独立产物：主进程输出 main.js，预加载输出 preload.cjs
    entryFileNames: entryName === "main" ? "main.mjs" : "preload.cjs",
  };
}

async function waitForFirstBuild(watcher: RollupWatcher, entryName: "main" | "preload") {
  return new Promise<void>((resolve, reject) => {
    watcher.on("event", event => {
      if (event.code === "START") {
        logger.info(`[electron] ${entryName} config build started`);
      } else if (event.code === "ERROR") {
        logger.error(`[electron] ${entryName} config build error:`, event.error);
        reject(event.error);
      } else if (event.code === "END") {
        logger.info(`[electron] ${entryName} config build finished`);
        resolve();
      }
    });
  });
}

/**
 * electron preload无法使用esm，如果使用esm，在网页环境无法正常访问 window.electron
 * https://github.com/electron/electron/issues/40777
 */
export async function buildElectronConfig(mode: "development" | "production" = "production") {
  // 独立构建 main (ESM) 与 preload (CJS)
  const mainOptions = createRollupOptions(MAIN_ENTRY);
  const mainOutput = createOutput("es", "main");
  const preloadOptions = createRollupOptions(PRELOAD_ENTRY);
  const preloadOutput = createOutput("cjs", "preload");

  if (mode === "development") {
    const mainWatcher = watch({ ...mainOptions, output: mainOutput });
    const preloadWatcher = watch({ ...preloadOptions, output: preloadOutput });
    await Promise.all([waitForFirstBuild(mainWatcher, "main"), waitForFirstBuild(preloadWatcher, "preload")]);
    return { mainWatcher, preloadWatcher } as unknown as RollupWatcher;
  }

  const mainBundle = await rollup(mainOptions);
  const mainWrite = await mainBundle.write(mainOutput);
  await mainBundle.close();

  const preloadBundle = await rollup(preloadOptions);
  const preloadWrite = await preloadBundle.write(preloadOutput);
  await preloadBundle.close();

  // 产物存在性与简单格式验证日志
  const mainFiles = mainWrite.output.map(o => o.fileName).join(", ");
  const preloadFiles = preloadWrite.output.map(o => o.fileName).join(", ");
  logger.info(`[electron] main (esm) files: ${mainFiles}`);
  logger.info(`[electron] preload (cjs) files: ${preloadFiles}`);
  if (!mainFiles.includes("main.mjs")) {
    logger.warn("[electron] expected main.mjs not found in ESM build");
  }
  if (!preloadFiles.includes("preload.cjs")) {
    logger.warn("[electron] expected preload.cjs not found in CJS build");
  }
  logger.info(`[electron] bundles written to ${ELECTRON_OUT_DIR}`);
}
