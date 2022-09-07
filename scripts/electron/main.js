/*
 * electron 有两个进程，主进程和渲染进程
 * 主进程使用 nodejs 环境，主要用于管理窗口和应用生命周期
 * 渲染进程用于渲染 web 页面，此外还可以定义 preload 程序，用于在渲染进程开始加载 web 前执行：http://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const minWidth = 1280;
  const minHeight = 720;
  // 初始打开窗口的配置项
  const win = new BrowserWindow({
    title: 'rate',
    icon: path.resolve(process.cwd(), './public/electron/music.png'),
    // 先隐藏窗口，等待页面初始化完成后加载
    show: true,
    hasShadow: false,
    width: minWidth,
    height: minHeight,
    minWidth,
    minHeight,
    resizable: true,
    // 跟随 web 页面大小
    useContentSize: true,
    // 窗口居中
    center: true,
    // 无边框
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
  });

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

  // 注册 ipc 事件
  ipcMain.handle('isMaximized', () => {
    console.log(win.isMaximized());
    return win.isMaximized();
  });
  ipcMain.handle('close-window', () => {
    app.quit();
  });
  ipcMain.handle('min-win', () => win.minimize());
  ipcMain.handle('resize', () => win.isMaximized() ? win.setSize(minWidth, minHeight, true) : win.maximize());

  // https://www.electronjs.org/docs/latest/api/app#appispackaged-readonly
  if (app.isPackaged) {
    win.loadFile('./dist/web/index.html');
  } else {
    win.loadURL(`http://localhost:${process.env.PORT}/`);
    win.webContents.openDevTools({
      mode: 'bottom'
    });
  }

  // https://github.com/electron/electron/issues/26726#issuecomment-1143199775
  const WM_INITMENU = 0x0116;
  win.hookWindowMessage(WM_INITMENU, () => {
    win.setEnabled(false);
    win.setEnabled(true);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // 只有当应用程序激活后没有可见窗口时，才能创建新的浏览器窗口，macOS 设定
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // 如果用户不是在 macOS(darwin) 上运行程序，调用 quit 方法在所有窗口关闭后结束 electron 进程
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
