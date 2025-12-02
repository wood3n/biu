import React from "react";

import { useUser } from "@/store/user";

import MenuItem from "../menu-item";
import { menus } from "./menus";

const Menu = () => {
  const user = useUser(state => state.user);

  return (
    <div className="flex flex-col space-y-1">
      {menus
        .filter(item => (item.needLogin ? user?.isLogin : true))
        .map(item => {
          return (
            <MenuItem
              key={item.href}
              title={item.title}
              href={item.href}
              icon={item.icon}
              activeIcon={item.activeIcon}
            />
          );
        })}
    </div>
  );
};

export default Menu;
