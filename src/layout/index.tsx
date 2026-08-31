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
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import Navbar from "./navbar";
import SideNav from "./side";

const Layout = () => {
  const updateUser = useUser(state => state.updateUser);
  const location = useLocation();
  const playbarCollapsed = useSettings(s => s.playbarCollapsed);
  const init = usePlayList(s => s.init);

  useEffect(() => {
    updateUser();
    init();
  }, [init]);

  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      resetKeys={[location.pathname]}
      onError={(error, info) => {
        log.error("[ErrorBoundary]", error, info);
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex min-h-0 w-full flex-1">
          <SideNav />
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            {/* 毛玻璃导航栏：absolute 悬浮于内容之上，内容可滚动穿过其下方 */}
            <div className="absolute inset-x-0 top-0 z-40 h-16">
              <Navbar />
            </div>
            <div
              className={`main-content relative flex min-h-0 flex-1 flex-col overflow-hidden ${playbarCollapsed ? "playbar-collapsed" : ""}`}
            >
              <div className="min-h-0 flex-1">
                <Outlet />
              </div>
              {/* 统一 wrapper 结构：折叠/展开只切换 class，不改变 DOM 层级，避免 PlayBar 重新挂载导致播放中断 */}
              <div
                className={`pointer-events-none absolute z-50 ${
                  playbarCollapsed ? "right-4 bottom-4" : "inset-x-0 bottom-0 px-4 pb-4"
                }`}
              >
                <div className={`pointer-events-auto ${playbarCollapsed ? "inline-block" : "w-full"}`}>
                  <PlayBar />
                </div>
              </div>
            </div>
          </div>
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
