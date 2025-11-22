import { Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, Image, Link } from "@heroui/react";
import { RiDeleteBinLine } from "@remixicon/react";

import { ReactComponent as AudioAnimation } from "@/assets/icons/audio-animation.svg";
import { formatUrlProtocal } from "@/common/utils/url";
import Empty from "@/components/empty";
import If from "@/components/if";
import ScrollContainer from "@/components/scroll-container";
import { usePlayQueue } from "@/store/play-queue";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const PlayQueueDrawer = ({ isOpen, onOpenChange }: Props) => {
  const currentBvid = usePlayQueue(s => s.currentBvid);
  const list = usePlayQueue(s => s.list);
  const play = usePlayQueue(s => s.play);
  const clear = usePlayQueue(s => s.clear);
  const delMV = usePlayQueue(s => s.delMV);

  return (
    <Drawer
      backdrop="transparent"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        base: "data-[placement=right]:mb-[85px] data-[placement=right]:mt-[60px] rounded-medium",
      }}
    >
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center space-x-2 px-4 pt-4">
          <h2>播放列表</h2>
          <If condition={Boolean(list?.length)}>
            <Button isIconOnly size="sm" variant="light" onPress={clear} className="text-foreground">
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
                  const isSelected = currentBvid === mv.bvid;

                  return (
                    <Button
                      as="div"
                      key={mv.bvid}
                      fullWidth
                      disableAnimation
                      radius="md"
                      variant={isSelected ? "flat" : "light"}
                      color={isSelected ? "primary" : "default"}
                      onPress={() => {
                        play(mv.bvid);
                      }}
                      className="group flex h-auto min-h-auto w-full min-w-auto items-center justify-between space-y-2 p-2"
                    >
                      <div className="m-0 flex min-w-0 flex-1 items-center">
                        <div className="relative h-12 w-12 flex-none">
                          <Image
                            removeWrapper
                            radius="md"
                            src={formatUrlProtocal(mv.cover)}
                            alt={mv.title}
                            width="100%"
                            height="100%"
                            className="m-0 object-cover"
                          />
                          {isSelected && (
                            <div className="text-primary rounded-medium absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.2)]">
                              <AudioAnimation style={{ width: 20, height: 20 }} />
                            </div>
                          )}
                        </div>
                        <div className="ml-2 flex min-w-0 flex-auto flex-col items-start space-y-1">
                          <span className="w-full min-w-0 truncate text-base">{mv.title}</span>
                          <Link
                            href={`/user/${mv?.ownerMid}`}
                            className="text-foreground-500 w-fit truncate text-sm hover:underline"
                          >
                            {mv?.ownerName}
                          </Link>
                        </div>
                      </div>
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => delMV(mv.bvid)}
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
