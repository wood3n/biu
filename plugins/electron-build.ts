import { logger } from "@rsbuild/core";
import { build as electronBuild } from "electron-builder";

import pkg from "../package.json";
import { ELECTRON_OUT_DIRNAME, ELECTRON_ICON_BASE_PATH } from "../shared/path";

export async function buildElectron() {
  await electronBuild({
    publish: "onTag",
    config: {
      appId: "com.biu.wood3n",
      productName: "Biu",
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
      files: [`${ELECTRON_OUT_DIRNAME}/**`, "dist/web/**"],
      win: {
        target: [
          { target: "nsis", arch: ["x64", "arm64"] },
          { target: "portable", arch: ["x64", "arm64"] },
        ],
        icon: `${ELECTRON_ICON_BASE_PATH}/logo.ico`,
        extraResources: [{ from: "electron/ffmpeg/ffmpeg.exe", to: "electron/ffmpeg/ffmpeg.exe" }],
      },
      nsis: {
        deleteAppDataOnUninstall: true,
        oneClick: false,
        perMachine: false,
        allowElevation: true,
        allowToChangeInstallationDirectory: true,
        buildUniversalInstaller: false,
        artifactName: "${productName}-${version}-win-setup-${arch}.${ext}",
      },
      portable: {
        artifactName: "${productName}-${version}-win-portable-${arch}.${ext}",
      },
      mac: {
        target: [
          { target: "dmg", arch: ["x64", "arm64"] },
          { target: "zip", arch: ["x64", "arm64"] },
        ],
        category: "public.app-category.music",
        icon: `${ELECTRON_ICON_BASE_PATH}/biu.icon`,
        hardenedRuntime: true,
        gatekeeperAssess: false,
        darkModeSupport: true,
        entitlements: "plugins/mac/entitlements.mac.plist",
        entitlementsInherit: "plugins/mac/entitlements.mac.plist",
        notarize: false,
        artifactName: "${productName}-${version}-mac-${arch}.${ext}",
        extraResources: [{ from: "electron/ffmpeg/ffmpeg-mac-${arch}", to: "electron/ffmpeg/ffmpeg-mac-${arch}" }],
      },
      linux: {
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
        artifactName: "${productName}-${version}-linux-${arch}.${ext}",
        extraResources: [{ from: "electron/ffmpeg/ffmpeg-linux", to: "electron/ffmpeg/ffmpeg-linux" }],
      },
      publish: {
        provider: "github",
        owner: "wood3n",
        repo: "biu",
        releaseType: null,
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
