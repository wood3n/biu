import {
  RiFileMusicLine,
  RiFileVideoLine,
  RiPlayCircleLine,
  RiPlayListAddLine,
  RiStarLine,
  RiStarOffLine,
} from "@remixicon/react";

interface Props {
  type: "audio" | "mv";
  isCreatedBySelf: boolean;
  isPlaying: boolean;
}

export const getContextMenus = ({ type, isCreatedBySelf, isPlaying }: Props) => {
  return [
    {
      icon: <RiStarLine size={18} />,
      key: "favorite",
      label: isCreatedBySelf ? "移动" : "收藏",
    },
    {
      icon: <RiStarOffLine size={18} />,
      key: "cancelFavorite",
      label: "取消收藏",
      hidden: !isCreatedBySelf,
    },
    {
      icon: <RiPlayCircleLine size={18} />,
      key: "play-next",
      label: "下一首播放",
      hidden: isPlaying,
    },
    {
      icon: <RiPlayListAddLine size={18} />,
      key: "add-to-playlist",
      label: "添加到播放列表",
      hidden: isPlaying,
    },
    {
      icon: <RiFileMusicLine size={18} />,
      key: "download-audio",
      label: "下载音频",
    },
    {
      icon: <RiFileVideoLine size={18} />,
      key: "download-video",
      label: "下载视频",
      hidden: type === "audio",
    },
  ];
};
