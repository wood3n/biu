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
  http: {
    get: "http:get",
    post: "http:post",
  },
  player: {
    state: "player:state",
    prev: "player:prev",
    next: "player:next",
    toggle: "player:toggle",
  },
  app: {
    getVersion: "app:get-version",
    checkUpdate: "app:check-update",
    downloadUpdate: "app:download-update",
    updateMessage: "app:update-message",
    quitAndInstall: "app:quit-and-install",
  },
  cookie: {
    get: "cookie:get",
    setLoginCookies: "cookie:set-login-cookies",
  },
  window: {
    switchToMini: "window:switch-to-mini",
    switchToMain: "window:switch-to-main",
    minimize: "window:minimize",
    toggleMaximize: "window:toggle-maximize",
    close: "window:close",
    maximize: "window:maximize",
    unmaximize: "window:unmaximize",
    isMaximized: "window:is-maximized",
    enterFullScreen: "window:enter-full-screen",
    leaveFullScreen: "window:leave-full-screen",
    isFullScreen: "window:is-full-screen",
  },
};
