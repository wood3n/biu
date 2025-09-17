import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";

import { pluginElectronBuild } from "./plugins/build";
import { pluginElectronDev } from "./plugins/dev";

export default defineConfig({
  output: {
    distPath: {
      root: "./dist/web",
    },
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
      },
    }),
    pluginElectronDev(),
    pluginElectronBuild(),
  ],
  server: {
    open: false,
    proxy: {
      "/api": {
        target: "https://api.bilibili.com",
        changeOrigin: true,
        pathRewrite: { "^/api": "" },
      },
      "/auth": {
        target: "https://passport.bilibili.com",
        changeOrigin: true,
        pathRewrite: { "^/auth": "" },
      },
    },
  },
});
