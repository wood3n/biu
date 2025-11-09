import React, { useRef } from "react";

import { Button, Tooltip, Slider, type PressEvent } from "@heroui/react";
import { RiVolumeDownLine, RiVolumeMuteLine, RiVolumeUpLine } from "@remixicon/react";

import { PlayBarIconSize } from "../constants";

interface Props {
  isMuted: boolean;
  value: number;
  onChange: (value: number) => void;
  onChangeMute: (isMuted: boolean) => void;
}

const Volume = ({ isMuted, value, onChange, onChangeMute }: Props) => {
  const previousVolume = useRef(value);

  const onVolumeChange = (val: number) => {
    if (isMuted) {
      onChangeMute(false);
    }
    if (val === 0) {
      onChangeMute(true);
    }
    onChange(val);
  };

  const toggleMute = (e: PressEvent) => {
    e.continuePropagation();
    if (!isMuted) {
      previousVolume.current = value;
      onChange(0);
    } else {
      onChange(previousVolume.current);
    }
    onChangeMute(!isMuted);
  };

  const tooltipId = "volume-tooltip";

  return (
    <Tooltip
      id={tooltipId}
      placement="top"
      delay={200}
      showArrow={false}
      classNames={{
        content: "py-4 w-[60px] min-w-[60px] flex justify-center items-center",
      }}
      content={
        <Slider
          aria-label="音量"
          color="primary"
          radius="full"
          orientation="vertical"
          className="h-40 w-7"
          value={value}
          size="sm"
          minValue={0}
          maxValue={1}
          step={0.01}
          // @ts-expect-error value is number
          onChange={onVolumeChange}
          classNames={{
            thumb: "after:hidden",
          }}
          endContent={
            <span className="text-foreground/60 w-8 text-center text-xs tabular-nums">{Math.round(value * 100)}%</span>
          }
        />
      }
    >
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="hover:text-primary"
        onPress={toggleMute}
        aria-label={isMuted ? "取消静音" : "静音"}
        aria-describedby={tooltipId}
      >
        {isMuted ? (
          <RiVolumeMuteLine size={PlayBarIconSize.SideIconSize} />
        ) : value > 0.5 ? (
          <RiVolumeUpLine size={PlayBarIconSize.SideIconSize} />
        ) : (
          <RiVolumeDownLine size={PlayBarIconSize.SideIconSize} />
        )}
      </Button>
    </Tooltip>
  );
};

export default Volume;
