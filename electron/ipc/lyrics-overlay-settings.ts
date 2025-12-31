import { ipcMain } from "electron";

import {
  createLyricsOverlaySettings,
  destroyLyricsOverlaySettings,
  lyricsOverlaySettings,
} from "../lyrics-overlay-settings";
import { channel } from "./channel";

export const registerLyricsOverlaySettingsHandlers = () => {
  ipcMain.handle(channel.window.openLyricsOverlaySettings, () => {
    createLyricsOverlaySettings();
  });

  ipcMain.handle(channel.window.closeLyricsOverlaySettings, () => {
    destroyLyricsOverlaySettings();
  });

  ipcMain.handle(channel.window.isLyricsOverlaySettingsOpen, () => {
    return Boolean(lyricsOverlaySettings && !lyricsOverlaySettings.isDestroyed());
  });
};
