const { createServer } = require('vite');
const baseConfig = require('./vite/vite.config');
const portfinder = require('portfinder');
const electronmon = require('electronmon');

(async () => {
  console.log('Start vite server...');

  process.env.NODE_ENV === 'development';
  const port = await portfinder.getPortPromise();
  const server = await createServer({
    ...baseConfig('development'),
    server: {
      open: false,
      port
    },
  });
  await server.listen();
  server.printUrls();

  // 启动 electron 进程
  console.log('Start electron main process...');

  // 启动 electron 进程
  try {
    await electronmon({
      env: {
        NODE_ENV: 'development',
        PORT: port,
      },
      logLevel: 'error'
    });
    console.log('Start electron successfully!');
  } catch (err) {
    return Promise.reject(err);
  }
})().catch(err => {
  console.log(err);
});
