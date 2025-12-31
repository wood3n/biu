import type { IpcHandlerProps } from "./types";

import { registerAppHandlers } from "./app";
import { registerCookieIpcHandlers } from "./cookie";
import { registerDialogHandlers } from "./dialog";
import { registerDownloadHandlers } from "./download";
import { registerFontHandlers } from "./font";
import { registerLyricsHandlers } from "./lyrics";
import { registerLyricsOverlayHandlers } from "./lyrics-overlay";
import { registerLyricsOverlaySettingsHandlers } from "./lyrics-overlay-settings";
import { registerShortcutHandlers } from "./shortcut";
import { registerStoreHandlers } from "./store";
import { registerWindowHandlers } from "./window";

export function registerIpcHandlers(props: IpcHandlerProps) {
  registerStoreHandlers();
  registerDialogHandlers();
  registerFontHandlers();
  registerDownloadHandlers(props);
  registerLyricsHandlers();
  registerAppHandlers();
  registerCookieIpcHandlers();
  registerWindowHandlers(props);
  registerShortcutHandlers(props);
  registerLyricsOverlayHandlers();
  registerLyricsOverlaySettingsHandlers();
}
