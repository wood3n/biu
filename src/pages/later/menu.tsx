import {
  RiDeleteBinLine,
  RiFileMusicLine,
  RiFileVideoLine,
  RiPlayCircleLine,
  RiPlayListAddLine,
  RiStarLine,
} from "@remixicon/react";

interface Props {
  isPlaying: boolean;
}

export const getContextMenus = ({ isPlaying }: Props) => {
  return [
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
      icon: <RiStarLine size={18} />,
      key: "favorite",
      label: "收藏",
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
    },
    {
      icon: <RiDeleteBinLine size={18} />,
      key: "delete",
      label: "移除",
      className: "text-danger",
      color: "danger" as const,
    },
  ];
};
