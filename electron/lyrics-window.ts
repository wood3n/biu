import type { Rectangle } from "electron";

import { BrowserWindow, screen } from "electron";
import isDev from "electron-is-dev";
import log from "electron-log";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defaultDesktopLyricsSettings } from "@shared/settings/desktop-lyrics-settings";

import { channel } from "./ipc/channel";
import { desktopLyricsStore } from "./store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** 窗口必须保留在屏幕内的最小可见尺寸 */
const MIN_VISIBLE_SIZE = 60;
/** 允许拖拽调整的最小窗口尺寸 */
const MIN_WIDTH = 360;
const MIN_HEIGHT = 96;
/** 锁定时右上角"解锁"按钮的判定区域（与渲染层的按钮尺寸对应，比按钮略大一点更好点） */
const UNLOCK_BUTTON_WIDTH = 84;
const UNLOCK_BUTTON_HEIGHT = 38;
const UNLOCK_BUTTON_MARGIN = 6;

/** 光标位置轮询间隔（毫秒）：用于判断鼠标是否停留在歌词窗口上 */
const HOVER_POLL_INTERVAL = 120;

let lyricsWindow: BrowserWindow | null = null;
let persistTimer: NodeJS.Timeout | null = null;
let hoverTimer: NodeJS.Timeout | null = null;
let lastHovered: boolean | undefined;
let ignoreMouseActive: boolean | undefined;

export function getDesktopLyricsSettings(): DesktopLyricsSettings {
  const stored = desktopLyricsStore.store;

  if (!stored) return { ...defaultDesktopLyricsSettings };

  return {
    ...defaultDesktopLyricsSettings,
    ...stored,
    bounds: {
      ...defaultDesktopLyricsSettings.bounds,
      ...(stored.bounds ?? {}),
    },
  };
}

/** 向所有窗口广播桌面歌词窗口的显示状态 */
function broadcastVisibility(visible: boolean) {
  BrowserWindow.getAllWindows().forEach(win => {
    if (win.isDestroyed()) return;

    try {
      win.webContents.send(channel.window.lyricsVisibility, visible);
    } catch (error) {
      log.warn("[lyrics-window] broadcast visibility failed:", error);
    }
  });
}

/** 向所有窗口广播锁定状态 */
function broadcastLock(locked: boolean) {
  BrowserWindow.getAllWindows().forEach(win => {
    if (win.isDestroyed()) return;

    try {
      win.webContents.send(channel.window.lyricsLockChange, locked);
    } catch (error) {
      log.warn("[lyrics-window] broadcast lock state failed:", error);
    }
  });
}

/** 窗口矩形是否与任一显示器有足够交集 */
function isBoundsVisible(bounds: Rectangle) {
  return screen.getAllDisplays().some(display => {
    const area = display.workArea;
    const overlapX = Math.min(bounds.x + bounds.width, area.x + area.width) - Math.max(bounds.x, area.x);
    const overlapY = Math.min(bounds.y + bounds.height, area.y + area.height) - Math.max(bounds.y, area.y);

    return overlapX >= MIN_VISIBLE_SIZE && overlapY >= MIN_VISIBLE_SIZE;
  });
}

/**
 * 光标位置轮询：
 * 1. 判断鼠标是否停留在歌词窗口内 —— 不能用渲染层的 mouseenter：整窗是 `-webkit-app-region: drag`
 *    （为了能拖动），拖拽区域会把鼠标事件交给系统处理，渲染层根本收不到 hover，工具栏就永远不显示。
 * 2. 锁定时默认仍然**鼠标穿透**（点击留给下面的内容）；只有当光标落在右上角"解锁"按钮那一块时，
 *    才临时允许鼠标事件，这样既不影响穿透，又能点到解锁按钮。
 */
function startHoverTracking(win: BrowserWindow) {
  stopHoverTracking();

  hoverTimer = setInterval(() => {
    if (!win || win.isDestroyed()) {
      stopHoverTracking();

      return;
    }

    let hovered = false;

    try {
      const point = screen.getCursorScreenPoint();
      const { x, y, width, height } = win.getBounds();

      // 留一点边距，避免贴着边缘时反复抖动
      hovered = point.x >= x - 2 && point.x <= x + width + 2 && point.y >= y - 2 && point.y <= y + height + 2;

      const locked = Boolean(desktopLyricsStore.get("locked"));
      const overUnlockButton =
        locked &&
        hovered &&
        point.x >= x + width - UNLOCK_BUTTON_WIDTH - UNLOCK_BUTTON_MARGIN &&
        point.x <= x + width &&
        point.y >= y &&
        point.y <= y + UNLOCK_BUTTON_HEIGHT + UNLOCK_BUTTON_MARGIN;
      const shouldIgnore = locked && !overUnlockButton;

      if (shouldIgnore !== ignoreMouseActive) {
        ignoreMouseActive = shouldIgnore;
        win.setIgnoreMouseEvents(shouldIgnore, { forward: true });
      }
    } catch {
      hovered = false;
    }

    if (hovered === lastHovered) return;

    lastHovered = hovered;

    try {
      win.webContents.send(channel.window.lyricsHoverChange, hovered);
    } catch (error) {
      log.warn("[lyrics-window] send hover state failed:", error);
    }
  }, HOVER_POLL_INTERVAL);
}

function stopHoverTracking() {
  if (hoverTimer) clearInterval(hoverTimer);

  hoverTimer = null;
  lastHovered = undefined;
}

/** 计算窗口初始位置：优先使用上次记录的位置，否则放在主屏底部居中 */
function resolveBounds(settings: DesktopLyricsSettings): Rectangle {
  const width = Math.max(MIN_WIDTH, Math.round(settings.bounds.width || defaultDesktopLyricsSettings.bounds.width));
  const height = Math.max(MIN_HEIGHT, Math.round(settings.bounds.height || defaultDesktopLyricsSettings.bounds.height));
  const { x, y } = settings.bounds;

  if (typeof x === "number" && typeof y === "number") {
    const saved: Rectangle = { x: Math.round(x), y: Math.round(y), width, height };
    if (isBoundsVisible(saved)) return saved;
  }

  const workArea = screen.getPrimaryDisplay().workArea;

  return {
    x: Math.round(workArea.x + (workArea.width - width) / 2),
    y: Math.round(workArea.y + workArea.height - height - 80),
    width,
    height,
  };
}

function persistBounds() {
  if (!lyricsWindow || lyricsWindow.isDestroyed()) return;

  const { x, y, width, height } = lyricsWindow.getBounds();
  desktopLyricsStore.set("bounds", { x, y, width, height });
}

export function getDesktopLyricsBounds(): Rectangle | undefined {
  if (!lyricsWindow || lyricsWindow.isDestroyed()) return undefined;

  return lyricsWindow.getBounds();
}

/** 拖拽边缘调整大小时的入口：按最小尺寸约束后应用（透明窗口下用渲染层手柄驱动，比原生 resize 可靠） */
export function setDesktopLyricsBounds(next: Partial<Rectangle>) {
  if (!lyricsWindow || lyricsWindow.isDestroyed()) return;

  const current = lyricsWindow.getBounds();
  const width = Math.max(MIN_WIDTH, Math.round(next.width ?? current.width));
  const height = Math.max(MIN_HEIGHT, Math.round(next.height ?? current.height));

  lyricsWindow.setBounds({
    x: Math.round(next.x ?? current.x),
    y: Math.round(next.y ?? current.y),
    width,
    height,
  });
  schedulePersistBounds();
}

function schedulePersistBounds() {
  if (persistTimer) clearTimeout(persistTimer);

  persistTimer = setTimeout(() => {
    persistTimer = null;

    try {
      persistBounds();
    } catch (error) {
      log.warn("[lyrics-window] persist bounds failed:", error);
    }
  }, 400);
}

export function createDesktopLyrics() {
  if (lyricsWindow && !lyricsWindow.isDestroyed()) {
    lyricsWindow.showInactive();
    broadcastVisibility(true);

    return lyricsWindow;
  }

  const settings = getDesktopLyricsSettings();
  const bounds = resolveBounds(settings);

  lyricsWindow = new BrowserWindow({
    ...bounds,
    title: "Biu Desktop Lyrics",
    show: false,
    hasShadow: false,
    minWidth: 360,
    minHeight: 96,
    resizable: true,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    // 无边框 + 透明背景，保证歌词浮在桌面上
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    titleBarOverlay: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: !settings.locked,
    acceptFirstMouse: true,
    roundedCorners: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev,
    },
  });

  lyricsWindow.setAlwaysOnTop(true, "normal");

  if (process.platform === "darwin") {
    lyricsWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  lyricsWindow.setIgnoreMouseEvents(Boolean(settings.locked), { forward: true });
  ignoreMouseActive = Boolean(settings.locked);

  lyricsWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  lyricsWindow.webContents.on("before-input-event", (event, input) => {
    if ((input.control || input.meta) && input.key.toLowerCase() === "r") {
      event.preventDefault();
    }
  });

  lyricsWindow.webContents.on("context-menu", event => {
    event.preventDefault();
  });

  lyricsWindow.once("ready-to-show", () => {
    if (!lyricsWindow || lyricsWindow.isDestroyed()) return;

    // 不抢焦点地显示，避免打断当前正在操作的窗口
    lyricsWindow.showInactive();
    broadcastVisibility(true);
  });

  lyricsWindow.on("moved", schedulePersistBounds);
  lyricsWindow.on("resized", schedulePersistBounds);

  lyricsWindow.on("closed", () => {
    lyricsWindow = null;
    stopHoverTracking();
    desktopLyricsStore.set("visible", false);
    broadcastVisibility(false);
  });

  desktopLyricsStore.set("visible", true);

  // 主进程轮询光标位置来判断 hover，绕开拖拽区域吞事件的问题
  startHoverTracking(lyricsWindow);

  const indexPath = path.resolve(__dirname, "../dist/web/index.html");
  lyricsWindow.loadFile(indexPath, { hash: "desktop-lyrics" });

  return lyricsWindow;
}

export function destroyDesktopLyrics() {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }

  stopHoverTracking();

  if (lyricsWindow && !lyricsWindow.isDestroyed()) {
    lyricsWindow.destroy();
  }

  lyricsWindow = null;
  desktopLyricsStore.set("visible", false);
  broadcastVisibility(false);
}

/** 切换桌面歌词窗口，返回切换后是否显示 */
export function toggleDesktopLyrics() {
  if (lyricsWindow && !lyricsWindow.isDestroyed()) {
    destroyDesktopLyrics();

    return false;
  }

  createDesktopLyrics();

  return true;
}

export function isDesktopLyricsOpen() {
  return Boolean(lyricsWindow && !lyricsWindow.isDestroyed());
}

/** 设置锁定（鼠标穿透）状态 */
export function setDesktopLyricsLocked(locked: boolean) {
  const next = Boolean(locked);

  desktopLyricsStore.set("locked", next);

  if (lyricsWindow && !lyricsWindow.isDestroyed()) {
    try {
      lyricsWindow.setIgnoreMouseEvents(next, { forward: true });
      lyricsWindow.setFocusable(!next);
      ignoreMouseActive = next;
    } catch (error) {
      log.warn("[lyrics-window] apply lock state failed:", error);
    }
  }

  broadcastLock(next);

  return next;
}

/** 仅更新渲染进程可修改的样式设置 */
export function updateDesktopLyricsStyle(style: Partial<DesktopLyricsStyle>) {
  const allowedKeys: (keyof DesktopLyricsStyle)[] = ["background", "fontSize", "opacity", "showTranslation"];

  allowedKeys.forEach(key => {
    const value = style?.[key];
    if (value === undefined) return;

    desktopLyricsStore.set(key, value);
  });

  return getDesktopLyricsSettings();
}
