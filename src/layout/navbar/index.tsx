import { useUser } from "@/store/user";

import WindowAction from "../../components/window-action";
import Dev from "./dev";
import Navigation from "./navigation";
import Search from "./search";
import UserCard from "./user";
import UserFeed from "./user-feed";

const platform = window.electron.getPlatform();

const LayoutNavbar = () => {
  const user = useUser(s => s.user);

  return (
    <div className="window-drag flex h-full items-center justify-between px-4">
      <div className="window-no-drag flex items-center justify-start space-x-2 pr-20">
        <Navigation />
        <Search />
      </div>
      <div className="window-no-drag flex items-center justify-center space-x-4 pl-20">
        <Dev />
        {Boolean(user?.isLogin) && <UserFeed />}
        <UserCard />
        {["linux", "windows"].includes(platform) && <WindowAction />}
      </div>
    </div>
  );
};

export default LayoutNavbar;
