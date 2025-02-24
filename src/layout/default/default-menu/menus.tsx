import { RiBroadcastLine, RiCalendarEventLine, RiCloudLine, RiDownloadLine, RiRadioLine } from "@remixicon/react";

const size = 16;

export const menus = [
  {
    key: "daily",
    label: "日推",
    icon: <RiCalendarEventLine size={size} />,
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
  {
    key: "cloud",
    label: "云盘",
    icon: <RiCloudLine size={size} />,
  },
  {
    key: "download",
    label: "下载",
    icon: <RiDownloadLine size={size} />,
  },
];
