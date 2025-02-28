import { useHref, useNavigate, useRoutes } from "react-router-dom";

import { HeroUIProvider, ToastProvider } from "@heroui/react";

import routes from "./routes";

import "./app.css";

export function App() {
  const routeElement = useRoutes(routes);
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref} locale="zh-CN">
      <ToastProvider placement="top-center" toastOffset={24} maxVisibleToasts={3} toastProps={{ timeout: 3000, color: "primary" }} />
      <main className="h-screen w-screen bg-background text-foreground dark">{routeElement}</main>
    </HeroUIProvider>
  );
}
