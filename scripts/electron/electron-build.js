const builder = require('electron-builder');
const readPackageSync = require('read-pkg');

const pkg = readPackageSync({
  cwd: process.cwd(),
});

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const options = {
  appId: 'com.rate.wangkai',
  productName: 'Rate',
  copyright: 'Copyright © 2022 wangkai',
  nodeVersion: 'current',
  buildVersion: pkg.version,
  asar: true,
  electronCompile: false,
  // "store” | “normal” | "maximum". - For testing builds, use 'store' to reduce build time significantly.
  compression: 'normal',
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
  files: ['./dist/web', 'scripts/electron'],
  win: {
    // windows 直接打包成便携程序
    target: 'portable',
    // 用 png 就行，builder 会自动生成 ico 文件
    icon: './public/electron/music.png',
  },
  // nsis: {
  //   deleteAppDataOnUninstall: true,
  //   include: 'installer/win/nsis-installer.nsh',
  // },
};

module.exports = builder
  .build({
    config: options,
  })
  .then((result) => {
    console.log(JSON.stringify(result));
  })
  .catch((error) => {
    console.error(error);
  });
