import React from "react";

import { Button, Tooltip } from "@heroui/react";

import { PlayMode, PlayModeDesc } from "@/common/constants";

import { PlayModeIcon } from "./constants";

interface Props {
  value: PlayMode;
  onChange: (v: PlayMode) => void;
}

const playModes = [PlayMode.Loop, PlayMode.Random, PlayMode.Single];

const PlayModeToggle = ({ value, onChange }: Props) => {
  const handleChange = () => {
    const index = playModes.indexOf(value);
    const nextIndex = (index + 1) % playModes.length;
    onChange(playModes[nextIndex]);
  };

  return (
    <Tooltip content={PlayModeDesc[value]}>
      <Button size="sm" variant="light" onPress={handleChange}>
        {PlayModeIcon[value]}
      </Button>
    </Tooltip>
  );
};

export default PlayModeToggle;
