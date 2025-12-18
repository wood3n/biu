import { globalShortcut, ipcMain } from "electron";

import { channel } from "./channel";

export function registerShortcutHandlers() {
  ipcMain.handle(channel.shortcut.check, (_, accelerator: string) => {
    if (!accelerator) return true;
    try {
      // 尝试注册，如果成功则说明可用
      // 注意：这会暂时占用快捷键，所以需要立即注销
      const isRegistered = globalShortcut.isRegistered(accelerator);
      if (isRegistered) {
        // 如果已经被注册（可能是被我们自己注册的，也可能是其他应用）
        // 但此时我们假设前端已经做过内部冲突检测，所以这里如果是 true，
        // 说明是被 Electron 当前进程占用了（即被我们自己占用了）。
        // 如果是其他应用占用，isRegistered 也是 true 吗？
        // 文档说：isRegistered returns true if this application has registered...
        // 所以如果是其他应用注册了，isRegistered 返回 false。
        // 但是 globalShortcut.register 会返回 false。

        // 如果 isRegistered 为 true，说明是我们自己注册的。
        // 但我们正在修改，所以如果它已经被注册，那肯定是冲突了（或者就是原本的快捷键，但前端应该过滤了这种情况）。
        // 不过为了保险，我们尝试 register。
        return false;
      }

      const ret = globalShortcut.register(accelerator, () => {});
      if (ret) {
        globalShortcut.unregister(accelerator);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });
}
