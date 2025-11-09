import { useRef } from "react";

import { Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Image } from "@heroui/react";
import { RiDeleteBinLine } from "@remixicon/react";
import clx from "classnames";

import If from "@/components/if";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { usePlayingQueue } from "@/store/playing-queue";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const PlayQueueDrawer = ({ isOpen, onOpenChange }: Props) => {
  const { list, current, play, clear, deleteMV } = usePlayingQueue();

  const scrollerRef = useRef<ScrollRefObject>(null);

  const clearList = () => {
    clear();
  };

  return (
    <Drawer
      disableAnimation
      backdrop="transparent"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: "data-[placement=right]:mb-[90px] data-[placement=right]:mt-[65px] data-[placement=right]:mx-2 rounded-medium",
      }}
    >
      <DrawerContent className="bg-content2">
        <DrawerHeader className="flex flex-row items-center space-x-2">
          <h2>播放列表</h2>
          <If condition={Boolean(list?.length)}>
            <Button isIconOnly size="sm" variant="light" onPress={clearList}>
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
              <div className="flex flex-col">
                {list.map(mv => {
                  const isSelected = current?.bvid === mv.bvid;

                  return (
                    <div
                      key={mv.bvid}
                      className={clx(
                        "group relative flex h-full w-full cursor-pointer items-center justify-between space-x-2 px-6 py-2",
                        {
                          "hover:bg-zinc-800": !isSelected,
                          "bg-content3": isSelected,
                        },
                      )}
                      onPointerDown={() => {
                        play(mv);
                      }}
                    >
                      <Image
                        radius="sm"
                        src={mv.coverImageUrl}
                        alt={mv.title}
                        classNames={{ wrapper: "flex-none" }}
                        className="h-12 w-12 object-cover"
                      />
                      <div className="flex min-w-0 flex-grow flex-col space-y-1">
                        <span className="truncate text-base">{mv.title}</span>
                        <span className="text-xs text-zinc-400">{mv.singer}</span>
                      </div>
                      <div className="absolute top-0 right-0 flex h-full items-center justify-center bg-transparent px-4 opacity-0 backdrop-filter group-hover:opacity-100">
                        <Button isIconOnly variant="light" size="sm" onPress={() => deleteMV([mv.bvid])}>
                          <RiDeleteBinLine size={16} />
                        </Button>
                      </div>
                    </div>
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

export default PlayQueueDrawer;
