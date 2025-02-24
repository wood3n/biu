import type { RsbuildConfig } from "@rsbuild/core";
import { pluginLess } from "@rsbuild/plugin-less";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";

import { pluginElectronBuild } from "./plugins/build";
import { pluginElectronDev } from "./plugins/dev";

const config: RsbuildConfig = {
  output: {
    distPath: {
      root: "./dist/web",
    },
  },
  plugins: [
    pluginReact(),
    pluginLess({
      lessLoaderOptions: {
        lessOptions: {
          javascriptEnabled: false,
        },
      },
    }),
    pluginSvgr({
      svgrOptions: {
        exportType: "named",
      },
    }),
    pluginElectronDev(),
    pluginElectronBuild(),
  ],
  server: {
    port: 3456,
  },
};

export default config;
