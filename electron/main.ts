import { app, BrowserWindow, nativeImage, session } from "electron";
import log from "electron-log";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createTray, destroyTray } from "./createTray"; // 托盘功能
import { registerIpcHandlers } from "./ipc/index";
import { installWebRequestInterceptors } from "./network/interceptor";
import { store, storeKey } from "./store";
import { setupAutoUpdater } from "./updater";

let mainWindow: BrowserWindow;
let webRequestDisposer: { dispose: () => void } | undefined;
let autoUpdaterCtl: { checkForUpdates: () => Promise<void>; dispose: () => void } | undefined;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  // 计算图标基准路径：打包后使用 resourcesPath，开发用 cwd
  const iconBase = app.isPackaged ? process.resourcesPath : process.cwd();

  mainWindow = new BrowserWindow({
    title: "Biu",
    // windows taskbar icon
    icon: path.resolve(
      iconBase,
      process.platform === "win32" ? "electron/icons/win/logo.ico" : "electron/icons/macos/logo.icns",
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
    trafficLightPosition: { x: 0, y: 0 },
    webPreferences: {
      webSecurity: false,
      preload: path.resolve(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  // 禁止通过中键/target=_blank/window.open 等方式在 Electron 中打开新窗口
  // 不影响当前窗口内的左键导航与其他鼠标按键行为
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  // MAC dock icon
  if (process.platform === "darwin") {
    const dockIcon = nativeImage.createFromPath(path.resolve(process.cwd(), "electron/icons/logo.png"));
    app.dock?.setIcon(dockIcon);
  }

  // https://www.electronjs.org/docs/latest/api/app#appispackaged-readonly
  if (app.isPackaged) {
    // 使用 __dirname 相对路径，确保打包后在 asar 内正确解析
    const indexPath = path.resolve(__dirname, "../dist/web/index.html");
    mainWindow.loadFile(indexPath);
  } else {
    mainWindow.loadURL(`http://localhost:${process.env.PORT}/`);
    mainWindow.webContents.openDevTools({
      mode: "detach",
    });
  }

  // 从store获取配置，判断是否关闭窗口时隐藏还是退出程序
  mainWindow.on("close", event => {
    const closeWindowOption = store.get(storeKey.appSettings).closeWindowOption;

    if ((app as any).quitting) {
      return;
    }

    if (closeWindowOption === "hide") {
      event.preventDefault();
      mainWindow.hide();
    } else if (closeWindowOption === "exit") {
      if ((app as any).quitting) {
        mainWindow = null as any;
      }
    }
  });
}

app.commandLine.appendSwitch("--in-process-gpu");

app.whenReady().then(() => {
  // 接入系统托盘（仅 Windows 生效）
  createTray({
    // 获取主窗口实例（惰性读取，避免闭包引用旧值）
    getMainWindow: () => mainWindow,
    // 退出：设置 app.quitting 标记，避免 close 事件拦截
    onExit: () => {
      (app as any).quitting = true;
      app.quit();
    },
  });

  // 安装统一的 webRequest 拦截器
  webRequestDisposer = installWebRequestInterceptors(session.defaultSession);

  // 初始化并触发自动更新检查（仅打包环境）
  if (app.isPackaged) {
    autoUpdaterCtl = setupAutoUpdater({ getMainWindow: () => mainWindow });
    autoUpdaterCtl.checkForUpdates().catch(err => log.error("[autoUpdater] check failed:", err));
  }

  registerIpcHandlers();
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

  try {
    // 停止拦截逻辑
    webRequestDisposer?.dispose();
    webRequestDisposer = undefined;
  } catch (err) {
    // 修改说明：网络拦截器清理失败时记录日志，便于定位
    log.warn("[main] webRequest dispose failed:", err);
  }

  try {
    autoUpdaterCtl?.dispose();
    autoUpdaterCtl = undefined;
  } catch (err) {
    // 修改说明：自动更新模块释放失败时记录日志
    log.warn("[main] autoUpdater dispose failed:", err);
  }

  // 开发环境：Electron 退出时同时结束 Node.js 开发进程
  if (!app.isPackaged) {
    process.exit(0);
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
  (app as any).quitting = true;
  app.quit();
});

process.on("unhandledRejection", reason => {
  console.error("[unhandledRejection]", reason);
});

app.disableHardwareAcceleration();
