import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { Spinner } from "@heroui/react";
import { useVirtualizer } from "@tanstack/react-virtual";

import Empty from "@/components/empty";

export interface VirtualPageListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getScrollElement: () => HTMLElement | null;
  rowHeight: number;
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading: boolean;
}

const VirtualPageList = <T,>({
  items,
  renderItem,
  getScrollElement,
  rowHeight,
  className,
  onLoadMore,
  hasMore,
  loading,
}: VirtualPageListProps<T>) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(onLoadMore);
  const getRootRef = useRef(getScrollElement);
  const hasMoreRef = useRef(hasMore);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isInitialMountRef = useRef(true);
  const lastTriggerTimeRef = useRef(0);
  const DEBOUNCE_DELAY = 300; // 防抖延迟 300ms

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  // 统一更新所有 ref，减少 useEffect 数量
  useEffect(() => {
    loadMoreRef.current = onLoadMore;
    getRootRef.current = getScrollElement;
    hasMoreRef.current = hasMore;
  }, [onLoadMore, getScrollElement, hasMore]);

  // 处理加载更多的回调，添加防抖
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const now = Date.now();
    entries.forEach(entry => {
      if (
        entry.isIntersecting &&
        !isInitialMountRef.current &&
        hasMoreRef.current &&
        now - lastTriggerTimeRef.current > DEBOUNCE_DELAY
      ) {
        lastTriggerTimeRef.current = now;
        loadMoreRef.current?.();
      }
    });
  }, []);

  // 使用 useLayoutEffect 确保 DOM 更新后再设置 observer
  useLayoutEffect(() => {
    const scrollElement = getRootRef.current();
    if (!scrollElement || !bottomRef.current) {
      return;
    }

    // 清理旧的 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 创建新的 observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: scrollElement,
      rootMargin: "0px 0px 200px 0px",
      threshold: 0,
    });

    observerRef.current.observe(bottomRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [handleIntersection]); // 只在 handleIntersection 变化时重建

  // 标记初始挂载完成 - 使用 requestAnimationFrame 更可靠
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isInitialMountRef.current = false;
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!items.length && !loading) {
    return <Empty className="min-h-20" />;
  }

  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div
      className={className}
      style={{
        height: totalSize,
        width: "100%",
        position: "relative",
      }}
    >
      {rowVirtualizer.getVirtualItems().map(virtualRow => {
        const item = items[virtualRow.index] as T;
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: virtualRow.size,
              transform: `translate3d(0, ${virtualRow.start}px, 0)`,
            }}
          >
            {renderItem(item, virtualRow.index)}
          </div>
        );
      })}
      {hasMore && loading && (
        <div
          className="flex w-full justify-center py-4"
          style={{
            position: "absolute",
            top: totalSize,
            left: 0,
            width: "100%",
          }}
        >
          <Spinner size="sm" />
        </div>
      )}
      <div
        ref={bottomRef}
        style={{
          position: "absolute",
          top: totalSize,
          left: 0,
          width: "100%",
          height: 1,
        }}
      />
    </div>
  );
};

export default VirtualPageList;
