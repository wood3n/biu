import { useEffect, useState } from "react";

import { Button } from "@heroui/react";
import {
  RiCloseLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
  RiPictureInPicture2Line,
  RiSubtractLine,
} from "@remixicon/react";
import { shallow } from "zustand/shallow";

import { createBroadcastChannel } from "@/common/broadcast/mini-player-sync";
import { usePlayList } from "@/store/play-list";

const WindowAction = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [shouldBroadcastMainState, setShouldBroadcastMainState] = useState(false);

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

  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (shouldBroadcastMainState) {
      bc = createBroadcastChannel();

      bc.onmessage = ev => {
        const { from, data } = ev.data || {};
        if (from !== "mini" || !data) return;
        switch (data.type) {
          case "init": {
            const { list, isPlaying, currentTime, playMode, duration, getPlayItem } = usePlayList.getState();
            const playItem = getPlayItem();
            bc?.postMessage({
              from: "main",
              state: {
                isSingle: list.length === 1,
                mediaData: {
                  title: playItem?.pageTitle || playItem?.pageTitle,
                  cover: playItem?.pageCover || playItem?.cover,
                },
                isPlaying: isPlaying,
                currentTime: currentTime,
                playMode: playMode,
                duration: duration,
              },
              ts: Date.now(),
            });
            break;
          }
          case "seek": {
            usePlayList.getState().seek(data.state.currentTime);
            break;
          }
          case "togglePlayMode": {
            usePlayList.getState().togglePlayMode();
            break;
          }
          case "next": {
            usePlayList.getState().next();
            break;
          }
          case "prev": {
            usePlayList.getState().prev();
            break;
          }
          case "togglePlay": {
            usePlayList.getState().togglePlay();
            break;
          }
        }
      };

      const unsubscribe = usePlayList.subscribe((state, prevState) => {
        if (
          !shallow(
            {
              playId: state.playId,
              isPlaying: state.isPlaying,
              playMode: state.playMode,
              currentTime: state.currentTime,
              duration: state.duration,
            },
            {
              playId: prevState.playId,
              isPlaying: prevState.isPlaying,
              playMode: prevState.playMode,
              currentTime: prevState.currentTime,
              duration: prevState.duration,
            },
          )
        ) {
          const playItem = state.getPlayItem();

          bc?.postMessage({
            from: "main",
            state: {
              mediaData: {
                title: playItem?.pageTitle || playItem?.pageTitle,
                cover: playItem?.pageCover || playItem?.cover,
              },
              playId: state.playId,
              isPlaying: state.isPlaying,
              currentTime: state.currentTime,
              playMode: state.playMode,
              duration: state.duration,
            },
            ts: Date.now(),
          });
        }
      });

      return () => {
        bc?.close();
        unsubscribe();
      };
    } else {
      if (bc) {
        (bc as BroadcastChannel).close();
        bc = null;
      }
    }
  }, [shouldBroadcastMainState]);

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
    setShouldBroadcastMainState(true);
  };

  return (
    <div className="flex items-center justify-center">
      {!isFullScreen && (
        <>
          <Button title="切换到迷你播放器" isIconOnly size="sm" variant="light" onPress={handleSwitchToMini}>
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
