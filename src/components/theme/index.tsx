import { useEffect } from "react";

import { useShallow } from "zustand/react/shallow";

import { hexToHsl } from "@/common/utils/color";
import { useSettings } from "@/store/settings";
import { lightThemeColors, darkThemeColors } from "@shared/settings/app-settings";

interface Props {
  children: React.ReactNode;
}

const Theme = ({ children }: Props) => {
  const { fontFamily, backgroundColor, contentBackgroundColor, primaryColor, borderRadius, themeMode } = useSettings(
    useShallow(s => ({
      fontFamily: s.fontFamily,
      backgroundColor: s.backgroundColor,
      contentBackgroundColor: s.contentBackgroundColor,
      primaryColor: s.primaryColor,
      borderRadius: s.borderRadius,
      themeMode: s.themeMode,
    })),
  );

  // 根据主题模式获取实际的背景色和前景色
  const actualBg = themeMode === "light" ? lightThemeColors.backgroundColor : backgroundColor;
  const actualContentBg = themeMode === "light" ? lightThemeColors.contentBackgroundColor : contentBackgroundColor;
  const foreground = themeMode === "light" ? lightThemeColors.foregroundColor : darkThemeColors.foregroundColor;

  // 将主题相关样式应用到 :root 和 body，确保挂载在 body 上的组件可读取到
  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const bodyElement = document.body;

    const bg = hexToHsl(actualBg);
    const contentBg = hexToHsl(actualContentBg);
    const primary = hexToHsl(primaryColor);
    const radius = `${borderRadius}px`;

    // 在 body 上添加/移除 dark 类，确保 Portal 渲染的组件也能应用样式
    if (themeMode === "dark") {
      bodyElement.classList.add("dark");
      bodyElement.classList.remove("light");
    } else {
      bodyElement.classList.add("light");
      bodyElement.classList.remove("dark");
    }

    // :root 级变量（全局）
    rootStyle.setProperty("--heroui-background", contentBg);
    rootStyle.setProperty("--heroui-content1", bg);
    rootStyle.setProperty("--heroui-primary", primary);
    rootStyle.setProperty("--primary", primary);
    rootStyle.setProperty("--heroui-radius-medium", radius);
    rootStyle.setProperty("--radius-medium", radius);
    rootStyle.setProperty("--radius", radius);
    rootStyle.setProperty("--heroui-foreground", foreground);

    // body 级变量与字体（用于挂载在 body 的 Portal 组件）
    bodyStyle.setProperty("--heroui-background", contentBg);
    bodyStyle.setProperty("--heroui-content1", bg);
    bodyStyle.setProperty("--heroui-primary", primary);
    bodyStyle.setProperty("--primary", primary);
    bodyStyle.setProperty("--heroui-radius-medium", radius);
    bodyStyle.setProperty("--radius-medium", radius);
    bodyStyle.setProperty("--radius", radius);
    bodyStyle.setProperty("--heroui-foreground", foreground);
    const validFontFamily = fontFamily === "system-default" ? "system-ui" : fontFamily;
    bodyStyle.fontFamily = validFontFamily || bodyStyle.fontFamily;
  }, [fontFamily, actualBg, actualContentBg, primaryColor, borderRadius, themeMode, foreground]);

  return (
    <main
      className={`bg-background text-foreground h-screen w-screen overflow-hidden ${themeMode === "light" ? "light" : "dark"}`}
      style={{
        fontFamily: fontFamily === "system-default" ? "system-ui" : fontFamily,
        ["--heroui-background" as any]: hexToHsl(actualContentBg),
        ["--heroui-content1" as any]: hexToHsl(actualBg),
        ["--heroui-primary" as any]: hexToHsl(primaryColor),
        ["--heroui-radius-medium" as any]: `${borderRadius}px`,
      }}
    >
      {children}
    </main>
  );
};

export default Theme;
