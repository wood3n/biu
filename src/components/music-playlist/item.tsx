import React, { useMemo } from "react";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, addToast } from "@heroui/react";
import { RiDownload2Line, RiMoreFill, RiPlayFill, RiPlayListAddLine, RiSkipForwardLine } from "@remixicon/react";
import moment from "moment";
import { twMerge } from "tailwind-merge";

import { formatNumber } from "@/common/utils/number";
import Image from "@/components/image";
import { usePlayList } from "@/store/play-list";

import type { MusicPlaylistItem } from "./types";

import "moment-duration-format";

interface Props {
  item: MusicPlaylistItem;
  showOwner?: boolean;
  showPlayCount?: boolean;
  showAddDate?: boolean;
  className?: string;
  displayMode?: "list" | "compact";
}

const MusicPlaylistItemComponent = ({
  item,
  showOwner = true,
  showPlayCount = true,
  showAddDate = true,
  className,
  displayMode = "list",
}: Props) => {
  const { playId, isPlaying, play, addToNext, addList } = usePlayList();
  const isActive = playId === item.id;
  const isCurrentPlaying = isActive && isPlaying;

  const handlePlay = () => {
    play({
      id: item.id,
      title: item.title,
      cover: item.cover,
      type: item.type || "audio",
      bvid: item.bvid,
      sid: item.sid,
      cid: item.cid,
      ownerName: item.ownerName,
      ownerMid: item.ownerMid,
    } as any);
  };

  const handleAddToNext = () => {
    addToNext({
      id: item.id,
      title: item.title,
      cover: item.cover,
      type: item.type || "audio",
      bvid: item.bvid,
      sid: item.sid,
      cid: item.cid,
      ownerName: item.ownerName,
      ownerMid: item.ownerMid,
    } as any);
    addToast({ title: "已添加到下一首播放", color: "success" });
  };

  const handleAddToPlaylist = () => {
    addList([
      {
        id: item.id,
        title: item.title,
        cover: item.cover,
        type: item.type || "audio",
        bvid: item.bvid,
        sid: item.sid,
        cid: item.cid,
        ownerName: item.ownerName,
        ownerMid: item.ownerMid,
      } as any,
    ]);
    addToast({ title: "已添加到播放列表", color: "success" });
  };

  const handleDownload = async () => {
    try {
      if (window.electron && window.electron.addMediaDownloadTask) {
        await window.electron.addMediaDownloadTask({
          outputFileType: "audio",
          title: item.pageTitle || item.title || `audio-${Date.now()}`,
          cover: item.pageCover || item.cover,
          bvid: item.bvid,
          cid: item.cid,
          sid: item.sid,
        });
        addToast({ title: "已添加下载任务", color: "success" });
      } else {
        addToast({ title: "下载功能不可用", color: "danger" });
      }
    } catch (error) {
      console.error(error);
      addToast({ title: "添加下载任务失败", color: "danger" });
    }
  };

  const durationStr = useMemo(() => {
    if (!item.duration) return "--:--";
    return moment.duration(item.duration, "seconds").format("m:ss", { trim: false });
  }, [item.duration]);

  return (
    <div
      className={twMerge(
        "group hover:bg-content2 flex w-full items-center gap-4 rounded-lg px-4 py-2 transition-colors",
        isActive && "bg-content2 border-primary border-l-4 pl-3",
        className,
      )}
      onDoubleClick={handlePlay}
    >
      {/* Music Info Column */}
      <div className="flex min-w-0 grow items-center gap-3">
        {/* Cover with Hover Effect */}
        {displayMode === "list" && (
          <div className="relative h-10 w-10 flex-none overflow-hidden rounded-md">
            <Image src={item.cover} width={40} height={40} className="h-full w-full object-cover" />

            {/* Overlay: Show on hover OR if currently playing */}
            <div
              className={twMerge(
                "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100",
                isCurrentPlaying && "opacity-100",
              )}
              onClick={e => {
                e.stopPropagation();
                handlePlay();
              }}
            >
              {!isCurrentPlaying && <RiPlayFill className="text-white" size={20} />}
            </div>
          </div>
        )}

        {/* Text Info */}
        <div className="flex min-w-0 flex-col justify-center">
          <div className={twMerge("truncate text-sm font-medium", isActive && "text-primary")}>{item.title}</div>
          {displayMode === "list" && showOwner && (
            <div className="text-default-500 truncate text-xs">{item.ownerName}</div>
          )}
        </div>
      </div>

      {/* Owner Column (Compact Mode) */}
      {displayMode === "compact" && showOwner && (
        <div className="text-default-500 hidden w-32 flex-none justify-start truncate text-sm md:block">
          {item.ownerName || "未知"}
        </div>
      )}

      {/* Play Count Column */}
      {showPlayCount && (
        <div className="text-default-500 hidden w-32 flex-none justify-end text-sm md:flex">
          {item.playCount !== undefined ? `${formatNumber(item.playCount)}次播放` : "-"}
        </div>
      )}

      {/* Date Column */}
      {showAddDate && (
        <div className="text-default-500 hidden w-32 flex-none justify-end text-sm md:flex">{item.addDate || "-"}</div>
      )}

      {/* Duration Column */}
      <div className="text-default-500 flex w-16 flex-none justify-end text-sm">{durationStr}</div>

      {/* Actions Column */}
      <div className="flex w-10 flex-none justify-end">
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <RiMoreFill size={20} className="text-default-500" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Music Actions">
            <DropdownItem key="next" startContent={<RiSkipForwardLine size={18} />} onPress={handleAddToNext}>
              下一首播放
            </DropdownItem>
            <DropdownItem key="add" startContent={<RiPlayListAddLine size={18} />} onPress={handleAddToPlaylist}>
              添加到播放列表
            </DropdownItem>
            <DropdownItem key="download" startContent={<RiDownload2Line size={18} />} onPress={handleDownload}>
              下载音频
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default MusicPlaylistItemComponent;
