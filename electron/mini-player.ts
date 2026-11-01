import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { appSettingsStore } from "./store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let miniPlayer: BrowserWindow | null = null;

/** 悬浮窗面板尺寸：窗口 = 面板，材质/底色直接铺满，不再内嵌一层 CSS 胶囊 */
const PANEL_WIDTH = 340;
const PANEL_HEIGHT = 80;

/** 纯色底板对应的窗口底色（深色不是纯黑，压住屏幕边缘更舒服） */
const SOLID_BACKGROUND: Record<"light" | "dark", string> = {
  light: "#FAFAFC",
  dark: "#1A1A1E",
};

/** Windows 以外没有 DWM 材质，底板交回 CSS 画 */
const supportsSystemMaterial = process.platform === "win32";

/**
 * 切换悬浮窗底板。
 *
 * 亚克力由 DWM 合成，它糊的是「此刻窗口后面的真实画面」，所以是实时的，且我们这边零开销；
 * 代价是材质只能按窗口矩形（带系统圆角）整块画 —— 于是面板就是窗口本身，
 * 不再往里嵌一层胶囊，否则就是「矩形材质里贴了一颗药丸」。
 * 材质必须 `transparent: false` 才拿得到，纯色模式则关掉材质、用窗口实色底。
 */
export function applyMiniPlayerBackdrop(mode: MiniPlayerBackdrop) {
  if (!miniPlayer || miniPlayer.isDestroyed() || !supportsSystemMaterial) return;

  if (mode === "acrylic") {
    miniPlayer.setBackgroundMaterial("acrylic");
    miniPlayer.setBackgroundColor("#00000000");
    return;
  }

  miniPlayer.setBackgroundMaterial("none");
  miniPlayer.setBackgroundColor(SOLID_BACKGROUND[mode]);
}

/** 读取持久化的底板模式，窗口创建时就按它设置，避免开机先闪一下亚克力 */
function persistedBackdrop(): MiniPlayerBackdrop {
  const value = appSettingsStore.get("appSettings.miniPlayerBackdrop");
  return value === "light" || value === "dark" ? value : "acrylic";
}

const createMiniPlayer = () => {
  const backdrop = persistedBackdrop();

  miniPlayer = new BrowserWindow({
    title: "Biu Mini Player",
    show: true,
    // 阴影交给系统：材质窗口自带投影，且按窗口形状（含圆角）裁切，不会在面板里留脏边
    hasShadow: true,
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    resizable: false,
    // 保留 Win11 默认圆角：材质只能沿窗口矩形（带系统圆角）整块绘制，这正是我们要的形状
    roundedCorners: true,
    center: true,
    // 隐藏窗口标题栏和窗口按钮
    frame: false,
    // 透明窗口拿不到系统材质，所以 Windows 上必须 transparent: false，
    // 页面透明处透出材质；其它平台没有 DWM 材质，仍按逐像素透明由 CSS 画底板
    transparent: !supportsSystemMaterial,
    backgroundColor: backdrop === "acrylic" ? "#00000000" : SOLID_BACKGROUND[backdrop],
    backgroundMaterial: supportsSystemMaterial && backdrop === "acrylic" ? "acrylic" : "none",
    titleBarOverlay: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev,
      spellcheck: false,
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
