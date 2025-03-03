import { useHref, useNavigate, useRoutes } from "react-router-dom";
import "moment/locale/zh-cn";

import moment from "moment";
import { HeroUIProvider, ToastProvider } from "@heroui/react";

import routes from "./routes";

import "overlayscrollbars/overlayscrollbars.css";
import "./app.css";

moment.locale("zh-cn");

export function App() {
  const routeElement = useRoutes(routes);
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref} locale="zh-CN">
      <ToastProvider placement="top-center" toastOffset={24} maxVisibleToasts={3} toastProps={{ timeout: 3000, color: "primary" }} />
      <main className="h-screen w-screen overflow-hidden bg-background text-foreground dark">{routeElement}</main>
    </HeroUIProvider>
  );
}
