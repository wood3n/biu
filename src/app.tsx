import { useEffect } from "react";
import { useHref, useNavigate, useRoutes } from "react-router";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import moment from "moment";

import { useSettings } from "@/store/settings";

import { hexToHsl } from "./common/utils/color";
import routes from "./routes";

import "moment/locale/zh-cn";

import "overlayscrollbars/overlayscrollbars.css";
import "./app.css";

moment.locale("zh-cn");

export function App() {
  const routeElement = useRoutes(routes);
  const navigate = useNavigate();
  const { fontFamily, backgroundColor, contentBackgroundColor, primaryColor, borderRadius } = useSettings();

  useEffect(() => {
    if (window.electron && window.electron.navigate) {
      window.electron.navigate(path => navigate(path));
    }
  }, [navigate]);

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
          ["--heroui-background" as any]: hexToHsl(backgroundColor),
          ["--heroui-content1" as any]: hexToHsl(contentBackgroundColor),
          ["--heroui-primary" as any]: hexToHsl(primaryColor),
          ["--heroui-radius-medium" as any]: `${borderRadius}px`,
        }}
      >
        {routeElement}
      </main>
    </HeroUIProvider>
  );
}
