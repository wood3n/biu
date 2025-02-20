import { BiLibrary } from "react-icons/bi";
import { IoRadio } from "react-icons/io5";
import { MdHistory, MdOutlineLibraryAdd, MdOutlineWbCloudy, MdRadio, MdRecentActors, MdRecommend, MdToday } from "react-icons/md";

export interface MenuProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  key: string;
  sub?: MenuProps[];
}

export default [
  {
    label: "推荐",
    icon: <MdRecommend />,
    key: "/",
  },
  {
    label: "日推",
    icon: <MdToday />,
    key: "/daily",
  },
  {
    label: "私人FM",
    icon: <MdRadio />,
    key: "/fm",
  },
  {
    label: "播客",
    icon: <IoRadio />,
    key: "/podcast",
  },
  {
    label: "音乐库",
    key: "lib",
    icon: <MdOutlineLibraryAdd />,
    sub: [
      {
        label: "专辑",
        icon: <BiLibrary />,
        key: "/collect/album",
      },
      {
        label: "艺人",
        icon: <MdRecentActors />,
        key: "/collect/artist",
      },
      // {
      //   label: '收藏',
      //   icon: <MdOutlineCollectionsBookmark />,
      //   key: '/collect',
      // },
      {
        label: "云盘",
        icon: <MdOutlineWbCloudy />,
        key: "/drive",
      },
      {
        label: "最近播放",
        icon: <MdHistory />,
        key: "/history",
      },
    ],
  },
];
