# rate

windows music application

# plan

- [x] 2022-04-27 init prorject

# 一些小灵感

1. 播放界面使用 Speed Dial 组件，显示分享和保存等快捷操作
2. 关于页面，写入开源项目的名称和版本
3. support Thumbnail Toolbars: https://docs.microsoft.com/en-us/windows/win32/shell/taskbar-extensions#thumbnail-toolbars
4. youtube 音乐播放界面参考

# 开源项目

- electron
- vite
- mui
- react + typescript

# electron-builder 打包问题

## Application entry file "index.js" in the "xxx\artifacts\local\win-unpacked\resources\app.asar" does not exist.

https://github.com/electron-userland/electron-builder/issues/2404

解决方法：

1. 配置`electron-builder`的`files`属性，必须包含`electron`的`main.js`等文件；
2. 在`package.json`下添加`main`字段，指向 web 页面的 js 入口文件

## Get "https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-resources-3.4.1/nsis-resources-3.4.1.7z": dial tcp 140.82.113.4:443: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.

[相关 issue](https://github.com/electron-userland/electron-builder/issues/1859): 无法从 GitHub 下载打包依赖的文件，可以先将文件下载下来放在 electron 缓存目录下，这样后续执行打包，就会直接从缓存目录获取文件。下面是不同系统的缓存目录：

```shell
macOS: ~/Library/Caches/electron-builder
Linux: ~/.cache/electron-builder
windows: %LOCALAPPDATA%\electron-builder\cache
```

需要下载的文件都在 [electron-builder-binaries](https://github.com/electron-userland/electron-builder-binaries) 这个仓库的 release 里，windows 打包需要以下这些，下载下来解压完分别在缓存目录下建立相同名称的文件夹即可。

1. winCodeSign
2. nsis
3. nsis-resources

## output file is locked for writing (maybe by virus scanner) => waiting for unlock...

这种情况一般是前面打包的程序还在执行导致新的打包程序无法替换原有程序，需要到任务管理器下找到执行程序全部关掉才行。

## document is not defined in main process

`package.json`中指定的`main`字段错了，`main`应该是`electron`的入口程序 - `main.js`.

# react router 在本地页面打开

# vite 一些问题

## 如何解决 esm 本地无法加载的问题

这个问题其实还是浏览器的同源策略导致的跨域问题，由于 vite 打包以后将 JS 文件以 ESM 的形式插入 HTML 文件，而 ESM 请求的 JS 文件只会走 HTTP 协议，在本地或者 electron 内部通过本地文件系统的`File`协议加载文件时，自然在 ESM 请求时会遇到跨域问题，这里有两种方式：

1. 通过 vite 提供的 [`transformindexhtml`](https://vitejs.dev/guide/api-plugin.html#transformindexhtml) 转换 vite 打包产物为单文件，且改变以 ESM 插入到 HTML 内部的方式。
   这种方式首先要熟悉如何开发 vite 插件，其次还需要对打包完生成的 chunk，html 等产物进行处理，比较麻烦，虽然解决了 ESM 请求的问题，但是并没解决接口请求跨域的问题，除非服务端提前处理了跨域请求头参数。
   不过仍然可以使用 electron 内置的 [`onBeforeSendHeaders`](https://www.electronjs.org/docs/latest/api/web-request#webrequestonbeforesendheadersfilter-listener) 和[`onHeadersReceived`](https://www.electronjs.org/docs/latest/api/web-request#webrequestonheadersreceivedfilter-listener) 来处理请求头和响应头达到绕过跨域限制的目的。

```js
const { session } = require('electron');

session.defaultSession.webRequest.onBeforeSendHeaders(
  filter,
  (details, callback) => {
    details.requestHeaders['Origin'] = '*';
    callback({ requestHeaders: details.requestHeaders });
  }
);

session.defaultSession.webRequest.onHeadersReceived(
  filter,
  (details, callback) => {
    details.requestHeaders['access-control-allow-origin'] = '*';
    details.requestHeaders['access-control-allow-credentials'] = '*';
    callback({ requestHeaders: details.requestHeaders });
  }
);
```

最后还需要设置`react-router-dom`为`HashRouter`模式，否则本地页面跳转无法响应路由配置。

2. 通过`vite`直接启一个`server`，这种方式也可以，但是比较占用客户端资源。
