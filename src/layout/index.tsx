import React, { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router";

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
        log.error("[ErrorBoundary]", error, info);
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex min-h-0 w-full flex-1">
          <SideNav />
          <div className="flex flex-1 flex-col">
            <div className="h-16 flex-none">
              <Navbar />
            </div>
            <Outlet />
          </div>
        </div>
        <div className="h-[88px] w-full shrink-0">
          <PlayBar />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
