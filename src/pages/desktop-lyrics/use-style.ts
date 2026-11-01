import { useEffect } from "react";

/**
 * 桌面歌词窗口是 transparent 无边框窗口：
 * 文档各层背景必须全透明，否则会把窗口自身涂成一块不透明矩形，
 * 盖住桌面并让整条区域看起来像黑框。
 */
export const useTransparentDocument = () => {
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    const rootEl: HTMLDivElement | null = document.querySelector("#root");
    if (rootEl) {
      rootEl.style.background = "transparent";
      rootEl.style.overflow = "hidden";
    }

    return () => {
      const el: HTMLDivElement | null = document.querySelector("#root");
      document.documentElement.style.removeProperty("background");
      document.body.style.removeProperty("background");
      document.body.style.removeProperty("margin");
      document.body.style.removeProperty("overflow");
      el?.style.removeProperty("background");
      el?.style.removeProperty("overflow");
    };
  }, []);
};
