const {
  Tray,
  nativeImage,
  Menu
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
  }

  if (process.platform === 'win32') {
    const trayIcon = nativeImage.createFromPath(path.resolve(process.cwd(), './public/electron/music.ico'));
    trayIcon.setTemplateImage(true);
    tray = new Tray(trayIcon);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Item1', type: 'radio' },
      { label: 'Item2', type: 'radio' },
      { label: 'Item3', type: 'radio', checked: true },
      { label: 'Item4', type: 'radio' }
    ]);
    tray.setContextMenu(contextMenu);
  }
};

module.exports = createTray;