import React from "react";
import { useLocation, useParams } from "react-router";

import { Button, Link as HeroLink, Image } from "@heroui/react";
import clx from "classnames";

export interface MenuItemProps {
  /** 菜单项标签 */
  title: string;
  /** 菜单项链接 */
  href: string;
  /** 菜单项图标 */
  icon?: React.ComponentType<{ size?: number | string }>;
  /** 封面 */
  cover?: string;
  /** 激活状态图标 */
  activeIcon?: React.ComponentType<{ size?: number | string }>;
  onPress?: VoidFunction;
}

const MenuItem: React.FC<MenuItemProps> = ({ title, href, cover, icon: Icon, activeIcon: ActiveIcon, onPress }) => {
  const location = useLocation();
  const { id } = useParams();

  const isActive = location.pathname === href || (id && href.includes(id));
  console.log(isActive);

  return (
    <Button
      as={href ? HeroLink : "button"}
      href={href}
      fullWidth
      radius="sm"
      variant={isActive ? "flat" : "light"}
      color="default"
      onPress={onPress}
      startContent={
        cover ? (
          <Image
            radius="sm"
            src={cover}
            alt={title}
            height={32}
            width={32}
            className="object-cover"
            classNames={{
              wrapper: "flex-none",
            }}
          />
        ) : isActive ? (
          // @ts-expect-error 忽略类型错误，因为 ActiveIcon 可能是 undefined
          <ActiveIcon size={18} />
        ) : (
          // @ts-expect-error 忽略类型错误，因为 Icon 可能是 undefined
          <Icon size={18} />
        )
      }
      className={clx("justify-start", {
        "text-primary": isActive,
      })}
    >
      <span className="truncate">{title}</span>
    </Button>
  );
};

export default MenuItem;
