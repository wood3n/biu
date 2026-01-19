import React, { memo } from "react";

import { CollectionType } from "@/common/constants/collection";
import { formatSecondsToDate } from "@/common/utils/time";
import Image from "@/components/image";

export interface GridCardProps {
  title: string;
  cover: string;
  type: CollectionType;
  createTime?: number;
  mediaCount?: number;
  onPress?: () => void;
}

const GridCard = memo(({ title, cover, type, createTime, mediaCount, onPress }: GridCardProps) => {
  return (
    <div className="group flex h-full max-h-full w-full cursor-pointer flex-col overflow-hidden" onClick={onPress}>
      <div className="relative w-full flex-none">
        <div className="relative z-10 aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
          <Image
            radius="none"
            src={cover}
            params="672w_378h_1c.avif"
            alt={title}
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
            width="100%"
            height="100%"
            removeWrapper
          />
          {/* Overlay */}
          <div className="absolute right-2 bottom-2 z-20 rounded-sm bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
            <span>{`${type === CollectionType.VideoSeries ? "系列" : "合集"} · ${mediaCount ?? 0}个视频`}</span>
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
  );
});

export default GridCard;
