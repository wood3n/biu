// @ts-check
const path = require('path');
const react = require('@vitejs/plugin-react');
const viteTransformESMPlugin = require('./vite-plugin-transform-esm');
const mkcert = require('vite-plugin-mkcert').default;

/**
 * @param {string} mode developement | production
 * @returns {import('vite').UserConfig}
 */
module.exports = function getConfig(mode) {
  const projectRootDir = process.cwd();

  return {
    configFile: false,
    mode,
    root: path.resolve(projectRootDir, './src'),
    publicDir: path.resolve(projectRootDir, './public/web'),
    plugins: [
      react(),
      mode === 'production' && viteTransformESMPlugin(),
      // 启用 https，第一次启动需要生成 key，超级慢
      mode === 'development' && mkcert(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(projectRootDir, './src'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {},
      },
    },
  };
};
