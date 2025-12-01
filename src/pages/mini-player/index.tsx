import { useEffect, useMemo } from "react";

import { Button, Image, Slider } from "@heroui/react";
import {
  RiExpandDiagonalLine,
  RiPauseCircleFill,
  RiPlayCircleFill,
  RiSkipBackFill,
  RiSkipForwardFill,
} from "@remixicon/react";
import { useShallow } from "zustand/react/shallow";

import { getPlayModeList } from "@/common/constants/audio";
import { formatDuration } from "@/common/utils";
import { usePlayQueue } from "@/store/play-queue";

const PlayModeList = getPlayModeList(18);

const MiniPlayer = () => {
  const {
    init,
    currentBvid,
    currentCid,
    isPlaying,
    duration,
    currentTime,
    togglePlay,
    prev,
    next,
    seek,
    list,
    playMode,
    setPlayMode,
  } = usePlayQueue(
    useShallow(s => ({
      init: s.init,
      currentBvid: s.currentBvid,
      currentCid: s.currentCid,
      isPlaying: s.isPlaying,
      duration: s.duration,
      currentTime: s.currentTime,
      togglePlay: s.togglePlay,
      prev: s.prev,
      next: s.next,
      seek: s.seek,
      list: s.list,
      playMode: s.playMode,
      setPlayMode: s.setPlayMode,
    })),
  );

  const { title, cover, ownerName, disabled } = useMemo(() => {
    const mvData = list.find(item => item.bvid === currentBvid);
    const pageData = mvData?.pages?.find(item => item.cid === currentCid);
    const hasPages = (mvData?.pages?.length ?? 0) > 1;
    return {
      title: hasPages ? pageData?.title : mvData?.title,
      cover: hasPages ? pageData?.cover : mvData?.cover,
      ownerName: mvData?.ownerName,
      disabled: list.length === 0,
    };
  }, [list, currentBvid, currentCid]);

  useEffect(() => {
    init();
  }, [init]);

  const handleSwitchToMain = () => {
    window.electron.switchToMainWindow();
  };

  const togglePlayMode = () => {
    const currentIndex = PlayModeList.findIndex(item => item.value === playMode);
    const nextIndex = (currentIndex + 1) % PlayModeList.length;
    setPlayMode(PlayModeList[nextIndex].value);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-zinc-900 select-none">
      <div className="window-drag flex h-full items-center space-x-2 px-3">
        {currentBvid && (
          <Image
            radius="md"
            src={cover}
            width={64}
            height={64}
            classNames={{ wrapper: "flex-none" }}
            className="object-cover"
          />
        )}
        <div className="window-no-drag flex min-w-0 flex-1 flex-col space-y-1">
          <div className="flex min-w-0 flex-col">
            {currentBvid ? (
              <>
                <span className="truncate text-sm font-medium">{title}</span>
                <span className="text-center text-xs text-zinc-400">{ownerName}</span>
              </>
            ) : (
              <span className="text-sm text-zinc-500">暂无播放内容</span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-8 text-xs whitespace-nowrap opacity-70">
              {currentTime ? formatDuration(currentTime) : "-:--"}
            </span>
            <Slider
              aria-label="播放进度"
              hideThumb
              minValue={0}
              maxValue={duration}
              value={currentTime}
              onChange={v => seek(v as number)}
              isDisabled={disabled}
              size="sm"
              className="flex-1"
              classNames={{ track: "h-[3px]" }}
            />
            <span className="w-8 text-xs whitespace-nowrap opacity-70">
              {duration ? formatDuration(duration) : "-:--"}
            </span>
          </div>
          <div className="flex items-center justify-between space-x-1">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={togglePlayMode}
              className="hover:text-primary"
              aria-label="播放模式"
            >
              {PlayModeList.find(item => item.value === playMode)?.icon}
            </Button>
            <div className="flex items-center space-x-1">
              <Button
                isDisabled={disabled}
                isIconOnly
                size="sm"
                variant="light"
                onPress={prev}
                className="hover:text-primary"
              >
                <RiSkipBackFill size={18} />
              </Button>
              <Button
                isDisabled={disabled}
                isIconOnly
                size="sm"
                variant="light"
                onPress={togglePlay}
                className="hover:text-primary"
              >
                {isPlaying ? <RiPauseCircleFill size={28} /> : <RiPlayCircleFill size={28} />}
              </Button>
              <Button
                isDisabled={disabled}
                isIconOnly
                size="sm"
                variant="light"
                onPress={next}
                className="hover:text-primary"
              >
                <RiSkipForwardFill size={18} />
              </Button>
            </div>
            <Button isIconOnly size="sm" variant="light" onPress={handleSwitchToMain} className="hover:text-primary">
              <RiExpandDiagonalLine size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
