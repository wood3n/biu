/** 桌面实时材质：Win11 亚克力 / macOS vibrancy；其它平台没有系统材质，底板只能由页面画 */
export type DesktopMaterial = "acrylic" | "vibrancy" | "none";

/** Win11 的起始内部版本号，22000 之前（Win10）DWM 没有 Acrylic */
const WINDOWS_11_BUILD = 22000;

function windowsBuild(): number {
  // getSystemVersion 在 Windows 上形如 "10.0.22631"，第三段才是 build
  return Number(process.getSystemVersion().split(".")[2] ?? 0);
}

export function getDesktopMaterial(): DesktopMaterial {
  if (process.platform === "win32") {
    return windowsBuild() >= WINDOWS_11_BUILD ? "acrylic" : "none";
  }
  if (process.platform === "darwin") return "vibrancy";
  return "none";
}
