import React from "react";

import MusicPlayControl from "@/components/music-play-control";
import MusicPlayProgress from "@/components/music-play-progress";
import { usePlayList } from "@/store/play-list";

const Control = () => {
  const list = usePlayList(state => state.list);
  const isEmptyPlayList = list.length === 0;

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-0.5 overflow-hidden px-6">
      <MusicPlayControl />
      <MusicPlayProgress isDisabled={isEmptyPlayList} />
    </div>
  );
};

export default Control;
