const {
  Tray,
  nativeImage,
  Menu,
} = require('electron');
const path = require('path');

/**
 * windows 托盘
 * mac 任务栏
 */
let tray;
const createTray = () => {
  // mac
  if (process.platform === 'darwin') {
    const trayIcon = nativeImage.createFromPath(path.resolve(process.cwd(), './public/electron/musicTemplate.png'));
    trayIcon.setTemplateImage(true);
    tray = new Tray(trayIcon.resize({ width: 18, height: 18 }));
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Item1', type: 'radio' },
      { label: 'Item2', type: 'radio' },
      { label: 'Item3', type: 'radio', checked: true },
      { label: 'Item4', type: 'radio' },
    ]);
    tray.setContextMenu(contextMenu);
  }

  if (process.platform === 'win32') {
    const trayIcon = nativeImage.createFromPath(path.resolve(process.cwd(), './public/electron/music.png'));
    trayIcon.setTemplateImage(true);
    tray = new Tray(trayIcon);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Item1', type: 'radio' },
      { label: 'Item2', type: 'radio' },
      { label: 'Item3', type: 'radio', checked: true },
      { label: 'Item4', type: 'radio' },
    ]);
    tray.setContextMenu(contextMenu);
  }
};

module.exports = {
  tray,
  createTray,
};
