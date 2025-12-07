import React, { useEffect, useMemo, useRef, useState } from "react";

import { Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Switch, Tooltip } from "@heroui/react";
import { RiDeleteBinLine } from "@remixicon/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { uniqBy } from "es-toolkit/array";

import Empty from "@/components/empty";
import If from "@/components/if";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { usePlayList } from "@/store/play-list";

import ListItem from "./list-item";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const PlayListDrawer = ({ isOpen, onOpenChange }: Props) => {
  const shouldKeepPagesOrderInRandomPlayMode = usePlayList(s => s.shouldKeepPagesOrderInRandomPlayMode);
  const setShouldKeepPagesOrderInRandomPlayMode = usePlayList(s => s.setShouldKeepPagesOrderInRandomPlayMode);
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);
  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);

  const pureList = useMemo(() => {
    return uniqBy(list, item => item.bvid);
  }, [list]);
  const clear = usePlayList(s => s.clear);

  const [container, setContainer] = useState<HTMLElement | null>(null);
  const scrollerRef = useRef<ScrollRefObject>(null);

  useEffect(() => {
    if (isOpen) {
      setContainer(scrollerRef.current?.osInstance()?.elements().viewport as HTMLElement);
    }
  }, [isOpen]);

  const virtualizer = useVirtualizer({
    count: pureList.length,
    getScrollElement: () => container,
    estimateSize: () => 64,
    overscan: 8,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <Drawer
      radius="md"
      shadow="none"
      backdrop="opaque"
      size="sm"
      hideCloseButton
      disableAnimation
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: "data-[placement=right]:mb-[88px]",
      }}
    >
      <DrawerContent>
        <DrawerHeader className="border-b-content2 flex flex-row items-center justify-between space-x-2 border-b px-4 py-3">
          <h3>播放列表</h3>
          <div>
            <If condition={Boolean(pureList?.length)}>
              <Tooltip closeDelay={0} content="清空播放列表">
                <Button isIconOnly size="sm" variant="light" onPress={clear} className="text-zinc-300">
                  <RiDeleteBinLine size={16} />
                </Button>
              </Tooltip>
            </If>
          </div>
        </DrawerHeader>
        <div className="border-b-content2 flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm">随机播放时保持分集顺序</span>
          <Switch
            size="sm"
            isSelected={shouldKeepPagesOrderInRandomPlayMode}
            onValueChange={setShouldKeepPagesOrderInRandomPlayMode}
          />
        </div>
        <DrawerBody className="overflow-hidden px-0">
          <ScrollContainer ref={scrollerRef} className="px-2">
            <If condition={!pureList?.length}>
              <div className="flex flex-col items-center justify-center px-4">
                <Empty className="min-h-[180px]" />
              </div>
            </If>
            <If condition={Boolean(pureList?.length)}>
              <div style={{ height: totalSize, position: "relative" }}>
                {virtualItems.map(vi => {
                  const item = pureList[vi.index];
                  const isPlaying = item.type === "mv" ? playItem?.bvid === item.bvid : playItem?.id === item.id;
                  return (
                    <ListItem
                      key={item.id}
                      data={item}
                      isPlaying={isPlaying}
                      onClose={() => onOpenChange(false)}
                      virtualOffset={vi.start}
                    />
                  );
                })}
              </div>
            </If>
          </ScrollContainer>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default PlayListDrawer;
