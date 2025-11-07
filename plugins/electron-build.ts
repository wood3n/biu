import { logger } from "@rsbuild/core";
import { build as electronBuild } from "electron-builder";

import pkg from "../package.json";

export async function buildElectron() {
  await electronBuild({
    // 不在构建阶段直接发布，统一由 changelogen 上传产物
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
      // 动态压缩：CI 使用 maximum，本地使用 store 以提升速度
      compression: process.env.NODE_ENV === "production" ? "maximum" : "store",
      // 是否移除 package.json 的 scripts/keywords 定义
      removePackageScripts: true,
      removePackageKeywords: true,
      // 无原生模块时关闭重建以提速
      npmRebuild: false,
      nodeGypRebuild: false,
      buildDependenciesFromSource: false,
      // Only include necessary Electron locales to reduce runtime size
      electronLanguages: ["zh-CN"],
      directories: {
        output: "dist/artifacts",
        // 构建资源目录（图标等）
        buildResources: "electron/icons",
      },
      // 应用文件打包规则：包含 Rspack 产物
      files: [
        ".electron/**",
        "electron/**",
        "dist/web/**",
        // Exclude sourcemaps and logs
        "!**/*.map",
        "!**/*.log",
        // Exclude common dev-only folders inside node_modules to shrink size
        "!**/node_modules/**/{test,tests,__tests__,example,examples,demo,docs}/**",
        // Exclude changelogs (keep README for license transparency)
        "!**/{CHANGELOG*,changelog*}.md",
      ],
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
        // 同时构建 x64 与 arm64 的 dmg/zip 产物
        target: [
          { target: "dmg", arch: ["x64", "arm64"] },
          { target: "zip", arch: ["x64", "arm64"] },
        ],
        category: "public.app-category.music",
        icon: "electron/icons/macos/logo.icns",
        hardenedRuntime: true,
        gatekeeperAssess: false,
        entitlements: "plugins/mac/entitlements.mac.plist",
        entitlementsInherit: "plugins/mac/entitlements.mac.plist",
        // 使用环境变量进行公证配置；未设置时跳过
        notarize: Boolean(process.env.APPLE_ID && process.env.APPLE_TEAM_ID),
      },
      linux: {
        // 生成多种包格式，覆盖主流发行版
        target: [
          { target: "AppImage", arch: ["x64", "arm64"] },
          { target: "deb", arch: ["x64", "arm64"] },
          { target: "rpm", arch: ["x64", "arm64"] },
        ],
        icon: "electron/icons/logo.png",
        category: "AudioVideo",
        synopsis: "Biu - bilibili music desktop application",
        maintainer: "wood3n",
        vendor: "wood3n",
        executableName: "Biu",
      },
      publish: null,
    },
  })
    .then(result => {
      logger.success(result);
    })
    .catch(error => {
      logger.error(error);
    });
}
