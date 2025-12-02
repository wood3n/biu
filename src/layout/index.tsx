import React, { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router";

import log from "electron-log/renderer";

import Fallback from "@/components/error-fallback";
import PlayBar from "@/layout/playbar";
import { useAppUpdateStore } from "@/store/app-update";
import { useUser } from "@/store/user";

import Navbar from "./navbar";
import SideNav from "./side";

const Layout = () => {
  const updateUser = useUser(state => state.updateUser);
  const setUpdate = useAppUpdateStore(s => s.setUpdate);

  useEffect(() => {
    const removeListener = window.electron.onDownloadAppProgress(info => {
      if (info.type === "downloaded" && info.releaseInfo) {
        setUpdate({
          hasUpdate: true,
          isDownloaded: true,
          latestVersion: info.releaseInfo.latestVersion,
          releaseNotes: info.releaseInfo.releaseNotes,
        });
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    updateUser();
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
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="h-16 flex-none">
              <Navbar />
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <Outlet />
            </div>
          </div>
        </div>
        <div className="relative z-50 h-[88px] w-full flex-none">
          <PlayBar />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
