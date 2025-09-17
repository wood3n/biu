import React from "react";

import { Button } from "@heroui/react";
import { RiPauseCircleFill, RiPlayCircleFill, RiSkipBackFill, RiSkipForwardFill } from "@remixicon/react";

import { usePlayingQueue } from "@/store/playing-queue";

import { PlayBarIconSize } from "../constants";
import Progress from "./progress";

const Control = () => {
  const { prev, next, list, isPlaying, togglePlay } = usePlayingQueue();

  const disabled = !isPlaying && list.length === 0;

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-0.5 px-6">
      <div className="flex items-center space-x-6">
        <Button
          onPress={prev}
          isDisabled={disabled}
          isIconOnly
          size="sm"
          variant="light"
          className="hover:text-green-500"
        >
          <RiSkipBackFill size={PlayBarIconSize.SecondControlIconSize} />
        </Button>
        <Button
          isDisabled={disabled}
          isIconOnly
          variant="light"
          radius="full"
          className="hover:text-green-500"
          onPress={togglePlay}
        >
          {isPlaying ? (
            <RiPauseCircleFill size={PlayBarIconSize.MainControlIconSize} />
          ) : (
            <RiPlayCircleFill size={PlayBarIconSize.MainControlIconSize} />
          )}
        </Button>
        <Button
          onPress={next}
          isDisabled={disabled}
          isIconOnly
          size="sm"
          variant="light"
          className="hover:text-green-500"
        >
          <RiSkipForwardFill size={PlayBarIconSize.SecondControlIconSize} />
        </Button>
      </div>
      <Progress isDisabled={disabled} />
    </div>
  );
};

export default Control;
