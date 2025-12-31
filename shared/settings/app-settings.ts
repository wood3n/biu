export const defaultAppSettings: AppSettings = {
  autoStart: false,
  closeWindowOption: "hide",
  fontFamily: "system-ui",
  borderRadius: 8,
  downloadPath: "",
  primaryColor: "#17c964",
  audioQuality: "auto",
  hiddenMenuKeys: [],
  displayMode: "list",
  ffmpegPath: "",
  themeMode: "system",
  pageTransition: "none",
  showSearchHistory: true,
};

export const lightThemeColors = {
  backgroundColor: "#f5f5f5",
  contentBackgroundColor: "#ffffff",
  foregroundColor: "#000000",
};

export const darkThemeColors = {
  backgroundColor: "#18181b",
  contentBackgroundColor: "#1f1f1f",
  foregroundColor: "#ffffff",
};

/**
 * 根据主题模式获取对应的颜色配置
 */
export function getThemeColors(themeMode: ThemeMode) {
  return themeMode === "light" ? lightThemeColors : darkThemeColors;
}

/**
 * 主题模式选项
 */
export const THEME_MODE_OPTIONS = [
  { key: "light" as const, label: "浅色" },
  { key: "dark" as const, label: "深色" },
] as const;
