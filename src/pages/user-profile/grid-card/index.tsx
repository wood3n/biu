import React, { memo } from "react";

import { Image } from "@heroui/react";

import { formatSecondsToDate } from "@/common/utils/time";
import ContextMenu, { type ContextMenuItem } from "@/components/context-menu";

export interface GridCardProps {
  title: string;
  cover: string;
  playCount?: number;
  createTime?: number;
  mediaCount?: number;
  onPress?: () => void;
  menus?: ContextMenuItem[];
  onMenuAction?: (key: string) => void;
}

const GridCard = memo(({ title, cover, createTime, mediaCount, onPress, menus = [], onMenuAction }: GridCardProps) => {
  return (
    <ContextMenu items={menus} onAction={onMenuAction} className="h-full min-h-0 w-full">
      <div className="group flex h-full w-full cursor-pointer flex-col" onClick={onPress}>
        {/* Stack Effect Container */}
        <div className="relative w-full shrink">
          {/* Main Card */}
          <div className="relative z-10 aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
            <Image
              radius="none"
              src={`${cover}?@320h`}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              width="100%"
              height="100%"
              removeWrapper
            />
            {/* Overlay */}
            <div className="absolute right-2 bottom-2 z-20 rounded-sm bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
              <span>{`${mediaCount ?? 0}个视频`}</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-2 flex flex-col gap-1">
          <div className="line-clamp-2 font-medium">{title}</div>
          {Boolean(createTime) && (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">{formatSecondsToDate(createTime)}</div>
          )}
        </div>
      </div>
    </ContextMenu>
  );
});

export default GridCard;
