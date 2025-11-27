import { registerAppHandlers } from "./app";
import { registerDialogHandlers } from "./dialog";
import { registerDownloadHandlers } from "./download";
import { registerFontHandlers } from "./font";
import { registerRequestHandlers } from "./request";
import { registerStoreHandlers } from "./store";

export function registerIpcHandlers() {
  registerStoreHandlers();
  registerDialogHandlers();
  registerFontHandlers();
  registerDownloadHandlers();
  registerRequestHandlers();
  registerAppHandlers();
}
