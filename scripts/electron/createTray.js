const {
  Tray,
  nativeImage,
} = require('electron');
const path = require('path');

/**
 * windows 托盘
 * mac 任务栏
 */
let tray;
const createTray = ({
  onClick,
}) => {
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

  tray.addListener('click', onClick);
};

module.exports = {
  tray,
  createTray,
};
