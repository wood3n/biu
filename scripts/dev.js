const { createServer } = require('vite');
const electronPath = require('electron');
const { spawn } = require('child_process');
var minimist = require('minimist');
const baseConfig = require('./vite.config');
const portfinder = require('portfinder');

process.env.NODE_ENV === 'development';

(async () => {
  console.log('Start web server...');
  const { web: isInWeb } = minimist(process.argv.slice(2));

  const port = await portfinder.getPortPromise();

  try {
    const server = await createServer({
      ...baseConfig('development'),
      server: {
        open: !!isInWeb,
        port,
        // proxy: {
        //   '^/api': {
        //     target: 'https://netease-cloud-music-api-kohl-beta.vercel.app',
        //     changeOrigin: true,
        //     rewrite: (path) => path.replace(/^\/api/, ''),
        //   },
        // },
      },
    });

    await server.listen();

    server.printUrls();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  // 启动 electron 进程
  if (!isInWeb) {
    console.log('Start electron main process...');

    // 启动 electron 进程
    // 这里 env 传递到 main.js 执行，否则直接在 main.js 中读取 env 会是 undefined
    const electronProcess = spawn(electronPath, ['./scripts/main.js'], {
      env: {
        NODE_ENV: 'development',
        PORT: port,
      },
    });

    electronProcess.on('spawn', () => {
      console.log('Start electron successfully!');
    });

    electronProcess.on('error', (err) => {
      console.error(`Failed to start electron process: ${err}`, err);
    });

    electronProcess.on('close', (code) => {
      electronProcess.kill();
      process.exit(code);
    });
  }
})().catch(err => {
  console.log(err);
});
