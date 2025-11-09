import React, { useMemo } from "react";

import { Chip, Image } from "@heroui/react";

import Ellipsis from "@/components/ellipsis";
import { usePlayingQueue } from "@/store/playing-queue";

import VideoPageList from "./video-page-list";

const LeftControl = () => {
  const { current } = usePlayingQueue();

  const title = useMemo(() => {
    if ((current?.pages?.length ?? 0) > 1) {
      return current?.pages?.find(item => item.pageIndex === current.currentPage)?.pageTitle;
    }

    return current?.title;
  }, [current]);

  if (!current) {
    return null;
  }

  return (
    <div className="flex h-full w-full items-center justify-start space-x-4">
      <Image
        src={current.coverImageUrl}
        width={56}
        height={56}
        classNames={{
          wrapper: "flex-none",
        }}
        className="object-cover"
      />
      <div className="flex min-w-0 flex-col space-y-1">
        <span className="flex items-center">
          <Ellipsis>{title}</Ellipsis>
          {Boolean(current.isLossless) && <Chip size="sm">无损</Chip>}
        </span>
        {Boolean(current.singer) && <span className="truncate text-sm text-zinc-400">{current.singer}</span>}
      </div>
      {Boolean((current.pages?.length ?? 0) > 1) && <VideoPageList />}
    </div>
  );
};

export default LeftControl;
