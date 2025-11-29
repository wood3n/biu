import { nodeResolve } from "@rollup/plugin-node-resolve";
import { logger } from "@rsbuild/core";
import fs from "node:fs/promises";
import path from "node:path";
import { rollup, watch, type RollupOptions, type OutputOptions, type RollupWatcher } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import tsconfigPaths from "rollup-plugin-tsconfig-paths";

import { ELECTRON_OUT_DIR, ICONS_DST_DIR } from "../shared/path";

const MAIN_ENTRY = path.resolve(process.cwd(), "electron/main.ts");
const PRELOAD_ENTRY = path.resolve(process.cwd(), "electron/preload.ts");
const ICONS_SRC_DIR = path.resolve(process.cwd(), "electron/icons");

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

  async function ensureDir(dir: string) {
    await fs.mkdir(dir, { recursive: true }).catch(() => void 0);
  }

  async function pathExists(p: string) {
    try {
      await fs.access(p);
      return true;
    } catch {
      return false;
    }
  }

  async function copyIconsForPlatform() {
    const srcExists = await pathExists(ICONS_SRC_DIR);
    if (!srcExists) {
      logger.warn(`[electron] icons source not found: ${ICONS_SRC_DIR}`);
      return;
    }
    await ensureDir(ICONS_DST_DIR);

    const platform = process.platform;
    const rootLogo = path.join(ICONS_SRC_DIR, "logo.png");
    if (await pathExists(rootLogo)) {
      try {
        await fs.copyFile(rootLogo, path.join(ICONS_DST_DIR, "logo.png"));
      } catch (err) {
        logger.warn(`[electron] failed to copy root logo.png: ${String((err && (err as any).message) || err)}`);
      }
    }

    const platformDir = platform === "win32" ? "win" : platform === "darwin" ? "macos" : null;
    if (platformDir) {
      const srcDir = path.join(ICONS_SRC_DIR, platformDir);
      const hasPlatformDir = await pathExists(srcDir);
      if (!hasPlatformDir) {
        logger.warn(`[electron] icons platform dir not found: ${srcDir}`);
        return;
      }
      try {
        await ensureDir(ICONS_DST_DIR);
        await fs.cp(srcDir, ICONS_DST_DIR, { recursive: true });
        logger.info(`[electron] copied icons dir '${platformDir}' → ${ICONS_DST_DIR}`);
      } catch (err) {
        logger.warn(
          `[electron] failed to copy icons dir '${platformDir}': ${String((err && (err as any).message) || err)}`,
        );
      }
    }
  }

  if (mode === "development") {
    const mainWatcher = watch({ ...mainOptions, output: mainOutput });
    const preloadWatcher = watch({ ...preloadOptions, output: preloadOutput });
    await Promise.all([waitForFirstBuild(mainWatcher, "main"), waitForFirstBuild(preloadWatcher, "preload")]);
    await copyIconsForPlatform();
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

  // Copy platform-specific icons into .electron/icons for runtime/dev convenience
  await copyIconsForPlatform();
}
