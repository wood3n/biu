import { useEffect, useMemo } from "react";

import { useShallow } from "zustand/react/shallow";

import { hexToHsl } from "@/common/utils/color";
import { useSettings } from "@/store/settings";
import { getThemeColors } from "@shared/settings/app-settings";

interface Props {
  children: React.ReactNode;
}

/**
 * CSS变量名称映射
 */
const CSS_VARIABLES = {
  background: "--heroui-background",
  content1: "--heroui-content1",
  primary: "--heroui-primary",
  radiusMedium: "--heroui-radius-medium",
  foreground: "--heroui-foreground",
} as const;

/**
 * 设置CSS变量的辅助函数
 */
function setCSSVariables(
  style: CSSStyleDeclaration,
  variables: {
    background: string;
    content1: string;
    primary: string;
    radius: string;
    foreground: string;
  },
) {
  style.setProperty(CSS_VARIABLES.background, variables.background);
  style.setProperty(CSS_VARIABLES.content1, variables.content1);
  style.setProperty(CSS_VARIABLES.primary, variables.primary);
  style.setProperty(CSS_VARIABLES.radiusMedium, variables.radius);
  style.setProperty(CSS_VARIABLES.foreground, variables.foreground);
}

/**
 * 规范化字体族名称
 */
function normalizeFontFamily(fontFamily: string): string {
  return fontFamily === "system-default" ? "system-ui" : fontFamily;
}

const Theme = ({ children }: Props) => {
  const { fontFamily, primaryColor, borderRadius, themeMode } = useSettings(
    useShallow(s => ({
      fontFamily: s.fontFamily,
      primaryColor: s.primaryColor,
      borderRadius: s.borderRadius,
      themeMode: s.themeMode,
    })),
  );

  // 根据主题模式获取颜色配置
  const themeColors = useMemo(() => getThemeColors(themeMode), [themeMode]);

  // 规范化字体族
  const normalizedFontFamily = useMemo(() => normalizeFontFamily(fontFamily), [fontFamily]);

  // 计算CSS变量值（避免重复计算）
  const cssVariables = useMemo(
    () => ({
      background: hexToHsl(themeColors.contentBackgroundColor),
      content1: hexToHsl(themeColors.backgroundColor),
      primary: hexToHsl(primaryColor),
      radius: `${borderRadius}px`,
      foreground: themeColors.foregroundColor,
    }),
    [themeColors, primaryColor, borderRadius],
  );

  // 将主题相关样式应用到 :root 和 body，确保挂载在 body 上的组件可读取到
  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const bodyElement = document.body;

    // 更新主题类名
    bodyElement.classList.remove("light", "dark");
    bodyElement.classList.add(themeMode);

    // 设置CSS变量
    setCSSVariables(rootStyle, cssVariables);
    setCSSVariables(bodyStyle, cssVariables);

    // 设置字体
    bodyStyle.fontFamily = normalizedFontFamily;
  }, [cssVariables, themeMode, normalizedFontFamily]);

  // 计算内联样式
  const inlineStyles = useMemo(
    () => ({
      fontFamily: normalizedFontFamily,
      [CSS_VARIABLES.background]: cssVariables.background,
      [CSS_VARIABLES.content1]: cssVariables.content1,
      [CSS_VARIABLES.primary]: cssVariables.primary,
      [CSS_VARIABLES.radiusMedium]: cssVariables.radius,
    }),
    [normalizedFontFamily, cssVariables],
  );

  return (
    <main
      className={`bg-background text-foreground h-screen w-screen overflow-hidden ${themeMode}`}
      style={inlineStyles}
    >
      {children}
    </main>
  );
};

export default Theme;
