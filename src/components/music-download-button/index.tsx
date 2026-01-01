import { addToast, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { RiDownload2Fill, RiFileMusicLine, RiFileVideoLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import IconButton from "@/components/icon-button";
import { usePlayList } from "@/store/play-list";

const MusicDownloadButton = () => {
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const playItem = list.find(item => item.id === playId);

  const downloadAudio = async () => {
    await window.electron.addMediaDownloadTask({
      outputFileType: "audio",
      title: playItem?.pageTitle || playItem?.title || `audio-${Date.now()}`,
      cover: playItem?.pageCover || playItem?.cover,
      bvid: playItem?.bvid,
      cid: playItem?.cid,
      sid: playItem?.type === "audio" ? playItem?.sid : undefined,
    });

    addToast({
      title: "已添加下载任务",
      color: "success",
    });
  };

  const downloadVideo = async () => {
    await window.electron.addMediaDownloadTask({
      outputFileType: "video",
      title: playItem?.pageTitle || playItem?.title || `video-${Date.now()}`,
      cover: playItem?.pageCover || playItem?.cover,
      bvid: playItem?.bvid,
      cid: playItem?.cid,
    });

    addToast({
      title: "已添加下载任务",
      color: "success",
    });
  };

  if (playItem?.sid) {
    return (
      <AsyncButton isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={downloadAudio}>
        <RiDownload2Fill size={18} />
      </AsyncButton>
    );
  }

  return (
    <Dropdown
      classNames={{
        content: "min-w-fit",
      }}
    >
      <DropdownTrigger>
        <IconButton>
          <RiDownload2Fill size={18} />
        </IconButton>
      </DropdownTrigger>
      <DropdownMenu aria-label="选择下载视频或音频">
        <DropdownItem key="downloadAudio" startContent={<RiFileMusicLine size={16} />} onPress={downloadAudio}>
          下载音频
        </DropdownItem>
        <DropdownItem key="downloadVideo" startContent={<RiFileVideoLine size={16} />} onPress={downloadVideo}>
          下载视频
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default MusicDownloadButton;
