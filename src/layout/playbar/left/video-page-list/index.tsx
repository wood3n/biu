import React, { useMemo } from "react";

import { Button, Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@heroui/react";
import { RiListRadio } from "@remixicon/react";

import Empty from "@/components/empty";
import { VirtualList } from "@/components/virtual-list";
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

  return (
    <Popover disableAnimation placement="top" offset={28} radius="md" isOpen={isOpen} onOpenChange={onOpenChange}>
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
        <VirtualList
          className="max-h-[60vh] w-full px-2"
          data={pages}
          itemHeight={48}
          overscan={5}
          empty={
            <div className="flex flex-col items-center justify-center px-4">
              <Empty className="min-h-[180px]" />
              <div className="text-foreground-500 py-3 text-sm">暂无匹配结果</div>
            </div>
          }
          renderItem={item => {
            const isActive = item.id === playId;
            return <ListItem key={item.id} data={item} isActive={isActive} onClose={onClose} />;
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default VideoPageListDrawer;
