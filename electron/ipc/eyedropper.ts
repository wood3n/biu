import { desktopCapturer, ipcMain, screen } from "electron";
import * as Jimp from "jimp";

import { channel } from "./channel";

export function initEyeDropperIPC() {
  ipcMain.handle(channel.eyedropper.open, () => {
    return new Promise((resolve, reject) => {
      const pickerWindow = new BrowserWindow({
        transparent: true,
        frame: false,
        fullscreen: true,
        skipTaskbar: true,
        alwaysOnTop: true,
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
      });

      const cleanup = () => {
        ipcMain.removeListener("eyedropper-pick", onPick);
        ipcMain.removeListener("eyedropper-cancel", onCancel);
        if (pickerWindow && !pickerWindow.isDestroyed()) {
          pickerWindow.close();
        }
      };

      const onPick = async () => {
        try {
          const { x, y } = screen.getCursorScreenPoint();
          const display = screen.getDisplayNearestPoint({ x, y });
          const sources = await desktopCapturer.getSources({
            types: ["screen"],
            thumbnailSize: display.size,
          });
          const source = sources.find(s => s.display_id === String(display.id));

          if (!source) {
            reject(new Error("Cannot find screen source"));
            return;
          }

          const image = source.thumbnail.toPNG();
          const jimpImage = await Jimp.read(image);
          const color = jimpImage.getPixelColor(x - display.bounds.x, y - display.bounds.y);
          const { r, g, b } = Jimp.intToRGBA(color);
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          resolve(hex);
        } catch (e) {
          reject(e);
        } finally {
          cleanup();
        }
      };

      const onCancel = () => {
        cleanup();
        reject(new Error("Color picking cancelled"));
      };

      ipcMain.once("eyedropper-pick", onPick);
      ipcMain.once("eyedropper-cancel", onCancel);
      pickerWindow.on("close", onCancel);

      const script = `
        const { ipcRenderer } = require('electron');
        document.body.style.cursor = 'crosshair';

        document.addEventListener('click', () => {
          ipcRenderer.send('eyedropper-pick');
        }, { once: true });

        document.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          ipcRenderer.send('eyedropper-cancel');
        }, { once: true });

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            ipcRenderer.send('eyedropper-cancel');
          }
        }, { once: true });
      `;

      pickerWindow.loadURL('data:text/html,<body style="background-color: rgba(0,0,0,0.001);"></body>');
      pickerWindow.webContents.on("did-finish-load", () => {
        pickerWindow.webContents.executeJavaScript(script);
        pickerWindow.show();
      });
    });
  });
}
