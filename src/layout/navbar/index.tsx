import { RiFireFill, RiFireLine, RiMvFill, RiMvLine } from "@remixicon/react";

import { ReactComponent as LogoIcon } from "@/assets/icons/music.svg";

import LinkItem from "./item";
import Login from "./login";

const LayoutNavbar = () => {
  return (
    <div className="flex h-full items-center justify-between px-6">
      <div className="flex items-center">
        <LogoIcon style={{ width: 42, height: 42, color: "#fb8aaa" }} />
        <div className="ml-6 flex items-center space-x-3">
          <LinkItem href="/" icon={<RiFireLine />} activeIcon={<RiFireFill />}>
            音乐热榜
          </LinkItem>
          <LinkItem href="/music-rank" icon={<RiMvLine />} activeIcon={<RiMvFill />}>
            热歌精选
          </LinkItem>
        </div>
      </div>
      <div className="flex items-center">
        <Login />
      </div>
    </div>
  );
};

export default LayoutNavbar;
