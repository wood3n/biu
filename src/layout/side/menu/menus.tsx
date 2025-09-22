import {
  RiFireLine,
  RiFireFill,
  RiMvLine,
  RiMvFill,
  RiGroupLine,
  RiGroupFill,
  RiDiscLine,
  RiDiscFill,
  RiHistoryLine,
  RiHistoryFill,
} from "@remixicon/react";

const size = 18;

export const menus = [
  {
    key: "/",
    label: "音乐热榜",
    href: "/",
    icon: <RiFireLine size={size} />,
    activeIcon: <RiFireFill size={size} />,
  },
  {
    key: "/music-rank",
    label: "热歌精选",
    href: "/music-rank",
    icon: <RiMvLine size={size} />,
    activeIcon: <RiMvFill size={size} />,
  },
  {
    key: "/artist-rank",
    label: "音乐人",
    href: "/artist-rank",
    icon: <RiGroupLine size={size} />,
    activeIcon: <RiGroupFill size={size} />,
  },
  {
    key: "/music-recommend",
    label: "更多音乐推荐",
    href: "/music-recommend",
    icon: <RiDiscLine size={size} />,
    activeIcon: <RiDiscFill size={size} />,
  },
  {
    key: "/later",
    label: "稍后再看",
    href: "/later",
    icon: <RiHistoryLine size={size} />,
    activeIcon: <RiHistoryFill size={size} />,
  },
];
