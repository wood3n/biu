import React, { useRef } from "react";

import { Button, Tooltip, Slider } from "@heroui/react";
import { RiVolumeDownLine, RiVolumeMuteLine, RiVolumeUpLine } from "@remixicon/react";

import { usePlayQueue } from "@/store/play-queue";

import { PlayBarIconSize } from "../constants";

const Volume = () => {
  const volume = usePlayQueue(s => s.volume);
  const isMuted = usePlayQueue(s => s.isMuted);
  const toggleMute = usePlayQueue(s => s.toggleMute);
  const setVolume = usePlayQueue(s => s.setVolume);

  const previousVolume = useRef(volume);

  const onVolumeChange = (val: number) => {
    if (isMuted) {
      toggleMute();
    }
    if (val === 0) {
      toggleMute();
    }
    setVolume(val);
  };

  const onToggleMute = () => {
    if (!isMuted) {
      previousVolume.current = volume;
      setVolume(0);
    } else {
      setVolume(previousVolume.current);
    }
    toggleMute();
  };

  const tooltipId = "volume-tooltip";

  return (
    <Tooltip
      id={tooltipId}
      placement="top"
      delay={300}
      showArrow={false}
      shouldCloseOnBlur={false}
      content={
        <div className="flex items-center justify-center p-3">
          <Slider
            disableAnimation
            aria-label="音量"
            color="primary"
            radius="full"
            size="sm"
            orientation="vertical"
            value={volume}
            minValue={0}
            maxValue={1}
            step={0.01}
            // @ts-expect-error volume is number
            onChange={onVolumeChange}
            classNames={{
              trackWrapper: "h-40 w-[32px]",
              thumb: "after:hidden",
            }}
            endContent={
              <span className="text-foreground/60 w-8 text-center text-xs tabular-nums">
                {Math.round(volume * 100)}%
              </span>
            }
          />
        </div>
      }
    >
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="hover:text-primary"
        onPress={onToggleMute}
        aria-label={isMuted ? "取消静音" : "静音"}
        aria-describedby={tooltipId}
      >
        {isMuted ? (
          <RiVolumeMuteLine size={PlayBarIconSize.SideIconSize} />
        ) : volume > 0.5 ? (
          <RiVolumeUpLine size={PlayBarIconSize.SideIconSize} />
        ) : (
          <RiVolumeDownLine size={PlayBarIconSize.SideIconSize} />
        )}
      </Button>
    </Tooltip>
  );
};

export default Volume;
