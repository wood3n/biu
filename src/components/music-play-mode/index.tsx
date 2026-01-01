import React from "react";

import { getPlayModeList } from "@/common/constants/audio";
import IconButton from "@/components/icon-button";
import { usePlayList } from "@/store/play-list";

const PlayModeList = getPlayModeList(18);

const MusicPlayMode = () => {
  const playMode = usePlayList(s => s.playMode);
  const togglePlayMode = usePlayList(s => s.togglePlayMode);

  return (
    <IconButton className="flex-none" aria-label="播放模式" onPress={togglePlayMode}>
      {PlayModeList.find(item => item.value === playMode)?.icon}
    </IconButton>
  );
};

export default MusicPlayMode;
