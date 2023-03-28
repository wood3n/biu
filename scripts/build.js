const path = require('path');
const { build } = require('vite');
const consola = require('consola');
const baseConfig = require('./vite/vite.config');

process.env.NODE_ENV = 'production';

(async () => {
  consola.info('Start build web resources...');
  const outDir = path.resolve(process.cwd(), './dist/web');

  try {
    await build({
      ...baseConfig('production'),
      // js,css 等资源相对于 html 的路径前缀
      base: './',
      build: {
        outDir,
        // 生成的 js，css 等文件相对于 outDir 的路径
        assetsDir: '.',
        minify: true,
        target: ['es2020'],
        emptyOutDir: true,
        write: true,
      },
    });
  } catch (err) {
    consola.error(err);
    process.exit(1);
  }

  consola.success('build web successfully!');
})();
