import { useCallback, useEffect, useRef, useState } from "react";

import { addToast, Button, Spinner } from "@heroui/react";
import { RiDeleteBinLine } from "@remixicon/react";

import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { postHistoryClear } from "@/service/history-clear";
import { postHistoryDelete } from "@/service/history-delete";
import {
  searchWebInterfaceHistory,
  type HistoryListItem,
  type WebInterfaceHistorySearchParams,
} from "@/service/web-interface-history-search";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import GridList from "./grid-list";
import HistoryList from "./list";
import HistorySearch from "./search";

const History = () => {
  const scrollerRef = useRef<ScrollRefObject>(null);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [list, setList] = useState<HistoryListItem[]>([]);
  const pageRef = useRef(1);
  const keywordRef = useRef("");
  const dateRangeRef = useRef<{ start?: number; end?: number } | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const displayMode = useSettings(state => state.displayMode);

  // 加载历史记录（只负责请求和数据合并，loading 状态由调用方管理）
  const fetchHistory = useCallback(async () => {
    try {
      const params: WebInterfaceHistorySearchParams = {
        pn: pageRef.current,
        keyword: keywordRef.current,
        business: "archive",
      };

      if (dateRangeRef.current) {
        if (dateRangeRef.current.start) {
          params.add_time_start = Math.floor(dateRangeRef.current.start / 1000);
        }
        if (dateRangeRef.current.end) {
          params.add_time_end = Math.floor(dateRangeRef.current.end / 1000);
        }
      }

      const res = await searchWebInterfaceHistory(params);

      if (res.code !== 0) {
        if (res.code === -101) {
          throw new Error("请先登录");
        }
        throw new Error(res.message || "获取历史记录失败");
      }

      const newList = res.data?.list || [];
      // 统一走追加逻辑；首次加载 / 刷新前会清空 list
      if (pageRef.current === 1) {
        setList(newList);
      } else {
        setList(prev => [...prev, ...newList]);
      }

      setHasMore(res.data.has_more);
    } catch (error: any) {
      addToast({
        title: error?.message || "获取历史记录失败",
        color: "danger",
      });
      // 如果是第一页请求失败，清空列表
      if (pageRef.current === 1) {
        setList([]);
      }
    }
  }, []);

  const refreshList = useCallback(async () => {
    pageRef.current = 1;
    setLoading(true);
    try {
      await fetchHistory();
    } finally {
      setLoading(false);
    }
  }, [fetchHistory]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      pageRef.current += 1;
      await fetchHistory();
    } catch {
      pageRef.current -= 1;
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, fetchHistory]);

  const handleSearch = useCallback(
    async (keyword: string) => {
      keywordRef.current = keyword;
      pageRef.current = 1;
      setLoading(true);
      try {
        await fetchHistory();
      } finally {
        setLoading(false);
      }
    },
    [fetchHistory],
  );

  const handleDateRangeChange = useCallback(
    async (range: { start?: number; end?: number } | null) => {
      dateRangeRef.current = range;
      pageRef.current = 1;
      setLoading(true);
      try {
        await fetchHistory();
      } finally {
        setLoading(false);
      }
    },
    [fetchHistory],
  );

  useEffect(() => {
    // 首次进入页面加载一次
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        await fetchHistory();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchHistory]);

  const handleMenuAction = useCallback(async (key: string, item: HistoryListItem) => {
    switch (key) {
      case "play-next":
        usePlayList.getState().addToNext({
          type: "mv",
          title: item.title,
          cover: item.cover,
          bvid: item.history.bvid,
          ownerName: item.author_name,
          ownerMid: item.author_mid,
        });
        break;
      case "add-to-playlist":
        usePlayList.getState().addList([
          {
            type: "mv",
            title: item.title,
            cover: item.cover,
            bvid: item.history.bvid,
            ownerName: item.author_name,
            ownerMid: item.author_mid,
          },
        ]);
        break;
      case "download-audio":
        await window.electron.addMediaDownloadTask({
          outputFileType: "audio",
          title: item.title,
          cover: item.cover,
          bvid: item.history.bvid,
          cid: item.history.cid,
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
          cover: item.cover,
          bvid: item.history.bvid,
          cid: item.history.cid,
        });
        addToast({
          title: "已添加下载任务",
          color: "success",
        });
        break;
      case "delete":
        useModalStore.getState().onOpenConfirmModal({
          title: `删除记录${item.title}`,
          confirmText: "删除",
          onConfirm: async () => {
            const res = await postHistoryDelete({
              kid: `${item.history.business}_${item.kid}`,
            });

            if (res.code === 0) {
              setList(prev => prev.filter(record => record.kid !== item.kid));
              addToast({
                title: "已删除记录",
                color: "success",
              });
            }
            return res.code === 0;
          },
        });
        break;
    }
  }, []);

  const handleClear = useCallback(() => {
    useModalStore.getState().onOpenConfirmModal({
      title: "确认删除所有历史记录？",
      confirmText: "删除",
      onConfirm: async () => {
        const res = await postHistoryClear();
        if (res.code === 0) {
          refreshList();
        }
        return res.code === 0;
      },
    });
  }, [refreshList]);

  const isEmpty = !loading && list.length === 0;

  return (
    <ScrollContainer enableBackToTop ref={scrollerRef} className="h-full w-full px-4">
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h1>历史记录</h1>
          <Button variant="flat" startContent={<RiDeleteBinLine size={18} />} onPress={handleClear}>
            清空
          </Button>
        </div>
        <HistorySearch onSearch={handleSearch} onDateRangeChange={handleDateRangeChange} />
      </div>

      {loading && list.length === 0 ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : isEmpty ? (
        <div className="flex h-[40vh] items-center justify-center text-gray-500">暂无历史记录</div>
      ) : displayMode === "card" ? (
        <GridList
          items={list}
          hasMore={hasMore}
          loading={loadingMore}
          onLoadMore={handleLoadMore}
          getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport || null}
          onMenuAction={handleMenuAction}
        />
      ) : (
        <HistoryList
          items={list}
          hasMore={hasMore}
          loading={loadingMore}
          onLoadMore={handleLoadMore}
          getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport || null}
          onMenuAction={handleMenuAction}
        />
      )}
    </ScrollContainer>
  );
};

export default History;
