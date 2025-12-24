import React from "react";

import { Button } from "@heroui/react";

import { getPlayModeList } from "@/common/constants/audio";
import { usePlayList } from "@/store/play-list";

const PlayModeList = getPlayModeList(18);

const MusicPlayMode = () => {
  const playMode = usePlayList(s => s.playMode);
  const togglePlayMode = usePlayList(s => s.togglePlayMode);

  return (
    <Button
      isIconOnly
      variant="light"
      size="sm"
      className="hover:text-primary flex-none"
      aria-label="播放模式"
      onPress={togglePlayMode}
    >
      {PlayModeList.find(item => item.value === playMode)?.icon}
    </Button>
  );
};

export default MusicPlayMode;
