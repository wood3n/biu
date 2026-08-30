import React, { useMemo } from "react";
import { useLocation, useParams } from "react-router";

import { Avatar, Button, Link as HeroLink, Tooltip } from "@heroui/react";
import clx from "classnames";
import { twMerge } from "tailwind-merge";

export interface MenuItemProps {
  /** 菜单项标签 */
  title: string;
  /** 菜单项链接 */
  href?: string;
  /** 唯一标识，用于排序等场景 */
  id?: number | string;
  /** 菜单项图标 */
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  /** 封面 */
  cover?: string;
  /** 激活状态图标 */
  activeIcon?: React.ComponentType<{ size?: number | string; className?: string }>;
  className?: string;
  onPress?: VoidFunction;
  collapsed?: boolean;
  /** 用于 dnd-kit 等场景，把拖拽监听器绑定到可交互元素上 */
  dndProps?: ({ className?: string } & Record<string, unknown>) | undefined;
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
  dndProps,
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

    // 收起态：直接放大图标，不套 Avatar 圆角容器，只保留选中底色
    if (collapsed) {
      if (isActive && ActiveIcon) {
        return <ActiveIcon size={24} className="text-primary" />;
      }
      if (Icon) {
        return <Icon size={24} />;
      }
      // 有封面的收藏夹：收起态也用小封面，和功能图标同尺寸
      if (cover) {
        return (
          <Avatar
            name={title}
            src={`${cover}@672w_378h_1c.avif`}
            showFallback
            radius="none"
            alt={title}
            className="size-8 flex-none rounded-[6px]"
          />
        );
      }
    }

    if (!collapsed && icon) {
      return icon;
    }

    return (
      <Avatar
        name={title}
        src={cover ? `${cover}@672w_378h_1c.avif` : undefined}
        showFallback
        radius="none"
        fallback={icon}
        alt={title}
        className="size-5 flex-none rounded-[3px]"
      />
    );
  }, [cover, isActive, Icon, ActiveIcon, title, collapsed]);

  const { className: dndClassName, ...dndRest } = (dndProps ?? {}) as {
    className?: string;
  } & Record<string, unknown>;

  if (collapsed) {
    return (
      <Tooltip closeDelay={0} content={title} placement="right" offset={-3}>
        <Button
          as={href ? HeroLink : "button"}
          href={href}
          variant={isActive ? "flat" : "light"}
          color={isActive ? "primary" : "default"}
          onPress={onPress}
          className={clx("flex flex-none items-center justify-center rounded-lg px-0 py-0", className, dndClassName, {
            "text-primary": isActive,
          })}
          style={{ width: 40, height: 40, minWidth: 40, maxWidth: 40 }}
          {...(dndRest as any)}
        >
          {iconContent}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      as={href ? HeroLink : "button"}
      href={href}
      fullWidth
      disableRipple
      variant={isActive ? "flat" : "light"}
      color={isActive ? "primary" : "default"}
      onPress={onPress}
      startContent={iconContent}
      className={twMerge("h-9 justify-start px-2 text-inherit", className, dndClassName)}
      {...(dndRest as any)}
    >
      <span className="pointer-events-none truncate">{title}</span>
    </Button>
  );
};

export default MenuItem;
