import { useUser } from "@/store/user";

import { LyricsOverlayBridge } from "./lyrics-overlay-bridge";
import Navigation from "./navigation";
import Search from "./search";
import UserCard from "./user";
import UserFeed from "./user-feed";
import WindowAction from "./window-action";

const platform = window.electron.getPlatform();

const LayoutNavbar = () => {
  const user = useUser(s => s.user);

  return (
    <div className="window-drag flex h-full items-center justify-between px-4">
      <LyricsOverlayBridge />
      <div className="window-no-drag flex items-center justify-start space-x-2 pr-20">
        <Navigation />
        <Search />
      </div>
      <div className="window-no-drag flex items-center justify-center space-x-4 pl-20">
        {Boolean(user?.isLogin) && <UserFeed />}
        <UserCard />
        {["linux", "windows"].includes(platform) && <WindowAction />}
      </div>
    </div>
  );
};

export default LayoutNavbar;
