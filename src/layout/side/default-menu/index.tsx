import React, { useMemo } from "react";

import { DefaultMenuList } from "@/common/constants/menus";
import MenuGroup from "@/components/menu/menu-group";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

interface Props {
  isCollapsed?: boolean;
}

const DefaultMenus = ({ isCollapsed }: Props) => {
  const user = useUser(state => state.user);
  const hiddenMenuKeys = useSettings(state => state.hiddenMenuKeys);

  const items = useMemo(() => {
    const filtered = DefaultMenuList.filter(item => (item.needLogin ? user?.isLogin : true)).filter(
      item => item.href && !hiddenMenuKeys.includes(item.href),
    );

    return filtered;
  }, [user?.isLogin, hiddenMenuKeys]);

  return <MenuGroup items={items} collapsed={isCollapsed} />;
};

export default DefaultMenus;
