const electron = require('electron');
const { spawn } = require('child_process');
const { createServer } = require('vite');
const consola = require('consola');
const portfinder = require('portfinder');
const baseConfig = require('./vite/vite.config');

(async () => {
  consola.info('Start vite server...');

  process.env.NODE_ENV = 'development';
  const port = await portfinder.getPortPromise();
  const server = await createServer({
    ...baseConfig('development'),
    server: {
      open: false,
      overlay: false,
      port,
    },
  });
  await server.listen();
  server.printUrls();

  // 启动 electron 进程
  consola.info('Start electron main process...');

  // 启动 electron 进程
  const electronProcess = spawn(electron, ['.'], {
    stdio: 'inherit',
    env: {
      NODE_ENV: 'development',
      PORT: port,
    },
    cwd: process.cwd(),
    windowsHide: false,
  });

  electronProcess.on('spawn', () => {
    consola.success('Start electron successfully!');
  });

  electronProcess.on('error', (err) => {
    console.error(electron, 'Failed to start electron process', err);
  });

  electronProcess.on('close', (code, signal) => {
    if (code === null) {
      console.error(electron, 'exited with signal', signal);
      process.exit(1);
    }
    process.exit(code);
  });

  const handleTerminationSignal = (signal) => {
    process.on(signal, () => {
      if (!electronProcess.killed) {
        electronProcess.kill(signal);
      }
    });
  };

  handleTerminationSignal('SIGINT');
  handleTerminationSignal('SIGTERM');
})().catch((err) => {
  consola.info(err);
});
