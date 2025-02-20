import React from "react";
import { MdAlbum, MdMusicNote, MdOutlinePeople, MdQueueMusic } from "react-icons/md";

const size = 16;
export const SEARCH_KEY_MAP: Record<string, { icon: React.ReactNode; text: string }> = {
  albums: {
    icon: <MdAlbum size={size} />,
    text: "专辑",
  },
  artists: {
    icon: <MdOutlinePeople size={size} />,
    text: "歌手",
  },
  playlists: {
    icon: <MdQueueMusic size={size} />,
    text: "歌单",
  },
  songs: {
    icon: <MdMusicNote size={size} />,
    text: "单曲",
  },
};
