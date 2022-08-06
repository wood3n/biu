const posthtml = require('posthtml');
const postTransformHtmlPlugin = require('../post-transform-html-plugin');
const { minify } = require('html-minifier-terser');

/**
 * 将 html esmodule 载入的 js script 转换成本地加载
 * 利用 transformIndexHtml 钩子函数： https://cn.vitejs.dev/guide/api-plugin.html#transformindexhtml
 */
const VitePluginInlineChunk = () => {
  return {
    name: 'vite-plugin-transform-esm',
    /**
     * 修改 vite 配置
     * @param {import('vite').UserConfig} config
     * @param {import('vite').ConfigEnv} env
     * @returns {import('vite').UserConfig}
     */
    config(config, { mode }) {
      if (mode === 'production') {
        return {
          build: {
            assetsInlineLimit: Number.MAX_SAFE_INTEGER,
            cssCodeSplit: false,
            rollupOptions: {
              output: {
                // 从入口生成的 js chunk 的文件名
                entryFileNames: '[name].js',
                // css 文件名
                assetFileNames: '[name][extname]',
                // disable split chunks
                // from vite2.9, split vendor chunk need to use splitVendorChunkPlugin: https://cn.vitejs.dev/guide/build.html#chunking-strategy
                manualChunks: () => 'index.js',
              },
            },
          },
        };
      }
    },
    /**
     * 转换 html 输出的钩子函数
     * @param {string} html 打包生成的转换前的 html
     * @param {import('vite').IndexHtmlTransformContext} ctx 当前 bundle，chunk 等输出信息
     * @returns {import('vite').IndexHtmlTransformResult} 转换后的 html 字符串
     */
    async transformIndexHtml(html, ctx) {
      const inlineHtml = posthtml()
        .use((tree) => postTransformHtmlPlugin(tree))
        .process(html, { sync: true }).html;
      return await minify(inlineHtml, {
        // 移除标签换行
        collapseWhitespace: true,
      });
    },
  };
};

module.exports = VitePluginInlineChunk;
