import {
  RiFireLine,
  RiFireFill,
  RiMvLine,
  RiMvFill,
  RiGroupLine,
  RiGroupFill,
  RiDiscLine,
  RiDiscFill,
} from "@remixicon/react";

export const menus = [
  {
    key: "/",
    label: "音乐热榜",
    href: "/",
    icon: <RiFireLine />,
    activeIcon: <RiFireFill />,
  },
  {
    key: "/music-rank",
    label: "热歌精选",
    href: "/music-rank",
    icon: <RiMvLine />,
    activeIcon: <RiMvFill />,
  },
  {
    key: "/artist-rank",
    label: "音乐人",
    href: "/artist-rank",
    icon: <RiGroupLine />,
    activeIcon: <RiGroupFill />,
  },
  {
    key: "/music-recommend",
    label: "更多音乐推荐",
    href: "/music-recommend",
    icon: <RiDiscLine />,
    activeIcon: <RiDiscFill />,
  },
];
