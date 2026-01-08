import React, { useCallback, useEffect, useRef, useState } from "react";

import { addToast, Spinner } from "@heroui/react";

import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { getMusicComprehensiveWebRank, type Data as MusicItem } from "@/service/music-comprehensive-web-rank";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import MusicRecommendGridList from "./grid-list";
import MusicRecommendList from "./list";

const PAGE_SIZE = 20;

const MusicRecommend = () => {
  const scrollerRef = useRef<ScrollRefObject>(null);

  const [list, setList] = useState<MusicItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);

  const displayMode = useSettings(state => state.displayMode);

  const fetchPage = async (pn: number = 1) => {
    const res = await getMusicComprehensiveWebRank({ pn, ps: PAGE_SIZE, web_location: "333.1351" });
    const items = res?.data?.list ?? [];
    if (res.code === 0) {
      setList(prev => (pn === 1 ? items : [...prev, ...items]));
      setHasMore(items.length === PAGE_SIZE);
    } else {
      if (pn === 1) {
        setList([]);
      }
      setHasMore(false);
    }
  };

  const loadMore = async () => {
    if (initialLoading || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      pageRef.current += 1;
      await fetchPage(pageRef.current);
    } finally {
      setLoadingMore(false);
    }
  };

  const init = async () => {
    try {
      pageRef.current = 1;
      setList([]);
      setHasMore(true);
      await fetchPage(1);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    // 首次加载
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMenuAction = useCallback(async (key: string, item: MusicItem) => {
    switch (key) {
      case "favorite":
        useModalStore.getState().onOpenFavSelectModal({
          rid: Number(item.aid) || Number(item.id),
          type: 2,
          title: item.music_title,
        });
        break;
      case "play-next":
        usePlayList.getState().addToNext({
          type: "mv",
          title: item.music_title,
          cover: item.cover,
          bvid: item.bvid,
          sid: item.id,
          ownerName: item.author,
        });
        break;
      case "add-to-playlist":
        usePlayList.getState().addList([
          {
            type: "mv",
            title: item.music_title,
            cover: item.cover,
            bvid: item.bvid,
            sid: item.id,
            ownerName: item.author,
          },
        ]);
        break;
      case "download-audio":
        await window.electron.addMediaDownloadTask({
          outputFileType: "audio",
          title: item.music_title,
          cover: item.cover,
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
          title: item.music_title,
          cover: item.cover,
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
    <ScrollContainer enableBackToTop ref={scrollerRef} className="h-full w-full px-4">
      <h1 className="mb-2">推荐音乐</h1>
      <>
        {/* 数据列表 */}
        {initialLoading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Spinner size="lg" label="Loading..." />
          </div>
        ) : displayMode === "card" ? (
          <MusicRecommendGridList
            items={list}
            hasMore={hasMore}
            loading={loadingMore}
            onLoadMore={loadMore}
            getScrollElement={() =>
              (scrollerRef.current?.osInstance()?.elements().viewport as HTMLElement | null) ?? null
            }
            onMenuAction={handleMenuAction}
          />
        ) : (
          <MusicRecommendList
            items={list}
            hasMore={hasMore}
            loading={loadingMore}
            onLoadMore={loadMore}
            getScrollElement={() =>
              (scrollerRef.current?.osInstance()?.elements().viewport as HTMLElement | null) ?? null
            }
            onMenuAction={handleMenuAction}
          />
        )}
      </>
    </ScrollContainer>
  );
};

export default MusicRecommend;
