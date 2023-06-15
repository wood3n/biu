const {
  Tray,
  nativeImage,
} = require('electron');
const trayWindow = require('electron-tray-window');
const path = require('path');

/**
 * windows 托盘
 * mac 任务栏
 */
let tray;
const createTray = () => {
  // mac
  if (process.platform === 'darwin') {
    const trayIcon = nativeImage.createFromPath(path.resolve(process.cwd(), './public/electron/mac_trayTemplate.png'));
    trayIcon.setTemplateImage(true);
    tray = new Tray(trayIcon);
  }

  if (process.platform === 'win32') {
    const trayIcon = nativeImage.createFromPath(path.resolve(process.cwd(), './public/electron/windows_tray.ico'));
    trayIcon.setTemplateImage(true);
    tray = new Tray(trayIcon);
  }

  trayWindow.setOptions({
    tray,
    windowUrl: `file://${path.join(__dirname, './tray.html')}`,
    width: 280,
    height: 120,
  });
};

module.exports = {
  tray,
  createTray,
};
