import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";

import { pluginElectron } from "./plugins/rsbuild-plugin-electron";

const isDev = process.env.NODE_ENV === "development";

export default defineConfig({
  output: {
    distPath: {
      root: "./dist/web",
    },
    // 生产环境相对路径，保证通过 file:// 加载时静态资源能正确引用
    assetPrefix: "./",
    cleanDistPath: true,
    sourceMap: isDev,
  },
  performance: {
    removeMomentLocale: true,
  },
  html: {
    template: "./src/index.html",
  },
  plugins: [
    pluginReact(),
    pluginSvgr({
      svgrOptions: {
        exportType: "named",
        // Enable SVGO to optimize inline SVGs
        svgo: true,
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: { overrides: { removeViewBox: false } },
            },
          ],
        },
      },
    }),
    pluginElectron(),
  ],
  dev: {
    writeToDisk: true,
    lazyCompilation: false,
    cliShortcuts: false,
    // 开发环境相对路径，保证通过 file:// 加载时静态资源能正确引用
    assetPrefix: "./",
    watchFiles: {
      paths: [".electron"],
    },
  },
  server: {
    printUrls: false,
    open: false,
    compress: false,
  },
});
