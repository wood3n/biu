import React, { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation } from "react-router";

import log from "electron-log/renderer";

import ConfirmModal from "@/components/confirm-modal";
import Fallback from "@/components/error-fallback";
import FavoritesSelectModal from "@/components/favorites-select-modal";
import FullScreenPlayer from "@/components/full-screen-player";
import PlayListDrawer from "@/components/music-playlist-drawer";
import ReleaseNoteModal from "@/components/release-note-modal";
import VideoPagesDownloadSelectModal from "@/components/video-pages-download-select-modal";
import PlayBar from "@/layout/playbar";
import { useUser } from "@/store/user";

import Navbar from "./navbar";
import SideNav from "./side";

const Layout = () => {
  const updateUser = useUser(state => state.updateUser);
  const location = useLocation();

  useEffect(() => {
    updateUser();
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      resetKeys={[location.pathname]}
      onError={(error, info) => {
        log.error("[ErrorBoundary]", error, info);
      }}
    >
      <div className="bg-content1 flex h-full flex-col">
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
        <div className="relative z-50 h-[88px] w-full flex-none shadow-2xl">
          <PlayBar />
        </div>
      </div>
      <FavoritesSelectModal />
      <ConfirmModal />
      <VideoPagesDownloadSelectModal />
      <ReleaseNoteModal />
      <PlayListDrawer />
      <FullScreenPlayer />
    </ErrorBoundary>
  );
};

export default Layout;
