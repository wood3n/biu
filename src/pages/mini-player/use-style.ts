import { useEffect } from "react";

/**
 * 悬浮窗底板画在窗口上（系统亚克力材质或窗口实色底），网页这层必须全透明才透得出来：
 * 文档背景一旦不透明，就会把材质整个盖掉（底板色调见 app.css 的 .mini-panel*）。
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
      const rootEl: HTMLDivElement | null = document.querySelector("#root");
      if (rootEl) {
        document.documentElement.style.removeProperty("background");
        document.body.style.removeProperty("background");
        document.body.style.removeProperty("margin");
        document.body.style.removeProperty("overflow");
        rootEl.style.removeProperty("background");
        rootEl.style.removeProperty("overflow");
      }
    };
  }, []);
};
