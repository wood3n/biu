const path = require('path');
const rimraf = require('rimraf');
const { build } = require('vite');
const consola = require('consola');
const builder = require('electron-builder');
const readPackageSync = require('read-pkg');
const baseConfig = require('./vite/vite.config');

const pkg = readPackageSync({
  cwd: process.cwd(),
});

process.env.NODE_ENV = 'production';

(async () => {
  rimraf.sync(path.resolve(process.cwd(), './dist'));

  const outDir = path.resolve(process.cwd(), './dist/web');

  try {
    await build({
      ...baseConfig('production'),
      // js,css 等资源相对于 html 的路径前缀
      base: './',
      build: {
        chunkSizeWarningLimit: Number.MAX_SAFE_INTEGER,
        outDir,
        // 生成的 js，css 等文件相对于 outDir 的路径
        assetsDir: '.',
        minify: true,
        target: ['es2020'],
        emptyOutDir: true,
        write: true,
      },
    });

    consola.info('Start build electron app...');

    await builder
      .build({
        config: {
          appId: 'com.rate.wangkai',
          productName: 'Rate',
          copyright: 'Copyright © 2022 wangkai',
          nodeVersion: 'current',
          buildVersion: pkg.version,
          asar: true,
          // electronLanguages: ['zh-CN'],
          electronCompile: false,
          // "store” | “normal” | "maximum". - For testing builds, use 'store' to reduce build time significantly.
          compression: 'store',
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
            target: 'nsis',
            // 用 png 就行，builder 会自动生成 ico 文件
            icon: './public/electron/music.png',
          },
          nsis: {
            deleteAppDataOnUninstall: true,
            include: 'installer/win/nsis-installer.nsh',
          },
        },
      })
      .then((result) => {
        consola.success(JSON.stringify(result));
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (err) {
    consola.error(err);
    process.exit(1);
  }
})();
