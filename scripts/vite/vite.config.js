// @ts-check
const path = require('path');
const viteReact = require('@vitejs/plugin-react').default;
const svgr = require('@svgr/rollup');
const { viteSingleFile } = require('vite-plugin-singlefile');

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
          color: '#fff'
        },
        svgoConfig: {
          plugins: [
            'preset-default',
            'removeUselessStrokeAndFill',
            {
              name: 'removeAttrs',
              params: {
                // remove stroke and fill in path：https://github.com/svg/svgo/issues/440#issuecomment-396329184
                attrs: '*:(stroke|fill):((?!^none$).)*'
              },
            },
          ]
        }
      }),
      mode === 'production' && viteSingleFile()
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(projectRootDir, './src')
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData:  `@import "${path.resolve(projectRootDir, 'src/assets/style/global.less')}";`
        },
      },
    },
  };
};
