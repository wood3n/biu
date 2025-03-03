import { RiAlbumLine, RiPlayListLine, RiUserStarLine } from "@remixicon/react";

import Album from "../album";
import Artist from "../artist";
import PlayList from "../playlist";

export const tabs = [
  {
    key: "playlist",
    title: "歌单",
    icon: <RiPlayListLine size={14} />,
    content: <PlayList />,
  },
  {
    key: "album",
    title: "专辑",
    icon: <RiAlbumLine size={14} />,
    content: <Album />,
  },
  {
    key: "artist",
    title: "艺人",
    icon: <RiUserStarLine size={14} />,
    content: <Artist />,
  },
];
