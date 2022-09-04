// @ts-check
const path = require('path');
const viteReact = require('@vitejs/plugin-react').default;
const svgr = require('vite-plugin-svgr');
// const { viteSingleFile } = require('vite-plugin-singlefile');

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
      svgr()
      // viteSingleFile()
    ],
    resolve: {
      alias: {
        '@': path.resolve(projectRootDir, './src')
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            'border-radius-base': '4px',
          },
          javascriptEnabled: true,
          additionalData:  `@import "${path.resolve(projectRootDir, 'src/assets/style/global.less')}";`
        },
      },
    },
  };
};
