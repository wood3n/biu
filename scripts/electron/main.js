const {
  app,
  BrowserWindow,
  Tray,
  nativeImage,
  ipcMain,
  Menu
} = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();

function createWindow() {
  const minWidth = 960;
  const minHeight = 600;
  // 初始打开窗口的配置项
  const win = new BrowserWindow({
    title: 'rate',
    // windows taskbar icon
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
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // MAC dock icon
  if (process.platform === 'darwin') {
    const dockIcon = nativeImage.createFromPath(path.resolve(process.cwd(), './public/electron/music_832x832.png'));
    app.dock.setIcon(dockIcon);
    const dockMenu = Menu.buildFromTemplate([
      { label: 'Item1', type: 'radio' },
      { label: 'Item2', type: 'radio' },
      { label: 'Item3', type: 'radio', checked: true },
      { label: 'Item4', type: 'radio' }
    ]);
    app.dock.setMenu(dockMenu);
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

  // 注册 ipc 事件
  ipcMain.handle('isMaximized', () => {
    console.log(win.isMaximized());
    return win.isMaximized();
  });
  ipcMain.handle('close-window', () => {
    app.quit();
  });
  ipcMain.handle('min-win', () => win.minimize());
  ipcMain.handle('resize', () => {
    const bounds = store.get('bounds');
    if (win.isMaximized()) {
      win.setBounds(bounds ? bounds : { width: 800, height: 800 });
    } else {
      store.set('bounds', bounds);
      win.maximize();
    }
  });

  // https://www.electronjs.org/docs/latest/api/app#appispackaged-readonly
  if (app.isPackaged) {
    win.loadFile('./dist/web/index.html');
  } else {
    win.loadURL(`http://localhost:${process.env.PORT}/`);
    win.webContents.openDevTools({
      mode: 'right'
    });
  }

  // 隐藏拖动区域右键菜单
  // https://github.com/electron/electron/issues/26726#issuecomment-1143199775
  const WM_INITMENU = 0x0116;
  win.hookWindowMessage(WM_INITMENU, () => {
    win.setEnabled(false);
    win.setEnabled(true);
  });
}

let tray;
app.whenReady().then(() => {
  const trayIcon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAABmklEQVRYCe2WOy8FQRTH15tIqBQa0eloRKG8lU5UGoVKIVqfQOMjSPABPFqdKOhoFAqF4nYSQiREPG7w+yezMebu7p2ZVUjsSX6Z13ntmXN3b5JUUlXgv1egzbMA7eh1gq/+J7of0IBC8XE4hoc1mILBQm/fhwpchy3YBCUTJT1YnYKeKJalqMjGaKVE4DThM3zo+jIl98Bo1zKtfm6+sbyDW3iEabCvdpS1eihTWiXQm2mVJM/s78AhnMMDPIEC30A3pFLYvK0SSJ244xUbuh4lYksfC5XeW2ITUAAF0pNOwIxhmzFIyiSwTqRFGLAi7lpzr2luc3hYD6NjB/cwaVYpk0Czt4id2CtwG+2S2MdwEppDaALvBNg3zJlgL4w1uIZ+CKpqaAILBEgbbZ65pAv0veiAWbNm8JPQBIaMWzXgpJkr8AHojagK/Kps4C19p2tswAXcO/u2jjuvo2u/GVn6yziqCuo6DVnvYR/UF256qyWS0Kdc/ZEr9lcrV4kDVWIZRoqUrDP9Mo5Af0Zerf1qWlWgqsDfq8AXQSx815vwCBUAAAAASUVORK5CYII=');
  trayIcon.setTemplateImage(true);
  tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ]);
  tray.setContextMenu(contextMenu);

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
