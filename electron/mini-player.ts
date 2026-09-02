import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let miniPlayer: BrowserWindow | null = null;

const createMiniPlayer = () => {
  miniPlayer = new BrowserWindow({
    title: "Biu Mini Player",
    show: true,
    hasShadow: false,
    width: 320,
    height: 67,
    resizable: false,
    roundedCorners: false,
    center: true,
    // 隐藏窗口标题栏和窗口按钮
    frame: false,
    // 直角边形态：transparent 禁用 DWM 窗口框架渲染（无系统阴影），
    // 亚克力由系统按窗口矩形整块绘制，直角窗口与其天然对齐，无露馅；
    // 圆角与亚克力、无阴影在 Win11 上不可兼得，故 UI 整体走直角设计
    transparent: true,
    backgroundMaterial: "acrylic",
    titleBarOverlay: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev,
    },
  });

  miniPlayer.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  miniPlayer.webContents.on("before-input-event", (event, input) => {
    if ((input.control || input.meta) && input.key.toLowerCase() === "r") {
      event.preventDefault();
    }
  });

  miniPlayer.webContents.on("context-menu", e => {
    e.preventDefault();
  });

  if (process.platform === "win32") {
    // 拦截 WM_INITMENU (0x0116) 消息，阻止系统菜单
    miniPlayer.hookWindowMessage(0x0116, () => {
      miniPlayer?.setEnabled(false);
      setTimeout(() => {
        miniPlayer?.setEnabled(true);
      }, 100);
      return true;
    });
  }

  const indexPath = path.resolve(__dirname, "../dist/web/index.html");
  miniPlayer.loadFile(indexPath, { hash: "mini-player" });
};

const destroyMiniPlayer = () => {
  if (miniPlayer) {
    if (!miniPlayer.isDestroyed()) {
      miniPlayer.destroy();
    }
    miniPlayer = null;
  }
};

export { miniPlayer, createMiniPlayer, destroyMiniPlayer };
