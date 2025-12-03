import { logger } from "@rsbuild/core";
import { build as electronBuild } from "electron-builder";

import pkg from "../package.json";
import { ELECTRON_OUT_DIRNAME, ELECTRON_ICON_BASE_PATH } from "../shared/path";

export async function buildElectron() {
  const arch = (process.env.ARCH || "x64") as "arm64" | "x64";

  await electronBuild({
    publish: "onTag",
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
      files: [`${ELECTRON_OUT_DIRNAME}/**`, "dist/web/**"],
      win: {
        target: [
          { target: "nsis", arch },
          { target: "portable", arch },
        ],
        icon: `${ELECTRON_ICON_BASE_PATH}/logo.ico`,
      },
      nsis: {
        deleteAppDataOnUninstall: true,
        oneClick: false,
        perMachine: false,
        allowElevation: true,
        allowToChangeInstallationDirectory: true,
        artifactName: "${productName}-Setup-${version}-${arch}.${ext}",
      },
      portable: {
        artifactName: "${productName}-Portable-${version}-${arch}.${ext}",
      },
      mac: {
        target: [
          { target: "dmg", arch },
          { target: "zip", arch },
        ],
        category: "public.app-category.music",
        icon: `${ELECTRON_ICON_BASE_PATH}/logo.icns`,
        hardenedRuntime: true,
        gatekeeperAssess: false,
        darkModeSupport: true,
        entitlements: "plugins/mac/entitlements.mac.plist",
        entitlementsInherit: "plugins/mac/entitlements.mac.plist",
        notarize: false,
      },
      linux: {
        target: [
          { target: "AppImage", arch },
          { target: "deb", arch },
          { target: "rpm", arch },
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
