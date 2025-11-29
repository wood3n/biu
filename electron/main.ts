import { app, BrowserWindow, nativeImage } from "electron";
import isDev from "electron-is-dev";
import log from "electron-log";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ELECTRON_ICON_BASE_PATH } from "@shared/path";

import { registerIpcHandlers } from "./ipc/index";
import { injectAuthCookie } from "./network/cookie";
import { installWebRequestInterceptors } from "./network/interceptor";
import { IconBase } from "./path";
import { store, storeKey } from "./store";
import { createTray, destroyTray } from "./tray"; // 托盘功能
import { autoUpdater, setupAutoUpdater, stopCheckForUpdates } from "./updater";
import { setupWindowsThumbar } from "./windows/thumbar";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

log.initialize();

let mainWindow: BrowserWindow | null;
function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Biu",
    icon: path.resolve(IconBase, ELECTRON_ICON_BASE_PATH, process.platform === "win32" ? "logo.ico" : "logo.icns"),
    show: true,
    hasShadow: true,
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 640,
    resizable: true,
    // 跟随 web 页面大小
    useContentSize: true,
    // 窗口居中
    center: true,
    // 无边框
    frame: false,
    transparent: false,
    // titleBarStyle: "hiddenInset",
    titleBarStyle: "hidden",
    titleBarOverlay: false,
    // expose window controls in Windows/Linux
    ...(process.platform !== "darwin"
      ? {
          titleBarOverlay: {
            color: "rgba(0,0,0,0)",
            symbolColor: "#ffffff",
            height: 64,
          },
        }
      : {}),
    trafficLightPosition: { x: 0, y: 0 },
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev,
    },
  });

  // 禁止通过中键/target=_blank/window.open 等方式在 Electron 中打开新窗口
  // 不影响当前窗口内的左键导航与其他鼠标按键行为
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  // 拦截 context menu（对所有右键都生效）
  mainWindow.webContents.on("context-menu", event => {
    // 阻止默认菜单显示
    event.preventDefault();
  });

  // MAC dock icon
  if (process.platform === "darwin") {
    const dockIcon = nativeImage.createFromPath(path.resolve(IconBase, ELECTRON_ICON_BASE_PATH, "logo.png"));
    app.dock?.setIcon(dockIcon);
  }

  const indexPath = path.resolve(__dirname, "../dist/web/index.html");
  mainWindow.loadFile(indexPath);
  if (isDev) {
    mainWindow.webContents.openDevTools({
      mode: "bottom",
    });
  }

  // 初始化 Windows 任务栏缩略按钮，并监听播放状态更新
  if (process.platform === "win32") {
    setupWindowsThumbar(mainWindow);
  }

  // 从store获取配置，判断是否关闭窗口时隐藏还是退出程序
  mainWindow.on("close", event => {
    const closeWindowOption = store.get(storeKey.appSettings).closeWindowOption;

    if ((app as any).quitting) {
      return;
    }

    if (closeWindowOption === "hide") {
      event.preventDefault();
      mainWindow?.hide();
    } else if (closeWindowOption === "exit") {
      if ((app as any).quitting) {
        mainWindow = null;
      }
    }
  });
}

app.whenReady().then(() => {
  createTray({
    getMainWindow: () => mainWindow,
    // 退出：设置 app.quitting 标记，避免 close 事件拦截
    onExit: () => {
      (app as any).quitting = true;
      app.quit();
    },
  });

  injectAuthCookie();

  installWebRequestInterceptors();

  registerIpcHandlers();

  setupAutoUpdater();

  createWindow();
});

app.on("activate", () => mainWindow?.show());

app.on("before-quit", () => {
  (app as any).quitting = true;
});

// 在 will-quit 阶段清理资源，确保进程干净退出
app.on("will-quit", () => {
  try {
    destroyTray();
  } catch (err) {
    // 修改说明：托盘销毁失败时记录日志，避免静默失败
    log.warn("[main] destroyTray failed:", err);
  }

  stopCheckForUpdates();
  autoUpdater.removeAllListeners();

  // 开发环境：Electron 退出时同时结束 Node.js 开发进程
  if (isDev) {
    process.exit(0);
  }
});

app.on("window-all-closed", () => {
  // 如果用户不是在 macOS(darwin) 上运行程序，调用 quit 方法在所有窗口关闭后结束 electron 进程
  if (process.platform !== "darwin") {
    app.quit();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // 2. 如果获取锁失败，说明已经有实例在运行了
  // 直接退出当前这个新的实例
  app.quit();
} else {
  // 3. 如果获取锁成功，说明这是第一个实例

  // 监听 'second-instance' 事件
  // 当用户尝试启动第二个实例时，第一个实例（持有锁的实例）会收到这个事件
  app.on("second-instance", () => {
    // 这里的逻辑是：如果有人试图打开第二个，我们就把第一个实例窗口置顶显示
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore(); // 如果窗口最小化了，先恢复
      }
      mainWindow.focus(); // 聚焦窗口
    }
  });
}

// 全局异常处理，避免未捕获异常导致进程异常驻留
process.on("uncaughtException", err => {
  log.error("[uncaughtException]", err);
  (app as any).quitting = true;
  app.quit();
});

process.on("unhandledRejection", reason => {
  log.error("[unhandledRejection]", reason);
});
