import {
  RiMvLine,
  RiMvFill,
  RiGroupLine,
  RiGroupFill,
  RiDiscLine,
  RiDiscFill,
  RiHistoryLine,
  RiHistoryFill,
  RiUserFollowLine,
  RiUserFollowFill,
} from "@remixicon/react";

import { type MenuItemProps } from "../menu-item";

export const menus: (MenuItemProps & { needLogin?: boolean })[] = [
  {
    title: "热歌精选",
    href: "/",
    icon: RiMvLine,
    activeIcon: RiMvFill,
  },
  {
    title: "音乐 UP",
    href: "/artist-rank",
    icon: RiGroupLine,
    activeIcon: RiGroupFill,
  },
  {
    title: "推荐音乐",
    href: "/music-recommend",
    icon: RiDiscLine,
    activeIcon: RiDiscFill,
  },
  {
    title: "我的关注",
    href: "/follow",
    needLogin: true,
    icon: RiUserFollowLine,
    activeIcon: RiUserFollowFill,
  },
  {
    title: "稍后再看",
    href: "/later",
    needLogin: true,
    icon: RiHistoryLine,
    activeIcon: RiHistoryFill,
  },
];
