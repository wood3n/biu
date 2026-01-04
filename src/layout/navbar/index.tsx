import React, { useState } from "react";

import clx from "classnames";

import { useUser } from "@/store/user";

import WindowAction from "../../components/window-action";
import AppUpdateNotify from "./app-update";
import Dev from "./dev";
import Navigation from "./navigation";
import Search from "./search";
import UserCard from "./user";
import UserFeed from "./user-feed";

const platform = window.electron.getPlatform();

const LayoutNavbar = () => {
  const user = useUser(s => s.user);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const isNoDrag = isSearchFocused || isUserDropdownOpen;

  return (
    <div
      className={clx("flex h-full items-center justify-between px-4", {
        "window-drag": !isNoDrag,
        "window-no-drag": isNoDrag,
      })}
    >
      <div className="window-no-drag flex items-center justify-start space-x-2">
        <Navigation />
        <Search onFocusChange={setIsSearchFocused} />
      </div>
      <div className="window-no-drag flex items-center justify-center space-x-4">
        <AppUpdateNotify />
        <Dev />
        {Boolean(user?.isLogin) && <UserFeed />}
        <UserCard onDropdownOpenChange={setIsUserDropdownOpen} />
        {["linux", "windows"].includes(platform) && <WindowAction />}
      </div>
    </div>
  );
};

export default LayoutNavbar;
