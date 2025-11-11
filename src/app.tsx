import { useEffect } from "react";
import { useHref, useNavigate, useRoutes } from "react-router";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import moment from "moment";

import Theme from "./components/theme";
import routes from "./routes";

import "moment/locale/zh-cn";

import "overlayscrollbars/overlayscrollbars.css";
import "./app.css";

moment.locale("zh-cn");

export function App() {
  const routeElement = useRoutes(routes);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.electron && window.electron.navigate) {
      window.electron.navigate(path => navigate(path));
    }
  }, [navigate]);

  const test = async () => {
    const res = await window.electron.httpGet("https://api.bilibili.com/x/web-interface/nav");
    console.log("nav res:", res);
  };

  useEffect(() => {
    test();
  }, []);

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref} locale="zh-CN">
      <ToastProvider
        placement="bottom-right"
        toastOffset={90}
        maxVisibleToasts={3}
        toastProps={{ timeout: 3000, color: "primary" }}
      />
      <Theme>{routeElement}</Theme>
    </HeroUIProvider>
  );
}
