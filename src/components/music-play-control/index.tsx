import React from "react";

import {
  RiForward5Fill,
  RiPauseCircleFill,
  RiPlayCircleFill,
  RiReplay5Fill,
  RiSkipBackFill,
  RiSkipForwardFill,
} from "@remixicon/react";

import IconButton from "@/components/icon-button";
import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";

/** 快进/回退步长（秒） */
const SEEK_STEP = 5;

const MusicPlayControl = () => {
  const prev = usePlayList(state => state.prev);
  const next = usePlayList(state => state.next);
  const list = usePlayList(state => state.list);
  const togglePlay = usePlayList(state => state.togglePlay);
  const isPlaying = usePlayList(state => state.isPlaying);
  const seek = usePlayList(state => state.seek);

  const isEmptyPlayList = list.length === 0;
  const isSingle = list.length === 1;

  // 基于当前播放进度增减偏移，下限 0、上限总时长
  const seekBy = (delta: number) => {
    if (isEmptyPlayList) return;
    const cur = usePlayProgress.getState().currentTime || 0;
    const dur = usePlayList.getState().duration;
    let nextTime = cur + delta;
    if (nextTime < 0) nextTime = 0;
    if (typeof dur === "number" && Number.isFinite(dur) && nextTime > dur) nextTime = dur;
    seek(nextTime);
  };

  return (
    <div className="flex items-center justify-center space-x-5">
      <IconButton radius="md" tooltip="后退 5 秒" onPress={() => seekBy(-SEEK_STEP)} isDisabled={isEmptyPlayList}>
        <RiReplay5Fill size={20} />
      </IconButton>
      <IconButton radius="md" onPress={prev} isDisabled={isEmptyPlayList || isSingle}>
        <RiSkipBackFill size={22} />
      </IconButton>
      <IconButton isDisabled={isEmptyPlayList} radius="full" onPress={togglePlay} className="size-12 min-w-12">
        {isPlaying ? <RiPauseCircleFill size={48} /> : <RiPlayCircleFill size={48} />}
      </IconButton>
      <IconButton radius="md" onPress={next} isDisabled={isEmptyPlayList || isSingle}>
        <RiSkipForwardFill size={22} />
      </IconButton>
      <IconButton radius="md" tooltip="快进 5 秒" onPress={() => seekBy(SEEK_STEP)} isDisabled={isEmptyPlayList}>
        <RiForward5Fill size={20} />
      </IconButton>
    </div>
  );
};

export default MusicPlayControl;
