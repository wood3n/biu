import { BrowserWindow, screen } from "electron";
import isDev from "electron-is-dev";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { appSettingsStore, desktopLyricsStore } from "./store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 歌词条窗口高度：需容纳双行模式下的两行字号上限（60px × 1.3 行高 × 2）+ 悬停工具条（28px + 间距）
 * + 内边距，再加底部留白 40px —— 字下那圈柔光是 `0 8px 22px`，要向下铺约 30px，
 * 留白不足会被窗口下边缘切掉（透明窗画不到窗外）。
 */
const LYRICS_WINDOW_HEIGHT = 244;

/**
 * 窗口宽度 = 屏幕工作区 × 用户设的百分比。刻意不再铺满整屏：
 * 铺满时那圈透明区既在桌面上留下一条看不见的横带，文字又只能靠内部裁切框限宽，
 * 裁切框必然切到滚动中的字与投影。窗口即歌词栏，留白才有的可谈。
 */
const MIN_LYRICS_WINDOW_WIDTH = 520;
/** 与渲染层 SHADOW_GUTTER 一致：窗口两侧各留出描边+柔光的绘制空间 */
const SHADOW_GUTTER = 32;

let widthPercent = 70;

const lyricsWindowWidth = () => {
  const { workArea } = screen.getPrimaryDisplay();
  return Math.max(
    MIN_LYRICS_WINDOW_WIDTH,
    Math.min(workArea.width, Math.round((workArea.width * widthPercent) / 100) + SHADOW_GUTTER * 2),
  );
};

let desktopLyrics: BrowserWindow | null = null;

/** 渲染层上报：指针当前是否正落在歌词胶囊上 */
let isPointerOnLyrics = false;

/**
 * 锁定态由渲染层显式下发，不在此处回读 app-settings：
 * zustand 的持久化写入是异步的，创建/切换后立即回读会拿到旧值。
 */
let isLocked = false;

const getLyricsWindow = () => {
  if (desktopLyrics && !desktopLyrics.isDestroyed()) return desktopLyrics;
  return null;
};

/**
 * 鼠标穿透策略：
 * - 锁定：整条永久穿透，歌词条完全不接收鼠标事件；
 * - 未锁定：默认穿透并转发 mousemove，指针进入歌词胶囊时临时取消穿透，
 *   于是整条覆盖带不挡住桌面与任务栏点击，歌词本身仍可拖动、可点工具按钮。
 */
const applyMouseMode = () => {
  const win = getLyricsWindow();
  if (!win) return;

  if (isLocked) {
    win.setIgnoreMouseEvents(true);
    return;
  }

  win.setIgnoreMouseEvents(!isPointerOnLyrics, { forward: true });
};

const createDesktopLyrics = () => {
  if (getLyricsWindow()) return;

  const { workArea } = screen.getPrimaryDisplay();
  const saved = desktopLyricsStore.get("bounds");

  const settings = appSettingsStore.get("appSettings");
  isLocked = Boolean(settings?.desktopLyricsLocked);
  widthPercent = clampWidthPercent(settings?.desktopLyricsWidth);

  const width = lyricsWindowWidth();

  // 显示器变化后保存的坐标可能落到屏幕外，钳回工作区
  const x = Math.min(
    Math.max(saved?.x ?? workArea.x + Math.round((workArea.width - width) / 2), workArea.x),
    workArea.x + workArea.width - width,
  );
  const y = Math.min(
    Math.max(saved?.y ?? workArea.y + workArea.height - LYRICS_WINDOW_HEIGHT - 24, workArea.y),
    workArea.y + workArea.height - LYRICS_WINDOW_HEIGHT,
  );

  desktopLyrics = new BrowserWindow({
    title: "Biu Desktop Lyrics",
    width,
    height: LYRICS_WINDOW_HEIGHT,
    x,
    y,
    show: false,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    // 抢焦点会打断用户正在输入的内容，歌词条只需要鼠标
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev,
      spellcheck: false,
    },
  });

  const win = desktopLyrics;

  // 高于普通置顶窗口，避免被其他 alwaysOnTop 窗口遮挡
  win.setAlwaysOnTop(true, "screen-saver");

  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  win.webContents.on("before-input-event", (event, input) => {
    if ((input.control || input.meta) && input.key.toLowerCase() === "r") {
      event.preventDefault();
    }
  });

  win.webContents.on("context-menu", event => {
    event.preventDefault();
  });

  let saveTimer: NodeJS.Timeout | null = null;
  win.on("moved", () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const [currentX, currentY] = win.getPosition();
      desktopLyricsStore.set("bounds", { x: currentX, y: currentY });
    }, 400);
  });

  win.on("closed", () => {
    if (saveTimer) clearTimeout(saveTimer);
    desktopLyrics = null;
    isPointerOnLyrics = false;
  });

  win.once("ready-to-show", () => {
    win.show();
    applyMouseMode();
  });

  const indexPath = path.resolve(__dirname, "../dist/web/index.html");
  win.loadFile(indexPath, { hash: "desktop-lyrics" });
};

const destroyDesktopLyrics = () => {
  const win = getLyricsWindow();
  if (win) {
    win.destroy();
  }
  desktopLyrics = null;
  isPointerOnLyrics = false;
};

const setDesktopLyricsVisible = (visible: boolean) => {
  if (visible) {
    createDesktopLyrics();
  } else {
    destroyDesktopLyrics();
  }
};

const setDesktopLyricsLocked = (locked: boolean) => {
  isLocked = locked;
  applyMouseMode();
};

function clampWidthPercent(value: number | undefined) {
  if (!Number.isFinite(value)) return 70;
  return Math.min(95, Math.max(30, Math.round((value as number) / 5) * 5));
}

/**
 * 宽度设置变化：改窗口宽度，水平中心保持不动（用户拖到哪儿就还在哪儿）。
 * 窗口即歌词栏，所以这里变宽/变窄直接就是「一行最多吃掉多少屏幕」。
 */
const setDesktopLyricsWidth = (percent: number) => {
  const next = clampWidthPercent(percent);
  if (next === widthPercent) return;

  widthPercent = next;

  const win = getLyricsWindow();
  if (!win) return;

  const { workArea } = screen.getPrimaryDisplay();
  const [currentX, currentY] = win.getPosition();
  const [oldWidth] = win.getSize();
  const width = lyricsWindowWidth();
  const centerX = currentX + oldWidth / 2;
  const x = Math.min(Math.max(Math.round(centerX - width / 2), workArea.x), workArea.x + workArea.width - width);

  win.setBounds({ x, y: currentY, width, height: LYRICS_WINDOW_HEIGHT });
  desktopLyricsStore.set("bounds", { x, y: currentY });
};

const setDesktopLyricsInteractive = (interactive: boolean) => {
  isPointerOnLyrics = interactive;
  applyMouseMode();
};

/** 启动时按上次的开关恢复歌词条 */
const restoreDesktopLyrics = () => {
  if (appSettingsStore.get("appSettings")?.desktopLyricsEnabled) {
    createDesktopLyrics();
  }
};

export {
  destroyDesktopLyrics,
  setDesktopLyricsVisible,
  setDesktopLyricsLocked,
  setDesktopLyricsWidth,
  setDesktopLyricsInteractive,
  restoreDesktopLyrics,
};
