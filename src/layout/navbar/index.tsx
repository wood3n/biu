import { useUser } from "@/store/user";

import Login from "./login";
import Search from "./search";
import UserCard from "./user";

const LayoutNavbar = () => {
  const { user } = useUser();

  return (
    <div className="window-drag grid h-full grid-cols-3 items-center gap-8">
      <div className="ml-6 flex items-center"></div>
      <div className="window-no-drag flex items-center justify-center">
        <Search />
      </div>
      <div className="flex items-center justify-center">{user?.isLogin ? <UserCard /> : <Login />}</div>
    </div>
  );
};

export default LayoutNavbar;
