import isDev from "electron-is-dev";
import path from "node:path";

import { ELECTRON_ICON_BASE_PATH } from "@shared/path";

export const IconBase = isDev ? process.cwd() : process.resourcesPath;

export const getWindowIcon = () =>
  process.platform === "darwin"
    ? undefined
    : path.resolve(IconBase, ELECTRON_ICON_BASE_PATH, process.platform === "win32" ? "logo.ico" : "logo.png");
