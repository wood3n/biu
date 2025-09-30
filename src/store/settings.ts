import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_FONT_FAMILY } from "@/common/constants/font";

interface SettingsActions {
  update: (patch: Partial<SettingsState>) => void;
  reset: () => void;
}

const defaultSettings: SettingsState = {
  fontFamily: DEFAULT_FONT_FAMILY,
  color: "#17c964",
  borderRadius: 4,
  downloadPath: "",
  closeWindowOption: "hide",
  autoStart: false,
};

export const useSettings = create<SettingsState & SettingsActions>()(
  persist(
    set => ({
      ...defaultSettings,
      update: (patch: Partial<SettingsState>) => {
        set(patch);
      },
      reset: () => {
        set(defaultSettings);
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
