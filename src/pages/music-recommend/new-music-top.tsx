import React, { useEffect, useMemo, useRef, useState } from "react";

import { Card, Spinner, addToast } from "@heroui/react";
import { RiArrowLeftSLine, RiArrowRightSLine, RiMusic2Line, RiPlayFill } from "@remixicon/react";
import log from "electron-log/renderer";

import { formatNumber } from "@/common/utils/number";
import IconButton from "@/components/icon-button";
import Image from "@/components/image";
import { getNewMusic } from "@/service/web-interface-new-music";
import { getNewMusicBanner } from "@/service/web-interface-new-music-banner";
import { usePlayList } from "@/store/play-list";

type UnifiedItem = {
  key: string;
  title: string;
  cover?: string;
  bvid?: string;
  jump_url?: string;
  total_vv?: number;
  wish_count?: number;
  author?: string;
  date?: string;
};

const NewMusicTop = () => {
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [newLoading, setNewLoading] = useState(true);
  const [newPage, setNewPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const [colCount, setColCount] = useState(2);

  const handlePlay = React.useCallback((item: UnifiedItem) => {
    usePlayList
      .getState()
      .play({
        type: "mv",
        bvid: item.bvid,
        title: item.title,
        cover: item.cover,
        ownerName: item.author,
      })
      .catch(error => {
        log.error("[new-music-top] play error", error);
        addToast({ title: "播放失败", color: "danger" });
      });
  }, []);

  const fetchNewMusic = async () => {
    try {
      setNewLoading(true);
      const [bannerRes, listRes] = await Promise.all([getNewMusicBanner(), getNewMusic()]);
      const bannerList = bannerRes?.data?.list ?? [];
      const musicList = listRes?.data?.list ?? [];

      const normalizedBanner: UnifiedItem[] = bannerList.map(b => ({
        key: b.bvid || b.music_id || b.jump_url || (b.cover ? `cover:${b.cover}` : `banner:${Math.random()}`),
        title: b.archive_title || "",
        cover: b.cover,
        bvid: b.bvid,
        jump_url: b.jump_url,
        author: b.author,
        date: b.publish_time ? String(b.publish_time).slice(0, 10) : undefined,
      }));

      const normalizedMusic: UnifiedItem[] = musicList.map(m => ({
        key:
          m.bvid ||
          (typeof m.id === "number" ? String(m.id) : "") ||
          m.music_id ||
          m.jump_url ||
          (m.cover ? `cover:${m.cover}` : `music:${Math.random()}`),
        title: m.music_title || "",
        cover: m.cover,
        bvid: m.bvid,
        jump_url: m.jump_url,
        total_vv: m.total_vv,
        wish_count: m.wish_count,
        author: m.author,
        date: m.publish_time || undefined,
      }));

      const seen = new Set<string>();
      const merged: UnifiedItem[] = [];
      [...normalizedBanner, ...normalizedMusic].forEach(it => {
        const k = it.key || Math.random().toString();
        if (!seen.has(k)) {
          seen.add(k);
          merged.push(it);
        }
      });

      setItems(merged);
      setNewPage(1);
    } catch (error) {
      log.error("[new-music-top] fetchNewMusic error", error);
    } finally {
      setNewLoading(false);
    }
  };

  useEffect(() => {
    fetchNewMusic();
  }, []);

  useEffect(() => {
    const computeColsByBreakpoint = () => {
      const w = window.innerWidth;
      if (w >= 1280) return 6;
      if (w >= 1024) return 5;
      if (w >= 768) return 4;
      if (w >= 640) return 3;
      return 2;
    };
    const update = () => {
      try {
        setColCount(computeColsByBreakpoint());
      } catch (err) {
        log.error("[new-music-top] compute cols error", err);
        setColCount(2);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);

  const pageSize = useMemo(() => Math.max(1, colCount) * 2, [colCount]);
  const totalPages = useMemo(() => (items.length > 0 ? Math.ceil(items.length / pageSize) : 0), [items, pageSize]);

  useEffect(() => {
    if (totalPages > 0 && newPage > totalPages) {
      setNewPage(totalPages);
    }
    // eslint-disable-next-line
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (newPage - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, newPage, pageSize]);

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RiMusic2Line className="text-primary" />
          <h1>新歌速递</h1>
        </div>
        {newLoading ? null : (
          <div className="flex items-center gap-2">
            <IconButton
              isDisabled={newPage <= 1 || totalPages === 0}
              onPress={() => setNewPage(p => Math.max(1, p - 1))}
              variant="flat"
              className="bg-foreground/10 hover:bg-foreground/20 shadow-none"
            >
              <RiArrowLeftSLine size={16} />
            </IconButton>
            <span className="text-foreground text-sm">{`${newPage} / ${totalPages}`}</span>
            <IconButton
              isDisabled={newPage >= totalPages || totalPages === 0}
              onPress={() => setNewPage(p => Math.min(totalPages, p + 1))}
              variant="flat"
              className="bg-foreground/10 hover:bg-foreground/20 shadow-none"
            >
              <RiArrowRightSLine size={16} />
            </IconButton>
          </div>
        )}
      </div>
      {newLoading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Spinner size="lg" label="Loading..." />
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          {pageItems.length === 0 ? (
            <Card className="rounded-medium col-span-full flex h-[200px] items-center justify-center">
              <span className="text-foreground-500">暂无数据</span>
            </Card>
          ) : (
            pageItems.map(item => {
              return (
                <div
                  key={item.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePlay(item)}
                  className="group w-full cursor-pointer select-none"
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      radius="md"
                      src={item.cover || ""}
                      width="100%"
                      height="100%"
                      params="672w_378h_1c.avif"
                      emptyPlaceholder={<RiMusic2Line />}
                      removeWrapper
                      className="rounded-medium shadow-md"
                    />
                    {typeof item.total_vv === "number" && (
                      <div className="absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
                        <div className="line-clamp-1 text-xs">{`${formatNumber(item.total_vv ?? 0)}播放`}</div>
                      </div>
                    )}
                    <div className="pointer-events-none absolute right-2 bottom-8 z-40 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
                      <div className="bg-primary rounded-full shadow-2xl">
                        <div className="flex h-10 w-10 items-center justify-center">
                          <RiPlayFill className="text-black" size={26} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-left">
                    <div className="group-hover:text-primary line-clamp-1 text-base font-medium transition-colors">
                      {item.title}
                    </div>
                    {(item.author || item.date) && (
                      <div className="text-foreground-500 group-hover:text-primary mt-1 text-xs transition-colors">
                        {`${item.author ?? ""}${item.author && item.date ? " · " : ""}${item.date ?? ""}`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default NewMusicTop;
