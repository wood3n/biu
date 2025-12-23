import { desktopCapturer, ipcMain, screen } from "electron";
import * as Jimp from "jimp";

import { channel } from "./channel";

export function initEyeDropperIPC() {
  ipcMain.handle(channel.eyedropper.open, async () => {
    const { x, y } = screen.getCursorScreenPoint();
    const currentScreen = screen.getDisplayNearestPoint({ x, y });
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: {
        width: currentScreen.size.width,
        height: currentScreen.size.height,
      },
    });
    const primarySource = sources.find(source => source.display_id === String(currentScreen.id));
    if (!primarySource) return null;

    const image = primarySource.thumbnail.toPNG();
    // Convert to Jimp image for pixel manipulation
    const jimpImage = await Jimp.read(image);
    // Get the color of the pixel at the cursor position
    const color = jimpImage.getPixelColor(x - currentScreen.bounds.x, y - currentScreen.bounds.y);
    // Convert the color to RGBA components
    const { r, g, b } = Jimp.intToRGBA(color);

    // Return the color in hexadecimal format
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  });
}
