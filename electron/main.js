const path = require("node:path");
const Store = require("electron-store");
const { app, BrowserWindow, nativeImage, ipcMain } = require("electron/main");
// const { createTray } = require("./createTray");

const store = new Store();

let mainWindow;

function createWindow() {
  // 初始打开窗口的配置项
  mainWindow = new BrowserWindow({
    title: "Tune",
    // windows taskbar icon
    icon: path.resolve(process.cwd(), process.platform === "win32" ? "./public/electron/windows_tray.ico" : "./public/electron/macos_dock.png"),
    show: true,
    hasShadow: false,
    width: 1560,
    height: 900,
    minWidth: 1180,
    minHeight: 800,
    resizable: true,
    // 跟随 web 页面大小
    useContentSize: true,
    // 窗口居中
    center: true,
    // 无边框
    frame: true,
    // macos不需要设置frame-false，只需要titleBarStyle即可隐藏边框，因此也不需要自定义窗口操作
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 14, y: 14 },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
  });

  // MAC dock icon
  if (process.platform === "darwin") {
    const dockIcon = nativeImage.createFromPath(path.resolve(process.cwd(), "./public/electron/macos_dock.png"));
    app.dock.setIcon(dockIcon);
  }

  // 设置 windows taskbar 图标的操作栏
  // win.setThumbarButtons([
  //   {
  //     tooltip: '上一首',
  //     icon: path.resolve(process.cwd(), './public/back.png'),
  //     click() {
  //       console.log('button1 clicked');
  //     },
  //   },
  //   {
  //     tooltip: '暂停',
  //     icon: isPlaying
  //       ? path.resolve(process.cwd(), './public/pause.png')
  //       : path.resolve(process.cwd(), './public/play.png'),
  //     click() {
  //       console.log('button1 clicked');
  //     },
  //   },
  //   {
  //     tooltip: '下一首',
  //     icon: path.resolve(process.cwd(), './public/next.png'),
  //     click() {
  //       console.log('button2 clicked.');
  //     },
  //   },
  // ]);

  // windows自定义窗口
  if (process.platform === "win32") {
    ipcMain.handle("isMaximized", () => {
      console.log(mainWindow.isMaximized());
      return mainWindow.isMaximized();
    });
    ipcMain.handle("close-window", () => {
      app.quit();
    });
    ipcMain.handle("min-win", () => mainWindow.minimize());
    ipcMain.handle("resize", () => {
      const bounds = store.get("bounds");
      if (mainWindow.isMaximized()) {
        mainWindow.setBounds(bounds || { width: 800, height: 800 });
      } else {
        store.set("bounds", bounds);
        mainWindow.maximize();
      }
    });
  }

  // https://www.electronjs.org/docs/latest/api/app#appispackaged-readonly
  if (app.isPackaged) {
    mainWindow.loadFile("./dist/web/index.html");
  } else {
    mainWindow.loadURL(`http://localhost:${process.env.PORT}/`);
    mainWindow.webContents.openDevTools({
      mode: "bottom",
    });
  }

  mainWindow.on("close", event => {
    if (app.quitting) {
      mainWindow = null;
    } else {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

app.whenReady().then(() => {
  // createTray({
  //   onClick: () => mainWindow.show(),
  // });

  createWindow();
});

app.on("activate", () => mainWindow.show());

app.on("before-quit", () => {
  app.quitting = true;
});

app.on("window-all-closed", () => {
  // 如果用户不是在 macOS(darwin) 上运行程序，调用 quit 方法在所有窗口关闭后结束 electron 进程
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.disableHardwareAcceleration();
