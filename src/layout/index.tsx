import React, { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet, useLocation } from "react-router";

import log from "electron-log/renderer";

import Fallback from "@/components/error-fallback";
import MusicPlayerDrawer from "@/components/full-screen-player";
import PlayBar from "@/layout/playbar";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import Navbar from "./navbar";
import SideNav from "./side";

const Layout = () => {
  const updateUser = useUser(state => state.updateUser);
  const location = useLocation();
  const pageTransition = useSettings(s => s.pageTransition);
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<"entering" | "entered">("entered");

  useEffect(() => {
    updateUser();
  }, [updateUser]);

  useEffect(() => {
    if (location !== displayLocation) {
      if (pageTransition === "none") {
        // 无动画时直接切换，不延迟
        setDisplayLocation(location);
        setTransitionStage("entered");
      } else {
        setTransitionStage("entering");
        const timer = setTimeout(() => {
          setDisplayLocation(location);
          setTransitionStage("entered");
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [location, displayLocation, pageTransition]);

  const getTransitionClass = () => {
    if (pageTransition === "none") {
      return "h-full w-full";
    }

    const baseClass = "h-full w-full transition-all duration-300 ease-in-out";

    switch (pageTransition) {
      case "fade":
        return `${baseClass} ${transitionStage === "entering" ? "opacity-0" : "opacity-100"}`;
      case "slide":
        return `${baseClass} ${
          transitionStage === "entering" ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
        }`;
      case "scale":
        return `${baseClass} ${transitionStage === "entering" ? "scale-95 opacity-0" : "scale-100 opacity-100"}`;
      case "slideUp":
        return `${baseClass} ${
          transitionStage === "entering" ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
        }`;
      default:
        return baseClass;
    }
  };

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
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="h-16 flex-none">
              <Navbar />
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div key={displayLocation.pathname} className={getTransitionClass()}>
                <Outlet />
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-50 h-[88px] w-full flex-none">
          <PlayBar />
        </div>
        <MusicPlayerDrawer />
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
