import React from "react";

import { Button } from "@heroui/react";

import { PlayMode, PlayModeIcon } from "./constants";

interface Props {
  value: PlayMode;
  onChange: (value: PlayMode) => void;
}

const Mode = ({ value, onChange }: Props) => {
  const togglePlayMode = () => {
    const playModes = [PlayMode.Sequential, PlayMode.Loop, PlayMode.Single, PlayMode.Random];
    const currentIndex = playModes.indexOf(value);
    onChange(playModes[(currentIndex + 1) % playModes.length] as PlayMode);
  };

  return (
    <Button isIconOnly variant="light" size="sm" className="hover:text-green-500" onPress={togglePlayMode}>
      {PlayModeIcon[value]}
    </Button>
  );
};

export default Mode;
