import { RiUserLine, RiVideoLine } from "@remixicon/react";

export enum SearchType {
  Video = "video",
  User = "bili_user",
}

export const SearchTypeOptions = [
  {
    label: "视频",
    value: SearchType.Video,
    icon: <RiVideoLine size={16} />,
  },
  {
    label: "用户",
    value: SearchType.User,
    icon: <RiUserLine size={16} />,
  },
];
