import { app, BrowserWindow, nativeImage, session } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTray, destroyTray } from "./createTray.mjs"; // 托盘功能
import { registerIpcHandlers } from "./ipc/index.mjs";
import { store, storeKey } from "./store.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let onBeforeSendHeadersHandler;
let onHeadersReceivedHandler;

function createWindow() {
  // 初始打开窗口的配置项
  mainWindow = new BrowserWindow({
    title: "Biu",
    // windows taskbar icon
    icon: path.resolve(
      process.cwd(),
      process.platform === "win32" ? "electron/icons/win/logo.ico" : "electron/icons/mac/logo.icns",
    ),
    show: true,
    hasShadow: true,
    width: 1560,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    resizable: true,
    // 跟随 web 页面大小
    useContentSize: true,
    // 窗口居中
    center: true,
    // 无边框
    frame: false,
    transparent: false,
    hasShadow: false,
    // macos不需要设置frame-false，只需要titleBarStyle即可隐藏边框，因此也不需要自定义窗口操作
    // titleBarStyle: "hiddenInset",
    titleBarStyle: "hidden",
    // expose window controls in Windows/Linux
    ...(process.platform !== "darwin"
      ? {
          titleBarOverlay: {
            color: "#00000000",
            symbolColor: "#ffffff",
            height: 64,
          },
        }
      : {}),
    trafficLightPosition: { x: 14, y: 14 },
    webPreferences: {
      webSecurity: false,
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: true,
    },
  });

  // MAC dock icon
  if (process.platform === "darwin") {
    const dockIcon = nativeImage.createFromPath(path.resolve(process.cwd(), "electron/icons/logo.png"));
    app.dock.setIcon(dockIcon);
  }

  // https://www.electronjs.org/docs/latest/api/app#appispackaged-readonly
  if (app.isPackaged) {
    // 使用 __dirname 相对路径，确保打包后在 asar 内正确解析
    const indexPath = path.resolve(__dirname, "../dist/web/index.html");
    mainWindow.loadFile(indexPath);
    mainWindow.webContents.openDevTools({
      mode: "bottom",
    });
  } else {
    mainWindow.loadURL(`http://localhost:${process.env.PORT}/`);
    mainWindow.webContents.openDevTools({
      mode: "bottom",
    });
  }

  // 从store获取配置，判断是否关闭窗口时隐藏还是退出程序
  mainWindow.on("close", event => {
    const closeWindowOption = store.get(storeKey.appSettings).closeWindowOption;

    if (closeWindowOption === "hide") {
      event.preventDefault();
      mainWindow.hide();
    } else if (closeWindowOption === "exit") {
      if (app.quitting) {
        mainWindow = null;
      }
    }
  });
}

app.commandLine.appendSwitch("--in-process-gpu");

function stripDomainFromSetCookie(cookies) {
  // cookies 是一个数组，每项是单个 Set-Cookie 字符串
  return cookies.map(cookieStr => {
    // 移除 Domain=xxx, Secure（及可能的前后分号空格）
    return (
      cookieStr
        // 移除 Domain=xxx
        .replace(/;\s*Domain=[^;]+/gi, "")
        // 移除 Secure
        .replace(/;\s*Secure/gi, "")
        // 移除 SameSite=None
        .replace(/;\s*SameSite=None/gi, "")
        // 清理多余空格和分号
        .replace(/;\s*;+/g, ";")
        .replace(/;\s*$/, "")
    );
  });
}

app.whenReady().then(() => {
  // 接入系统托盘（仅 Windows 生效）
  createTray({
    // 获取主窗口实例（惰性读取，避免闭包引用旧值）
    getMainWindow: () => mainWindow,
    // 退出：设置 app.quitting 标记，避免 close 事件拦截
    onExit: () => {
      app.quitting = true;
      app.quit();
    },
  });

  // 保存监听器引用，便于退出时移除
  onBeforeSendHeadersHandler = (details, callback) => {
    details.requestHeaders["Referer"] = "https://www.bilibili.com/";
    details.requestHeaders["Origin"] = "https://www.bilibili.com";
    callback({ requestHeaders: details.requestHeaders });
  };
  session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["*://*/*"] }, onBeforeSendHeadersHandler);

  onHeadersReceivedHandler = (details, callback) => {
    const headers = details.responseHeaders || {};
    const headerName = Object.keys(headers).find(k => k.toLowerCase() === "set-cookie");

    if (headerName) {
      const setCookieValues = headers[headerName]; // array
      const newCookies = stripDomainFromSetCookie(setCookieValues);
      // 重新赋值（保留其他 header 不变）
      headers[headerName] = newCookies;
    }

    callback({ responseHeaders: headers });
  };
  session.defaultSession.webRequest.onHeadersReceived({ urls: ["*://*/*"] }, onHeadersReceivedHandler);

  registerIpcHandlers({ app });
  createWindow();
});

app.on("activate", () => mainWindow?.show());

app.on("before-quit", () => {
  app.quitting = true;
});

// 在 will-quit 阶段清理资源，确保进程干净退出
app.on("will-quit", () => {
  try {
    destroyTray();
  } catch {}

  try {
    if (onBeforeSendHeadersHandler) {
      session.defaultSession.webRequest.removeListener("onBeforeSendHeaders", onBeforeSendHeadersHandler);
      onBeforeSendHeadersHandler = undefined;
    }
    if (onHeadersReceivedHandler) {
      session.defaultSession.webRequest.removeListener("onHeadersReceived", onHeadersReceivedHandler);
      onHeadersReceivedHandler = undefined;
    }
  } catch {}

  // 开发环境：Electron 退出时同时结束 Node.js 开发进程
  if (!app.isPackaged) {
    try {
      process.exit(0);
    } catch {}
  }
});

app.on("window-all-closed", () => {
  // 如果用户不是在 macOS(darwin) 上运行程序，调用 quit 方法在所有窗口关闭后结束 electron 进程
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 全局异常处理，避免未捕获异常导致进程异常驻留
process.on("uncaughtException", err => {
  console.error("[uncaughtException]", err);
  app.quitting = true;
  app.quit();
});

process.on("unhandledRejection", reason => {
  console.error("[unhandledRejection]", reason);
});

app.disableHardwareAcceleration();
