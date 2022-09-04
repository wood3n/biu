const path = require('path');
const { build } = require('vite');
const baseConfig = require('./vite/vite.config');

process.env.NODE_ENV === 'production';

(async () => {
  console.log('Start build web resources...');
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
        // disable css split chunks
        // cssCodeSplit: false,
        minify: true,
        target: ['es2020'],
        emptyOutDir: true,
        write: true,
      },
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('build web successfully!');
})();
