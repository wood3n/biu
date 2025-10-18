import { useHref, useNavigate, useRoutes } from "react-router";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import moment from "moment";

import { useSettings } from "@/store/settings";

import routes from "./routes";

import "moment/locale/zh-cn";

import "overlayscrollbars/overlayscrollbars.css";
import "./app.css";

moment.locale("zh-cn");

// 将 HEX 颜色转换为 HeroUI 变量所需的 HSL 字符串格式，例如："120 60% 50%"
function hexToHslString(hex: string) {
  const h = hex.replace("#", "").trim();
  if (h.length !== 6) return "120 100% 50%"; // fallback: green
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hDeg = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        hDeg = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        hDeg = (b - r) / d + 2;
        break;
      case b:
        hDeg = (r - g) / d + 4;
        break;
    }
    hDeg *= 60;
  }
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);
  const hRound = Math.round(hDeg);
  return `${hRound} ${sPct}% ${lPct}%`;
}

export function App() {
  const routeElement = useRoutes(routes);
  const navigate = useNavigate();
  const { fontFamily, color, borderRadius } = useSettings();

  const primaryColor = color || "#17c964"; // 默认主色
  const radiusSm = `${Math.max(0, (borderRadius ?? 6) - 2)}px`;
  const radiusMd = `${Math.max(0, borderRadius ?? 6)}px`;
  const radiusLg = `${Math.max(0, (borderRadius ?? 6) + 2)}px`;

  const primaryHsl = hexToHslString(primaryColor);

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref} locale="zh-CN">
      <ToastProvider
        placement="top-center"
        toastOffset={70}
        maxVisibleToasts={3}
        disableAnimation
        toastProps={{ timeout: 3000, color: "primary" }}
      />
      <main
        className="bg-background text-foreground dark h-screen w-screen overflow-hidden"
        style={{
          fontFamily,
          // 运行时覆盖 HeroUI 的 CSS 变量（Tailwind v4 tokens）
          // 颜色：主色与焦点色
          ["--heroui-primary" as any]: primaryHsl,
          ["--heroui-primary-500" as any]: primaryHsl,
          ["--heroui-focus" as any]: primaryHsl,
          // 圆角：不同尺寸半径
          ["--heroui-radius-small" as any]: radiusSm,
          ["--heroui-radius-medium" as any]: radiusMd,
          ["--heroui-radius-large" as any]: radiusLg,
        }}
      >
        {routeElement}
      </main>
    </HeroUIProvider>
  );
}
