declare global {
  type ShortcutCommand = "togglePlay" | "prev" | "next" | "volumeUp" | "volumeDown" | "toggleMiniMode" | "toggleLyrics";

  interface ShortcutItem {
    id: ShortcutCommand;
    name: string;
    shortcut: string;
    isConflict?: boolean;
    error?: string;
  }

  interface ShortcutSettings {
    shortcuts: ShortcutItem[];
    globalShortcuts: ShortcutItem[];
    enableGlobalShortcuts: boolean;
  }
}

export {};
