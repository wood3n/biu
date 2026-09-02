import { useEffect } from "react";

export const useStyle = () => {
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    const rootEl: HTMLDivElement | null = document.querySelector("#root");
    if (rootEl) {
      // 直角形态：亚克力由系统 backgroundMaterial 提供，
      // 网页只需透明底让亚克力透出，不画背景色也不画圆角；
      // 加 1px 半透明描边，让窗口轮廓在浅色桌面上可辨
      rootEl.style.background = "transparent";
      rootEl.style.overflow = "hidden";
      rootEl.style.outline = "1px solid hsl(var(--heroui-foreground) / 12%)";
      rootEl.style.outlineOffset = "-1px";
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
  }, []);
};
