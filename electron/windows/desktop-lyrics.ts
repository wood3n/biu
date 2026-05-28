import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Store from "electron-store";

import { channel } from "../ipc/channel"; // we'll use this if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const desktopLyricsStore = new Store({
  name: "desktop-lyrics-settings",
  defaults: {
    bounds: { width: 800, height: 120 }
  }
});

let desktopLyricsWindow: BrowserWindow | null = null;
let isDesktopLyricsLocked = false;

const createDesktopLyricsWindow = () => {
  const savedBounds = desktopLyricsStore.get("bounds") as Electron.Rectangle;

  desktopLyricsWindow = new BrowserWindow({
    title: "Biu Desktop Lyrics",
    show: false, // 阻止初次白屏闪烁
    backgroundColor: '#00000000', // 透明背景
    width: savedBounds?.width || 800,
    height: savedBounds?.height || 120,
    x: savedBounds?.x,
    y: savedBounds?.y,
    resizable: true, // Allow user to resize it horizontally/vertically if needed
    roundedCorners: false,
    center: true,
    frame: false,
    transparent: true,
    hasShadow: false, // Better for lock through without shadow box
    alwaysOnTop: true,
    type: 'toolbar', // Helps with alwaysOnTop on some Linux WMs
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      webSecurity: true,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev,
    },
  });

  desktopLyricsWindow.setAlwaysOnTop(true, "screen-saver"); // Enforce top level

  desktopLyricsWindow.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  desktopLyricsWindow.webContents.on("before-input-event", (event, input) => {
    if ((input.control || input.meta) && input.key.toLowerCase() === "r") {
      event.preventDefault();
    }
  });

  desktopLyricsWindow.webContents.on("context-menu", e => {
    e.preventDefault(); // hide default context menu
  });

  // Load the React route explicitly for desktop-lyrics
  const indexPath = path.resolve(__dirname, "../dist/web/index.html");
  desktopLyricsWindow.loadFile(indexPath, { hash: "desktop-lyrics" });

  desktopLyricsWindow.once("ready-to-show", () => {
    desktopLyricsWindow?.show();
  });
  
  const saveBounds = () => {
    if (desktopLyricsWindow && !desktopLyricsWindow.isDestroyed()) {
      desktopLyricsStore.set("bounds", desktopLyricsWindow.getBounds());
    }
  };

  desktopLyricsWindow.on("moved", saveBounds);
  desktopLyricsWindow.on("resized", saveBounds);
  
  // Set initial lock state
  updateDesktopLyricsLockStatus(false);
};

const destroyDesktopLyricsWindow = () => {
  if (desktopLyricsWindow) {
    if (!desktopLyricsWindow.isDestroyed()) {
      desktopLyricsWindow.destroy();
    }
    desktopLyricsWindow = null;
  }
};

const updateDesktopLyricsLockStatus = (locked: boolean) => {
  isDesktopLyricsLocked = locked;
  if (desktopLyricsWindow && !desktopLyricsWindow.isDestroyed()) {
    desktopLyricsWindow.setIgnoreMouseEvents(locked, { forward: true });
    desktopLyricsWindow.webContents.send(channel.window.onDesktopLyricsLockChange, locked);
  }
};

const toggleDesktopLyricsWindow = () => {
  if (desktopLyricsWindow && !desktopLyricsWindow.isDestroyed()) {
    destroyDesktopLyricsWindow();
  } else {
    createDesktopLyricsWindow();
  }
};

const getDesktopLyricsWindow = () => desktopLyricsWindow;
const getDesktopLyricsLockStatus = () => isDesktopLyricsLocked;

export {
  desktopLyricsWindow,
  createDesktopLyricsWindow,
  destroyDesktopLyricsWindow,
  toggleDesktopLyricsWindow,
  updateDesktopLyricsLockStatus,
  getDesktopLyricsWindow,
  getDesktopLyricsLockStatus,
};
