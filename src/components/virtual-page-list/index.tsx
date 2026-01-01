import { type ReactNode, useRef, useLayoutEffect, useCallback, useEffect, useState } from "react";

import { Spinner } from "@heroui/react";
import { useVirtualizer, observeElementRect, type Virtualizer } from "@tanstack/react-virtual";

import Empty from "../empty";

export interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getScrollElement: () => HTMLElement | null;
  rowHeight: number;
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading: boolean;
}

export default function VirtualList<T>({
  items,
  renderItem,
  getScrollElement,
  rowHeight,
  className,
  onLoadMore,
  hasMore = false,
  loading,
}: VirtualListProps<T>) {
  const scrollElRef = useRef<HTMLElement | null>(null);
  const loadLockRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetTop, setOffsetTop] = useState(0);
  const checkFillRef = useRef<((instance?: Virtualizer<HTMLElement, Element>) => void) | null>(null);
  const updateOffsetTopRef = useRef<(() => void) | null>(null);

  const updateOffsetTop = useCallback(() => {
    const el = containerRef.current;
    const scrollEl = getScrollElement();
    if (el && scrollEl) {
      const rect = el.getBoundingClientRect();
      const scrollRect = scrollEl.getBoundingClientRect();
      const offset = rect.top - scrollRect.top + scrollEl.scrollTop;
      setOffsetTop(prev => (Math.abs(prev - offset) > 1 ? offset : prev));
    }
  }, [getScrollElement]);

  /** 保持 updateOffsetTopRef 最新 */
  useEffect(() => {
    updateOffsetTopRef.current = updateOffsetTop;
  }, [updateOffsetTop]);

  /** 计算 offsetTop - 初始化和依赖变化时 */
  useLayoutEffect(() => {
    updateOffsetTop();
  }, [updateOffsetTop]);

  /** 只绑定一次 scroll element */
  useLayoutEffect(() => {
    scrollElRef.current = getScrollElement();
  }, [getScrollElement]);

  const rowVirtualizer = useVirtualizer({
    count: hasMore ? items.length + 1 : items.length,
    getScrollElement,
    estimateSize: useCallback(() => rowHeight, [rowHeight]),
    overscan: 4,
    scrollMargin: offsetTop,
    observeElementRect: (instance, cb) => {
      // 使用 tanstack-virtual 内置的 observeElementRect，避免手动管理 ResizeObserver
      return observeElementRect(instance, rect => {
        cb(rect);
        // 当容器尺寸变化时，重新检测是否填满
        // 使用 ref 调用 checkFill，确保获取到最新的闭包状态
        checkFillRef.current?.(instance);
        // 同时重新计算 offsetTop，防止布局变化导致偏移量改变
        updateOffsetTopRef.current?.();
      });
    },
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const checkFill = useCallback(
    (instanceParam?: Virtualizer<HTMLElement, Element>) => {
      if (!onLoadMore || !hasMore || loading) return;
      if (loadLockRef.current) return;

      const el = scrollElRef.current;
      if (!el) return;

      const instance = instanceParam || rowVirtualizer;
      if (!instance) return;

      // 获取滚动容器的高度
      const scrollClientHeight = el.clientHeight;
      // 获取列表总高度（包括已渲染项 + overscan）
      const totalSize = instance.getTotalSize();

      // 如果列表内容总高度 + 顶部偏移量 <= 滚动容器高度，说明还没填满，继续加载
      // 这里稍微放宽一点判断条件，比如加上一个 rowHeight 的余量
      if (totalSize + offsetTop <= scrollClientHeight + rowHeight) {
        loadLockRef.current = true;
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, loading, rowVirtualizer, offsetTop, rowHeight],
  );

  // 保持 checkFillRef 最新
  useEffect(() => {
    checkFillRef.current = checkFill;
  }, [checkFill]);

  /** ① 初始化 / items 变化：容器未填满检测 */
  useEffect(() => {
    const el = scrollElRef.current;
    if (!el) return;

    // 初始检查
    checkFill();
  }, [checkFill]);

  /** ② 滚动过程中：接近底部 */
  useEffect(() => {
    if (!onLoadMore || !hasMore || loading) return;
    if (loadLockRef.current) return;
    if (virtualItems.length === 0) return;

    const last = virtualItems[virtualItems.length - 1];
    if (last.index >= items.length) {
      loadLockRef.current = true;
      onLoadMore();
    }
  }, [virtualItems, items.length, hasMore, loading, onLoadMore]);

  /** loading 结束释放锁，并再次检测是否需要加载 */
  useEffect(() => {
    if (!loading) {
      loadLockRef.current = false;
      // loading 结束后，可能数据还是不够填满屏幕，再次检测
      checkFill();
    }
  }, [loading, checkFill]);

  if (items.length === 0 && !hasMore && !loading) {
    return <Empty />;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        height: rowVirtualizer.getTotalSize(),
      }}
    >
      {virtualItems.map(v => {
        const index = v.index;
        const isLoader = index >= items.length;

        return (
          <div
            key={v.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: rowHeight,
              transform: `translateY(${v.start - rowVirtualizer.options.scrollMargin}px)`,
            }}
          >
            {isLoader ? (
              hasMore ? (
                <div className="flex h-full items-center justify-center">{loading ? <Spinner /> : null}</div>
              ) : null
            ) : (
              renderItem(items[index], index)
            )}
          </div>
        );
      })}
    </div>
  );
}
