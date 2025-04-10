import React, { useEffect, useRef, useState } from "react";

import { Spinner } from "@heroui/react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface Props<T> {
  maxRowHeight: number;
  dynamicRowHeight?: boolean;
  overscan?: number;
  getScrollElement: () => HTMLElement | null;
  children: (index: number, rowData: T) => React.ReactNode;
  scrollMargin?: number;
  data?: T[];
  hasMore?: boolean;
  loadMore?: () => Promise<void>;
}

const VirtualList = <T extends object = any>({
  data,
  dynamicRowHeight,
  scrollMargin = 0,
  overscan = 5,
  maxRowHeight,
  getScrollElement,
  children,
  hasMore,
  loadMore,
}: Props<T>) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const virtualizer = useVirtualizer({
    count: hasMore ? (data?.length ?? 0) + 1 : (data?.length ?? 0),
    getScrollElement,
    estimateSize: () => maxRowHeight,
    overscan,
    // top content height
    scrollMargin: (listRef.current?.offsetTop ?? 0) - scrollMargin,
  });

  const loadMoreData = async () => {
    setLoadingMore(true);
    try {
      await loadMore?.();
    } finally {
      setLoadingMore(false);
    }
  };

  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    if (!items.length) return;

    const lastItem = items[items.length - 1];
    if (hasMore && !loadingMore && data?.length && lastItem.index >= data.length - 1) {
      loadMoreData();
    }
  }, [items, hasMore, loadMore]);

  return (
    <div
      ref={listRef}
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: "100%",
        position: "relative",
      }}
    >
      {items.map(virtualRow => {
        const rowData = data?.[virtualRow.index];
        const isLoaderRow = Array.isArray(data) && virtualRow.index > data.length - 1;

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className="absolute left-0 top-0 w-full"
            style={{
              height: dynamicRowHeight ? undefined : virtualRow.size,
              transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
            }}
          >
            {isLoaderRow ? (
              <div className="flex h-full items-center justify-center text-sm opacity-70">
                <Spinner variant="dots" size="sm" label="加载更多中..." />
              </div>
            ) : (
              children(virtualRow.index, rowData!)
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VirtualList;
