import clx from "classnames";

import Navigation from "./navigation";
import Search from "./search";
import UserCard from "./user";

const LayoutNavbar = () => {
  const platform = window.electron.getPlatform();

  return (
    <div className="window-drag flex h-full items-center justify-between px-4">
      <div className="flex items-center justify-start space-x-2">
        <Navigation />
        <Search />
      </div>
      <div
        className={clx("window-no-drag flex items-center justify-center", {
          "pr-[140px]": platform === "windows" || platform === "linux",
        })}
      >
        <UserCard />
      </div>
    </div>
  );
};

export default LayoutNavbar;
