import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Tab, Tabs } from "@heroui/react";
import { useShallow } from "zustand/react/shallow";

import ScrollContainer from "@/components/scroll-container";
import { useAppUpdateStore } from "@/store/app-update";
import { useSettings } from "@/store/settings";

import MenuSettings from "./menu-settings";
import ShortcutSettingsPage from "./shortcut-settings";
import { SystemSettingsTab } from "./system-settings";

const useSystemSettingsForm = () => {
  const [appVersion, setAppVersion] = useState<string>("");
  const {
    fontFamily,
    backgroundColor,
    contentBackgroundColor,
    primaryColor,
    borderRadius,
    downloadPath,
    closeWindowOption,
    autoStart,
    audioQuality,
    hiddenMenuKeys,
    displayMode,
    ffmpegPath,
    lyricsOverlayEnabled,
    lyricsOverlayAutoShow,
    lyricsProvider,
    neteaseSearchUrlTemplate,
    neteaseLyricUrlTemplate,
    lyricsTitleResolverEnabled,
    lyricsTitleResolverProvider,
    lyricsArkApiKey,
    lyricsArkModel,
    lyricsArkEndpoint,
    lyricsArkReasoningEffort,
    lyricsTitleResolverUrlTemplate,
    lyricsApiUrlTemplate,
    lyricsOverlayFontSize,
    lyricsOverlayOpacity,
    lyricsOverlayContentMaxWidth,
    lyricsOverlayContentHeight,
  } = useSettings(
    useShallow(s => ({
      fontFamily: s.fontFamily,
      backgroundColor: s.backgroundColor,
      contentBackgroundColor: s.contentBackgroundColor,
      primaryColor: s.primaryColor,
      borderRadius: s.borderRadius,
      downloadPath: s.downloadPath,
      closeWindowOption: s.closeWindowOption,
      autoStart: s.autoStart,
      audioQuality: s.audioQuality,
      hiddenMenuKeys: s.hiddenMenuKeys,
      displayMode: s.displayMode,
      ffmpegPath: s.ffmpegPath,
      lyricsOverlayEnabled: s.lyricsOverlayEnabled,
      lyricsOverlayAutoShow: s.lyricsOverlayAutoShow,
      lyricsProvider: s.lyricsProvider,
      neteaseSearchUrlTemplate: s.neteaseSearchUrlTemplate,
      neteaseLyricUrlTemplate: s.neteaseLyricUrlTemplate,
      lyricsTitleResolverEnabled: s.lyricsTitleResolverEnabled,
      lyricsTitleResolverProvider: s.lyricsTitleResolverProvider,
      lyricsArkApiKey: s.lyricsArkApiKey,
      lyricsArkModel: s.lyricsArkModel,
      lyricsArkEndpoint: s.lyricsArkEndpoint,
      lyricsArkReasoningEffort: s.lyricsArkReasoningEffort,
      lyricsTitleResolverUrlTemplate: s.lyricsTitleResolverUrlTemplate,
      lyricsApiUrlTemplate: s.lyricsApiUrlTemplate,
      lyricsOverlayFontSize: s.lyricsOverlayFontSize,
      lyricsOverlayOpacity: s.lyricsOverlayOpacity,
      lyricsOverlayContentMaxWidth: s.lyricsOverlayContentMaxWidth,
      lyricsOverlayContentHeight: s.lyricsOverlayContentHeight,
    })),
  );
  const updateSettings = useSettings(s => s.update);
  const { isUpdateAvailable, latestVersion } = useAppUpdateStore(
    useShallow(s => ({
      isUpdateAvailable: s.isUpdateAvailable ?? false,
      latestVersion: s.latestVersion,
    })),
  );

  const { control, watch, setValue } = useForm<AppSettings>({
    defaultValues: {
      fontFamily,
      backgroundColor,
      contentBackgroundColor,
      primaryColor,
      borderRadius,
      downloadPath,
      closeWindowOption,
      autoStart,
      audioQuality,
      hiddenMenuKeys,
      displayMode,
      ffmpegPath,
      lyricsOverlayEnabled,
      lyricsOverlayAutoShow,
      lyricsProvider,
      neteaseSearchUrlTemplate,
      neteaseLyricUrlTemplate,
      lyricsTitleResolverEnabled,
      lyricsTitleResolverProvider,
      lyricsArkApiKey,
      lyricsArkModel,
      lyricsArkEndpoint,
      lyricsArkReasoningEffort,
      lyricsTitleResolverUrlTemplate,
      lyricsApiUrlTemplate,
      lyricsOverlayFontSize,
      lyricsOverlayOpacity,
      lyricsOverlayContentMaxWidth,
      lyricsOverlayContentHeight,
    },
  });

  useEffect(() => {
    const subscription = watch(values => {
      // @ts-ignore hiddenMenuKeys类型错误，但是实际运行时没有问题
      updateSettings(values);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSettings]);

  useEffect(() => {
    window.electron.getAppVersion().then(v => setAppVersion(v));
  }, []);

  return {
    appVersion,
    audioQuality,
    control,
    isUpdateAvailable,
    latestVersion,
    setValue,
  };
};

const SettingsPage = () => {
  const system = useSystemSettingsForm();

  return (
    <ScrollContainer className="h-full w-full">
      <div className="m-auto mb-6 max-w-[900px] px-8 py-4">
        <div className="space-y-6">
          <h1>设置</h1>
          <Tabs aria-label="设置选项" classNames={{ panel: "px-1 py-0", cursor: "rounded-medium" }}>
            <Tab key="system" title="系统设置">
              <SystemSettingsTab {...system} />
            </Tab>
            <Tab key="menu" title="菜单设置">
              <MenuSettings control={system.control} />
            </Tab>
            <Tab key="shortcut" title="快捷键设置">
              <ShortcutSettingsPage />
            </Tab>
          </Tabs>
        </div>
      </div>
    </ScrollContainer>
  );
};

export default SettingsPage;
