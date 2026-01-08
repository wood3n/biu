import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { addToast, Button, Spinner } from "@heroui/react";
import { RiDeleteBinLine } from "@remixicon/react";

import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { postHistoryToViewDel } from "@/service/history-toview-del";
import {
  getHistoryToViewList,
  type HistoryToViewListParams,
  type ToViewVideoItem,
} from "@/service/history-toview-list";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import GridList from "./grid-list";
import LaterList from "./list";
import LaterSearch from "./search";

const PAGE_SIZE = 20;

const Later = () => {
  const scrollerRef = useRef<ScrollRefObject>(null);

  const [list, setList] = useState<ToViewVideoItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageRef = useRef(1);
  const keywordRef = useRef("");
  const dateRangeRef = useRef<{ start?: number; end?: number } | null>(null);

  const displayMode = useSettings(state => state.displayMode);

  const fetchPage = useCallback(async (pn: number = 1) => {
    const params: HistoryToViewListParams = {
      pn,
      ps: PAGE_SIZE,
      key: keywordRef.current,
    };

    if (dateRangeRef.current) {
      if (dateRangeRef.current.start) {
        params.add_time_start = Math.floor(dateRangeRef.current.start / 1000);
      }
      if (dateRangeRef.current.end) {
        params.add_time_end = Math.floor(dateRangeRef.current.end / 1000);
      }
    }

    const res = await getHistoryToViewList(params);
    if (res?.code === 0 && res?.data) {
      const items = res.data.list ?? [];
      if (pn === 1) {
        // 第一页：重置列表
        setList(items);
        setHasMore(items.length < (res.data.count ?? 0));
      } else {
        // 后续页：追加列表
        setList(prev => {
          const newList = [...prev, ...items];
          setHasMore(newList.length < (res.data.count ?? 0));
          return newList;
        });
      }
    } else {
      setHasMore(false);
      if (pn === 1) {
        setList([]);
      }
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      pageRef.current += 1;
      await fetchPage(pageRef.current);
    } catch {
      pageRef.current -= 1;
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, fetchPage]);

  const refreshList = useCallback(async () => {
    setInitialLoading(true);
    setList([]);
    pageRef.current = 1;
    try {
      await fetchPage(1);
    } finally {
      setInitialLoading(false);
    }
  }, [fetchPage]);

  const handleSearch = useCallback(
    async (keyword: string) => {
      keywordRef.current = keyword;
      await refreshList();
    },
    [refreshList],
  );

  const handleDateRangeChange = useCallback(
    async (range: { start?: number; end?: number } | null) => {
      dateRangeRef.current = range;
      await refreshList();
    },
    [refreshList],
  );

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const handleMenuAction = useCallback(async (key: string, item: ToViewVideoItem) => {
    switch (key) {
      case "delete":
        useModalStore.getState().onOpenConfirmModal({
          title: `确认移除“${item.title}”`,
          confirmText: "移除",
          onConfirm: async () => {
            const res = await postHistoryToViewDel({
              aid: item.aid,
            });

            if (res.code === 0) {
              addToast({
                title: "已移除",
                color: "success",
              });
              setList(prev => prev.filter(i => i.aid !== item.aid));
            }
            return res.code === 0;
          },
        });
        break;
      case "play-next":
        usePlayList.getState().addToNext({
          type: "mv",
          title: item.title,
          cover: item.pic,
          bvid: item.bvid,
          ownerName: item.owner?.name,
          ownerMid: item.owner?.mid,
        });
        break;
      case "add-to-playlist":
        usePlayList.getState().addList([
          {
            type: "mv",
            title: item.title,
            cover: item.pic,
            bvid: item.bvid,
            ownerName: item.owner?.name,
            ownerMid: item.owner?.mid,
          },
        ]);
        break;
      case "download-audio":
        await window.electron.addMediaDownloadTask({
          outputFileType: "audio",
          title: item.title,
          cover: item.pic,
          bvid: item.bvid,
          cid: item.cid,
        });
        addToast({
          title: "已添加下载任务",
          color: "success",
        });
        break;
      case "download-video":
        await window.electron.addMediaDownloadTask({
          outputFileType: "video",
          title: item.title,
          cover: item.pic,
          bvid: item.bvid,
          cid: item.cid,
        });
        addToast({
          title: "已添加下载任务",
          color: "success",
        });
        break;
      case "bililink":
        window.electron.openExternal(`https://www.bilibili.com/video/${item.bvid}`);
        break;
      default:
        break;
    }
  }, []);

  const handleClear = useCallback(() => {
    useModalStore.getState().onOpenConfirmModal({
      title: "删除已观看完的视频？",
      confirmText: "删除",
      onConfirm: async () => {
        const res = await postHistoryToViewDel({
          viewed: true,
        });
        if (res.code === 0) {
          refreshList();
        }
        return res.code === 0;
      },
    });
  }, [refreshList]);

  const isEmpty = useMemo(() => !initialLoading && list.length === 0, [initialLoading, list]);

  return (
    <ScrollContainer enableBackToTop ref={scrollerRef} className="h-full w-full px-4">
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h1>稍后再看</h1>
          <Button variant="flat" startContent={<RiDeleteBinLine size={18} />} onPress={handleClear}>
            清除已看完
          </Button>
        </div>
        <LaterSearch onSearch={handleSearch} onDateRangeChange={handleDateRangeChange} />
      </div>

      <>
        {initialLoading && (
          <div className="flex h-[40vh] items-center justify-center">
            <Spinner size="lg" label="Loading..." />
          </div>
        )}

        {/* 空状态 */}
        {isEmpty && <div className="flex h-[40vh] items-center justify-center text-gray-500">暂无稍后再看内容</div>}

        {/* 列表内容 */}
        {list.length > 0 && (
          <>
            {displayMode === "card" ? (
              <GridList
                items={list}
                hasMore={hasMore}
                loading={loadingMore}
                onLoadMore={loadMore}
                getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport || null}
                onMenuAction={handleMenuAction}
              />
            ) : (
              <LaterList
                items={list}
                hasMore={hasMore}
                loading={loadingMore}
                onLoadMore={loadMore}
                getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport || null}
                onMenuAction={handleMenuAction}
              />
            )}
          </>
        )}
      </>
    </ScrollContainer>
  );
};

export default Later;
