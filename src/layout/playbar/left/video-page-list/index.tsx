import React, { useEffect, useMemo, useRef, useState } from "react";

import { Button, Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@heroui/react";
import { RiListRadio } from "@remixicon/react";
import { useVirtualizer } from "@tanstack/react-virtual";

import Empty from "@/components/empty";
import If from "@/components/if";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { usePlayList } from "@/store/play-list";

import ListItem from "./list-item";

const VideoPageListDrawer = () => {
  const playId = usePlayList(s => s.playId);
  const list = usePlayList(s => s.list);

  const pages = useMemo(() => {
    const currentItem = list.find(item => item.id === playId);
    return list.filter(item => item.bvid === currentItem?.bvid);
  }, [playId, list]);

  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const scrollRef = useRef<ScrollRefObject>(null);

  const rowVirtualizer = useVirtualizer({
    count: pages.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 72,
    overscan: 5,
  });

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      setScrollElement(scrollRef.current.osInstance()?.elements().viewport as HTMLElement);
    }
  }, [isOpen]);

  return (
    <Popover disableAnimation placement="top" offset={32} radius="md" isOpen={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger>
        <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={onOpen}>
          <RiListRadio size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-content2 w-auto min-w-[500px] overflow-hidden p-0"
        style={{ maxWidth: "min(500px, 90vw)" }}
      >
        <div className="border-b-content2 flex flex-row items-center justify-between space-x-2 border-b px-4 py-3">
          <h3>分集</h3>
        </div>
        <ScrollContainer ref={scrollRef} className="max-h-[60vh] w-full px-2">
          <If condition={!pages?.length}>
            <div className="flex flex-col items-center justify-center px-4">
              <Empty className="min-h-[180px]" />
              <div className="text-foreground-500 py-3 text-sm">暂无匹配结果</div>
            </div>
          </If>
          <If condition={Boolean(pages?.length)}>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map(virtualItem => {
                const item = pages[virtualItem.index];
                const isActive = item.id === playId;
                return (
                  <ListItem
                    key={item.id}
                    data={item}
                    isActive={isActive}
                    onClose={onClose}
                    virtualOffset={virtualItem.start}
                  />
                );
              })}
            </div>
          </If>
        </ScrollContainer>
      </PopoverContent>
    </Popover>
  );
};

export default VideoPageListDrawer;
