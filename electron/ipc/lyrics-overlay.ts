import { ipcMain } from "electron";

import { createLyricsOverlay, destroyLyricsOverlay, lyricsOverlay } from "../lyrics-overlay";
import { channel } from "./channel";

export const registerLyricsOverlayHandlers = () => {
  ipcMain.handle(channel.window.openLyricsOverlay, () => {
    createLyricsOverlay();
  });

  ipcMain.handle(channel.window.closeLyricsOverlay, () => {
    destroyLyricsOverlay();
  });

  ipcMain.handle(channel.window.isLyricsOverlayOpen, () => {
    return Boolean(lyricsOverlay && !lyricsOverlay.isDestroyed());
  });

  ipcMain.handle(channel.window.getLyricsOverlayBounds, () => {
    if (!lyricsOverlay || lyricsOverlay.isDestroyed()) return null;
    const { x, y, width, height } = lyricsOverlay.getBounds();
    return { x, y, width, height };
  });

  ipcMain.handle(
    channel.window.setLyricsOverlayBounds,
    (_evt, bounds: { width?: number; height?: number; x?: number; y?: number }) => {
      const win = createLyricsOverlay();
      const current = win.getBounds();
      const next = {
        x: typeof bounds?.x === "number" ? bounds.x : current.x,
        y: typeof bounds?.y === "number" ? bounds.y : current.y,
        width: typeof bounds?.width === "number" ? bounds.width : current.width,
        height: typeof bounds?.height === "number" ? bounds.height : current.height,
      };
      win.setBounds(next, true);
      return next;
    },
  );
};
