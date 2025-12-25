import { useEffect, useRef } from "react";

import { RiTimeLine } from "@remixicon/react";
import { twMerge } from "tailwind-merge";

import type { ScrollRefObject } from "@/components/scroll-container";

import { VirtualList } from "@/components/virtual-list";

import type { MusicPlaylistProps } from "./types";

import MusicPlaylistItemComponent from "./item";
import { MusicPlaylistItemSkeleton } from "./skeleton";

export const Musiclist = ({
  items,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  showOwner = true,
  showPlayCount = true,
  showAddDate = true,
  className,
  empty,
  displayMode = "list",
}: MusicPlaylistProps) => {
  const scrollerRef = useRef<ScrollRefObject>(null);

  useEffect(() => {
    const instance = scrollerRef.current?.osInstance();
    if (!instance) return;

    const onScroll = () => {
      const viewport = instance.elements().viewport;
      if (!viewport) return;

      const { scrollTop, scrollHeight, clientHeight } = viewport;
      if (scrollHeight - scrollTop - clientHeight < 200) {
        if (hasMore && !isLoading && onLoadMore) {
          onLoadMore();
        }
      }
    };

    instance.on("scroll", onScroll);

    return () => {
      instance.off("scroll", onScroll);
    };
  }, [hasMore, isLoading, onLoadMore, items]);

  const renderSkeleton = () => {
    return (
      <div className="flex w-full flex-col">
        {Array.from({ length: 10 }).map((_, index) => (
          <MusicPlaylistItemSkeleton
            key={index}
            showOwner={showOwner}
            showPlayCount={showPlayCount}
            showAddDate={showAddDate}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={twMerge("flex h-full w-full flex-col", className)}>
      {/* Header */}
      <div className="text-default-500 flex w-full items-center gap-4 px-4 py-2 text-sm font-medium">
        <div className="grow">歌曲</div>
        {displayMode === "compact" && showOwner && (
          <div className="hidden w-32 flex-none justify-start md:block">UP主</div>
        )}
        {showPlayCount && <div className="hidden w-32 flex-none justify-end md:flex">播放量</div>}
        {showAddDate && <div className="hidden w-32 flex-none justify-end md:flex">添加日期</div>}
        <div className="flex w-16 flex-none justify-end">
          <RiTimeLine size={16} />
        </div>
        <div className="w-10 flex-none" />
      </div>

      {/* List */}
      <div className="min-h-0 flex-1">
        {isLoading && items.length === 0 ? (
          renderSkeleton()
        ) : (
          <VirtualList
            scrollerRef={scrollerRef}
            data={items}
            itemHeight={64} // 56px (h-10 + p-2) approx? Item has py-2 and h-10 content -> 40 + 16 = 56. Let's measure.
            // Item: py-2 (8px * 2 = 16px). Content h-10 (40px). Total 56px.
            // But we used `gap-4` in the container? No, gap is horizontal.
            // Let's use 60px to be safe or 56px.
            renderItem={item => (
              <MusicPlaylistItemComponent
                key={item.id}
                item={item}
                showOwner={showOwner}
                showPlayCount={showPlayCount}
                showAddDate={showAddDate}
              />
            )}
            empty={empty}
            className="h-full"
          />
        )}
      </div>
    </div>
  );
};

export default Musiclist;
