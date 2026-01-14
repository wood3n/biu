import React, { useCallback, useEffect, useState } from "react";

import { addToast, Spinner } from "@heroui/react";

import { formatUrlProtocol } from "@/common/utils/url";
import Empty from "@/components/empty";
import { getWebInterfaceWbiSearchType, type SearchVideoItem } from "@/service/web-interface-search-type";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import GridList from "./grid-list";
import List from "./list";
import SearchHeader, { type SortOrder } from "./search-header";

export type SearchVideoProps = {
  keyword: string;
  getScrollElement: () => HTMLElement | null;
};

export default function SearchVideo({ keyword, getScrollElement }: SearchVideoProps) {
  const displayMode = useSettings(state => state.displayMode);

  const [musicOnly, setMusicOnly] = useState(true);
  const [order, setOrder] = useState<SortOrder>("totalrank");
  const [list, setList] = useState<SearchVideoItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (pn: number) => {
      const res = await getWebInterfaceWbiSearchType<SearchVideoItem>({
        search_type: "video",
        keyword,
        page: pn,
        page_size: 24,
        order,
        ...(musicOnly && { tids: 3 }), // 音乐分区ID为3
      });
      const items = res?.data?.result ?? [];
      const total = res?.data?.numResults ?? 0;
      return { items, total };
    },
    [keyword, musicOnly, order],
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const { items, total } = await fetchPage(nextPage);
      setList(prev => {
        const newList = [...prev, ...items];
        setHasMore(newList.length < total);
        return newList;
      });
      setPage(nextPage);
    } catch {
      addToast({ title: "加载更多失败", color: "danger" });
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, fetchPage]);

  const retryInitial = useCallback(async () => {
    if (!keyword) return;
    setInitialLoading(true);
    setList([]);
    setPage(1);
    setHasMore(true);
    try {
      const { items, total } = await fetchPage(1);
      setList(items);
      setHasMore(items.length < total);
    } catch {
      addToast({ title: "加载失败", color: "danger" });
    } finally {
      setInitialLoading(false);
    }
  }, [fetchPage, keyword]);

  useEffect(() => {
    retryInitial();
  }, [retryInitial]);

  const handlePlayAll = useCallback(async () => {
    if (!list.length) {
      addToast({ title: "暂无可播放内容", color: "warning" });
      return;
    }

    const items = list.map(item => ({
      type: "mv" as const,
      bvid: item.bvid,
      title: item.title,
      cover: formatUrlProtocol(item.pic),
      ownerName: item.author,
      ownerMid: item.mid,
    }));

    await usePlayList.getState().addList(items);
    addToast({ title: `已添加 ${items.length} 首到播放列表`, color: "success" });
  }, [list]);

  const handleMenuAction = useCallback(async (key: string, item: SearchVideoItem) => {
    const musicItem = {
      type: "mv" as const,
      bvid: item.bvid,
      title: item.title,
      cover: formatUrlProtocol(item.pic),
      ownerName: item.author,
      ownerMid: item.mid,
    };

    switch (key) {
      case "play-next":
        usePlayList.getState().addToNext(musicItem);
        addToast({ title: "已添加到下一首播放", color: "success" });
        break;
      case "add-to-playlist":
        usePlayList.getState().addList([musicItem]);
        addToast({ title: "已添加到播放列表", color: "success" });
        break;
      case "favorite":
        useModalStore.getState().onOpenFavSelectModal({
          rid: item.aid,
          type: 2,
          title: (
            <div>
              收藏
              <span dangerouslySetInnerHTML={{ __html: item.title }} />
            </div>
          ),
        });
        break;
      case "download-audio":
        await window.electron.addMediaDownloadTask({
          outputFileType: "audio",
          title: item.title,
          cover: formatUrlProtocol(item.pic),
          bvid: item.bvid,
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
          cover: formatUrlProtocol(item.pic),
          bvid: item.bvid,
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

  return (
    <>
      <SearchHeader
        order={order}
        onOrderChange={setOrder}
        musicOnly={musicOnly}
        onMusicOnlyChange={setMusicOnly}
        onPlayAll={handlePlayAll}
        playAllDisabled={initialLoading || list.length === 0}
      />
      {initialLoading && (
        <div className="flex min-h-[280px] items-center justify-center">
          <Spinner label="加载中" />
        </div>
      )}
      {!initialLoading && !list?.length && <Empty className="min-h-[280px]" />}
      {!initialLoading && list?.length > 0 && (
        <>
          {displayMode === "card" ? (
            <GridList
              items={list}
              getScrollElement={getScrollElement}
              onMenuAction={handleMenuAction}
              loading={loadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          ) : (
            <List
              items={list}
              getScrollElement={getScrollElement}
              onMenuAction={handleMenuAction}
              loading={loadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          )}
        </>
      )}
    </>
  );
}
