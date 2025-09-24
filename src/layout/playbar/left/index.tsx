import React, { useMemo } from "react";

import { Button, Image, useDisclosure } from "@heroui/react";
import { RiListRadio } from "@remixicon/react";

import Ellipsis from "@/components/ellipsis";
import { usePlayingQueue } from "@/store/playing-queue";

import VideoPageList from "./video-page-list";

const LeftControl = () => {
  const { current } = usePlayingQueue();
  const { isOpen, onOpen: openPageList, onOpenChange } = useDisclosure();

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
        radius="sm"
        width={56}
        height={56}
        classNames={{
          wrapper: "flex-none",
        }}
        className="object-cover"
      />
      <div className="flex min-w-0 flex-col space-y-1">
        <Ellipsis>{title}</Ellipsis>
        {Boolean(current.singer) && <span className="truncate text-zinc-400">{current.singer}</span>}
      </div>
      <div>
        {Boolean((current.pages?.length ?? 0) > 1) && (
          <Button isIconOnly size="sm" variant="light" onPress={openPageList}>
            <RiListRadio size={18} />
          </Button>
        )}
      </div>
      <VideoPageList isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  );
};

export default LeftControl;
