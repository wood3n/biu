import {
  RiDiscLine,
  RiDiscFill,
  RiUserFollowLine,
  RiUserFollowFill,
  RiFileDownloadLine,
  RiFileDownloadFill,
  RiTimeLine,
  RiTimeFill,
  RiHistoryLine,
  RiHistoryFill,
} from "@remixicon/react";

import { type MenuItemProps } from "@/components/menu/menu-item";

export const DefaultMenuList: (MenuItemProps & { needLogin?: boolean })[] = [
  {
    title: "推荐音乐",
    href: "/",
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
    icon: RiTimeLine,
    activeIcon: RiTimeFill,
  },
  {
    title: "历史记录",
    href: "/history",
    needLogin: true,
    icon: RiHistoryLine,
    activeIcon: RiHistoryFill,
  },
  {
    title: "下载记录",
    href: "/download-list",
    icon: RiFileDownloadLine,
    activeIcon: RiFileDownloadFill,
  },
];
