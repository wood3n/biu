import React, { useEffect, useMemo, useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useSize } from "ahooks";
import { twMerge } from "tailwind-merge";

import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";

import Empty from "../empty";
import ImageCard from "../music-card";

export interface GridPageListProps<T> {
  data?: T[];
  loading?: boolean;
  itemKey: keyof T | ((item: T) => React.Key);
  skeletonCoverHeight?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  onEndReached?: () => void;
  offset?: number;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const EMPTY_ARRAY: never[] = [];

const GridList = <T,>({
  data = EMPTY_ARRAY as T[],
  loading = false,
  itemKey,
  skeletonCoverHeight,
  renderItem,
  className,
  onEndReached,
  offset = 200,
  header,
  footer,
}: GridPageListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<ScrollRefObject>(null);
  const size = useSize(wrapperRef);
  const width = size?.width || 0;
  const loadingRef = useRef(loading);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const columns = useMemo(() => {
    if (!width) return 1;
    if (width >= 1280) return 4; // xl, 2xl
    if (width >= 1024) return 3; // lg
    return 1;
  }, [width]);

  const rows = useMemo(() => {
    const result: T[][] = [];
    for (let i = 0; i < data.length; i += columns) {
      result.push(data.slice(i, i + columns));
    }
    return result;
  }, [data, columns]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current?.osInstance()?.elements().viewport ?? null,
    estimateSize: () => 300,
    overscan: 5,
  });

  useEffect(() => {
    const instance = scrollRef.current?.osInstance();
    if (!instance || !onEndReached) return;

    let rAFId: number | null = null;

    const onScroll = () => {
      if (rAFId) return;

      rAFId = requestAnimationFrame(() => {
        rAFId = null;
        if (loadingRef.current) return;

        const { viewport } = instance.elements();
        if (!viewport) return;
        const { scrollTop, scrollHeight, clientHeight } = viewport;

        if (scrollHeight - scrollTop - clientHeight < offset) {
          onEndReached();
        }
      });
    };

    instance.on("scroll", onScroll);
    return () => {
      instance.off("scroll", onScroll);
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, [onEndReached, offset, rows.length]);

  if (loading && data.length === 0) {
    const gridClassName = twMerge("grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4", className);
    return (
      <div className={gridClassName}>
        {Array(12)
          .fill(0)
          .map((_, index) => (
            <ImageCard.Skeleton coverHeight={skeletonCoverHeight} key={index} />
          ))}
      </div>
    );
  }

  if (data?.length === 0) {
    return <Empty className="min-h-20" />;
  }

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div ref={wrapperRef} className={twMerge("h-full w-full", className)}>
      <ScrollContainer ref={scrollRef} className="h-full w-full">
        <div ref={containerRef}>
          {header}
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map(virtualRow => {
              const rowItems = rows[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="grid gap-4 pb-4"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  }}
                >
                  {rowItems.map((item, colIndex) => {
                    const realIndex = virtualRow.index * columns + colIndex;
                    const key = typeof itemKey === "function" ? itemKey(item) : (item[itemKey as keyof T] as React.Key);
                    return <React.Fragment key={key}>{renderItem(item, realIndex)}</React.Fragment>;
                  })}
                </div>
              );
            })}
          </div>
          {footer}
        </div>
      </ScrollContainer>
    </div>
  );
};

export default GridList;
