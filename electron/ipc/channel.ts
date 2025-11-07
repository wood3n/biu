export const channel = {
  store: {
    getSettings: "settings:get",
    setSettings: "settings:set",
    clearSettings: "settings:clear",
  },
  dialog: {
    selectDirectory: "dialog:select-directory",
    openDirectory: "dialog:open-directory",
    openExternal: "dialog:open-external",
  },
  font: {
    getFonts: "font:get-fonts",
  },
  file: {
    getSize: "file:get-size",
  },
  download: {
    checkExists: "download:check-exists",
    start: "start-download",
    progress: "download:progress",
  },
  router: {
    navigate: "router:navigate",
  },
};
