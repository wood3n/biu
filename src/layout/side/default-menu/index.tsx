import React from "react";

import { DefaultMenuList } from "@/common/constants/menus";
import MenuItem from "@/components/menu/menu-item";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

const DefaultMenus = () => {
  const user = useUser(state => state.user);
  const hiddenMenuKeys = useSettings(state => state.hiddenMenuKeys);

  return (
    <div className="flex flex-col space-y-1">
      {DefaultMenuList.filter(item => (item.needLogin ? user?.isLogin : true))
        .filter(item => !hiddenMenuKeys.includes(item.href))
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

export default DefaultMenus;
