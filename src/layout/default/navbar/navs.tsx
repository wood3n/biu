import { RiBroadcastLine, RiFolderMusicFill, RiFolderMusicLine, RiRadioLine, RiSparklingFill, RiSparklingLine } from "@remixicon/react";

const size = 18;

export const navs = [
  {
    key: "daily",
    label: "推荐",
    icon: <RiSparklingLine size={size} />,
    selectedIcon: <RiSparklingFill size={size} />,
  },
  {
    key: "radio",
    label: "漫游",
    icon: <RiRadioLine size={size} />,
  },
  {
    key: "broadcast",
    label: "播客",
    icon: <RiBroadcastLine size={size} />,
  },
  // {
  //   key: "collection",
  //   label: "收藏",
  //   icon: <RiStarSmileLine size={size} />,
  //   selectedIcon: <RiStarSmileFill size={size} />,
  // },
  {
    key: "local",
    label: "本地",
    icon: <RiFolderMusicLine size={size} />,
    selectedIcon: <RiFolderMusicFill size={size} />,
  },
];
