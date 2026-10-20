import type { IpcHandlerProps } from "./types";

import { registerAppHandlers } from "./app";
import { registerCookieIpcHandlers } from "./cookie";
import { registerDesktopLyricsHandlers } from "./desktop-lyrics";
import { registerDialogHandlers } from "./dialog";
import { registerDownloadHandlers } from "./download";
import { registerFontHandlers } from "./font";
import { registerLocalMusicHandlers } from "./local-music";
import { registerLyricsHandlers } from "./lyrics";
import { registerShortcutHandlers } from "./shortcut";
import { registerStoreHandlers } from "./store";
import { registerWindowHandlers } from "./window";

export function registerIpcHandlers(props: IpcHandlerProps) {
  registerStoreHandlers();
  registerDialogHandlers();
  registerFontHandlers();
  registerDownloadHandlers(props);
  registerAppHandlers();
  registerCookieIpcHandlers();
  registerWindowHandlers(props);
  registerDesktopLyricsHandlers(props);
  registerShortcutHandlers(props);
  registerLyricsHandlers();
  registerLocalMusicHandlers();
}
