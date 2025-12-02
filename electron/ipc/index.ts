import type { IpcHandlerProps } from "./types";

import { registerAppHandlers } from "./app";
import { registerCookieIpcHandlers } from "./cookie";
import { registerDialogHandlers } from "./dialog";
import { registerDownloadHandlers } from "./download";
import { registerFontHandlers } from "./font";
import { registerRequestHandlers } from "./request";
import { registerStoreHandlers } from "./store";
import { registerWindowHandlers } from "./window";

export function registerIpcHandlers(props: IpcHandlerProps) {
  registerStoreHandlers();
  registerDialogHandlers();
  registerFontHandlers();
  registerDownloadHandlers();
  registerRequestHandlers();
  registerAppHandlers();
  registerCookieIpcHandlers();
  registerWindowHandlers(props);
}
