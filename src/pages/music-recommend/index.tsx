import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Alert, Button, Spinner, addToast } from "@heroui/react";
import { twMerge } from "tailwind-merge";

import ImageCard from "@/components/image-card";
import MVCard from "@/components/mv-card";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { getMusicComprehensiveWebRank, type Data as MusicItem } from "@/service/music-comprehensive-web-rank";
import { usePlayingQueue } from "@/store/playing-queue";

const PAGE_SIZE = 20;

const gridClass = twMerge("grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4");

const MusicRecommend = () => {
  const scrollerRef = useRef<ScrollRefObject>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [list, setList] = useState<MusicItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playMusic = usePlayingQueue(state => state.play);

  const deDupConcat = useCallback((prev: MusicItem[], next: MusicItem[]) => {
    const seen = new Set(prev.map(i => i.id));
    const merged = [...prev];
    for (const item of next) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
    return merged;
  }, []);

  const fetchPage = useCallback(
    async (pn: number) => {
      setError(null);
      const res = await getMusicComprehensiveWebRank({ pn, ps: PAGE_SIZE, web_location: "333.1351" });
      const items = res?.data?.list ?? [];
      setHasMore(items.length === PAGE_SIZE);
      setList(prev => deDupConcat(prev, items));
    },
    [deDupConcat],
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      await fetchPage(nextPage);
      setPage(nextPage);
    } catch (e: any) {
      const msg = e?.message || "加载更多失败";
      setError(msg);
      addToast({ title: msg, color: "danger" });
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, fetchPage]);

  const retryInitial = useCallback(async () => {
    setInitialLoading(true);
    setList([]);
    setPage(1);
    try {
      await fetchPage(1);
    } catch (e: any) {
      const msg = e?.message || "加载失败";
      setError(msg);
      addToast({ title: msg, color: "danger" });
    } finally {
      setInitialLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    // 首次加载
    retryInitial();
  }, [retryInitial]);

  useEffect(() => {
    // 监听滚动末尾的 sentinel，实现无限滚动
    const rootEl = scrollerRef.current?.osInstance()?.elements().viewport as HTMLElement | undefined;
    if (!rootEl) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !loadingMore && !initialLoading && !error) {
          loadMore();
        }
      },
      { root: rootEl, rootMargin: "0px 0px 200px 0px", threshold: 0.1 },
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observerRef.current.observe(sentinel);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, loadingMore, initialLoading, error, loadMore]);

  const isEmpty = useMemo(() => !initialLoading && list.length === 0 && !error, [initialLoading, list, error]);

  return (
    <ScrollContainer ref={scrollerRef} className="h-full w-full p-4">
      <h1 className="mb-4">音乐推荐</h1>
      <div className="w-full">
        {/* 错误提示（整页） */}
        {error && list.length === 0 && (
          <div className="flex h-[40vh] flex-col items-center justify-center space-y-3">
            <Alert color="danger" title="加载失败">
              出错了：{error}
            </Alert>
            <Button color="primary" onPress={retryInitial}>
              重试
            </Button>
          </div>
        )}

        {/* 初始加载骨架屏 */}
        {initialLoading && (
          <div className={gridClass}>
            {Array.from({ length: 10 }).map((_, idx) => (
              <ImageCard.Skeleton key={idx} />
            ))}
          </div>
        )}

        {/* 空数据 */}
        {isEmpty && <div className="text-foreground-500 flex h-[40vh] items-center justify-center">暂无数据</div>}

        {/* 数据网格 */}
        {!initialLoading && list.length > 0 && (
          <div className={gridClass}>
            {list.map(item => (
              <MVCard
                bvid={item.bvid}
                aid={String(item.id)}
                key={item.id}
                cover={item.cover}
                title={item.music_title}
                footer={<div className="w-full truncate text-left text-sm text-zinc-400">{item.author}</div>}
                onPress={() =>
                  playMusic({
                    title: item.music_title,
                    bvid: item.bvid,
                    cid: item.cid,
                    singer: item.author,
                    coverImageUrl: item.cover,
                  })
                }
              />
            ))}
          </div>
        )}

        {/* 加载更多/无更多 提示区 & 作为 sentinel */}
        <div ref={sentinelRef} className="flex w-full items-center justify-center py-6">
          {loadingMore && (
            <div className="text-default-500 flex items-center space-x-2 text-sm">
              <Spinner size="sm" />
              <span>加载更多中...</span>
            </div>
          )}
          {!hasMore && list.length > 0 && <div className="text-default-400 text-sm">没有更多了</div>}
        </div>
      </div>
    </ScrollContainer>
  );
};

export default MusicRecommend;
