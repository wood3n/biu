import { useCallback, useEffect, useMemo, useRef } from "react";

import { Button, Image, Slider } from "@heroui/react";
import {
  RiExpandDiagonalLine,
  RiPauseCircleFill,
  RiPlayCircleFill,
  RiSkipBackFill,
  RiSkipForwardFill,
} from "@remixicon/react";
import clx from "classnames";
import { useShallow } from "zustand/shallow";

import { createBroadcastChannel } from "@/common/broadcast/mini-player-sync";
import { getPlayModeList } from "@/common/constants/audio";

import { usePlayState } from "./play-state";
import { useStyle } from "./use-style";

const PlayModeList = getPlayModeList(16);

const MiniPlayer = () => {
  const { isSingle, isPlaying, mediaData, currentTime, duration, playMode } = usePlayState(
    useShallow(state => ({
      isSingle: state.isSingle,
      isPlaying: state.isPlaying,
      mediaData: state.mediaData,
      currentTime: state.currentTime,
      duration: state.duration,
      playMode: state.playMode,
    })),
  );
  const updatePlayState = usePlayState(state => state.update);

  const bcRef = useRef<BroadcastChannel>(null);

  const postMessage = (type: string, state?: any) => {
    if (!bcRef.current) return;
    bcRef.current.postMessage({
      from: "mini",
      data: {
        type,
        state,
      },
      ts: Date.now(),
    });
  };

  useStyle();

  const playModeIcon = useMemo(() => {
    return PlayModeList.find(item => item.value === playMode)?.icon;
  }, [playMode]);

  useEffect(() => {
    bcRef.current = createBroadcastChannel();
    postMessage("init");

    bcRef.current.onmessage = ev => {
      try {
        const { from, state } = ev.data || {};
        if (from !== "main" || !state) return;

        updatePlayState(state);
      } catch (err) {
        console.error("[mini] failed to handle message from main", err);
      }
    };

    return () => {
      if (!bcRef.current) return;
      bcRef.current.close();
    };
  }, []);

  const handleSwitchToMain = useCallback(() => {
    window.electron.switchToMainWindow();
  }, []);

  const handleSeek = (v: number) => {
    postMessage("seek", { currentTime: v });
  };

  const togglePlayMode = () => {
    postMessage("togglePlayMode");
  };

  const prev = () => {
    postMessage("prev");
  };

  const togglePlay = () => {
    postMessage("togglePlay");
  };

  const next = () => {
    postMessage("next");
  };

  return (
    <div className="window-drag bg-content1 rounded-medium flex h-screen w-screen flex-col overflow-hidden select-none">
      <div className="flex h-full items-center space-x-3 px-3">
        {Boolean(mediaData) && (
          <Image
            radius="md"
            src={mediaData?.cover}
            width={64}
            height={64}
            classNames={{ wrapper: "flex-none" }}
            className="object-cover"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col space-y-1">
          <div className="flex min-w-0 flex-col">
            {mediaData ? (
              <span className="truncate text-center text-sm font-medium">{mediaData?.title}</span>
            ) : (
              <span className="text-center text-sm text-zinc-500">暂无播放内容</span>
            )}
          </div>
          <div className="window-no-drag mt-1 flex items-center">
            <Slider
              aria-label="播放进度"
              minValue={0}
              maxValue={duration}
              value={currentTime}
              onChange={v => {
                handleSeek(v as number);
              }}
              isDisabled={!mediaData}
              size="sm"
              className="flex-1"
              classNames={{
                trackWrapper: "cursor-pointer group",
                track: "h-[4px]",
                thumb: clx("w-3 h-3 after:h-2 after:bg-primary opacity-0", {
                  "group-hover:opacity-100": Boolean(mediaData),
                }),
              }}
            />
          </div>
          <div className="flex items-center justify-between space-x-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={togglePlayMode}
              className="hover:text-primary window-no-drag"
              aria-label="播放模式"
            >
              {playModeIcon}
            </Button>
            <div className="flex items-center space-x-1">
              <Button
                isDisabled={!mediaData || isSingle}
                isIconOnly
                size="sm"
                variant="light"
                onPress={prev}
                className="hover:text-primary window-no-drag"
              >
                <RiSkipBackFill size={18} />
              </Button>
              <Button
                isDisabled={!mediaData}
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => {
                  togglePlay();
                }}
                className="hover:text-primary window-no-drag"
              >
                {isPlaying ? <RiPauseCircleFill size={28} /> : <RiPlayCircleFill size={28} />}
              </Button>
              <Button
                isDisabled={!mediaData || isSingle}
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => {
                  next();
                }}
                className="hover:text-primary window-no-drag"
              >
                <RiSkipForwardFill size={18} />
              </Button>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={handleSwitchToMain}
              className="hover:text-primary window-no-drag"
            >
              <RiExpandDiagonalLine size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
