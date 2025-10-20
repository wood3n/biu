import { nodeResolve } from "@rollup/plugin-node-resolve";
import { rm, mkdir } from "node:fs/promises";
import path from "node:path";
import { rollup, watch, type RollupOptions, type OutputOptions, type RollupWatcher } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import tsconfigPaths from "rollup-plugin-tsconfig-paths";

const ELECTRON_OUT_DIR = path.resolve(".electron");
const MAIN_ENTRY = path.resolve("electron/main.ts");
const PRELOAD_ENTRY = path.resolve("electron/preload.ts");

function createRollupOptions(inputs: Record<string, string>): RollupOptions {
  return {
    input: inputs,
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

function createOutput(): OutputOptions {
  return {
    dir: ELECTRON_OUT_DIR,
    format: "es",
    sourcemap: false,
    entryFileNames: "[name].js",
    chunkFileNames: "shared-[hash].js",
  };
}

async function waitForFirstBuild(watcher: RollupWatcher) {
  return new Promise<void>((resolve, reject) => {
    watcher.on("event", event => {
      if (event.code === "ERROR") {
        console.error("[electron] build error:", event.error);
        reject(event.error);
      } else if (event.code === "END") {
        console.log("[electron] initial build finished");
        resolve();
      }
    });
  });
}

export async function compileElectronTypescript(mode: "development" | "production" = "production") {
  await rm(ELECTRON_OUT_DIR, { recursive: true, force: true });
  await mkdir(ELECTRON_OUT_DIR, { recursive: true });

  const inputs = { main: MAIN_ENTRY, preload: PRELOAD_ENTRY };
  const options = createRollupOptions(inputs);
  const output = createOutput();

  if (mode === "development") {
    const watcher = watch({ ...options, output });
    await waitForFirstBuild(watcher);
    return watcher;
  }

  const bundle = await rollup(options);
  await bundle.write(output);
  await bundle.close();
  console.log("[electron] bundles written to", ELECTRON_OUT_DIR);
}
