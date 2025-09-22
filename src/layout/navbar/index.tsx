import { ReactComponent as LogoIcon } from "@/assets/icons/music.svg";
import { useUser } from "@/store/user";

import Login from "./login";
import SearchBox from "./search";
import UserCard from "./user";

const LayoutNavbar = () => {
  const { user } = useUser();

  return (
    <div className="flex h-full items-center justify-between gap-4 px-10">
      <div className="flex items-center">
        <LogoIcon style={{ color: "#006996", width: 40, height: 40 }} />
      </div>
      <div className="flex items-center">
        <SearchBox />
      </div>
      <div className="flex items-center">{user?.isLogin ? <UserCard /> : <Login />}</div>
    </div>
  );
};

export default LayoutNavbar;
