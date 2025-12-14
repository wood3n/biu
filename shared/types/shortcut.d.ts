export { };

declare global {
  type ShortcutCommand =
    | "togglePlay"
    | "prev"
    | "next"
    | "volumeUp"
    | "volumeDown"
    | "toggleMiniMode"
    | "toggleLike"
    | "toggleLyrics"
    | "translateLyrics";

  interface ShortcutItem {
    id: ShortcutCommand;
    name: string;
    shortcut: string;
    globalShortcut: string;
  }

  interface ShortcutSettings {
    shortcuts: ShortcutItem[];
    enableGlobalShortcuts: boolean;
    useSystemMediaShortcuts: boolean;
  }
}
