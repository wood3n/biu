import { BrowserWindow, screen } from "electron";
import isDev from "electron-is-dev";
import log from "electron-log";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { channel } from "./ipc/channel";
import { desktopLyricsStore } from "./store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_WIDTH = 1100;
const DEFAULT_HEIGHT = 140;
const MIN_WIDTH = 480;
const MIN_HEIGHT = 80;
/** 默认位置距离屏幕底部（任务栏上方）的间距 */
const DEFAULT_BOTTOM_OFFSET = 72;
/** 判断已保存位置是否仍可见的最小重叠区域 */
const MIN_VISIBLE_SIZE = 40;

let desktopLyricsWindow: BrowserWindow | null = null;
/** 最近一次主窗口同步过来的内容，用于窗口创建/重载后补发 */
let lastPayload: DesktopLyricsPayload | null = null;
let isContentReady = false;
let saveBoundsTimer: NodeJS.Timeout | null = null;

/** 计算默认窗口位置：主屏工作区底部居中 */
const getDefaultBounds = (): DesktopLyricsBounds => {
  const { workArea } = screen.getPrimaryDisplay();
  const width = Math.min(DEFAULT_WIDTH, Math.max(MIN_WIDTH, workArea.width - 80));
  const height = Math.min(DEFAULT_HEIGHT, Math.max(MIN_HEIGHT, workArea.height - 80));

  return {
    x: Math.round(workArea.x + (workArea.width - width) / 2),
    y: Math.round(workArea.y + workArea.height - height - DEFAULT_BOTTOM_OFFSET),
    width,
    height,
  };
};

/** 判断保存的位置是否还落在某个显示器的工作区内 */
const isBoundsVisible = (bounds: DesktopLyricsBounds) => {
  return screen.getAllDisplays().some(({ workArea }) => {
    const overlapWidth =
      Math.min(bounds.x + bounds.width, workArea.x + workArea.width) - Math.max(bounds.x, workArea.x);
    const overlapHeight =
      Math.min(bounds.y + bounds.height, workArea.y + workArea.height) - Math.max(bounds.y, workArea.y);
    return overlapWidth >= MIN_VISIBLE_SIZE && overlapHeight >= MIN_VISIBLE_SIZE;
  });
};

/** 读取上次保存的位置；位置已不可见（如拔掉副屏）时回退到默认位置 */
const getInitialBounds = (): DesktopLyricsBounds => {
  const saved = desktopLyricsStore.get("bounds");

  if (saved && isBoundsVisible(saved)) {
    return {
      x: saved.x,
      y: saved.y,
      width: Math.max(MIN_WIDTH, saved.width ?? DEFAULT_WIDTH),
      height: Math.max(MIN_HEIGHT, saved.height ?? DEFAULT_HEIGHT),
    };
  }

  return getDefaultBounds();
};

/** 把当前窗口位置写入本地存储 */
const persistBounds = () => {
  if (!desktopLyricsWindow || desktopLyricsWindow.isDestroyed()) return;

  try {
    desktopLyricsStore.set("bounds", desktopLyricsWindow.getBounds());
  } catch (err) {
    log.warn("[desktop-lyrics] save bounds failed:", err);
  }
};

/** 拖动/缩放时防抖保存位置，避免频繁写盘 */
const persistBoundsDebounced = () => {
  if (saveBoundsTimer) {
    clearTimeout(saveBoundsTimer);
  }
  saveBoundsTimer = setTimeout(() => {
    saveBoundsTimer = null;
    persistBounds();
  }, 400);
};

/** 窗口被拖动到屏幕外后重新拉回默认位置 */
const ensureBoundsVisible = () => {
  if (!desktopLyricsWindow || desktopLyricsWindow.isDestroyed()) return;

  const bounds = desktopLyricsWindow.getBounds();
  if (!isBoundsVisible(bounds)) {
    desktopLyricsWindow.setBounds(getDefaultBounds());
  }
};

/** 应用锁定状态：锁定后鼠标穿透窗口，不影响桌面其他操作 */
const applyLockedState = (locked: boolean) => {
  if (!desktopLyricsWindow || desktopLyricsWindow.isDestroyed()) return;

  try {
    desktopLyricsWindow.setIgnoreMouseEvents(locked, { forward: true });
  } catch (err) {
    log.warn("[desktop-lyrics] set ignore mouse events failed:", err);
  }
};

/** 把最近一次内容快照发送给桌面歌词窗口 */
const sendContentToWindow = () => {
  if (!desktopLyricsWindow || desktopLyricsWindow.isDestroyed() || !isContentReady) return;

  try {
    desktopLyricsWindow.webContents.send(channel.desktopLyrics.content, lastPayload);
  } catch (err) {
    log.warn("[desktop-lyrics] send content failed:", err);
  }
};

/**
 * 根据内容快照控制窗口显示：
 * - 有歌词且页面已加载时显示窗口（暂停时保持显示）
 * - 无歌词/未启用时隐藏窗口
 */
const applyVisibility = () => {
  if (!desktopLyricsWindow || desktopLyricsWindow.isDestroyed()) return;

  const payload = lastPayload;
  if (!payload) return;

  applyLockedState(payload.locked);

  if (payload.active && isContentReady) {
    ensureBoundsVisible();
    if (!desktopLyricsWindow.isVisible()) {
      desktopLyricsWindow.showInactive();
    }
  } else if (desktopLyricsWindow.isVisible()) {
    desktopLyricsWindow.hide();
  }
};

/** 创建桌面歌词窗口（透明、无边框、置顶、不占任务栏） */
const createDesktopLyricsWindow = () => {
  if (desktopLyricsWindow && !desktopLyricsWindow.isDestroyed()) {
    return desktopLyricsWindow;
  }

  const bounds = getInitialBounds();
  isContentReady = false;

  desktopLyricsWindow = new BrowserWindow({
    ...bounds,
    title: "Biu Desktop Lyrics",
    show: false,
    hasShadow: false,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    resizable: true,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    closable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev,
      // 桌面歌词窗口常驻后台，避免隐藏时定时器被节流
      backgroundThrottling: false,
    },
  });

  desktopLyricsWindow.setAlwaysOnTop(true, "floating");

  desktopLyricsWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  desktopLyricsWindow.webContents.on("before-input-event", (event, input) => {
    if ((input.control || input.meta) && input.key.toLowerCase() === "r") {
      event.preventDefault();
    }
  });

  desktopLyricsWindow.webContents.on("context-menu", e => {
    e.preventDefault();
  });

  if (process.platform === "win32" && desktopLyricsWindow) {
    // 拦截 WM_INITMENU (0x0116) 消息，阻止系统菜单
    desktopLyricsWindow.hookWindowMessage(0x0116, () => {
      desktopLyricsWindow?.setEnabled(false);
      setTimeout(() => {
        desktopLyricsWindow?.setEnabled(true);
      }, 100);
      return true;
    });
  }

  desktopLyricsWindow.on("moved", persistBoundsDebounced);
  desktopLyricsWindow.on("resized", persistBoundsDebounced);

  desktopLyricsWindow.on("closed", () => {
    desktopLyricsWindow = null;
    isContentReady = false;
  });

  desktopLyricsWindow.webContents.on("did-finish-load", () => {
    isContentReady = true;
    sendContentToWindow();
    applyVisibility();
  });

  const indexPath = path.resolve(__dirname, "../dist/web/index.html");
  void desktopLyricsWindow.loadFile(indexPath, { hash: "desktop-lyrics" });

  return desktopLyricsWindow;
};

/** 销毁桌面歌词窗口并清理保存位置的定时器 */
const destroyDesktopLyricsWindow = () => {
  if (saveBoundsTimer) {
    clearTimeout(saveBoundsTimer);
    saveBoundsTimer = null;
  }

  if (desktopLyricsWindow && !desktopLyricsWindow.isDestroyed()) {
    desktopLyricsWindow.destroy();
  }

  desktopLyricsWindow = null;
  isContentReady = false;
};

/**
 * 应用主窗口同步过来的桌面歌词状态：
 * - 关闭时销毁窗口；开启时按需创建窗口
 * - 锁定状态对应鼠标穿透
 * - 仅在有歌词内容时显示窗口（暂停时保持显示）
 */
export const applyDesktopLyricsPayload = (payload: DesktopLyricsPayload) => {
  lastPayload = payload;

  if (!payload.enabled) {
    destroyDesktopLyricsWindow();
    return;
  }

  if (!desktopLyricsWindow || desktopLyricsWindow.isDestroyed()) {
    createDesktopLyricsWindow();
    return;
  }

  sendContentToWindow();
  applyVisibility();
};

/** 获取最近一次同步的内容快照（页面重载后用于补发） */
export const getLastDesktopLyricsPayload = () => lastPayload;

/** 把窗口重置回默认位置（主屏底部居中） */
export const resetDesktopLyricsPosition = () => {
  if (!desktopLyricsWindow || desktopLyricsWindow.isDestroyed()) return;

  desktopLyricsWindow.setBounds(getDefaultBounds());
  persistBounds();
};

export { createDesktopLyricsWindow, destroyDesktopLyricsWindow };
