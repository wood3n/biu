import React from "react";

import { Button } from "@heroui/react";

import { getPlayModeList } from "@/common/constants/audio";
import { usePlayQueue } from "@/store/play-queue";

import { PlayBarIconSize } from "../constants";

const PlayModeList = getPlayModeList(PlayBarIconSize.SideIconSize);

const PlayModeSwitch = () => {
  const playMode = usePlayQueue(s => s.playMode);
  const setPlayMode = usePlayQueue(s => s.setPlayMode);

  const togglePlayMode = () => {
    const currentIndex = PlayModeList.findIndex(item => item.value === playMode);
    const nextIndex = (currentIndex + 1) % PlayModeList.length;
    setPlayMode(PlayModeList[nextIndex].value);
  };

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
