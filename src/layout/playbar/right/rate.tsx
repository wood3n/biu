import React from "react";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";

import { PlayRate } from "../constants";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const Rate = ({ value, onChange }: Props) => {
  return (
    <Dropdown type="listbox" classNames={{ content: "min-w-0" }}>
      <DropdownTrigger>
        <Button isIconOnly variant="light" size="sm" className="text-medium min-w-fit px-2 hover:text-green-500">
          {value}x
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="播放速率"
        hideSelectedIcon
        disableAnimation
        selectionMode="single"
        selectedKeys={new Set([String(value)])}
        onSelectionChange={keys => onChange(Number([...keys].at(0)))}
        className="w-fit"
      >
        {PlayRate.map(v => (
          <DropdownItem key={String(v)}>{v}x</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default Rate;
