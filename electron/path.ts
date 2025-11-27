import isDev from "electron-is-dev";

export const IconBase = isDev ? process.cwd() : process.resourcesPath;
