import { useEffect } from "react";

/**
 * 桌面歌词窗口：窗口本身透明，歌词直接浮在桌面上
 */
export const useStyle = () => {
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
      document.documentElement.style.removeProperty("background");
      document.body.style.removeProperty("background");
      document.body.style.removeProperty("margin");
      document.body.style.removeProperty("overflow");

      if (rootEl) {
        rootEl.style.removeProperty("background");
        rootEl.style.removeProperty("overflow");
      }
    };
  }, []);
};
