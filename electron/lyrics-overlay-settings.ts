import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { channel } from "./ipc/channel";
import { appSettingsStore, storeKey } from "./store";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let lyricsOverlaySettings: BrowserWindow | null = null;
let savePositionTimer: NodeJS.Timeout | null = null;

const notifySettingsShown = () => {
  if (!lyricsOverlaySettings || lyricsOverlaySettings.isDestroyed()) return;
  console.log("lyricsOverlaySettings is not destroyed");
  lyricsOverlaySettings.webContents.send(channel.window.lyricsOverlaySettingsShow);
};

const createLyricsOverlaySettings = () => {
  if (lyricsOverlaySettings && !lyricsOverlaySettings.isDestroyed()) {
    lyricsOverlaySettings.show();
    lyricsOverlaySettings.focus();
    notifySettingsShown();
    return lyricsOverlaySettings;
  }

  const settings = appSettingsStore.get(storeKey.appSettings);

  lyricsOverlaySettings = new BrowserWindow({
    title: "Biu Lyrics Settings",
    show: true,
    width: 420,
    height: 320,
    x: Number.isFinite(settings.lyricsOverlayPanelX) ? settings.lyricsOverlayPanelX : undefined,
    y: Number.isFinite(settings.lyricsOverlayPanelY) ? settings.lyricsOverlayPanelY : undefined,
    resizable: false,
    roundedCorners: true,
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

  lyricsOverlaySettings.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  lyricsOverlaySettings.webContents.on("before-input-event", (event, input) => {
    if ((input.control || input.meta) && input.key.toLowerCase() === "r") {
      event.preventDefault();
    }
  });

  lyricsOverlaySettings.webContents.on("context-menu", e => {
    e.preventDefault();
  });

  lyricsOverlaySettings.webContents.on("did-finish-load", () => {
    notifySettingsShown();
  });

  const indexPath = path.resolve(__dirname, "../dist/web/index.html");
  lyricsOverlaySettings.loadFile(indexPath, { hash: "lyrics-overlay-settings" });

  lyricsOverlaySettings.on("closed", () => {
    lyricsOverlaySettings = null;
  });

  lyricsOverlaySettings.on("show", () => {
    notifySettingsShown();
  });

  lyricsOverlaySettings.on("move", () => {
    if (!lyricsOverlaySettings || lyricsOverlaySettings.isDestroyed()) return;
    if (savePositionTimer) clearTimeout(savePositionTimer);
    savePositionTimer = setTimeout(() => {
      if (!lyricsOverlaySettings || lyricsOverlaySettings.isDestroyed()) return;
      const { x, y } = lyricsOverlaySettings.getBounds();
      const current = appSettingsStore.get(storeKey.appSettings);
      appSettingsStore.set(storeKey.appSettings, {
        ...current,
        lyricsOverlayPanelX: x,
        lyricsOverlayPanelY: y,
      });
      savePositionTimer = null;
    }, 300);
  });

  return lyricsOverlaySettings;
};

const destroyLyricsOverlaySettings = () => {
  if (lyricsOverlaySettings) {
    if (!lyricsOverlaySettings.isDestroyed()) {
      lyricsOverlaySettings.destroy();
    }
    lyricsOverlaySettings = null;
  }
};

export { lyricsOverlaySettings, createLyricsOverlaySettings, destroyLyricsOverlaySettings };
