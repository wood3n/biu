import { useEffect, useState } from "react";

import { twMerge } from "tailwind-merge";

import { ReactComponent as LogoIcon } from "@/assets/icons/logo.svg";

const isMac = window.electron?.getPlatform() === "macos";

interface LogoProps {
  isCollapsed: boolean;
}

const Logo = ({ isCollapsed }: LogoProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (!isMac) return;

    window.electron?.isFullScreen().then(setIsFullScreen);
    const unlisten = window.electron?.onWindowFullScreenChange(setIsFullScreen);

    return () => {
      unlisten?.();
    };
  }, []);

  return (
    <>
      <div
        className={twMerge(
          "window-drag text-primary relative flex flex-none items-center justify-center py-3",
          isCollapsed ? "px-0" : "pr-3 pl-4",
          isMac && !isFullScreen && "pt-8",
        )}
      >
        <div
          className={twMerge("window-no-drag flex items-center", isCollapsed ? "justify-center" : "flex-1 space-x-2")}
        >
          <LogoIcon className="h-10 w-10" />
          {!isCollapsed && (
            <span
              className="text-lg leading-none font-bold tracking-tight"
              style={{ fontFamily: '"Microsoft YaHei Light", "微软雅黑 Light", "Microsoft YaHei", sans-serif' }}
            >
              BIUMUSIC
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default Logo;
