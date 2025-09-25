import { useHref, useNavigate, useRoutes } from "react-router";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import moment from "moment";

import routes from "./routes";

import "moment/locale/zh-cn";

import "overlayscrollbars/overlayscrollbars.css";
import "./app.css";

moment.locale("zh-cn");

export function App() {
  const routeElement = useRoutes(routes);
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref} locale="zh-CN">
      <ToastProvider
        placement="top-center"
        toastOffset={70}
        maxVisibleToasts={3}
        disableAnimation
        toastProps={{ timeout: 3000, color: "primary" }}
      />
      <main className="bg-background text-foreground dark h-screen w-screen overflow-hidden">{routeElement}</main>
    </HeroUIProvider>
  );
}
