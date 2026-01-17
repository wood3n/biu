import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Tab, Tabs } from "@heroui/react";
import { useShallow } from "zustand/react/shallow";

import ScrollContainer from "@/components/scroll-container";
import { useAppUpdateStore } from "@/store/app-update";
import { useSettings } from "@/store/settings";

import MenuSettings from "./menu-settings";
import ProxySettings from "./proxy-settings";
import ShortcutSettingsPage from "./shortcut-settings";
import { SystemSettingsTab } from "./system-settings";

const useSystemSettingsForm = () => {
  const [appVersion, setAppVersion] = useState<string>("");
  const {
    fontFamily,
    primaryColor,
    backgroundColor,
    borderRadius,
    downloadPath,
    closeWindowOption,
    autoStart,
    audioQuality,
    hiddenMenuKeys,
    displayMode,
    ffmpegPath,
    themeMode,
    pageTransition,
    showSearchHistory,
    proxySettings,
    reportPlayHistory,
  } = useSettings(
    useShallow(s => ({
      fontFamily: s.fontFamily,
      primaryColor: s.primaryColor,
      backgroundColor: s.backgroundColor,
      borderRadius: s.borderRadius,
      downloadPath: s.downloadPath,
      closeWindowOption: s.closeWindowOption,
      autoStart: s.autoStart,
      audioQuality: s.audioQuality,
      hiddenMenuKeys: s.hiddenMenuKeys,
      displayMode: s.displayMode,
      ffmpegPath: s.ffmpegPath,
      themeMode: s.themeMode,
      pageTransition: s.pageTransition,
      showSearchHistory: s.showSearchHistory,
      proxySettings: s.proxySettings,
      reportPlayHistory: s.reportPlayHistory,
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
      primaryColor,
      backgroundColor,
      borderRadius,
      downloadPath,
      closeWindowOption,
      autoStart,
      audioQuality,
      hiddenMenuKeys,
      displayMode,
      ffmpegPath,
      themeMode,
      pageTransition,
      showSearchHistory,
      proxySettings: proxySettings ?? {
        type: "none",
        host: "",
        port: undefined,
        username: "",
        password: "",
      },
      reportPlayHistory,
    },
  });

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if (!name) return;
      const patch = { [name]: (values as any)[name] } as Partial<AppSettings>;
      updateSettings(patch);
      if (name === "proxySettings" && values.proxySettings && window.electron?.setProxySettings) {
        window.electron.setProxySettings(values.proxySettings as ProxySettings);
      }
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
    <ScrollContainer enableBackToTop className="h-full w-full">
      <div className="m-auto mb-6 max-w-[900px] px-8 py-4">
        <div className="space-y-6">
          <h1>设置</h1>
          <Tabs aria-label="设置选项" classNames={{ panel: "px-1 py-0", cursor: "rounded-medium" }}>
            <Tab key="system" title="常规设置">
              <SystemSettingsTab {...system} />
            </Tab>
            <Tab key="menu" title="菜单设置">
              <MenuSettings control={system.control} />
            </Tab>
            <Tab key="shortcut" title="快捷键设置">
              <ShortcutSettingsPage />
            </Tab>
            <Tab key="proxy" title="代理设置">
              <ProxySettings control={system.control} />
            </Tab>
          </Tabs>
        </div>
      </div>
    </ScrollContainer>
  );
};

export default SettingsPage;
