import { useEffect, useState } from "react";

import {
  RiCloseLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
  RiPictureInPicture2Line,
  RiSubtractLine,
} from "@remixicon/react";

import { toggleMiniMode } from "@/common/utils/mini-player";
import IconButton from "@/components/icon-button";

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
    <div className="window-no-drag flex items-center justify-center">
      {!isFullScreen && (
        <>
          <IconButton title="切换到迷你播放器" onPress={toggleMiniMode}>
            <RiPictureInPicture2Line size={18} />
          </IconButton>
          <div className="ml-4 flex items-center justify-center">
            <IconButton onPress={handleMinimize}>
              <RiSubtractLine size={18} />
            </IconButton>
            <IconButton onPress={handleMaximize}>
              {isMaximized ? <RiFullscreenExitLine size={18} /> : <RiFullscreenLine size={18} />}
            </IconButton>
            <IconButton onPress={handleClose} className="mr-2">
              <RiCloseLine size={18} />
            </IconButton>
          </div>
        </>
      )}
    </div>
  );
};

export default WindowAction;
