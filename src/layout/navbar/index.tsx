import { ReactComponent as LogoIcon } from "@/assets/icons/logo.svg";
import { useUser } from "@/store/user";

import Login from "./login";
import SearchBox from "./search";
import UserCard from "./user";

const LayoutNavbar = () => {
  const { user } = useUser();

  return (
    <div className="grid h-full grid-cols-3 items-center gap-8 px-6">
      <div className="ml-2 flex items-center">
        <LogoIcon style={{ color: "#17C964", width: 48, height: 48 }} />
      </div>
      <div className="flex items-center justify-center">
        <SearchBox />
      </div>
      <div className="flex items-center justify-center">{user?.isLogin ? <UserCard /> : <Login />}</div>
    </div>
  );
};

export default LayoutNavbar;
