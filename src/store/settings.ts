import { create } from "zustand";
import { persist } from "zustand/middleware";

import { defaultAppSettings } from "@shared/settings/app-settings";

interface SettingsActions {
  getSettings: () => AppSettings;
  update: (patch: Partial<AppSettings>) => void;
  reset: () => void;
}

export const useSettings = create<AppSettings & SettingsActions>()(
  persist(
    (set, get) => ({
      ...defaultAppSettings,
      getSettings: () => {
        return Object.keys(defaultAppSettings).reduce((acc, key) => {
          acc[key] = get()[key];
          return acc;
        }, {} as AppSettings);
      },
      update: (patch: Partial<AppSettings>) => {
        set(patch);
      },
      reset: () => {
        set(defaultAppSettings);
      },
    }),
    {
      name: "settings",
      storage: {
        getItem: async () => {
          const store = await window.electron.getSettings();

          // 兼容之前的错误默认值
          if (store.fontFamily === "system-default") {
            store.fontFamily = "system-ui";
          }

          return {
            state: store,
          };
        },

        setItem: async (_, value) => {
          await window.electron.setSettings(value.state);
        },

        removeItem: async () => {
          await window.electron.clearSettings();
        },
      },
      partialize: state => {
        return {
          downloadPath: state.downloadPath,
          closeWindowOption: state.closeWindowOption,
          autoStart: state.autoStart,
          fontFamily: state.fontFamily,
          backgroundColor: state.backgroundColor,
          contentBackgroundColor: state.contentBackgroundColor,
          primaryColor: state.primaryColor,
          borderRadius: state.borderRadius,
          audioQuality: state.audioQuality,
          hiddenMenuKeys: state.hiddenMenuKeys,
          displayMode: state.displayMode,
        };
      },
    },
  ),
);
