import { useEffect, useState } from "react";

import { useShallow } from "zustand/react/shallow";

import { hexToHsl } from "@/common/utils/color";
import { useSettings } from "@/store/settings";

interface Props {
  children: React.ReactNode;
}

function resolveTheme(theme: ThemeMode, systemTheme?: "light" | "dark") {
  if (theme === "system") {
    if (systemTheme) {
      return systemTheme;
    }
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  }
  return theme;
}

const Theme = ({ children }: Props) => {
  const { themeMode, fontFamily, primaryColor, borderRadius } = useSettings(
    useShallow(s => ({
      themeMode: s.themeMode,
      fontFamily: s.fontFamily,
      primaryColor: s.primaryColor,
      borderRadius: s.borderRadius,
    })),
  );

  const [systemTheme, setSystemTheme] = useState<"light" | "dark" | undefined>(undefined);

  // 当 themeMode 为 system 时，监听系统主题变化并更新本地 systemTheme
  useEffect(() => {
    if (themeMode !== "system") {
      return;
    }

    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      setSystemTheme(undefined);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (matches: boolean) => {
      setSystemTheme(matches ? "dark" : "light");
    };

    applyTheme(mediaQuery.matches);

    const mediaQueryHandler = (event: MediaQueryListEvent) => {
      applyTheme(event.matches);
    };

    mediaQuery.addEventListener("change", mediaQueryHandler);

    return () => {
      mediaQuery.removeEventListener("change", mediaQueryHandler);
    };
  }, [themeMode]);

  // 将主题相关样式应用到 :root 和 body，确保挂载在 body 上的组件可读取到
  useEffect(() => {
    const root = document.documentElement;
    const themeName = resolveTheme(themeMode, systemTheme);

    root.classList.remove("light", "dark");
    root.classList.add(themeName);
    root.style.colorScheme = themeName;

    const rootStyle = root.style;
    const bodyStyle = document.body.style;

    const primary = hexToHsl(primaryColor);
    const radius = `${borderRadius}px`;

    // :root 级变量（全局）
    rootStyle.setProperty("--heroui-primary", primary);
    rootStyle.setProperty("--primary", primary);
    rootStyle.setProperty("--heroui-radius-medium", radius);
    rootStyle.setProperty("--radius-medium", radius);
    rootStyle.setProperty("--radius", radius);

    // body 级变量与字体（用于挂载在 body 的 Portal 组件）
    bodyStyle.setProperty("--heroui-primary", primary);
    bodyStyle.setProperty("--primary", primary);
    bodyStyle.setProperty("--heroui-radius-medium", radius);
    bodyStyle.setProperty("--radius-medium", radius);
    bodyStyle.setProperty("--radius", radius);
    const validFontFamily = fontFamily === "system-default" ? "system-ui" : fontFamily;
    bodyStyle.fontFamily = validFontFamily || bodyStyle.fontFamily;
  }, [fontFamily, primaryColor, borderRadius, themeMode, systemTheme]);

  return (
    <main
      className={`bg-background text-foreground h-screen w-screen overflow-hidden ${resolveTheme(themeMode, systemTheme)}`}
      style={{
        fontFamily: fontFamily === "system-default" ? "system-ui" : fontFamily,
        ["--heroui-primary" as any]: hexToHsl(primaryColor),
        ["--heroui-radius-medium" as any]: `${borderRadius}px`,
      }}
    >
      {children}
    </main>
  );
};

export default Theme;
