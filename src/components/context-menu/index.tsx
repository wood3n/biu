import React, { useCallback, useState } from "react";

import { Listbox, ListboxItem, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { twMerge } from "tailwind-merge";

export interface ContextMenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  hidden?: boolean;
  className?: string;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

export interface ContextMenuProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  onAction?: (key: string) => void;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

const ContextMenu = ({ children, items, className, contentClassName, disabled, onAction }: ContextMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setPosition(null);
  }, [setIsOpen, setPosition]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const target = event.target as HTMLElement | null;
    let el: HTMLElement | null = target;
    const container = event.currentTarget as HTMLElement;
    while (el && el !== container) {
      if (el.getAttribute("data-no-contextmenu") === "true") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      el = el.parentElement;
    }
    event.preventDefault();
    const rect = container.getBoundingClientRect();
    setPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    setIsOpen(true);
  }, []);

  return (
    <div onContextMenu={handleContextMenu} className={twMerge("relative", className)}>
      {children}
      {position && (
        <Popover
          radius="md"
          isOpen={isOpen}
          onOpenChange={openState => {
            if (!openState) {
              closeMenu();
            }
          }}
          placement="bottom-start"
          offset={4}
          disableAnimation
          shouldBlockScroll={false}
        >
          <PopoverTrigger>
            <div
              style={{
                position: "absolute",
                left: position.x,
                top: position.y,
                width: 0,
                height: 0,
              }}
            />
          </PopoverTrigger>
          <PopoverContent className={twMerge("min-w-[160px] p-0", contentClassName)}>
            {/* @ts-ignore 忽略 ListboxItem 的 key 类型错误 */}
            <Listbox
              aria-label="右键菜单"
              selectionMode="none"
              onAction={key => {
                onAction?.(key as string);
                closeMenu();
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
      )}
    </div>
  );
};

export default ContextMenu;
