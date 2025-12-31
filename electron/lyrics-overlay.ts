import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { appSettingsStore, storeKey } from "./store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let lyricsOverlay: BrowserWindow | null = null;
let saveBoundsTimer: NodeJS.Timeout | null = null;

const createLyricsOverlay = () => {
  if (lyricsOverlay && !lyricsOverlay.isDestroyed()) {
    lyricsOverlay.show();
    lyricsOverlay.focus();
    return lyricsOverlay;
  }

  lyricsOverlay = new BrowserWindow({
    title: "Biu Lyrics Overlay",
    show: true,
    hasShadow: true,
    width: appSettingsStore.get(storeKey.appSettings).lyricsOverlayWindowWidth || 900,
    height: appSettingsStore.get(storeKey.appSettings).lyricsOverlayWindowHeight || 180,
    resizable: true,
    roundedCorners: true,
    center: false,
    frame: false,
    transparent: true,
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

  lyricsOverlay.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  lyricsOverlay.webContents.on("before-input-event", (event, input) => {
    if ((input.control || input.meta) && input.key.toLowerCase() === "r") {
      event.preventDefault();
    }
  });

  lyricsOverlay.webContents.on("context-menu", e => {
    e.preventDefault();
  });

  if (process.platform === "win32") {
    lyricsOverlay.hookWindowMessage(0x0116, () => {
      lyricsOverlay?.setEnabled(false);
      setTimeout(() => {
        lyricsOverlay?.setEnabled(true);
      }, 100);
      return true;
    });
  }

  const indexPath = path.resolve(__dirname, "../dist/web/index.html");
  lyricsOverlay.loadFile(indexPath, { hash: "lyrics-overlay" });

  lyricsOverlay.on("closed", () => {
    lyricsOverlay = null;
  });

  lyricsOverlay.on("resize", () => {
    if (!lyricsOverlay || lyricsOverlay.isDestroyed()) return;
    if (saveBoundsTimer) clearTimeout(saveBoundsTimer);
    saveBoundsTimer = setTimeout(() => {
      if (!lyricsOverlay || lyricsOverlay.isDestroyed()) return;
      const { width, height } = lyricsOverlay.getBounds();
      const current = appSettingsStore.get(storeKey.appSettings);
      appSettingsStore.set(storeKey.appSettings, {
        ...current,
        lyricsOverlayWindowWidth: width,
        lyricsOverlayWindowHeight: height,
      });
      saveBoundsTimer = null;
    }, 300);
  });

  return lyricsOverlay;
};

const destroyLyricsOverlay = () => {
  if (lyricsOverlay) {
    if (!lyricsOverlay.isDestroyed()) {
      lyricsOverlay.destroy();
    }
    lyricsOverlay = null;
  }
};

export { lyricsOverlay, createLyricsOverlay, destroyLyricsOverlay };
