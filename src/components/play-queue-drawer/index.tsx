import { useRef } from "react";

import clx from "classnames";
import { Button, Drawer, DrawerBody, DrawerContent, DrawerHeader } from "@heroui/react";
import { RiDeleteBinLine } from "@remixicon/react";

import { usePlayingQueue } from "@/store/playing-queue";

import If from "../if";
import ScrollContainer, { ScrollRefObject } from "../scroll-container";
import SongBriefInfo from "../song-brief-info";
import VirtualList from "../virtual-list";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClearPlaylist: () => void;
  onDeleteSong: (song: Song) => void;
}

const PlayQueueDrawer = ({ isOpen, onOpenChange, onClearPlaylist, onDeleteSong }: Props) => {
  const { list, currentSong } = usePlayingQueue();

  const scrollerRef = useRef<ScrollRefObject>(null);

  return (
    <Drawer
      disableAnimation
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: "data-[placement=right]:mb-[90px] data-[placement=right]:mt-[65px] data-[placement=right]:mx-2 rounded-medium",
      }}
    >
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center">
          <h2>播放列表</h2>
          <If condition={Boolean(list?.length)}>
            <Button isIconOnly variant="light" onPress={onClearPlaylist}>
              <RiDeleteBinLine size={16} />
            </Button>
          </If>
        </DrawerHeader>
        <DrawerBody className="px-0">
          <ScrollContainer ref={scrollerRef}>
            <If condition={!list?.length}>
              <div className="flex h-full w-full items-center justify-center">暂无歌曲</div>
            </If>
            <If condition={Boolean(list?.length)}>
              <VirtualList
                data={list}
                maxRowHeight={60}
                overscan={5}
                getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport as HTMLDivElement}
              >
                {(_, song) => {
                  const isSelected = currentSong?.id === song.id;

                  return (
                    <div
                      className={clx(
                        "group relative flex h-full w-full cursor-pointer items-center justify-between px-6 hover:bg-zinc-800",
                        {
                          "bg-mid-green text-green-500": isSelected,
                        },
                      )}
                    >
                      <SongBriefInfo name={song.name} ars={song.ar} coverUrl={song.al?.picUrl} />
                      <div className="absolute right-0 top-0 flex h-full items-center justify-center bg-transparent px-4 opacity-0 backdrop-filter group-hover:opacity-100">
                        <Button isIconOnly variant="light" size="sm" onPress={() => onDeleteSong(song)}>
                          <RiDeleteBinLine size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                }}
              </VirtualList>
            </If>
          </ScrollContainer>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default PlayQueueDrawer;
