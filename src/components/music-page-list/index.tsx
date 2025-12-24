import React, { useMemo } from "react";

import { twMerge } from "tailwind-merge";

import Empty from "@/components/empty";
import { VirtualList } from "@/components/virtual-list";
import { usePlayList } from "@/store/play-list";

import ListItem from "./list-item";

interface Props {
  searchKeyword?: string;
  onPressItem?: VoidFunction;
  className?: string;
  hideCover?: boolean;
  itemClassName?: string;
  itemTitleClassName?: string;
  itemHeight?: number;
}

const MusicPageList = ({
  searchKeyword,
  onPressItem,
  className,
  hideCover,
  itemClassName,
  itemTitleClassName,
  itemHeight = 48,
}: Props) => {
  const playId = usePlayList(s => s.playId);
  const list = usePlayList(s => s.list);

  const pages = useMemo(() => {
    const currentItem = list.find(item => item.id === playId);
    return list.filter(item => item.bvid === currentItem?.bvid);
  }, [playId, list]);

  const filteredPages = useMemo(() => {
    if (!searchKeyword) return pages;
    const lowerKeyword = searchKeyword.toLowerCase();
    return pages.filter(item => {
      const title = item.pageTitle || item.title || "";
      return title.toLowerCase().includes(lowerKeyword);
    });
  }, [pages, searchKeyword]);

  return (
    <VirtualList
      className={twMerge("h-[60vh] w-full px-2", className)}
      data={filteredPages}
      itemHeight={itemHeight}
      overscan={5}
      empty={
        <div className="flex flex-col items-center justify-center px-4">
          <Empty className="min-h-[180px]" />
          <div className="text-foreground-500 py-3 text-sm">暂无匹配结果</div>
        </div>
      }
      renderItem={item => {
        const isActive = item.id === playId;
        return (
          <ListItem
            key={item.id}
            data={item}
            isActive={isActive}
            onPressItem={onPressItem}
            hideCover={hideCover}
            className={itemClassName}
            titleClassName={itemTitleClassName}
          />
        );
      }}
    />
  );
};

export default MusicPageList;
