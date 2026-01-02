import { useEffect, useState } from "react";

import { twMerge } from "tailwind-merge";

import { ReactComponent as LogoIcon } from "@/assets/icons/logo.svg";

const isMac = window.electron?.getPlatform() === "macos";

interface LogoProps {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
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
          "window-drag text-primary relative flex flex-none items-center py-3 pr-3 pl-4",
          isMac && !isFullScreen && "pt-12",
        )}
      >
        <div className="window-no-drag flex flex-1 items-center space-x-2">
          <LogoIcon className="h-10 w-10" />
          {!isCollapsed && <span className="text-2xl leading-none font-bold">Biu</span>}
        </div>
      </div>
    </>
  );
};

export default Logo;
