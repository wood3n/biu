import React from "react";

import { Button } from "@heroui/react";
import { RiPauseCircleFill, RiPlayCircleFill, RiSkipBackFill, RiSkipForwardFill } from "@remixicon/react";

import { usePlayList } from "@/store/play-list";

import { PlayBarIconSize } from "../constants";
import Progress from "./progress";

const Control = () => {
  const prev = usePlayList(state => state.prev);
  const next = usePlayList(state => state.next);
  const list = usePlayList(state => state.list);
  const togglePlay = usePlayList(state => state.togglePlay);
  const isPlaying = usePlayList(state => state.isPlaying);

  const isEmptyPlayList = list.length === 0;
  const isSingle = list.length === 1;

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-0.5 overflow-hidden px-6">
      <div className="flex items-center space-x-6">
        <Button
          radius="sm"
          onPress={prev}
          isDisabled={isEmptyPlayList || isSingle}
          isIconOnly
          size="sm"
          variant="light"
          className="hover:text-primary"
        >
          <RiSkipBackFill size={PlayBarIconSize.SecondControlIconSize} />
        </Button>
        <Button
          isDisabled={isEmptyPlayList}
          isIconOnly
          variant="light"
          radius="full"
          className="hover:text-primary"
          onPress={togglePlay}
        >
          {isPlaying ? (
            <RiPauseCircleFill size={PlayBarIconSize.MainControlIconSize} />
          ) : (
            <RiPlayCircleFill size={PlayBarIconSize.MainControlIconSize} />
          )}
        </Button>
        <Button
          radius="sm"
          onPress={next}
          isDisabled={isEmptyPlayList || isSingle}
          isIconOnly
          size="sm"
          variant="light"
          className="hover:text-primary"
        >
          <RiSkipForwardFill size={PlayBarIconSize.SecondControlIconSize} />
        </Button>
      </div>
      <Progress isDisabled={isEmptyPlayList} />
    </div>
  );
};

export default Control;
