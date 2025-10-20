import { create } from "zustand";
import { persist } from "zustand/middleware";

import { defaultAppSettings } from "@/common/constants/default-settings";

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
          color: state.color,
          borderRadius: state.borderRadius,
        };
      },
    },
  ),
);
