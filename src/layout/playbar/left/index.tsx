import React from "react";

import { Button, Card, Image } from "@heroui/react";
import { RiFullscreenLine } from "@remixicon/react";

import { usePlayingQueue } from "@/store/playing-queue";

const LeftControl = () => {
  const { current } = usePlayingQueue();

  if (!current) {
    return null;
  }

  return (
    <div className="flex h-full w-full items-center justify-start space-x-4">
      <div className="flex min-w-0 items-center space-x-4">
        <Card
          className="group relative h-14 w-14 flex-none cursor-pointer border-none"
          radius="sm"
          isHoverable
          isPressable
        >
          <Image src={current.coverImageUrl} radius="sm" width="100%" height="100%" />
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/10 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <Button isIconOnly size="sm">
              <RiFullscreenLine size={16} />
            </Button>
          </div>
        </Card>
        <div className="flex min-w-0 flex-col space-y-1">
          <span title={current.title} className="truncate text-base">
            {current.title}
          </span>
          {Boolean(current.singer) && <span className="truncate text-zinc-400">{current.singer}</span>}
        </div>
      </div>
    </div>
  );
};

export default LeftControl;
