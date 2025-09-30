import { registerDialogHandlers } from "./dialog.mjs";
import { registerFontHandlers } from "./font.mjs";
import { registerStoreHandlers } from "./store.mjs";

export function registerIpcHandlers({ app }) {
  registerStoreHandlers({ app });
  registerDialogHandlers();
  registerFontHandlers();
}
