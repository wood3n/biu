import React, { useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

interface Props<T> {
  data?: T[];
  getScrollElement: () => HTMLElement | null;
  children: (index: number, rowData: T) => React.ReactNode;
}

const VirtualList = <T extends object = any>({ data, getScrollElement, children }: Props<T>) => {
  const listRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data?.length || 0,
    getScrollElement,
    estimateSize: () => 60,
    overscan: 5,
    // top content height
    scrollMargin: (listRef.current?.offsetTop ?? 0) - 64,
  });

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
            {children(virtualRow.index, rowData!)}
          </div>
        );
      })}
    </div>
  );
};

export default VirtualList;
