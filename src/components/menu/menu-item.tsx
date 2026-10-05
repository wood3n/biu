import React, { useMemo } from "react";
import { useLocation, useParams } from "react-router";

import { Avatar, Button, Link as HeroLink, Tooltip } from "@heroui/react";
import clx from "classnames";
import { twMerge } from "tailwind-merge";

/** 根据字符串生成稳定的随机色（HSL） */
const getStableColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 45%)`;
};

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
  /** 封面为非B站图床，直接使用原始 URL（不加 .avif 后缀），收起态用随机色+白字头像 */
  coverBadge?: boolean;
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
  coverBadge,
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
      // 收藏夹封面：有图用图，无图用随机色+白字（BBPlayer 歌单 + B站收藏夹统一）
      {
        const bgColor = getStableColor(title);
        const src = cover ? (coverBadge ? cover : `${cover}@672w_378h_1c.avif`) : undefined;
        return (
          <Avatar
            name={title}
            src={src}
            showFallback
            radius="none"
            alt={title}
            className="size-8 flex-none"
            classNames={{
              img: "object-cover",
              name: "text-white text-sm font-medium",
            }}
            style={{ backgroundColor: bgColor, borderRadius: "calc(var(--heroui-radius-medium) * 0.75)" }}
          />
        );
      }
    }

    if (!collapsed && icon) {
      return icon;
    }

    // 展开态：收藏夹封面，有图用图，无图用随机色+白字
    {
      const bgColor = getStableColor(title);
      const src = cover ? (coverBadge ? cover : `${cover}@672w_378h_1c.avif`) : undefined;
      return (
        <Avatar
          name={title}
          src={src}
          showFallback
          radius="none"
          fallback={icon}
          alt={title}
          className="size-5 flex-none"
          classNames={{
            name: "text-white text-xs font-medium",
          }}
          style={{ backgroundColor: bgColor, borderRadius: "calc(var(--heroui-radius-medium) * 0.375)" }}
        />
      );
    }
  }, [cover, coverBadge, isActive, Icon, ActiveIcon, title, collapsed]);

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
          className={clx(
            "rounded-medium flex flex-none items-center justify-center px-0 py-0",
            className,
            dndClassName,
            {
              "text-primary": isActive,
            },
          )}
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
      radius="md"
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
