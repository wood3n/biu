import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { RsdoctorRspackPlugin } from "@rsdoctor/rspack-plugin";

import { pluginElectron } from "./plugins/rsbuild-plugin-electron";

export default defineConfig({
  output: {
    distPath: {
      root: "./dist/web",
    },
    // 生产环境相对路径，保证通过 file:// 加载时静态资源能正确引用
    assetPrefix: "./",
    cleanDistPath: true,
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
  tools: {
    rspack: {
      plugins: [
        process.env.RSDOCTOR === "true" &&
          new RsdoctorRspackPlugin({
            disableClientServer: true,
            output: {
              mode: "brief",
              options: {
                type: ["json"],
              },
            },
          }),
      ],
    },
  },
  dev: {
    writeToDisk: true,
    lazyCompilation: false,
    cliShortcuts: false,
    // 开发环境相对路径，保证通过 file:// 加载时静态资源能正确引用
    assetPrefix: "./",
  },
  server: {
    printUrls: false,
    open: false,
    compress: false,
  },
});
