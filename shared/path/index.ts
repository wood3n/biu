import path from "node:path";

export const ELECTRON_OUT_DIRNAME = ".electron";
export const ELECTRON_ICON_DIRNAME = "icons";
export const ELECTRON_ICON_BASE_PATH = `${ELECTRON_OUT_DIRNAME}/${ELECTRON_ICON_DIRNAME}`;
export const ELECTRON_OUT_DIR = path.resolve(process.cwd(), ELECTRON_OUT_DIRNAME);
export const ICONS_DST_DIR = path.resolve(process.cwd(), ELECTRON_ICON_BASE_PATH);
