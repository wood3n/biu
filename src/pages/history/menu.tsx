import {
  RiDeleteBinLine,
  RiFileMusicLine,
  RiFileVideoLine,
  RiPlayCircleLine,
  RiPlayListAddLine,
} from "@remixicon/react";

export const getContextMenus = ({ business }: { business: string }) => {
  const canPlay = business === "archive";

  return [
    {
      icon: <RiPlayCircleLine size={18} />,
      key: "play-next",
      label: "下一首播放",
      hidden: !canPlay,
    },
    {
      icon: <RiPlayListAddLine size={18} />,
      key: "add-to-playlist",
      label: "添加到播放列表",
      hidden: !canPlay,
    },
    {
      icon: <RiFileMusicLine size={18} />,
      key: "download-audio",
      label: "下载音频",
      hidden: !canPlay,
    },
    {
      icon: <RiFileVideoLine size={18} />,
      key: "download-video",
      label: "下载视频",
      hidden: !canPlay,
    },
    {
      icon: <RiDeleteBinLine size={18} />,
      key: "delete",
      label: "删除",
      className: "text-danger",
      color: "danger" as const,
    },
  ];
};
