import React from "react";

import { RiApps2AddFill, RiApps2AddLine } from "@remixicon/react";

import { DefaultMenuList } from "@/common/constants/menus";
import MenuItem from "@/components/menu/menu-item";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

interface Props {
  isCollapsed?: boolean;
  onOpenAddFavorite?: () => void;
}

const DefaultMenus = ({ isCollapsed, onOpenAddFavorite }: Props) => {
  const user = useUser(state => state.user);
  const hiddenMenuKeys = useSettings(state => state.hiddenMenuKeys);

  return (
    <div className="flex flex-col items-center">
      {DefaultMenuList.filter(item => (item.needLogin ? user?.isLogin : true))
        .filter(item => item.href && !hiddenMenuKeys.includes(item.href))
        .map(item => {
          return (
            <MenuItem
              key={item.href}
              title={item.title}
              href={item.href}
              icon={item.icon}
              activeIcon={item.activeIcon}
              collapsed={isCollapsed}
            />
          );
        })}
      {isCollapsed && (
        <MenuItem
          key="add-fav"
          title="创建收藏夹"
          icon={RiApps2AddLine}
          activeIcon={RiApps2AddFill}
          collapsed
          onPress={onOpenAddFavorite}
        />
      )}
    </div>
  );
};

export default DefaultMenus;
