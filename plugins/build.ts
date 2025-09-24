import { logger, RsbuildPlugin } from "@rsbuild/core";
import { build as electronBuild } from "electron-builder";

import pkg from "../package.json";

export const pluginElectronBuild = (): RsbuildPlugin => ({
  name: "plugin-electron-build",
  setup(api) {
    api.onAfterBuild(async () => {
      await electronBuild({
        config: {
          appId: "com.biu.wood3n",
          productName: "Biu",
          artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
          copyright: `Copyright © ${new Date().getFullYear()}`,
          nodeVersion: "current",
          buildVersion: pkg.version,
          asar: true,
          // 运行时需要直接读取的资源解压到 asar 之外
          asarUnpack: ["**/electron/icons/**"],
          electronCompile: false,
          // "store” | “normal” | "maximum". - 测试环境用 store 提升构建速度
          compression: "store",
          // 是否移除 package.json 的 scripts/keywords 定义
          removePackageScripts: true,
          removePackageKeywords: false,
          nodeGypRebuild: false,
          buildDependenciesFromSource: false,
          directories: {
            output: "dist/artifacts",
            // 构建资源目录（图标等）
            buildResources: "electron/icons",
          },
          // 应用文件打包规则
          files: ["electron/**", "dist/web/**"],
          // 运行时附加资源（保持相对路径 electron/icons 可用）
          extraResources: [{ from: "electron/icons", to: "electron/icons" }],
          win: {
            target: [
              { target: "nsis", arch: ["x64"] },
              { target: "portable", arch: ["x64"] },
            ],
            // 用 png 即可，electron-builder 会生成 ico
            icon: "electron/icons/win/logo.ico",
          },
          nsis: {
            deleteAppDataOnUninstall: true,
            oneClick: false,
            perMachine: false,
            allowElevation: true,
            allowToChangeInstallationDirectory: true,
            artifactName: "${productName}-Setup-${version}.exe",
          },
          mac: {
            target: ["dmg"],
            category: "public.app-category.music",
            icon: "electron/icons/mac/logo.icns",
          },
          linux: {
            target: ["AppImage"],
            icon: "electron/icons/linux/logo.png",
            category: "AudioVideo",
          },
          // 不发布
          publish: null,
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
