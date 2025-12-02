import { create } from "zustand";
import { persist } from "zustand/middleware";

import { defaultAppSettings } from "@shared/settings/app-settings";

interface SettingsActions {
  update: (patch: Partial<AppSettings>) => void;
  reset: () => void;
}

export const useSettings = create<AppSettings & SettingsActions>()(
  persist(
    set => ({
      ...defaultAppSettings,
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
          appUpdate: state.appUpdate,
          audioQuality: state.audioQuality,
        };
      },
    },
  ),
);
