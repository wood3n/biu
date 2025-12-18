declare global {
  type ShortcutCommand = "togglePlay" | "prev" | "next" | "volumeUp" | "volumeDown" | "toggleMiniMode" | "toggleLyrics";

  interface ShortcutItem {
    id: ShortcutCommand;
    name: string;
    shortcut: string;
    globalShortcut: string;
  }

  interface ShortcutSettings {
    shortcuts: ShortcutItem[];
    enableGlobalShortcuts: boolean;
  }
}

export {};
