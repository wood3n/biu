import { useCallback, useEffect, useRef, useState } from "react";

import { addToast, Spinner } from "@heroui/react";
import { RiCloseLine } from "@remixicon/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { twMerge } from "tailwind-merge";
import { useShallow } from "zustand/shallow";

import Empty from "@/components/empty";
import IconButton from "@/components/icon-button";
import { type ScrollRefObject } from "@/components/scroll-container";
import { getReplyMain, type ReplyItem } from "@/service/reply-main";
import { usePlayList } from "@/store/play-list";

import CommentItem from "./comment-item";

interface Props {
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
}

/** 预估评论行高（measureElement 支持动态高度） */
const ESTIMATE_ROW_HEIGHT = 100;
/** 触底加载阈值(px) */
const LOAD_MORE_THRESHOLD = 300;

const CommentPanel = ({ ref, className, style, onClose }: Props & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const { playId, list } = usePlayList(
    useShallow(s => ({
      playId: s.playId,
      list: s.list,
    })),
  );
  const playItem = list.find(item => item.id === playId);
  const oid = playItem?.aid ? Number(playItem.aid) : undefined;

  const [items, setItems] = useState<ReplyItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isError, setIsError] = useState(false);
  /** 游标（首页为0，与页码不同），存 ref 避免闭包过期 */
  const nextRef = useRef(0);
  const oidRef = useRef<number | undefined>(undefined);
  const loadingRef = useRef(false);

  const scrollRef = useRef<ScrollRefObject>(null);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);

  /** 拉取评论（只负责请求和数据合并，loading 由调用方管理） */
  const fetchComments = useCallback(async (isRefresh: boolean) => {
    if (oidRef.current === undefined || loadingRef.current) return;
    loadingRef.current = true;
    setIsError(false);
    try {
      const res = await getReplyMain({
        oid: oidRef.current,
        type: 1,
        mode: 3,
        next: nextRef.current,
        plat: 1,
      });

      if (res.code !== 0) {
        throw new Error(res.message || "获取评论失败");
      }

      // 无评论时 replies 为 null
      const newItems = res.data.replies ?? [];
      setItems(prev => (isRefresh ? newItems : [...prev, ...newItems]));
      setTotalCount(res.data.cursor.all_count);
      setHasMore(!res.data.cursor.is_end);
      nextRef.current = res.data.cursor.next;
    } catch (error: any) {
      setIsError(true);
      if (isRefresh) {
        setItems([]);
        setHasMore(false);
      }
      addToast({ title: error?.message || "获取评论失败", color: "danger" });
    } finally {
      loadingRef.current = false;
    }
  }, []);

  /** 刷新（换曲目或手动重试） */
  const refresh = useCallback(async () => {
    nextRef.current = 0;
    setItems([]);
    setHasMore(true);
    setLoading(true);
    try {
      await fetchComments(true);
    } finally {
      setLoading(false);
    }
  }, [fetchComments]);

  /** 切歌重载：oid 变化时重新拉取 */
  useEffect(() => {
    if (oid === undefined) return;
    if (oidRef.current === oid && items.length) return;
    oidRef.current = oid;
    refresh();
  }, [oid]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 初始化滚动容器 viewport（RAF 轮询直到 OverlayScrollbars 初始化完成） */
  useEffect(() => {
    let rafId: number;
    const updateViewport = () => {
      const viewport = scrollRef.current?.osInstance()?.elements().viewport as HTMLElement | null;
      if (viewport) {
        setScrollElement(viewport);
      } else {
        rafId = requestAnimationFrame(updateViewport);
      }
    };
    updateViewport();
    return () => cancelAnimationFrame(rafId);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => ESTIMATE_ROW_HEIGHT,
    overscan: 6,
  });

  const handleLoadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || loading || loadingMore) return;
    setLoadingMore(true);
    try {
      await fetchComments(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loading, loadingMore, fetchComments]);

  /** 触底加载：滚动位置接近底部时触发 */
  useEffect(() => {
    if (!scrollElement) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      if (scrollHeight - scrollTop - clientHeight < LOAD_MORE_THRESHOLD) {
        handleLoadMore();
      }
    };
    scrollElement.addEventListener("scroll", handleScroll);
    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [scrollElement, handleLoadMore]);

  return (
    <div
      ref={ref}
      className={twMerge(
        "flex flex-col overflow-hidden bg-white/70 text-neutral-900 shadow-[0_-8px_40px_-12px_rgb(0_0_0/0.25)] ring-1 ring-white/40 backdrop-blur-2xl backdrop-saturate-150",
        className,
      )}
      style={style}
    >
      {/* 头部：标题左上 + 关闭按钮右上 */}
      <div className="flex w-full flex-none items-center border-b border-black/8 px-2 py-2">
        <span className="ml-1 text-sm font-medium text-neutral-900 select-none">
          评论
          {totalCount > 0 && <span className="ml-1 text-neutral-400">{totalCount}</span>}
        </span>
        <IconButton aria-label="关闭评论" onPress={onClose} className="hover:text-danger mr-1 ml-auto text-neutral-600">
          <RiCloseLine size={22} />
        </IconButton>
      </div>

      {/* 评论列表 */}
      <OverlayScrollbarsComponent
        ref={scrollRef}
        className="h-full w-full flex-1"
        options={{
          scrollbars: { autoHide: "leave", autoHideDelay: 800, theme: "os-theme-light" },
          overflow: { x: "hidden" },
        }}
      >
        {loading && !items.length ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="sm" />
          </div>
        ) : !items.length && !isError ? (
          <Empty title="暂无评论" className="text-neutral-400" />
        ) : (
          <div className="relative w-full py-2" style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map(virtualItem => {
              const item = items[virtualItem.index];
              return (
                <div
                  key={item.rpid_str}
                  data-index={virtualItem.index}
                  ref={rowVirtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{ transform: `translateY(${virtualItem.start}px)` }}
                >
                  <CommentItem data={item} className="border-b border-black/5 last:border-b-0" />
                </div>
              );
            })}
          </div>
        )}

        {/* 底部状态 */}
        {items.length > 0 && (
          <div className="flex w-full justify-center py-3">
            {loadingMore && <Spinner size="sm" />}
            {!loadingMore && !hasMore && <span className="text-xs text-neutral-400 select-none">没有更多评论了</span>}
            {!loadingMore && hasMore && isError && (
              <span className="cursor-pointer text-xs text-neutral-500 select-none" onClick={() => handleLoadMore()}>
                加载失败，点击重试
              </span>
            )}
          </div>
        )}
      </OverlayScrollbarsComponent>
    </div>
  );
};

export default CommentPanel;
