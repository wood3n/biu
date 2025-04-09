import React, { useEffect, useRef } from "react";

import { Spinner } from "@heroui/react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface Props<T> {
  rowHeight: number;
  getScrollElement: () => HTMLElement | null;
  children: (index: number, rowData: T) => React.ReactNode;
  scrollMargin?: number;
  data?: T[];
  hasMore?: boolean;
  loadMore?: () => Promise<void>;
}

const VirtualList = <T extends object = any>({
  data,
  scrollMargin = 0,
  rowHeight,
  getScrollElement,
  children,
  hasMore,
  loadMore,
}: Props<T>) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = React.useState(false);

  const virtualizer = useVirtualizer({
    count: hasMore ? (data?.length ?? 0) + 1 : (data?.length ?? 0),
    getScrollElement,
    estimateSize: () => rowHeight,
    overscan: 5,
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

  useEffect(() => {
    const items = virtualizer.getVirtualItems();
    if (!items.length) return;

    const lastItem = items[items.length - 1];
    if (data && lastItem.index >= data.length - 1 && !loadingMore && hasMore) {
      loadMoreData();
    }
  }, [virtualizer.getVirtualItems()]);

  return (
    <div
      ref={listRef}
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: "100%",
        position: "relative",
      }}
    >
      {virtualizer.getVirtualItems().map(virtualRow => {
        const rowData = data?.[virtualRow.index];
        const isLoaderRow = Array.isArray(data) && virtualRow.index > data.length - 1;

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className="absolute left-0 top-0 w-full"
            style={{
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
            }}
          >
            {isLoaderRow ? (
              <div className="flex h-full items-center justify-center text-sm opacity-70">
                <Spinner variant="dots" label="加载更多中..." />
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
