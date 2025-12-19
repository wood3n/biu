import { useEffect, useState } from "react";

import { Button } from "@heroui/react";
import {
  RiCloseLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
  RiPictureInPicture2Line,
  RiSubtractLine,
} from "@remixicon/react";

import { toggleMiniMode } from "@/common/utils/mini-player";

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

  return (
    <div className="flex items-center justify-center">
      {!isFullScreen && (
        <>
          <Button title="切换到迷你播放器" isIconOnly size="sm" variant="light" onPress={toggleMiniMode}>
            <RiPictureInPicture2Line size={16} />
          </Button>
          <Button variant="light" size="sm" isIconOnly onPress={handleMinimize}>
            <RiSubtractLine size={18} />
          </Button>
          <Button variant="light" size="sm" isIconOnly onPress={handleMaximize}>
            {isMaximized ? <RiFullscreenExitLine size={14} /> : <RiFullscreenLine size={14} />}
          </Button>
          <Button variant="light" size="sm" isIconOnly onPress={handleClose}>
            <RiCloseLine size={18} />
          </Button>
        </>
      )}
    </div>
  );
};

export default WindowAction;
