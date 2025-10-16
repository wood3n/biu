import { registerDialogHandlers } from "./dialog.mjs";
import { registerDownloadHandlers } from "./download.mjs";
import { registerFontHandlers } from "./font.mjs";
import { registerStoreHandlers } from "./store.mjs";

export function registerIpcHandlers({ app }) {
  registerStoreHandlers({ app });
  registerDialogHandlers();
  registerFontHandlers();
  registerDownloadHandlers();
}
