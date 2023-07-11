// @ts-check
const path = require('path');
const viteReact = require('@vitejs/plugin-react').default;
const svgr = require('@svgr/rollup');

/**
 * @param {string} mode developement | production
 * @returns {import('vite').UserConfig}
 */
module.exports = function getConfig(mode) {
  const projectRootDir = process.cwd();

  return {
    mode,
    root: path.resolve(projectRootDir, './src'),
    publicDir: path.resolve(projectRootDir, './public/web'),
    plugins: [
      viteReact(),
      // @ts-expect-error ts(2349)
      svgr({
        icon: 16,
        svgProps: {
          stroke: '#fff',
          color: '#fff',
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(projectRootDir, './src'),
        '@service': path.resolve(projectRootDir, './src/service'),
        '@components': path.resolve(projectRootDir, './src/components'),
        '@store': path.resolve(projectRootDir, './src/store'),
        '@common': path.resolve(projectRootDir, './src/common'),
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "${path.resolve(projectRootDir, 'src/common/style/global.less')}";`,
        },
      },
    },
  };
};
