import { useState } from "react";

import { Button } from "@heroui/react";
import { RiArrowDownSLine, RiArrowRightSLine } from "@remixicon/react";
import clx from "classnames";

import MenuItem, { type MenuItemProps } from "../../components/menu/menu-item";

interface Props {
  title: React.ReactNode;
  titleExtra?: React.ReactNode;
  itemClassName?: string;
  items: MenuItemProps[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const MenuGroup = ({ title, titleExtra, itemClassName, items, collapsible = false, defaultExpanded = true }: Props) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <>
      <div className="flex items-center justify-between p-2 text-zinc-500">
        {collapsible ? (
          <Button
            onPress={() => setIsExpanded(!isExpanded)}
            variant={isExpanded ? "flat" : "light"}
            radius="md"
            color="default"
            className={clx("h-auto min-w-0 flex-1 justify-start px-2 py-1.5", {
              "text-primary": isExpanded,
              "text-zinc-500": !isExpanded,
            })}
            startContent={isExpanded ? <RiArrowDownSLine size={16} /> : <RiArrowRightSLine size={16} />}
          >
            <span className="truncate">{title}</span>
          </Button>
        ) : (
          <div className="flex items-center gap-1 text-sm text-zinc-500">
            <span>{title}</span>
          </div>
        )}
        <div className="ml-1 text-sm">{titleExtra}</div>
      </div>
      {isExpanded && (
        <div className="flex flex-col space-y-1">
          {items.map(item => (
            <MenuItem key={item.href} {...item} className={itemClassName} />
          ))}
        </div>
      )}
    </>
  );
};

export default MenuGroup;
