import * as React from "react";
import { useRef } from "react";

import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from "@heroui/react";

import { usePlayingQueue } from "@/store/playing-queue";

import ScrollContainer, { ScrollRefObject } from "../scroll-container";
import SongBriefInfo from "../song-brief-info";
import VirtualList from "../virtual-list";

interface Props {
  isOpen: boolean;
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
}

const PlayQueueDrawer = ({ isOpen, onOpenChange }: Props) => {
  const { list } = usePlayingQueue();

  const scrollerRef = useRef<ScrollRefObject>(null);

  return (
    <Drawer
      disableAnimation
      hideCloseButton
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: "data-[placement=right]:mb-[90px] data-[placement=right]:mt-[65px] data-[placement=right]:mx-2 rounded-medium",
      }}
    >
      <DrawerContent>
        <DrawerHeader>播放列表</DrawerHeader>
        <DrawerBody className="px-0">
          <ScrollContainer ref={scrollerRef} className="px-6">
            <VirtualList
              data={list}
              maxRowHeight={60}
              overscan={5}
              getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport as HTMLDivElement}
            >
              {(_, song) => (
                <div className="flex h-full w-full items-center">
                  <SongBriefInfo name={song.name} ars={song.ar} coverUrl={song.al?.picUrl} />
                </div>
              )}
            </VirtualList>
          </ScrollContainer>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default PlayQueueDrawer;
