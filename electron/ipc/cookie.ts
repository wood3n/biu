import { ipcMain, session } from "electron";

import { channel } from "./channel";

export function registerCookieIpcHandlers() {
  ipcMain.handle(channel.cookie.get, async (_, key: string) => {
    const cookies = await session.defaultSession.cookies.get({ name: key });

    return cookies?.[0]?.value;
  });
}
