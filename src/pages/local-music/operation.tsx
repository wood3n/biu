import React, { useState } from "react";

import { Button, Listbox, ListboxItem, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { RiMore2Line } from "@remixicon/react";
import { twMerge } from "tailwind-merge";

export interface LocalOperationItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  className?: string;
  hidden?: boolean;
}

export interface OperationMenuProps {
  items: LocalOperationItem[];
  onAction?: (key: string) => void;
  onOpenChange?: (open: boolean) => void;
}

const OperationMenu = ({ items, onAction, onOpenChange }: OperationMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      radius="md"
      isOpen={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        onOpenChange?.(open);
      }}
      placement="bottom-end"
      offset={4}
      disableAnimation
    >
      <PopoverTrigger>
        <Button isIconOnly variant="light" size="sm" aria-label="操作菜单">
          <RiMore2Line size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[140px] p-0"
        data-no-contextmenu="true"
        onContextMenuCapture={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onContextMenu={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Listbox
          aria-label="操作菜单"
          selectionMode="none"
          items={items.filter(item => !item.hidden)}
          data-no-contextmenu="true"
          onContextMenuCapture={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onContextMenu={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onAction={key => {
            onAction?.(String(key));
            setIsOpen(false);
          }}
          className="p-2"
        >
          {item => (
            <ListboxItem
              key={item.key}
              startContent={item.icon}
              className={twMerge("rounded-medium", item.className)}
              color={item.color}
            >
              {item.label}
            </ListboxItem>
          )}
        </Listbox>
      </PopoverContent>
    </Popover>
  );
};

export default OperationMenu;
