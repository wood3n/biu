import React, { useRef } from "react";

import { Button, Slider } from "@heroui/react";
import { RiVolumeMuteLine, RiVolumeUpLine } from "@remixicon/react";

import { PlayBarIconSize } from "../constants";

interface Props {
  isMuted: boolean;
  value: number;
  onChange: (value: number) => void;
  onChangeMute: (isMuted: boolean) => void;
}

const Volume = ({ isMuted, value, onChange, onChangeMute }: Props) => {
  const previousVolume = useRef(value);

  const onVolumeChange = (value: number) => {
    if (isMuted) {
      onChangeMute(false);
    }
    if (value === 0) {
      onChangeMute(true);
    }
    onChange(value);
  };

  const toggleMute = () => {
    if (!isMuted) {
      previousVolume.current = value;
      onChange(0);
    } else {
      onChange(previousVolume.current);
    }
    onChangeMute(!isMuted);
  };

  return (
    <Slider
      disableAnimation
      disableThumbScale
      aria-label="音量"
      size="sm"
      color="foreground"
      classNames={{
        track: "bg-default-500/30",
        thumb: "w-4 h-4 after:w-4 after:h-4 after:bg-foreground",
      }}
      className="w-36"
      value={value}
      minValue={0}
      maxValue={1}
      step={0.01}
      // @ts-expect-error value is number
      onChange={onVolumeChange}
      startContent={
        <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={toggleMute}>
          {isMuted ? (
            <RiVolumeMuteLine size={PlayBarIconSize.SideIconSize} />
          ) : (
            <RiVolumeUpLine size={PlayBarIconSize.SideIconSize} />
          )}
        </Button>
      }
    />
  );
};

export default Volume;
