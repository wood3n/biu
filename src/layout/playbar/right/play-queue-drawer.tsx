import { Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Image } from "@heroui/react";
import { RiDeleteBinLine } from "@remixicon/react";

import { formatUrlProtocal } from "@/common/utils/url";
import Empty from "@/components/empty";
import If from "@/components/if";
import ScrollContainer from "@/components/scroll-container";
import { usePlayingQueue } from "@/store/playing-queue";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const PlayQueueDrawer = ({ isOpen, onOpenChange }: Props) => {
  const { list, current, play, clear, deleteMV } = usePlayingQueue();

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
        <DrawerHeader className="flex flex-row items-center space-x-2 px-4 pt-4">
          <h2>播放列表</h2>
          <If condition={Boolean(list?.length)}>
            <Button isIconOnly size="sm" variant="light" onPress={clearList} className="text-foreground">
              <RiDeleteBinLine size={16} />
            </Button>
          </If>
        </DrawerHeader>
        <DrawerBody className="p-0">
          <ScrollContainer>
            <If condition={!list?.length}>
              <Empty className="min-h-[280px]" />
            </If>
            <If condition={Boolean(list?.length)}>
              <div className="mb-4 flex flex-col px-2">
                {list.map(mv => {
                  const isSelected = current?.bvid === mv.bvid;

                  return (
                    <Button
                      as="div"
                      key={mv.bvid}
                      fullWidth
                      disableAnimation
                      radius="md"
                      variant="light"
                      color={isSelected ? "primary" : "default"}
                      onPress={() => {
                        play(mv);
                      }}
                      className="group flex h-auto min-h-auto w-full min-w-auto items-center justify-between space-y-2 p-2"
                    >
                      <div className="m-0 flex flex-1 items-center">
                        <Image
                          radius="sm"
                          removeWrapper
                          src={formatUrlProtocal(mv.coverImageUrl)}
                          alt={mv.title}
                          className="m-0 h-12 w-12 flex-none object-cover"
                        />
                        <div className="ml-2 flex min-w-0 flex-grow flex-col space-y-1">
                          <span className="truncate text-base">{mv.title}</span>
                          <span className="text-sm text-zinc-400">{mv.singer}</span>
                        </div>
                      </div>
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => deleteMV([mv.bvid])}
                        className="hidden flex-none opacity-0 transition-opacity duration-200 group-hover:inline-flex group-hover:opacity-100"
                      >
                        <RiDeleteBinLine size={16} />
                      </Button>
                    </Button>
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
