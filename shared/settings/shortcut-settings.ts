export const defaultShortcutSettings: ShortcutSettings = {
  enableGlobalShortcuts: true,
  shortcuts: [
    {
      id: "togglePlay",
      name: "播放/暂停",
      shortcut: "CommandOrControl+P",
    },
    {
      id: "prev",
      name: "上一首",
      shortcut: "CommandOrControl+Left",
    },
    {
      id: "next",
      name: "下一首",
      shortcut: "CommandOrControl+Right",
    },
    {
      id: "volumeUp",
      name: "音量加",
      shortcut: "CommandOrControl+Up",
    },
    {
      id: "volumeDown",
      name: "音量减",
      shortcut: "CommandOrControl+Down",
    },
    {
      id: "toggleMiniMode",
      name: "切换mini/完整模式",
      shortcut: "CommandOrControl+M",
    },
  ],
  globalShortcuts: [
    {
      id: "togglePlay",
      name: "播放/暂停",
      shortcut: "CommandOrControl+Alt+P",
    },
    {
      id: "prev",
      name: "上一首",
      shortcut: "CommandOrControl+Alt+Left",
    },
    {
      id: "next",
      name: "下一首",
      shortcut: "CommandOrControl+Alt+Right",
    },
    {
      id: "volumeUp",
      name: "音量加",
      shortcut: "CommandOrControl+Alt+Up",
    },
    {
      id: "volumeDown",
      name: "音量减",
      shortcut: "CommandOrControl+Alt+Down",
    },
    {
      id: "toggleMiniMode",
      name: "切换mini/完整模式",
      shortcut: "CommandOrControl+Alt+M",
    },
  ],
};
