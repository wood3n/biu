import React, { useState } from "react";

import { Button, Listbox, ListboxItem, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { RiMore2Line } from "@remixicon/react";
import { twMerge } from "tailwind-merge";

import type { ContextMenuItem } from "@/components/context-menu";

export interface OperationMenuProps {
  items: ContextMenuItem[];
  onAction?: (key: string) => void;
}

const OperationMenu = ({ items, onAction }: OperationMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover radius="md" isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom-end" offset={4} disableAnimation>
      <PopoverTrigger>
        <Button isIconOnly variant="light" size="sm" aria-label="操作菜单">
          <RiMore2Line size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[140px] p-0">
        {/* @ts-ignore 忽略 ListboxItem 的 key 类型错误 */}
        <Listbox
          aria-label="操作菜单"
          selectionMode="none"
          onAction={key => {
            onAction?.(key as string);
            setIsOpen(false);
          }}
          className="p-2"
        >
          {items
            .filter(item => !item.hidden)
            .map(item => (
              <ListboxItem
                key={item.key}
                startContent={item.icon}
                className={twMerge("rounded-medium", item.className)}
                color={item.color}
              >
                {item.label}
              </ListboxItem>
            ))}
        </Listbox>
      </PopoverContent>
    </Popover>
  );
};

export default OperationMenu;
