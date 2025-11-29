import { logger } from "@rsbuild/core";
import { build as electronBuild } from "electron-builder";

import pkg from "../package.json";
import { ELECTRON_OUT_DIRNAME, ELECTRON_ICON_BASE_PATH } from "../shared/path";

export async function buildElectron() {
  await electronBuild({
    publish: process.env.GH_TOKEN && process.env.TEST_BUILD !== "true" ? "always" : "never",
    config: {
      appId: "com.biu.wood3n",
      productName: "Biu",
      artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
      copyright: `Copyright © ${new Date().getFullYear()}`,
      nodeVersion: "current",
      buildVersion: pkg.version,
      asar: true,
      electronCompile: false,
      compression: "maximum",
      removePackageScripts: true,
      removePackageKeywords: true,
      npmRebuild: false,
      nodeGypRebuild: false,
      buildDependenciesFromSource: false,
      electronLanguages: ["zh-CN"],
      directories: {
        output: "dist/artifacts",
      },
      extraResources: [{ from: ELECTRON_ICON_BASE_PATH, to: ELECTRON_ICON_BASE_PATH }],
      files: [
        `${ELECTRON_OUT_DIRNAME}/**`,
        "dist/web/**",
        // Exclude sourcemaps and logs
        "!**/*.map",
        "!**/*.log",
        // Exclude common dev-only folders inside node_modules to shrink size
        "!**/node_modules/**/{test,tests,__tests__,example,examples,demo,docs}/**",
        // Exclude changelogs (keep README for license transparency)
        "!**/{CHANGELOG*,changelog*}.md",
      ],
      win: {
        target: [
          { target: "nsis", arch: ["x64"] },
          { target: "portable", arch: ["x64"] },
        ],
        icon: `${ELECTRON_ICON_BASE_PATH}/logo.ico`,
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
        icon: `${ELECTRON_ICON_BASE_PATH}/logo.icns`,
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
        icon: `${ELECTRON_ICON_BASE_PATH}/logo.png`,
        category: "AudioVideo",
        synopsis: "Biu - bilibili music desktop application",
        maintainer: "wood3n",
        vendor: "wood3n",
        executableName: "Biu",
      },
      publish: {
        provider: "github",
        owner: "wood3n",
        repo: "biu",
        releaseType: "release",
      },
    },
  })
    .then(result => {
      logger.success(result);
    })
    .catch(error => {
      logger.error(error);
    });
}
