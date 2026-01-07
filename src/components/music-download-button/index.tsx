import React, { useState } from "react";

import { addToast, Button, Tooltip } from "@heroui/react";
import { RiDownload2Fill, RiFileImageLine, RiFileMusicLine, RiFileVideoLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import IconButton from "@/components/icon-button";
import { usePlayList } from "@/store/play-list";

const MusicDownloadButton = () => {
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const playItem = list.find(item => item.id === playId);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

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

  const downloadCover = async () => {
    const coverUrl = playItem?.pageCover || playItem?.cover;

    if (!coverUrl) {
      addToast({
        title: "没有可下载的封面",
        color: "warning",
      });
      return;
    }

    try {
      const response = await fetch(coverUrl);

      if (!response.ok) {
        throw new Error(`下载失败，状态码 ${response.status}`);
      }

      const blob = await response.blob();
      const ext = blob.type?.split("/")?.[1] || "jpg";
      const name = (playItem?.pageTitle || playItem?.title || "cover").replace(/[\\/:*?"<>|]/g, "_");

      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `${name}-cover.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      addToast({
        title: "封面下载失败",
        description: message,
        color: "danger",
      });
    }
  };

  if (playItem?.sid) {
    return (
      <AsyncButton isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={downloadAudio}>
        <RiDownload2Fill size={18} />
      </AsyncButton>
    );
  }

  return (
    <Tooltip
      disableAnimation
      triggerScaleOnOpen={false}
      isOpen={isTooltipOpen}
      onOpenChange={setIsTooltipOpen}
      placement="top"
      closeDelay={500}
      showArrow={false}
      classNames={{
        content: "py-3 px-2 min-w-[120px]",
      }}
      content={
        <div className="flex flex-col items-stretch gap-1">
          <Button
            size="sm"
            variant="light"
            startContent={<RiFileMusicLine size={16} />}
            className="justify-start"
            onPress={downloadAudio}
          >
            下载音频
          </Button>
          <Button
            size="sm"
            variant="light"
            startContent={<RiFileVideoLine size={16} />}
            className="justify-start"
            onPress={downloadVideo}
          >
            下载视频
          </Button>
          <Button
            size="sm"
            variant="light"
            startContent={<RiFileImageLine size={16} />}
            className="justify-start"
            onPress={downloadCover}
          >
            下载封面
          </Button>
        </div>
      }
    >
      <IconButton>
        <RiDownload2Fill size={18} />
      </IconButton>
    </Tooltip>
  );
};

export default MusicDownloadButton;
