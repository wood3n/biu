import { ReactComponent as LogoIcon } from "@/assets/icons/music.svg";

import Login from "./login";
import SearchBox from "./search";

const LayoutNavbar = () => {
  return (
    <div className="flex h-full items-center justify-between gap-4 px-10">
      <div className="flex items-center">
        <LogoIcon style={{ width: 32, height: 32 }} />
      </div>
      <div className="flex items-center">
        <SearchBox />
      </div>
      <div className="flex items-center">
        <Login />
      </div>
    </div>
  );
};

export default LayoutNavbar;
