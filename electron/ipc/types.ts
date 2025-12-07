import type { BrowserWindow } from "electron";

export interface IpcHandlerProps {
  getMainWindow: () => BrowserWindow | null;
}
