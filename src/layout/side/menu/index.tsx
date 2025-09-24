import React from "react";
import { useLocation } from "react-router";

import { Button, Link as HeroLink } from "@heroui/react";
import clx from "classnames";

import { useUser } from "@/store/user";

import { menus } from "./menus";

const Menu = () => {
  const { user } = useUser();

  const location = useLocation();
  const pathname = location.pathname || "/";

  return (
    <div className="flex flex-col space-y-1 p-2">
      {menus
        .filter(item => !item.needLogin || user?.isLogin)
        .map(item => {
          const isActive = pathname === item.href;
          const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

          return (
            <div key={item.key ?? item.href}>
              <Button
                as={HeroLink}
                href={item.href}
                fullWidth
                variant={isActive ? "flat" : "light"}
                color="default"
                startContent={<span className="text-base">{Icon}</span>}
                className={clx("justify-start", {
                  "text-success": isActive,
                })}
              >
                {item.label}
              </Button>
            </div>
          );
        })}
    </div>
  );
};

export default Menu;
