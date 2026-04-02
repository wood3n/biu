import { useEffect, useMemo, useRef, useState } from "react";

import { Tooltip } from "@heroui/react";
import clx from "classnames";

import type { MenuItemProps } from "./menu-item";

import MenuGroup from "./menu-group";
import MenuItem from "./menu-item";

export interface MenuFoldProps<T = MenuItemProps> extends MenuItemProps {
  /** 菜单项组 */
  items: T[];
  /* 是否折叠 */
  isFolded: boolean;
  renderItem?: (item: T, index: number) => React.ReactNode;
}

const MenuFold = <T = MenuItemProps,>({
  items,
  isFolded,
  collapsed,
  onPress,
  renderItem,
  ...menuItemProps
}: MenuFoldProps<T>) => {
  const [isHover, setIsHover] = useState(false);

  // 延迟关闭定时器（核心）
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // —————— 鼠标进入触发区 ——————
  const handleMouseEnter = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current); // 清除延迟
      closeTimer.current = null;
    }
    setIsHover(true);
  };

  // —————— 鼠标离开触发区 ——————
  const handleMouseLeave = () => {
    // 延迟 100ms 关闭，给鼠标移动时间
    closeTimer.current = setTimeout(() => {
      setIsHover(false);
    }, 100);
  };

  const menuGroup = useMemo(() => {
    return (
      <MenuGroup<T>
        className={clx({
          "pt-1 pl-2": !collapsed,
        })}
        items={items}
        collapsed={collapsed}
        renderItem={renderItem}
      />
    );
  }, [items, collapsed, renderItem]);

  /* 组件卸载时清理定时器 */
  useEffect(() => {
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    };
  });

  return collapsed ? (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Tooltip
        classNames={{
          content: ["w-15 overflow-hidden"],
        }}
        isOpen={isHover}
        content={menuGroup}
        placement="right"
      >
        <MenuItem collapsed={collapsed} {...(menuItemProps as MenuItemProps)} />
      </Tooltip>
    </div>
  ) : (
    <div>
      <MenuItem collapsed={collapsed} onPress={onPress} {...(menuItemProps as MenuItemProps)} />
      {!isFolded && menuGroup}
    </div>
  );
};

export default MenuFold;
