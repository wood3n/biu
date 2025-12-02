import WindowAction from "@/components/window-action";

import Navigation from "./navigation";
import Search from "./search";
import UserCard from "./user";

const LayoutNavbar = () => {
  return (
    <div className="window-drag flex h-full items-center justify-between px-4">
      <div className="window-no-drag flex items-center justify-start space-x-2 pr-20">
        <Navigation />
        <Search />
      </div>
      <div className="window-no-drag flex items-center justify-center space-x-4 pl-20">
        <UserCard />
        <WindowAction />
      </div>
    </div>
  );
};

export default LayoutNavbar;
