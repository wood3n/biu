import React, { useMemo } from "react";
import { useLocation, useParams } from "react-router";

import { Avatar, Button, Link as HeroLink, Tooltip } from "@heroui/react";
import clx from "classnames";

export interface MenuItemProps {
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
  className?: string;
  onPress?: VoidFunction;
  collapsed?: boolean;
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
}) => {
  const location = useLocation();
  const { id } = useParams();

  const isActive = useMemo(() => {
    return location.pathname === href || (id && href?.split("?")[0].includes(id));
  }, [location.pathname, href, id]);

  const iconContent = useMemo(() => {
    const icon =
      isActive && ActiveIcon ? (
        <ActiveIcon size={18} className="text-primary" />
      ) : Icon ? (
        <Icon size={18} />
      ) : undefined;

    if (!collapsed && icon) {
      return icon;
    }

    return (
      <Avatar
        name={title}
        src={cover ? `${cover}@672w_378h_1c.avif` : undefined}
        showFallback
        fallback={icon}
        alt={title}
        className="h-10 w-10 flex-none rounded-md"
      />
    );
  }, [cover, isActive, Icon, ActiveIcon, title, collapsed]);

  if (collapsed) {
    const collapsedButton = (
      <Button
        as={href ? HeroLink : "button"}
        href={href}
        fullWidth
        variant={isActive ? "flat" : "light"}
        color="default"
        onPress={onPress}
        className={clx("justify-center rounded-md px-0 py-1", className, {
          "h-auto": collapsed,
          "text-primary": isActive,
        })}
      >
        {iconContent}
      </Button>
    );

    return (
      <Tooltip closeDelay={0} content={title} placement="right" offset={-3}>
        {collapsedButton}
      </Tooltip>
    );
  }

  return (
    <Button
      as={href ? HeroLink : "button"}
      href={href}
      fullWidth
      radius="md"
      variant={isActive ? "flat" : "light"}
      color="default"
      onPress={onPress}
      startContent={iconContent}
      className={clx("justify-start rounded-md px-2", className, {
        "text-primary": isActive,
      })}
    >
      <span className="truncate">{title}</span>
    </Button>
  );
};

export default MenuItem;
