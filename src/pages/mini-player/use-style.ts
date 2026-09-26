import { useEffect } from "react";

import { useTheme } from "@/components/theme/use-theme";
import { useSettings } from "@/store/settings";

export const useStyle = () => {
  const { theme } = useTheme();
  const marqueeEnabled = useSettings(s => s.marqueeEnabled);

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    const rootEl: HTMLDivElement | null = document.querySelector("#root");
    if (rootEl) {
      // 直角形态：亚克力由系统 backgroundMaterial 提供，
      // 网页叠一层主题色纱提亮/压暗亚克力：浅色白纱、深色黑纱；
      // 加 1px 半透明描边，让窗口轮廓在浅色桌面上可辨
      rootEl.style.background = theme === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)";
      rootEl.style.overflow = "hidden";
      // 跑马灯光带开启时隐藏 outline，由光带自带 2px 描边负责窗口轮廓；
      // 关闭时恢复 1px 半透明描边，保证浅色桌面上窗口始终可辨
      if (marqueeEnabled) {
        rootEl.style.removeProperty("outline");
        rootEl.style.removeProperty("outline-offset");
      } else {
        rootEl.style.outline = "1px solid hsl(var(--heroui-foreground) / 12%)";
        rootEl.style.outlineOffset = "-1px";
      }
    }

    return () => {
      const rootEl: HTMLDivElement | null = document.querySelector("#root");
      if (rootEl) {
        document.documentElement.style.removeProperty("background");
        document.body.style.removeProperty("background");
        document.body.style.removeProperty("margin");
        document.body.style.removeProperty("overflow");
        rootEl.style.removeProperty("background");
        rootEl.style.removeProperty("backdrop-filter");
        rootEl.style.removeProperty("overflow");
        rootEl.style.removeProperty("border-radius");
        rootEl.style.removeProperty("outline");
        rootEl.style.removeProperty("outline-offset");
      }
    };
  }, [theme, marqueeEnabled]);
};
