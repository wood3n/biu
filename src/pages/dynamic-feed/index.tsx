import React, { useEffect, useRef, useState, useCallback } from "react";

import { Spinner, Button } from "@heroui/react";
import { useVirtualizer } from "@tanstack/react-virtual";

import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { getWebDynamicFeedAll, getWebDynamicFeedSpace, type WebDynamicItem } from "@/service/web-dynamic";

import AuthorList from "./author-list";
import DynamicItem from "./item";

const DynamicFeedPage = () => {
  const [items, setItems] = useState<WebDynamicItem[]>([]);
  const [offset, setOffset] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAuthorMid, setSelectedAuthorMid] = useState<number | null>(null);

  const scrollRef = useRef<ScrollRefObject>(null);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);

  const fetchData = useCallback(async (currentOffset: string = "", hostMid: number | null = null) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const res = hostMid
        ? await getWebDynamicFeedSpace({
            host_mid: hostMid,
            offset: currentOffset,
            type: "video",
            platform: "web",
          })
        : await getWebDynamicFeedAll({
            type: "video",
            offset: currentOffset,
            platform: "web",
          });

      if (res.code === 0) {
        setItems(prev => (currentOffset === "" ? res.data.items : [...prev, ...res.data.items]));
        setOffset(res.data.offset);
        setHasMore(res.data.has_more);
      } else {
        setError(res.message || "无法加载动态");
      }
    } catch {
      setError("无法获取动态数据");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData("");
  }, [fetchData]);

  useEffect(() => {
    const initScrollElement = () => {
      if (scrollRef.current) {
        const instance = scrollRef.current.osInstance();
        if (instance) {
          setScrollElement(instance.elements().viewport);
        }
      }
    };
    initScrollElement();
    const timer = setTimeout(initScrollElement, 100);
    return () => clearTimeout(timer);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 280,
    overscan: 5,
  });

  const handleScroll = useCallback(() => {
    if (!scrollElement || isLoading || !hasMore || error) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      fetchData(offset, selectedAuthorMid);
    }
  }, [scrollElement, isLoading, hasMore, offset, error, fetchData, selectedAuthorMid]);

  const handleSelectAuthor = useCallback(
    (mid: number | null) => {
      const nextMid = mid === null ? null : selectedAuthorMid === mid ? null : mid;
      setSelectedAuthorMid(nextMid);
      setOffset("");
      setHasMore(true);
      setItems([]);
      fetchData("", nextMid);
    },
    [fetchData, selectedAuthorMid],
  );

  useEffect(() => {
    if (!scrollRef.current) return;
    const instance = scrollRef.current.osInstance();
    if (!instance) return;
    const viewport = instance.elements().viewport;
    viewport.addEventListener("scroll", handleScroll);
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="flex h-full w-full">
      <AuthorList selectedAuthorMid={selectedAuthorMid} onSelect={handleSelectAuthor} />

      <div className="flex min-w-0 flex-1">
        <ScrollContainer ref={scrollRef} className="h-full w-full px-4">
          <div
            className="relative w-full px-4 py-4"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualItem => {
              const item = items[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={rowVirtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <DynamicItem item={item} className={virtualItem.index === 0 ? "pt-0" : ""} />
                </div>
              );
            })}
          </div>

          <div className="flex w-full justify-center py-4">
            {isLoading && (
              <div className="text-default-500 flex items-center gap-2">
                <Spinner size="sm" />
                <span>Loading...</span>
              </div>
            )}
            {!isLoading && error && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-danger">{error}</p>
                <Button size="sm" onPress={() => fetchData(offset, selectedAuthorMid)}>
                  Retry
                </Button>
              </div>
            )}
            {!isLoading && !hasMore && items.length > 0 && <p className="text-default-400 text-sm">No more dynamics</p>}
            {!isLoading && !hasMore && items.length === 0 && !error && (
              <p className="text-default-400 text-sm">Empty</p>
            )}
          </div>
        </ScrollContainer>
      </div>
    </div>
  );
};

export default DynamicFeedPage;
