import { ipcMain } from "electron";
import { getFonts2 } from "font-list";

import { channel } from "./channel";

export function registerFontHandlers() {
  ipcMain.handle(channel.font.getFonts, async () => {
    return getFonts2();
  });
}
