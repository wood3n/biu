/*
 * electron 有两个进程，主进程和渲染进程
 * 主进程使用 nodejs 环境，主要用于管理窗口和应用生命周期
 * 渲染进程用于渲染 web 页面，此外还可以定义 preload 程序，用于在渲染进程开始加载 web 前执行：http://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // 初始打开窗口的配置项
  const win = new BrowserWindow({
    title: 'rate',
    icon: path.resolve(process.cwd(), './public/rate.png'),
    // 先隐藏窗口，等待页面初始化完成后加载
    show: true,
    hasShadow: false,
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    resizable: true,
    // 跟随 web 页面大小
    useContentSize: true,
    // 窗口居中
    center: true,
    // 无边框
    frame: true,
    webPreferences: {},
  });

  win.center();

  const isPlaying = false;

  // 设置 windows taskbar 图标的操作栏
  win.setThumbarButtons([
    {
      tooltip: '上一首',
      icon: path.resolve(process.cwd(), './public/back.png'),
      click() {
        console.log('button1 clicked');
      },
    },
    {
      tooltip: '暂停',
      icon: isPlaying
        ? path.resolve(process.cwd(), './public/pause.png')
        : path.resolve(process.cwd(), './public/play.png'),
      click() {
        console.log('button1 clicked');
      },
    },
    {
      tooltip: '下一首',
      icon: path.resolve(process.cwd(), './public/next.png'),
      click() {
        console.log('button2 clicked.');
      },
    },
  ]);

  // 开发环境监听 vite server 端口，生产环境创建 server
  if (process.env.NODE_ENV === 'development') {
    win.loadURL(`http://localhost:${process.env.PORT}`);
  } else {
    win.loadFile('index.html');
  }

  // 默认打开devtool
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
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
