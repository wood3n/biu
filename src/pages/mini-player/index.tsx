import React, { useEffect } from "react";

import { Button, Image, Slider } from "@heroui/react";
import {
  RiExpandDiagonalLine,
  RiPauseCircleFill,
  RiPlayCircleFill,
  RiSkipBackFill,
  RiSkipForwardFill,
} from "@remixicon/react";

import { formatDuration } from "@/common/utils";
import Ellipsis from "@/components/ellipsis";
import { usePlayQueue } from "@/store/play-queue";

const MiniPlayer = () => {
  const init = usePlayQueue(s => s.init);
  const currentBvid = usePlayQueue(s => s.currentBvid);
  const currentCid = usePlayQueue(s => s.currentCid);
  const isPlaying = usePlayQueue(s => s.isPlaying);
  const duration = usePlayQueue(s => s.duration);
  const currentTime = usePlayQueue(s => s.currentTime);
  const togglePlay = usePlayQueue(s => s.togglePlay);
  const prev = usePlayQueue(s => s.prev);
  const next = usePlayQueue(s => s.next);
  const seek = usePlayQueue(s => s.seek);
  const list = usePlayQueue(s => s.list);

  const mvData = usePlayQueue(s => s.list.find(item => item.bvid === s.currentBvid));
  const pageData = mvData?.pages?.find(item => item.cid === currentCid);
  const hasPages = (mvData?.pages?.length ?? 0) > 1;
  const title = hasPages ? pageData?.title : mvData?.title;
  const cover = hasPages ? pageData?.cover : mvData?.cover;
  const ownerName = mvData?.ownerName;
  const disabled = list.length === 0;

  useEffect(() => {
    init();
  }, [init]);

  const handleSwitchToMain = () => {
    window.electron.switchToMainWindow();
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-zinc-900 select-none">
      <div className="window-drag flex h-full items-center space-x-3 px-4">
        {currentBvid && (
          <Image
            radius="md"
            src={cover}
            width={72}
            height={72}
            classNames={{ wrapper: "flex-none" }}
            className="object-cover"
          />
        )}
        <div className="window-no-drag flex min-w-0 flex-1 flex-col space-y-2">
          <div className="flex min-w-0 flex-col">
            {currentBvid ? (
              <>
                <Ellipsis className="text-sm font-medium">{title}</Ellipsis>
                <span className="text-xs text-zinc-400">{ownerName}</span>
              </>
            ) : (
              <span className="text-sm text-zinc-500">暂无播放内容</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-9 text-xs whitespace-nowrap opacity-70">
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
            <span className="w-9 text-xs whitespace-nowrap opacity-70">
              {duration ? formatDuration(duration) : "-:--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
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
                {isPlaying ? <RiPauseCircleFill size={32} /> : <RiPlayCircleFill size={32} />}
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
