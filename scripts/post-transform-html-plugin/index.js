/**
 * 使用 postHTML 将 js 和 css 进行内联转换
 * @param {import('posthtml').Node} tree
 */
module.exports = function (tree) {
  // 移除 header 内部的 script
  tree.match({ tag: 'script', attrs: { type: 'module' } }, (node) => {
    node.tag = false;

    return node;
  });

  tree.match({ tag: 'link', attrs: { rel: 'stylesheet' } }, (node) => {
    return {
      tag: 'style',
      content: ctx['style.css'].code,
    };
  });

  // 在 body 底部插入内联 js
  tree.match({ tag: 'body' }, (node) => {
    Object.assign(node, {
      content: node.content.concat({
        tag: 'script',
        attrs: { type: 'text/javascript', src: './index.js' },
      }),
    });

    return node;
  });
};
