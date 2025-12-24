import React, { useEffect, useRef, useState } from "react";

import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { type OverlayScrollbars } from "overlayscrollbars";

import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";

interface VirtualListProps<T> {
  data: T[];
  renderItem: (item: T, virtualItem: VirtualItem) => React.ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
  empty?: React.ReactNode;
  scrollerRef?: React.RefObject<ScrollRefObject | null>;
}

export function VirtualList<T>({
  data,
  renderItem,
  itemHeight,
  overscan = 5,
  className,
  empty,
  scrollerRef: propScrollerRef,
}: VirtualListProps<T>) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const internalScrollerRef = useRef<ScrollRefObject>(null);
  const scrollerRef = propScrollerRef || internalScrollerRef;

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => container,
    estimateSize: () => itemHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const handleInitialized = (instance: OverlayScrollbars) => {
    setContainer(instance.elements().viewport as HTMLElement);
  };

  // Fallback: sometimes initialized event might be missed if we are not careful,
  // or if the component is re-mounted.
  useEffect(() => {
    if (scrollerRef.current) {
      const instance = scrollerRef.current.osInstance();
      if (instance) {
        setContainer(instance.elements().viewport as HTMLElement);
      }
    }
  }, [scrollerRef]);

  return (
    <ScrollContainer
      ref={scrollerRef}
      className={className}
      events={{
        initialized: handleInitialized,
      }}
    >
      {!data.length && empty ? (
        empty
      ) : (
        <div
          style={{
            height: totalSize,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map(virtualItem => {
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
