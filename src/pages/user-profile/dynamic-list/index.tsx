import React, { useRef, useState, useCallback, useEffect } from "react";

import { Spinner } from "@heroui/react";
import { useInViewport, useMount } from "ahooks";

import { DynamicType } from "@/common/constants/feed";
import Empty from "@/components/empty";
import { getWebDynamicFeedSpace, type WebDynamicItem } from "@/service/web-dynamic";

import DynamicItem from "./item";

interface DynamicListProps {
  mid: number;
  getScrollElement: () => HTMLElement | null;
}

const DynamicList: React.FC<DynamicListProps> = ({ mid, getScrollElement }) => {
  const [items, setItems] = useState<WebDynamicItem[]>([]);
  const [offset, setOffset] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Sentinel for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [inViewport] = useInViewport(loadMoreRef, { root: getScrollElement() });

  // Fetch data function
  const fetchData = useCallback(
    async (currentOffset: string = "") => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        const res = await getWebDynamicFeedSpace({
          host_mid: mid,
          offset: currentOffset,
          type: "video",
          platform: "web",
        });

        if (res.code === 0) {
          const videos = res.data.items.filter(item => item.type === DynamicType.Av);
          setItems(prev => (currentOffset === "" ? videos : [...prev, ...videos]));
          setOffset(res.data.offset);
          setHasMore(res.data.has_more);
        }
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
        setInitialized(true);
      }
    },
    [mid],
  );

  // Initial load
  useMount(() => {
    fetchData("");
  });

  // Load more when sentinel is in viewport
  useEffect(() => {
    if (inViewport && hasMore && !isLoading && initialized) {
      fetchData(offset);
    }
  }, [inViewport, hasMore, isLoading, fetchData, offset, initialized]);

  if (!initialized && isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (initialized && items.length === 0) {
    return <Empty title="暂无动态" />;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col">
        {items.map((item, index) => (
          <DynamicItem key={`${item.id_str}-${index}`} item={item} />
        ))}
      </div>

      <div ref={loadMoreRef} className="flex w-full justify-center py-4">
        {isLoading && (
          <div className="text-default-500 flex items-center gap-2">
            <Spinner size="sm" />
            <span>Loading...</span>
          </div>
        )}
        {!hasMore && items.length > 0 && <div className="text-default-500 text-sm">没有更多了</div>}
      </div>
    </div>
  );
};

export default DynamicList;
