import React, { useMemo } from "react";

import { RiApps2AddFill, RiApps2AddLine } from "@remixicon/react";

import { DefaultMenuList } from "@/common/constants/menus";
import MenuGroup from "@/components/menu/menu-group";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

interface Props {
  isCollapsed?: boolean;
  onOpenAddFavorite?: () => void;
}

const DefaultMenus = ({ isCollapsed, onOpenAddFavorite }: Props) => {
  const user = useUser(state => state.user);
  const hiddenMenuKeys = useSettings(state => state.hiddenMenuKeys);

  const items = useMemo(() => {
    const filtered = DefaultMenuList.filter(item => (item.needLogin ? user?.isLogin : true)).filter(
      item => item.href && !hiddenMenuKeys.includes(item.href),
    );

    if (isCollapsed) {
      return [
        ...filtered,
        {
          title: "创建收藏夹",
          icon: RiApps2AddLine,
          activeIcon: RiApps2AddFill,
          onPress: onOpenAddFavorite,
        },
      ];
    }

    return filtered;
  }, [user?.isLogin, hiddenMenuKeys, isCollapsed, onOpenAddFavorite]);

  return <MenuGroup items={items} collapsed={isCollapsed} />;
};

export default DefaultMenus;
