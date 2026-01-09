import { useEffect, useState } from "react";

import { useShallow } from "zustand/react/shallow";

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
    root.style.fontFamily = fontFamily === "system-default" ? "system-ui" : fontFamily;
  }, [fontFamily, primaryColor, borderRadius, themeMode, systemTheme]);

  return (
    <main
      className={`h-screen w-screen overflow-hidden ${resolveTheme(themeMode, systemTheme)}`}
      style={{
        fontFamily: fontFamily === "system-default" ? "system-ui" : fontFamily,
        ["--heroui-radius-medium" as any]: `${borderRadius}px`,
      }}
    >
      {children}
    </main>
  );
};

export default Theme;
