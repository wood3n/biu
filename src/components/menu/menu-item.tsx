import React, { useMemo } from "react";
import { useLocation, useParams } from "react-router";

import { Button, Link as HeroLink, Avatar, Tooltip } from "@heroui/react";
import clx from "classnames";
import { twMerge } from "tailwind-merge";

export interface MenuItemProps {
  /** 菜单项 id */
  id?: string | number;
  /** 菜单项标签 */
  title: string;
  /** 菜单项链接 */
  href?: string;
  /** 菜单项图标 */
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  /** 封面 */
  cover?: string;
  /** 激活状态图标 */
  activeIcon?: React.ComponentType<{ size?: number | string; className?: string }>;
  /** 菜单项样式 */
  className?: string;
  /** 菜单项点击事件 */
  onPress?: VoidFunction;
  /** 收缩菜单项 */
  collapsed?: boolean;
  /** 用于 dnd-kit 等场景，把拖拽监听器绑定到可交互元素上 */
  dndProps?: ({ className?: string } & Record<string, unknown>) | undefined;
  /* 菜单项路径 用于匹配非跳转菜单 */
  path?: string;
  [key: string]: unknown;
}

const MenuItem: React.FC<MenuItemProps> = ({
  title,
  href,
  cover,
  icon: Icon,
  activeIcon: ActiveIcon,
  className,
  onPress,
  collapsed,
  path,
  dndProps,
  ...others
}) => {
  const { className: dndClassName, ...dndRest } = (dndProps ?? {}) as {
    className?: string;
  } & Record<string, unknown>;

  const location = useLocation();
  const { id } = useParams();

  /* 菜单项激活状态 */
  const isActive = useMemo(() => {
    const hrefPath = href?.split("?")[0];
    return (
      location.pathname === hrefPath ||
      (path ? location.pathname === path || location.pathname.startsWith(`${path}/`) : false) ||
      (id ? hrefPath?.endsWith(`/${id}`) : false)
    );
  }, [location.pathname, href, id, path]);

  /* 菜单项图标 */
  const menuIcon = useMemo(() => {
    // Icon 存在
    if (Icon) {
      // 图标切换
      const presentIcon =
        isActive && ActiveIcon ? <ActiveIcon size={18} className="text-primary" /> : <Icon size={18} />;

      // 是否折叠
      return collapsed ? (
        <Avatar className="h-10 w-10 flex-none" radius="md" fallback={presentIcon} alt={title} />
      ) : (
        presentIcon
      );
    }
    // 没 Icon 使用 封面/首字
    else {
      return (
        <Avatar
          // 折叠 改变尺寸
          className={clx("flex-none", {
            "h-4 w-4": !collapsed,
            "h-10 w-10": collapsed,
          })}
          name={title}
          src={cover ? `${cover}@672w_378h_1c.avif` : undefined}
          radius="md"
          alt={title}
        />
      );
    }
  }, [Icon, title, cover, isActive, ActiveIcon, collapsed]);

  const menuButton = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...restOthers } = others;

    return (
      <Button
        as={href ? (HeroLink as any) : "button"}
        href={href}
        fullWidth
        variant={isActive ? "flat" : "light"}
        color={isActive ? "primary" : "default"}
        onPress={onPress}
        disableRipple={collapsed ? false : true}
        startContent={collapsed ? undefined : menuIcon}
        className={clx(
          {
            [twMerge("w-full min-w-0 justify-center rounded-md px-0 py-1")]: collapsed,
            [twMerge("justify-start px-2 text-inherit")]: !collapsed,
          },
          className,
          dndClassName,
          {
            "h-auto": collapsed,
            "text-primary": isActive,
          },
        )}
        {...(dndRest as Record<string, unknown>)}
        {...restOthers}
      >
        {collapsed ? menuIcon : <span className="pointer-events-none truncate">{title}</span>}
      </Button>
    );
  }, [className, collapsed, dndClassName, dndRest, href, isActive, menuIcon, onPress, others, title]);

  if (collapsed) {
    return (
      <Tooltip content={title} placement="right">
        {menuButton}
      </Tooltip>
    );
  }

  return menuButton;
};

export default MenuItem;
