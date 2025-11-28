import React from "react";

import { Button, Image, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { RiListRadio, RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import { formatDuration } from "@/common/utils";
import ScrollContainer from "@/components/scroll-container";
import { usePlayQueue } from "@/store/play-queue";

const VideoPageList = () => {
  const pages = usePlayQueue(s => s.list.find(item => item.bvid === s.currentBvid)?.pages ?? []);
  const currentCid = usePlayQueue(s => s.currentCid);
  const playPage = usePlayQueue(s => s.playPage);

  return (
    <Popover placement="top-end" offset={32} radius="md">
      <PopoverTrigger>
        <Button isIconOnly size="sm" variant="light" className="hover:text-primary">
          <RiListRadio size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-content2 w-auto min-w-[300px] p-0" style={{ maxWidth: "min(500px, 90vw)" }}>
        <div className="px-4 py-2 text-base font-medium">分集</div>
        <ScrollContainer className="max-h-[60vh]">
          <div className="mb-4 flex flex-col px-3">
            {pages.map(p => {
              const isActive = p.cid === currentCid;

              return (
                <div
                  key={p.cid}
                  className="group flex min-w-0 cursor-default items-center gap-3 rounded-xl p-3 hover:bg-zinc-700"
                  onClick={() => playPage(p.cid)}
                >
                  <div className="relative h-12 w-12 flex-none shrink-0 overflow-hidden rounded-md">
                    <Image
                      radius="sm"
                      alt={p.title}
                      src={p.cover}
                      className="h-full w-full object-cover"
                      removeWrapper
                    />
                    {!isActive && (
                      <div className="absolute top-0 left-0 z-30 flex h-full w-full items-center justify-center opacity-0 group-hover:bg-gray-400/30 group-hover:opacity-100">
                        <RiPlayFill />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className={clx("truncate", { "text-primary": isActive })} title={p.title}>
                      {p.title}
                    </div>
                  </div>
                  {Boolean(p.duration) && (
                    <div className="text-foreground-500 ml-2 flex-none shrink-0 text-right text-sm whitespace-nowrap tabular-nums">
                      {formatDuration(p.duration as number)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollContainer>
      </PopoverContent>
    </Popover>
  );
};

export default VideoPageList;
