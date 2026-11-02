import React, { useState } from "react";

import clx from "classnames";

import { useUser } from "@/store/user";

import WindowAction from "../../components/window-action";
import AppUpdateNotify from "./app-update";
import BBPButton from "./bbp-button";
import Dev from "./dev";
import Navigation from "./navigation";
import Search from "./search";
import UserCard from "./user";
import UserFeed from "./user-feed";

const platform = window.electron.getPlatform();

const LayoutNavbar = ({ covered = false }: { covered?: boolean }) => {
  const user = useUser(s => s.user);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const isNoDrag = isSearchFocused || isUserDropdownOpen;

  return (
    <div
      className={clx(
        "flex h-full items-center justify-between pr-2 pl-4",
        "bg-background/70 border-b border-white/10 dark:border-white/5",
        // 全屏播放器盖住时这层看不见了，但仍要绘制：窗口拖拽区是按绘制块算出来的，
        // 整棵子树 invisible 掉就没有拖拽区（实测窗口拖不动）。省掉的只是那层整屏 backdrop-filter。
        !covered && "backdrop-blur-2xl backdrop-saturate-150",
        {
          "window-drag": !isNoDrag,
          "window-no-drag": isNoDrag,
        },
      )}
    >
      <div className="window-no-drag flex items-center justify-start space-x-2">
        <Navigation />
        <Search onFocusChange={setIsSearchFocused} />
      </div>
      <div className="window-no-drag flex items-center justify-center">
        <UserCard onDropdownOpenChange={setIsUserDropdownOpen} />
        <AppUpdateNotify />
        <Dev />
        <BBPButton />
        {Boolean(user?.isLogin) && <UserFeed />}
        {["linux", "windows"].includes(platform) && <WindowAction />}
      </div>
    </div>
  );
};

export default LayoutNavbar;
