import React from "react";

import { RiPauseCircleFill, RiPlayCircleFill, RiSkipBackFill, RiSkipForwardFill } from "@remixicon/react";

import IconButton from "@/components/icon-button";
import { usePlayList } from "@/store/play-list";

const MusicPlayControl = () => {
  const prev = usePlayList(state => state.prev);
  const next = usePlayList(state => state.next);
  const list = usePlayList(state => state.list);
  const togglePlay = usePlayList(state => state.togglePlay);
  const isPlaying = usePlayList(state => state.isPlaying);

  const isEmptyPlayList = list.length === 0;
  const isSingle = list.length === 1;

  return (
    <div className="flex items-center justify-center space-x-6">
      <IconButton radius="md" onPress={prev} isDisabled={isEmptyPlayList || isSingle}>
        <RiSkipBackFill size={22} />
      </IconButton>
      <IconButton isDisabled={isEmptyPlayList} radius="full" onPress={togglePlay} className="size-12 min-w-12">
        {isPlaying ? <RiPauseCircleFill size={48} /> : <RiPlayCircleFill size={48} />}
      </IconButton>
      <IconButton radius="md" onPress={next} isDisabled={isEmptyPlayList || isSingle}>
        <RiSkipForwardFill size={22} />
      </IconButton>
    </div>
  );
};

export default MusicPlayControl;
