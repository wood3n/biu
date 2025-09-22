import React from "react";
import { useLocation } from "react-router";

import { Button, Link as HeroLink } from "@heroui/react";

import { menus } from "./menus";

const Menu = () => {
  const location = useLocation();
  const pathname = location.pathname || "/";

  return (
    <div className="flex flex-col space-y-1 p-2">
      {menus.map(item => {
        const isActive = pathname === item.href;
        const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

        return (
          <div key={item.key ?? item.href}>
            <Button
              as={HeroLink}
              href={item.href}
              fullWidth
              variant={isActive ? "flat" : "light"}
              color={isActive ? "primary" : "default"}
              startContent={<span className="text-base">{Icon}</span>}
              className="justify-start"
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
