import React from "react";

import { RiPauseFill, RiPlayFill, RiSkipBackFill, RiSkipForwardFill } from "@remixicon/react";

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
    <div className="flex items-center justify-center gap-5">
      <IconButton radius="full" onPress={prev} isDisabled={isEmptyPlayList || isSingle} className="size-8 min-w-8">
        <RiSkipBackFill size={18} />
      </IconButton>
      <IconButton
        isDisabled={isEmptyPlayList}
        radius="full"
        onPress={togglePlay}
        variant="solid"
        color="primary"
        className="size-10 min-w-10 text-white"
      >
        {isPlaying ? <RiPauseFill size={20} className="text-white" /> : <RiPlayFill size={20} className="text-white" />}
      </IconButton>
      <IconButton radius="full" onPress={next} isDisabled={isEmptyPlayList || isSingle} className="size-8 min-w-8">
        <RiSkipForwardFill size={18} />
      </IconButton>
    </div>
  );
};

export default MusicPlayControl;
