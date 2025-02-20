import { createHashRouter, RouterProvider } from "react-router-dom";

import { HeroUIProvider, ToastProvider } from "@heroui/react";

import routes from "./routes";

import "./app.css";

const router = createHashRouter(routes);

export function App() {
  return (
    <HeroUIProvider locale="zh-CN">
      <ToastProvider placement="top-center" maxVisibleToasts={3} toastProps={{ timeout: 3000, color: "primary" }} />
      <main className="h-screen w-screen bg-background text-foreground dark">
        <RouterProvider router={router} />
      </main>
    </HeroUIProvider>
  );
}
