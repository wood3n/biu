import { useEffect } from "react";
import { useLocation } from "react-router";

import { useShallow } from "zustand/react/shallow";

import { hexToHsl } from "@/common/utils/color";
import { useSettings } from "@/store/settings";

interface Props {
  children: React.ReactNode;
}

const Theme = ({ children }: Props) => {
  const location = useLocation();
  const isLyricsOverlay = location.pathname === "/lyrics-overlay" || location.hash === "#lyrics-overlay";

  const { fontFamily, backgroundColor, contentBackgroundColor, primaryColor, borderRadius } = useSettings(
    useShallow(s => ({
      fontFamily: s.fontFamily,
      backgroundColor: s.backgroundColor,
      contentBackgroundColor: s.contentBackgroundColor,
      primaryColor: s.primaryColor,
      borderRadius: s.borderRadius,
    })),
  );

  // 将主题相关样式应用到 :root 和 body，确保挂载在 body 上的组件可读取到
  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const bodyStyle = document.body.style;

    const bg = hexToHsl(backgroundColor);
    const contentBg = hexToHsl(contentBackgroundColor);
    const primary = hexToHsl(primaryColor);
    const radius = `${borderRadius}px`;

    // :root 级变量（全局）
    rootStyle.setProperty("--heroui-background", contentBg);
    rootStyle.setProperty("--heroui-content1", bg);
    rootStyle.setProperty("--heroui-primary", primary);
    rootStyle.setProperty("--primary", primary);
    rootStyle.setProperty("--heroui-radius-medium", radius);
    rootStyle.setProperty("--radius-medium", radius);
    rootStyle.setProperty("--radius", radius);

    // body 级变量与字体（用于挂载在 body 的 Portal 组件）
    bodyStyle.setProperty("--heroui-background", contentBg);
    bodyStyle.setProperty("--heroui-content1", bg);
    bodyStyle.setProperty("--heroui-primary", primary);
    bodyStyle.setProperty("--primary", primary);
    bodyStyle.setProperty("--heroui-radius-medium", radius);
    bodyStyle.setProperty("--radius-medium", radius);
    bodyStyle.setProperty("--radius", radius);
    const validFontFamily = fontFamily === "system-default" ? "system-ui" : fontFamily;
    bodyStyle.fontFamily = validFontFamily || bodyStyle.fontFamily;

    if (isLyricsOverlay) {
      bodyStyle.backgroundColor = "transparent";
      rootStyle.backgroundColor = "transparent";
    } else {
      bodyStyle.backgroundColor = "";
      rootStyle.backgroundColor = "";
    }
  }, [fontFamily, backgroundColor, contentBackgroundColor, primaryColor, borderRadius, isLyricsOverlay]);

  return (
    <main
      className={`${isLyricsOverlay ? "bg-transparent" : "bg-background"} text-foreground dark h-screen w-screen overflow-hidden`}
      style={{
        fontFamily: fontFamily === "system-default" ? "system-ui" : fontFamily,
        ["--heroui-background" as any]: hexToHsl(contentBackgroundColor),
        ["--heroui-content1" as any]: hexToHsl(backgroundColor),
        ["--heroui-primary" as any]: hexToHsl(primaryColor),
        ["--heroui-radius-medium" as any]: `${borderRadius}px`,
      }}
    >
      {children}
    </main>
  );
};

export default Theme;
