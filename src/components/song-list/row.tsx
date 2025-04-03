import React, { HTMLAttributes, useState } from "react";

import clx from "classnames";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";

import { ColumnsType } from "./types";

interface Props extends HTMLAttributes<HTMLDivElement> {
  index: number;
  data: Song;
  columns: ColumnsType<Song>;
  hoverable?: boolean;
  isSelected?: boolean;
}

const Row = ({ index, data, columns, hoverable, isSelected, className, ...props }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <DropdownTrigger>
        <div
          {...props}
          className={clx("flex space-x-4 rounded-lg py-2", className, {
            "bg-mid-green text-green-500": isSelected,
            "cursor-pointer hover:bg-zinc-800": hoverable && !isSelected,
          })}
          onContextMenu={e => {
            e.preventDefault();
            setIsOpen(true);
          }}
        >
          {columns.map(({ key, align = "start", render, className }) => (
            <div key={key} className={clx(`flex items-center justify-${align}`, className)}>
              {render({ index, rowData: data, isSelected })}
            </div>
          ))}
        </div>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem key="new">New file</DropdownItem>
        <DropdownItem key="copy">Copy link</DropdownItem>
        <DropdownItem key="edit">Edit file</DropdownItem>
        <DropdownItem key="delete" className="text-danger" color="danger">
          Delete file
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default Row;
