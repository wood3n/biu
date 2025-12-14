import { create } from "zustand";
import { persist } from "zustand/middleware";

import { tauriAdapter } from "@/utils/tauri-adapter";
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
          // Use the specific getSettings command
          const settings = await tauriAdapter.getSettings();

          if (settings?.fontFamily === "system-default") {
            settings.fontFamily = "system-ui";
          }

          // Return the settings object directly as the state
          return {
            state: settings,
          };
        },

        setItem: async (_, value) => {
          await tauriAdapter.setSettings(value.state);
        },

        removeItem: async () => {
          await tauriAdapter.clearSettings();
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
          ffmpegPath: state.ffmpegPath,
        };
      },
    },
  ),
);
