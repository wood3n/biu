import { create } from "zustand";
import { persist } from "zustand/middleware";

import { defaultAppSettings } from "@shared/settings/app-settings";
import { StoreNameMap } from "@shared/store";

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
          const store = await window.electron.getStore(StoreNameMap.AppSettings);

          // 兼容之前的错误默认值
          if (store?.appSettings?.fontFamily === "system-default") {
            store.appSettings.fontFamily = "system-ui";
          }

          console.log("Loaded app settings from store:", JSON.stringify(store));
          const merged = {
            ...defaultAppSettings,
            ...(store?.appSettings ?? {}),
          };
          return {
            state: merged,
          };
        },

        setItem: async (_, value) => {
          if (value.state) {
            await window.electron.setStore(StoreNameMap.AppSettings, {
              appSettings: value.state,
            });
          }
        },

        removeItem: async () => {
          await window.electron.clearStore(StoreNameMap.AppSettings);
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
          lyricsOverlayEnabled: state.lyricsOverlayEnabled,
          lyricsOverlayAutoShow: state.lyricsOverlayAutoShow,
          lyricsProvider: state.lyricsProvider,
          neteaseSearchUrlTemplate: state.neteaseSearchUrlTemplate,
          neteaseLyricUrlTemplate: state.neteaseLyricUrlTemplate,
          lyricsTitleResolverEnabled: state.lyricsTitleResolverEnabled,
          lyricsTitleResolverProvider: state.lyricsTitleResolverProvider,
          lyricsArkApiKey: state.lyricsArkApiKey,
          lyricsArkModel: state.lyricsArkModel,
          lyricsArkEndpoint: state.lyricsArkEndpoint,
          lyricsArkReasoningEffort: state.lyricsArkReasoningEffort,
          lyricsTitleResolverUrlTemplate: state.lyricsTitleResolverUrlTemplate,
          lyricsApiUrlTemplate: state.lyricsApiUrlTemplate,
          lyricsOverlayFontSize: state.lyricsOverlayFontSize,
          lyricsOverlayOpacity: state.lyricsOverlayOpacity,
          lyricsOverlayContentMaxWidth: state.lyricsOverlayContentMaxWidth,
          lyricsOverlayContentHeight: state.lyricsOverlayContentHeight,
          lyricsOverlayWindowWidth: state.lyricsOverlayWindowWidth,
          lyricsOverlayWindowHeight: state.lyricsOverlayWindowHeight,
          lyricsOverlayBackgroundColor: state.lyricsOverlayBackgroundColor,
          lyricsOverlayBackgroundOpacity: state.lyricsOverlayBackgroundOpacity,
          lyricsOverlayFontColor: state.lyricsOverlayFontColor,
          lyricsOverlayFontOpacity: state.lyricsOverlayFontOpacity,
          lyricsOverlayVisibleLines: state.lyricsOverlayVisibleLines,
          lyricsOverlayPanelX: state.lyricsOverlayPanelX,
          lyricsOverlayPanelY: state.lyricsOverlayPanelY,
        };
      },
    },
  ),
);
