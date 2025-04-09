import React from "react";

import clx from "classnames";
import { Button } from "@heroui/react";
import {
  RiPauseCircleFill,
  RiPlayCircleFill,
  RiShuffleFill,
  RiSkipBackFill,
  RiSkipForwardFill,
} from "@remixicon/react";

import { formatDuration } from "@/common/utils";
import { usePlayingQueue } from "@/store/playing-queue";

import If from "../if";
import { PlayBarStyle, PlayMode, PlayModeIcon } from "./constants";
import Slider from "./slider";

interface Props {
  disabled?: boolean;
  loading?: boolean;
  progress?: number;
  duration?: number | null;
  paused?: boolean;
  isRandom?: boolean;
  playMode: PlayMode;
  onSeek?: (progress: number) => void;
  onPlay?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onToggleRandomPlay: () => void;
  onChangePlayMode: (v: PlayMode) => void;
  className?: string;
}

const Control = ({
  disabled,
  loading,
  progress,
  playMode,
  isRandom,
  duration,
  paused,
  onSeek,
  onPlay,
  onNext,
  onPrev,
  onToggleRandomPlay,
  onChangePlayMode,
  className,
}: Props) => {
  const { currentSong } = usePlayingQueue();

  const handleChangePlayMode = () => {
    const playModes = [PlayMode.Sequential, PlayMode.Loop, PlayMode.Single];
    const currentIndex = playModes.indexOf(playMode);
    onChangePlayMode(playModes[(currentIndex + 1) % playModes.length] as PlayMode);
  };

  return (
    <div className={clx("flex h-full flex-col items-center justify-center space-y-0.5 px-6", className)}>
      <div className="flex items-center space-x-6">
        <Button
          onPress={onToggleRandomPlay}
          isDisabled={disabled}
          isIconOnly
          size="sm"
          variant="light"
          color={isRandom ? "success" : "default"}
          className="hover:text-green-500"
        >
          <RiShuffleFill size={PlayBarStyle.ThirdControlIconSize} />
        </Button>
        <Button
          onPress={onPrev}
          isDisabled={disabled}
          isIconOnly
          size="sm"
          variant="light"
          className="hover:text-green-500"
        >
          <RiSkipBackFill size={PlayBarStyle.SecondControlIconSize} />
        </Button>
        <Button
          isDisabled={disabled}
          isIconOnly
          variant="light"
          radius="full"
          className="hover:text-green-500"
          onPress={onPlay}
        >
          {paused ? (
            <RiPlayCircleFill size={PlayBarStyle.MainControlIconSize} />
          ) : (
            <RiPauseCircleFill size={PlayBarStyle.MainControlIconSize} />
          )}
        </Button>
        <Button
          onPress={onNext}
          isDisabled={disabled}
          isIconOnly
          size="sm"
          variant="light"
          className="hover:text-green-500"
        >
          <RiSkipForwardFill size={PlayBarStyle.SecondControlIconSize} />
        </Button>
        <Button
          onPress={handleChangePlayMode}
          isDisabled={disabled}
          isIconOnly
          size="sm"
          variant="light"
          color={playMode === PlayMode.Sequential ? "default" : "success"}
          className="hover:text-green-500"
        >
          {PlayModeIcon[playMode]}
        </Button>
      </div>
      <Slider
        aria-label="进度"
        isDisabled={disabled || loading}
        hideThumb
        className="w-3/4"
        minValue={0}
        maxValue={duration || 0}
        value={progress}
        startContent={
          <div className="flex w-12 justify-center whitespace-nowrap text-sm opacity-70">
            <If condition={currentSong?.id}>{progress ? formatDuration(progress, false) : "00:00"}</If>
          </div>
        }
        // @ts-ignore value is number
        onChange={onSeek}
        endContent={
          <span className="flex w-12 justify-center whitespace-nowrap text-sm opacity-70">
            {duration ? formatDuration(duration, false) : null}
          </span>
        }
      />
    </div>
  );
};

export default Control;
