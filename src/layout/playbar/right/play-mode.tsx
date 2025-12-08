import React from "react";

import { Button } from "@heroui/react";

import { getPlayModeList } from "@/common/constants/audio";
import { usePlayList } from "@/store/play-list";

import { PlayBarIconSize } from "../constants";

const PlayModeList = getPlayModeList(PlayBarIconSize.SideIconSize);

const PlayModeSwitch = () => {
  const playMode = usePlayList(s => s.playMode);
  const togglePlayMode = usePlayList(s => s.togglePlayMode);

  return (
    <Button
      isIconOnly
      variant="light"
      size="sm"
      className="hover:text-primary min-w-fit text-[18px]"
      aria-label="播放模式"
      onPress={togglePlayMode}
    >
      {PlayModeList.find(item => item.value === playMode)?.icon}
    </Button>
  );
};

export default PlayModeSwitch;
