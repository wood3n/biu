import { useEffect, useState } from "react";

import { Button } from "@heroui/react";
import {
  RiCloseLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
  RiPictureInPicture2Line,
  RiSubtractLine,
} from "@remixicon/react";

const platform = window.electron.getPlatform();

const WindowAction = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    window.electron.isMaximized().then(setIsMaximized);
    window.electron.isFullScreen().then(setIsFullScreen);
    const unlistenMaximize = window.electron.onWindowMaximizeChange(setIsMaximized);
    const unlistenFullScreen = window.electron.onWindowFullScreenChange(setIsFullScreen);

    return () => {
      unlistenMaximize();
      unlistenFullScreen();
    };
  }, []);

  const handleMinimize = () => {
    window.electron.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electron.toggleMaximizeWindow();
  };

  const handleClose = () => {
    window.electron.closeWindow();
  };

  const handleSwitchToMini = () => {
    window.electron.switchToMiniPlayer();
  };

  return (
    <div className="flex items-center justify-center">
      {!isFullScreen && (
        <>
          <Button title="切换到迷你播放器" isIconOnly size="sm" variant="light" onPress={handleSwitchToMini}>
            <RiPictureInPicture2Line size={16} />
          </Button>
          {["linux", "windows"].includes(platform) && (
            <>
              <Button variant="light" size="sm" isIconOnly onPress={handleMinimize}>
                <RiSubtractLine size={18} />
              </Button>
              <Button variant="light" size="sm" isIconOnly onPress={handleMaximize}>
                {isMaximized ? <RiFullscreenExitLine size={16} /> : <RiFullscreenLine size={16} />}
              </Button>
              <Button variant="light" size="sm" isIconOnly onPress={handleClose}>
                <RiCloseLine size={18} />
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default WindowAction;
