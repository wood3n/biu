import type { BrowserWindow } from "electron";

export interface IpcHandlerProps {
  mainWindow: BrowserWindow | null;
  miniWindow: BrowserWindow | null;
}
