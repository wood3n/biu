import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

import { addToast, Spinner } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import SearchWithSort from "@/components/search-with-sort";
import { getSpaceWbiArcSearch, type SpaceArcVListItem } from "@/service/space-wbi-arc-search";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import PostGridList from "./grid-list";
import PostList from "./list";

interface VideoPostProps {
  getScrollElement: () => HTMLElement | null;
}

const VideoPost: React.FC<VideoPostProps> = ({ getScrollElement }) => {
  const { id } = useParams();
  const displayMode = useSettings(state => state.displayMode);

  const [keyword, setKeyword] = useState("");
  const [order, setOrder] = useState("pubdate");

  const [items, setItems] = useState<SpaceArcVListItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  const pageRef = useRef(1);

  const fetchData = useCallback(
    async (pn: number = 1) => {
      if (!id) return;

      const res = await getSpaceWbiArcSearch({
        mid: Number(id),
        ps: 30,
        pn,
        keyword: keyword?.trim() || undefined,
        order,
      });

      if (res.code === 0 && res.data?.list?.vlist) {
        const newItems = res.data.list.vlist;
        const totalCount = res.data.page?.count ?? 0;

        setTotal(totalCount);
        setItems(prev => {
          // 第一页重置，其他页追加
          const merged = pn === 1 ? newItems : [...prev, ...newItems];
          // 根据后端返回的总数与当前已加载数量判断是否还有更多
          setHasMore(merged.length < totalCount);
          return merged;
        });
      } else {
        setHasMore(false);
      }
    },
    [id, keyword, order],
  );

  // 当用户ID变化时，重置搜索条件
  useEffect(() => {
    if (id) {
      setKeyword("");
      setOrder("pubdate");
    }
  }, [id]);

  // Initial load or when filter changes
  useEffect(() => {
    if (!id) return;
    setItems([]);
    pageRef.current = 1;
    setHasMore(true);
    setTotal(0);
    setInitialLoading(true);
    fetchData(1).finally(() => {
      setInitialLoading(false);
    });
  }, [fetchData, id]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      pageRef.current += 1;
      setLoadingMore(true);
      fetchData(pageRef.current).finally(() => {
        setLoadingMore(false);
      });
    }
  }, [loadingMore, hasMore, fetchData]);

  const handleMenuAction = useCallback((key: string, item: SpaceArcVListItem) => {
    switch (key) {
      case "play-next":
        usePlayList.getState().addToNext({
          type: "mv",
          title: item.title,
          cover: item.pic,
          bvid: item.bvid,
          ownerName: item.author,
          ownerMid: item.mid,
        });
        break;
      case "add-to-playlist":
        usePlayList.getState().addList([
          {
            type: "mv",
            title: item.title,
            cover: item.pic,
            bvid: item.bvid,
            ownerName: item.author,
            ownerMid: item.mid,
          },
        ]);
        break;
      case "download-audio":
        window.electron?.addMediaDownloadTask({
          outputFileType: "audio",
          title: item.title,
          cover: item.pic,
          bvid: item.bvid,
        });
        addToast({
          title: "已添加下载任务",
          color: "success",
        });
        break;
      case "download-video":
        window.electron?.addMediaDownloadTask({
          outputFileType: "video",
          title: item.title,
          cover: item.pic,
          bvid: item.bvid,
        });
        addToast({
          title: "已添加下载任务",
          color: "success",
        });
        break;
      case "favorite":
        useModalStore.getState().onOpenFavSelectModal({
          rid: item.aid,
          type: 2,
          title: item.title,
        });
        break;
    }
  }, []);

  const handlePlayAll = useCallback(async () => {
    const playItems = items
      .map(item => ({
        type: "mv" as const,
        bvid: item.bvid,
        title: item.title,
        cover: item.pic,
        ownerName: item.author,
        ownerMid: item.mid,
      }))
      .filter(item => Boolean(item.bvid));

    if (!playItems.length) {
      addToast({ title: "暂无可播放内容", color: "warning" });
      return;
    }

    await usePlayList.getState().addList(playItems);
    addToast({ title: `已添加 ${playItems.length} 个投稿到播放列表`, color: "success" });
  }, [items]);

  return (
    <div className="h-full w-full">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="text-default-500 pl-2 text-sm">共 {total} 个视频</div>
        <div className="flex items-center gap-3">
          <AsyncButton
            color="primary"
            size="sm"
            startContent={<RiPlayFill size={18} />}
            isDisabled={initialLoading || items.length === 0}
            onPress={handlePlayAll}
            className="dark:text-black"
          >
            全部播放
          </AsyncButton>
          <SearchWithSort
            onKeywordSearch={setKeyword}
            order={order}
            orderOptions={[
              { key: "pubdate", label: "最新发布" },
              { key: "click", label: "最多播放" },
              { key: "stow", label: "最多收藏" },
            ]}
            onOrderChange={setOrder}
          />
        </div>
      </div>
      {initialLoading ? (
        <div className="flex h-[280px] items-center justify-center">
          <Spinner label="加载中" />
        </div>
      ) : displayMode === "card" ? (
        <PostGridList
          items={items}
          hasMore={hasMore}
          loading={loadingMore}
          getScrollElement={getScrollElement}
          onLoadMore={handleLoadMore}
          onMenuAction={handleMenuAction}
        />
      ) : (
        <PostList
          items={items}
          hasMore={hasMore}
          loading={loadingMore}
          getScrollElement={getScrollElement}
          onLoadMore={handleLoadMore}
          onMenuAction={handleMenuAction}
        />
      )}
    </div>
  );
};

export default VideoPost;
