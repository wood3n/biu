import { build as electronBuild } from "electron-builder";
import { logger, RsbuildPlugin } from "@rsbuild/core";

import pkg from "../package.json";

export const pluginElectronBuild = (): RsbuildPlugin => ({
  name: "plugin-electron-build",
  setup(api) {
    api.onAfterBuild(async () => {
      await electronBuild({
        config: {
          appId: "com.tune.wood3n",
          productName: "Tune",
          copyright: `Copyright © ${new Date().getFullYear()}`,
          nodeVersion: "current",
          buildVersion: pkg.version,
          asar: true,
          // electronLanguages: ['zh-CN'],
          electronCompile: false,
          // "store” | “normal” | "maximum". - For testing builds, use 'store' to reduce build time significantly.
          compression: "store",
          // 是否移除 package.json 的 scripts 定义
          removePackageScripts: true,
          // 是否移除 package.json 的 keywords 定义
          removePackageKeywords: false,
          nodeGypRebuild: false,
          buildDependenciesFromSource: false,
          // directories: {
          //   output: 'dist/artifacts/local',
          //   buildResources: 'installer/resources',
          // },
          files: ["./dist/web", "electron"],
          win: {
            // windows 直接打包成便携程序
            target: "nsis",
            // 用 png 就行，builder 会自动生成 ico 文件
            icon: "./public/electron/music.png",
          },
          nsis: {
            deleteAppDataOnUninstall: true,
            include: "installer/win/nsis-installer.nsh",
          },
        },
      })
        .then((result: unknown) => {
          logger.success(JSON.stringify(result));
        })
        .catch((error: unknown) => {
          console.error(error);
        });
    });
  },
});
