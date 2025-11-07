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

  // useEffect(() => {
  //   axios.head("https://bilibili.com/");
  // }, []);

  // 将主题相关样式应用到 :root 和 body，确保挂载在 body 上的组件可读取到
  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const bodyStyle = document.body.style;

    const bg = hexToHsl(backgroundColor);
    const content = hexToHsl(contentBackgroundColor);
    const primary = hexToHsl(primaryColor);
    const radius = `${borderRadius}px`;

    // :root 级变量（全局）
    rootStyle.setProperty("--heroui-background", bg);
    rootStyle.setProperty("--heroui-content1", content);
    rootStyle.setProperty("--heroui-primary", primary);
    rootStyle.setProperty("--primary", primary);
    rootStyle.setProperty("--heroui-radius-medium", radius);
    rootStyle.setProperty("--radius-medium", radius);
    rootStyle.setProperty("--radius", radius);

    // body 级变量与字体（用于挂载在 body 的 Portal 组件）
    bodyStyle.setProperty("--heroui-background", bg);
    bodyStyle.setProperty("--heroui-content1", content);
    bodyStyle.setProperty("--heroui-primary", primary);
    bodyStyle.setProperty("--primary", primary);
    bodyStyle.setProperty("--heroui-radius-medium", radius);
    bodyStyle.setProperty("--radius-medium", radius);
    bodyStyle.setProperty("--radius", radius);
    bodyStyle.fontFamily = fontFamily || bodyStyle.fontFamily;
  }, [fontFamily, backgroundColor, contentBackgroundColor, primaryColor, borderRadius]);

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref} locale="zh-CN">
      <div className="fixed z-[100]">
        <ToastProvider
          placement="bottom-right"
          toastOffset={90}
          maxVisibleToasts={3}
          toastProps={{ timeout: 3000, color: "primary" }}
        />
      </div>
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
