import { create } from "zustand";
import { persist } from "zustand/middleware";

import { defaultShortcutSettings } from "@shared/settings/shortcut-settings";

interface ShortcutActions {
  getSettings: () => ShortcutSettings;
  update: (patch: Partial<ShortcutSettings>) => void;
  reset: () => void;
}

export const useShortcutSettings = create<ShortcutSettings & ShortcutActions>()(
  persist(
    (set, get) => ({
      ...defaultShortcutSettings,
      getSettings: () => {
        return {
          shortcuts: get().shortcuts,
          enableGlobalShortcuts: get().enableGlobalShortcuts,
          useSystemMediaShortcuts: get().useSystemMediaShortcuts,
        };
      },
      update: (patch: Partial<ShortcutSettings>) => {
        set(patch);
      },
      reset: () => {
        set(defaultShortcutSettings);
      },
    }),
    {
      name: "shortcut-settings",
      storage: {
        getItem: async () => {
          const store = await window.electron.getStore<{ shortcutSettings: ShortcutSettings }>("shortcut-settings");
          return {
            state: store?.shortcutSettings || defaultShortcutSettings,
          };
        },

        setItem: async (_, value) => {
          await window.electron.setStore("shortcut-settings", {
            shortcutSettings: value.state,
          });
        },

        removeItem: async () => {
          await window.electron.clearStore("shortcut-settings");
        },
      },
    },
  ),
);
