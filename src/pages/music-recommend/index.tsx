import React, { useCallback, useEffect, useRef, useState } from "react";

import { addToast, Spinner, Tab, Tabs } from "@heroui/react";
import { RiMusicAiLine, RiPlayFill } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { getMusicComprehensiveWebRank, type Data as MusicItem } from "@/service/music-comprehensive-web-rank";
import { getRegionFeedRcmd, type Archive } from "@/service/web-interface-region-feed-rcmd";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import type { RecommendItem } from "./types";

import MusicRecommendGridList from "./grid-list";
import MusicRecommendList from "./list";
import NewMusicTop from "./new-music-top";

const PAGE_SIZE = 20;
const REGION_PAGE_SIZE = 15;
const REGION_WEB_LOCATION = "333.40138";

type RecommendTabKey = "music" | "guichu" | "pop";

const REGION_MAP: Record<Exclude<RecommendTabKey, "pop">, number> = {
  music: 1003,
  guichu: 1007,
};

const normalizeRankItem = (item: MusicItem): RecommendItem => {
  const archive = item.related_archive;
  return {
    id: item.id,
    aid: Number(item.aid) || undefined,
    bvid: archive?.bvid || item.bvid,
    title: archive?.title || item.music_title,
    cover: archive?.cover || item.cover,
    author: archive?.username || item.author,
    authorMid: archive?.uid,
    playCount: archive?.vv_count,
    duration: archive?.duration,
  };
};

const normalizeRegionItem = (item: Archive, fallbackId: string | number): RecommendItem => {
  return {
    id: item.aid ?? item.bvid ?? item.trackid ?? fallbackId,
    aid: item.aid,
    bvid: item.bvid,
    title: item.title || "",
    cover: item.cover,
    author: item.author?.name,
    authorMid: item.author?.mid,
    playCount: item.stat?.view,
    duration: item.duration,
  };
};

const MusicRecommend = () => {
  const scrollerRef = useRef<ScrollRefObject>(null);

  const [list, setList] = useState<RecommendItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const [activeTab, setActiveTab] = useState<RecommendTabKey>("music");
  const scrollRestoreRef = useRef<{ tab: RecommendTabKey; top: number } | null>(null);

  const displayMode = useSettings(state => state.displayMode);

  const getScrollElement = useCallback(() => {
    return (scrollerRef.current?.osInstance()?.elements().viewport as HTMLElement | null) ?? null;
  }, []);

  const fetchPage = useCallback(
    async (pn: number = 1) => {
      if (activeTab === "pop") {
        const res = await getMusicComprehensiveWebRank({ pn, ps: PAGE_SIZE, web_location: "333.1351" });
        const items = res?.data?.list ?? [];
        if (res.code === 0) {
          const normalized = items.map(normalizeRankItem);
          setList(prev => (pn === 1 ? normalized : [...prev, ...normalized]));
          setHasMore(items.length === PAGE_SIZE);
        } else {
          if (pn === 1) {
            setList([]);
          }
          setHasMore(false);
        }
        return;
      }

      const res = await getRegionFeedRcmd({
        display_id: pn,
        request_cnt: REGION_PAGE_SIZE,
        from_region: REGION_MAP[activeTab],
        device: "web",
        plat: 30,
        web_location: REGION_WEB_LOCATION,
      });
      const items = res?.data?.archives ?? [];
      if (res.code === 0) {
        const normalized = items.map((item, index) => normalizeRegionItem(item, `${pn}-${index}`));
        setList(prev => (pn === 1 ? normalized : [...prev, ...normalized]));
        setHasMore(items.length === REGION_PAGE_SIZE);
      } else {
        if (pn === 1) {
          setList([]);
        }
        setHasMore(false);
      }
    },
    [activeTab],
  );

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

  const init = useCallback(async () => {
    try {
      pageRef.current = 1;
      setList([]);
      setHasMore(true);
      setLoadingMore(false);
      await fetchPage(1);
    } finally {
      setInitialLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    setInitialLoading(true);
    init();
  }, [activeTab, init]);

  useEffect(() => {
    if (initialLoading) return;
    const restore = scrollRestoreRef.current;
    if (!restore || restore.tab !== activeTab) return;
    const viewport = getScrollElement();
    if (!viewport) return;
    const top = restore.top;
    requestAnimationFrame(() => {
      viewport.scrollTop = top;
      scrollRestoreRef.current = null;
    });
  }, [activeTab, getScrollElement, initialLoading, list.length]);

  const handlePlayAll = useCallback(async () => {
    const items = list
      .map(item => {
        return {
          type: "mv" as const,
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
          ownerName: item.author,
          ownerMid: item.authorMid,
        };
      })
      .filter(item => Boolean(item.bvid));

    if (!items.length) {
      addToast({ title: "暂无可播放内容", color: "warning" });
      return;
    }

    await usePlayList.getState().addList(items);
    addToast({ title: `已添加 ${items.length} 首到播放列表`, color: "success" });
  }, [list]);

  const handleMenuAction = useCallback(async (key: string, item: RecommendItem) => {
    if (!item.bvid && key !== "favorite") {
      addToast({ title: "暂无可播放内容", color: "warning" });
      return;
    }
    switch (key) {
      case "favorite":
        useModalStore.getState().onOpenFavSelectModal({
          rid: Number(item.aid) || Number(item.id),
          type: 2,
          title: item.title,
        });
        break;
      case "play-next":
        usePlayList.getState().addToNext({
          type: "mv",
          title: item.title,
          cover: item.cover,
          bvid: item.bvid,
          sid: Number(item.id) || undefined,
          ownerName: item.author,
        });
        break;
      case "add-to-playlist":
        usePlayList.getState().addList([
          {
            type: "mv",
            title: item.title,
            cover: item.cover,
            bvid: item.bvid,
            sid: Number(item.id) || undefined,
            ownerName: item.author,
          },
        ]);
        break;
      case "download-audio":
        await window.electron.addMediaDownloadTask({
          outputFileType: "audio",
          title: item.title,
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
          title: item.title,
          cover: item.cover,
          bvid: item.bvid,
        });
        addToast({
          title: "已添加下载任务",
          color: "success",
        });
        break;
      case "bililink":
        if (item.bvid) {
          window.electron.openExternal(`https://www.bilibili.com/video/${item.bvid}`);
        }
        break;
      default:
        break;
    }
  }, []);

  return (
    <ScrollContainer enableBackToTop ref={scrollerRef} className="h-full w-full px-4">
      <NewMusicTop />
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RiMusicAiLine className="text-primary" />
          <h1>分区</h1>
          <Tabs
            variant="light"
            size="lg"
            radius="md"
            classNames={{
              cursor: "rounded-medium",
            }}
            selectedKey={activeTab}
            onSelectionChange={key => {
              const nextTab = key as RecommendTabKey;
              const viewport = getScrollElement();
              if (viewport) {
                scrollRestoreRef.current = { tab: nextTab, top: viewport.scrollTop };
              }
              setActiveTab(nextTab);
            }}
          >
            <Tab key="music" title="音乐" />
            <Tab key="guichu" title="鬼畜" />
            <Tab key="pop" title="流行" />
          </Tabs>
        </div>
        <AsyncButton
          color="primary"
          size="md"
          startContent={<RiPlayFill size={18} />}
          isDisabled={initialLoading || list.length === 0}
          onPress={handlePlayAll}
          className="dark:text-black"
        >
          全部播放
        </AsyncButton>
      </div>
      <div className="relative">
        {displayMode === "card" ? (
          <MusicRecommendGridList
            items={list}
            hasMore={hasMore}
            loading={loadingMore}
            onLoadMore={loadMore}
            getScrollElement={getScrollElement}
            onMenuAction={handleMenuAction}
          />
        ) : (
          <MusicRecommendList
            items={list}
            hasMore={hasMore}
            loading={loadingMore}
            onLoadMore={loadMore}
            getScrollElement={getScrollElement}
            onMenuAction={handleMenuAction}
          />
        )}
        {initialLoading && (
          <div className="flex h-[40vh] items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
      </div>
    </ScrollContainer>
  );
};

export default MusicRecommend;
