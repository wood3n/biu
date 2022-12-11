const electronPath = require('electron');
const { spawn } = require('child_process');
const { createServer } = require('vite');
const baseConfig = require('./vite/vite.config');
const portfinder = require('portfinder');

(async () => {
  console.log('Start vite server...');

  process.env.NODE_ENV === 'development';
  const port = await portfinder.getPortPromise();
  const server = await createServer({
    ...baseConfig('development'),
    server: {
      open: false,
      overlay: false,
      port
    },
  });
  await server.listen();
  server.printUrls();

  // 启动 electron 进程
  console.log('Start electron main process...');

  // 启动 electron 进程
  try {
    const electronProcess = spawn(electronPath, ['.'], {
      env: {
        NODE_ENV: 'development',
        PORT: port,
      },
      cwd: process.cwd(),
      windowsHide: false,
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
  } catch (err) {
    return Promise.reject(err);
  }
})().catch(err => {
  console.log(err);
});
