import React, { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router";

import { Card } from "@heroui/react";
import log from "electron-log/renderer";

import { refreshCookie } from "@/common/utils/cookie";
import Fallback from "@/components/error-fallback";
import PlayBar from "@/layout/playbar";
import { useUser } from "@/store/user";

import Navbar from "./navbar";
import SideNav from "./side";

const Layout = () => {
  const { updateUser } = useUser();

  const getLoginInfo = async () => {
    try {
      await refreshCookie();
    } finally {
      updateUser();
    }
  };

  useEffect(() => {
    getLoginInfo();
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onError={(error, info) => {
        console.log("error", error, info);
        console.log(log);
        // 使用 electron-log 记录错误与组件堆栈
        log.error("[ErrorBoundary]", error, info);
      }}
    >
      <div className="flex h-full flex-col">
        <div className="h-16 w-full flex-none">
          <Navbar />
        </div>
        <div className="flex min-h-0 flex-grow space-x-2 px-2">
          <SideNav />
          <Card radius="md" className="h-full flex-grow">
            <Outlet />
          </Card>
        </div>
        <div className="h-22 w-full flex-none">
          <PlayBar />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
