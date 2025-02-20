import type { RsbuildConfig } from "@rsbuild/core";
import { pluginLess } from "@rsbuild/plugin-less";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";

import { pluginElectronBuild } from "./plugins/build";
import { pluginElectronDev } from "./plugins/dev";

const config: RsbuildConfig = {
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
  dev: {
    lazyCompilation: true,
  },
};

export default config;
