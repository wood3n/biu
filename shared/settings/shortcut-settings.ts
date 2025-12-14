export const defaultShortcutSettings: ShortcutSettings = {
  enableGlobalShortcuts: true,
  useSystemMediaShortcuts: true,
  shortcuts: [
    {
      id: "togglePlay",
      name: "播放/暂停",
      shortcut: "CommandOrControl+P",
      globalShortcut: "CommandOrControl+Alt+P",
    },
    {
      id: "prev",
      name: "上一首",
      shortcut: "CommandOrControl+Left",
      globalShortcut: "CommandOrControl+Alt+Left",
    },
    {
      id: "next",
      name: "下一首",
      shortcut: "CommandOrControl+Right",
      globalShortcut: "CommandOrControl+Alt+Right",
    },
    {
      id: "volumeUp",
      name: "音量加",
      shortcut: "CommandOrControl+Up",
      globalShortcut: "CommandOrControl+Alt+Up",
    },
    {
      id: "volumeDown",
      name: "音量减",
      shortcut: "CommandOrControl+Down",
      globalShortcut: "CommandOrControl+Alt+Down",
    },
    {
      id: "toggleMiniMode",
      name: "mini/完整模式",
      shortcut: "CommandOrControl+M",
      globalShortcut: "CommandOrControl+Alt+M",
    },
    {
      id: "toggleLike",
      name: "喜欢歌曲",
      shortcut: "CommandOrControl+L",
      globalShortcut: "CommandOrControl+Alt+L",
    },
    {
      id: "toggleLyrics",
      name: "打开/关闭歌词",
      shortcut: "CommandOrControl+D",
      globalShortcut: "CommandOrControl+Alt+D",
    },
    {
      id: "translateLyrics",
      name: "翻译当前歌词",
      shortcut: "CommandOrControl+T",
      globalShortcut: "",
    },
  ],
};
