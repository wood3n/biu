import {
  RiMvLine,
  RiMvFill,
  RiGroupLine,
  RiGroupFill,
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
    title: "热歌精选",
    href: "/",
    icon: RiMvLine,
    activeIcon: RiMvFill,
  },
  {
    title: "音乐大咖",
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
