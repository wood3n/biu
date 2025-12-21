import { ipcMain, session } from "electron";

import { channel } from "./channel";

export function registerCookieIpcHandlers() {
  ipcMain.handle(channel.cookie.get, async (_, key: string) => {
    const cookies = await session.defaultSession.cookies.get({ name: key, domain: ".bilibili.com" });

    return cookies?.[0]?.value;
  });

  ipcMain.handle(
    channel.cookie.set,
    async (_, { name, value, expirationDate }: { name: string; value: string; expirationDate?: number }) => {
      await session.defaultSession.cookies.set({
        url: "https://bilibili.com/",
        domain: ".bilibili.com",
        path: "/",
        name,
        value,
        secure: true,
        sameSite: "no_restriction",
        httpOnly: false,
        expirationDate,
      });

      await session.defaultSession.cookies.flushStore();
    },
  );
}
