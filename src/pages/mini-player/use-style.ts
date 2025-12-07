import { useEffect } from "react";

import { useSettings } from "@/store/settings";

export const useStyle = () => {
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    const rootEl: HTMLDivElement | null = document.querySelector("#root");
    if (rootEl) {
      rootEl.style.background = "rgba(0, 0, 0, 0)";
      rootEl.style.overflow = "hidden";
      rootEl.style.borderRadius = `${useSettings.getState().borderRadius}px`;
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
        rootEl.style.removeProperty("border-radius");
      }
    };
  }, []);
};
