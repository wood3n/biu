import React, { useEffect, useRef, useState } from "react";

import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";

import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";

interface VirtualListProps<T> {
  data: T[];
  renderItem: (item: T, virtualItem: VirtualItem) => React.ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
  empty?: React.ReactNode;
}

export function VirtualList<T>({ data, renderItem, itemHeight, overscan = 5, className, empty }: VirtualListProps<T>) {
  const scrollerRef = useRef<ScrollRefObject>(null);
  const [viewport, setViewport] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let rafId: number;
    const updateViewport = () => {
      const instance = scrollerRef.current?.osInstance();
      if (instance) {
        setViewport(instance.elements().viewport as HTMLElement);
      } else {
        rafId = requestAnimationFrame(updateViewport);
      }
    };
    updateViewport();
    return () => cancelAnimationFrame(rafId);
  }, []);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => viewport,
    estimateSize: () => itemHeight,
    overscan,
  });

  return (
    <ScrollContainer ref={scrollerRef} className={className}>
      {!data.length && empty ? (
        empty
      ) : (
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map(virtualItem => {
            const item = data[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualItem.size}px`,
                  transform: `translate3d(0, ${virtualItem.start}px, 0)`,
                }}
              >
                {renderItem(item, virtualItem)}
              </div>
            );
          })}
        </div>
      )}
    </ScrollContainer>
  );
}
