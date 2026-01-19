import React from "react";

import { Button } from "@heroui/react";
import { RiDeleteBinLine, RiFileMusicLine, RiPlayCircleLine, RiPlayFill, RiPlayListAddLine } from "@remixicon/react";
import clsx from "classnames";
import { filesize } from "filesize";

import { formatDuration, formatMillisecond } from "@/common/utils/time";
import ContextMenu from "@/components/context-menu";

import OperationMenu, { type LocalOperationItem } from "./operation";

interface Props {
  data: LocalMusicItem;
  isPlaying: boolean;
  index: number;
  onAddToNext: () => void;
  onAddToPlayList: () => void;
  onPlay: () => void;
  onOpen: () => void;
  onDelete: () => void;
}

const menus: LocalOperationItem[] = [
  { key: "nextplay", label: "下一首播放", icon: <RiPlayCircleLine size={18} /> },
  { key: "play", label: "添加到播放列表", icon: <RiPlayListAddLine size={18} /> },
  { key: "open", label: "打开文件", icon: <RiFileMusicLine size={18} /> },
  { key: "delete", label: "删除文件", color: "danger", className: "text-danger", icon: <RiDeleteBinLine size={18} /> },
];

const LocalMusicItemRow = ({
  data,
  isPlaying,
  index,
  onAddToNext,
  onAddToPlayList,
  onPlay,
  onOpen,
  onDelete,
}: Props) => {
  const [isOpOpen, setIsOpOpen] = React.useState(false);
  const items = isPlaying ? menus.filter(m => m.key !== "delete") : menus;

  const onAction = (key: string) => {
    if (key === "nextplay") onAddToNext();
    if (key === "play") onAddToPlayList();
    if (key === "open") onOpen();
    if (key === "delete") onDelete();
  };

  return (
    <ContextMenu items={items} onAction={onAction} contentClassName="w-[160px]" disabled={isOpOpen}>
      <Button
        as="div"
        radius="md"
        fullWidth
        disableAnimation
        color={isPlaying ? "primary" : "default"}
        variant={isPlaying ? "flat" : "light"}
        onDoubleClick={() => onPlay()}
        className="group flex w-full items-center justify-between rounded-md p-2"
      >
        <div className="grid w-full grid-cols-[40px_minmax(0,1fr)_100px_100px_100px_100px_40px] items-center gap-4">
          <div className="text-foreground-500 min-w-8 text-center text-xs tabular-nums">
            <span
              className={clsx({
                "group-hover:hidden": !isPlaying,
              })}
            >
              {index}
            </span>
            {!isPlaying && <RiPlayFill size={16} className="hidden align-middle group-hover:inline" />}
          </div>
          <div className="min-w-0 truncate">{data.title}</div>
          <div className="text-foreground-500 flex justify-end text-xs tabular-nums">{filesize(data.size)}</div>
          <div className="text-foreground-500 flex justify-end text-xs">{data.format?.toUpperCase() || "-"}</div>
          <div className="text-foreground-500 flex justify-end text-xs tabular-nums">
            {typeof data.duration === "number" ? formatDuration(Math.round(data.duration)) : "-"}
          </div>
          <div className="text-foreground-500 flex justify-end text-xs">
            {data.createdTime ? formatMillisecond(data.createdTime) : "-"}
          </div>
          <div
            className="flex h-full items-center justify-end"
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <OperationMenu
              items={items}
              onOpenChange={open => {
                setIsOpOpen(open);
              }}
              onAction={onAction}
            />
          </div>
        </div>
      </Button>
    </ContextMenu>
  );
};
export default LocalMusicItemRow;
