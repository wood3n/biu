import React, { useRef } from "react";

import { Button } from "@heroui/react";
import { RiVolumeMuteLine, RiVolumeUpLine } from "@remixicon/react";

import { PlayBarStyle } from "./constants";
import Slider from "./slider";

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
      className="w-36 cursor-pointer"
      value={value}
      minValue={0}
      maxValue={1}
      step={0.01}
      // @ts-ignore value is number
      onChange={onVolumeChange}
      startContent={
        <Button isIconOnly size="sm" variant="light" className="hover:text-green-500" onPress={toggleMute}>
          {isMuted ? (
            <RiVolumeMuteLine size={PlayBarStyle.SideIconSize} />
          ) : (
            <RiVolumeUpLine size={PlayBarStyle.SideIconSize} />
          )}
        </Button>
      }
    />
  );
};

export default Volume;
