import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";

import { Input, Select, SelectItem, Spinner } from "@heroui/react";
import { RiCloseLine, RiSearchLine } from "@remixicon/react";
import { useInViewport, useMount } from "ahooks";
import moment from "moment";

import { DynamicType } from "@/common/constants/feed";
import Empty from "@/components/empty";
import { getWebDynamicFeedSpace, type WebDynamicItem } from "@/service/web-dynamic";

import DynamicItem from "./item";

interface DynamicListProps {
  mid: number;
  scrollElement: HTMLElement | null;
}

type TimeRange = "all" | "today" | "week" | "month" | "year";

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: "all", label: "全部时间" },
  { value: "today", label: "今天" },
  { value: "week", label: "一周内" },
  { value: "month", label: "一个月内" },
  { value: "year", label: "一年内" },
] as const;

// 获取时间范围的起始时间
const getTimeRangeStart = (timeRange: TimeRange): moment.Moment => {
  const now = moment();
  switch (timeRange) {
    case "today":
      return now.clone().startOf("day");
    case "week":
      return now.clone().subtract(1, "week");
    case "month":
      return now.clone().subtract(1, "month");
    case "year":
      return now.clone().subtract(1, "year");
    default:
      return moment(0);
  }
};

// 检查动态项是否匹配时间范围
const matchesTimeRange = (item: WebDynamicItem, startTime: moment.Moment): boolean => {
  const pubTs = item.modules.module_author?.pub_ts;
  if (!pubTs) return false;
  const pubTime = moment(pubTs * 1000);
  return pubTime.isAfter(startTime) || pubTime.isSame(startTime);
};

// 检查动态项是否匹配搜索关键词
const matchesKeyword = (item: WebDynamicItem, keyword: string): boolean => {
  const archive = item.modules.module_dynamic?.major?.archive || item.modules.module_dynamic?.major?.ugc_season;
  const opus = item.modules.module_dynamic?.major?.opus;
  const textContent = item.modules.module_dynamic?.desc?.text || opus?.summary?.text || "";
  const title = archive?.title || "";
  const searchKeyword = keyword.toLowerCase();
  return title.toLowerCase().includes(searchKeyword) || textContent.toLowerCase().includes(searchKeyword);
};

const DynamicList: React.FC<DynamicListProps> = ({ mid, scrollElement }) => {
  const [items, setItems] = useState<WebDynamicItem[]>([]);
  const [offset, setOffset] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  // Sentinel for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [inViewport] = useInViewport(loadMoreRef, { root: scrollElement });

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

  // 计算时间范围的起始时间（使用 useMemo 优化）
  const timeRangeStart = useMemo(() => getTimeRangeStart(timeRange), [timeRange]);

  // 过滤动态列表
  const filteredItems = useMemo(() => {
    if (!items.length) return [];

    return items.filter(item => {
      // 时间筛选
      if (timeRange !== "all" && !matchesTimeRange(item, timeRangeStart)) {
        return false;
      }

      // 关键词搜索
      if (keyword.trim() && !matchesKeyword(item, keyword.trim())) {
        return false;
      }

      return true;
    });
  }, [items, keyword, timeRange, timeRangeStart]);

  if (!initialized && isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 搜索和时间筛选 */}
      <div className="mb-4 flex flex-col items-start gap-4 md:flex-row md:items-center">
        {/* 搜索框 */}
        <div className="relative flex-shrink-0">
          <Input
            placeholder="搜索动态标题..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            startContent={<RiSearchLine size={16} />}
            endContent={
              keyword && (
                <button
                  onClick={() => setKeyword("")}
                  className="bg-content2 hover:bg-content3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors"
                  type="button"
                  aria-label="清除搜索"
                >
                  <RiCloseLine size={16} />
                </button>
              )
            }
            className="max-w-full"
            style={{ width: "10rem" }}
          />
        </div>

        {/* 时间筛选 */}
        <Select
          selectedKeys={[timeRange]}
          onSelectionChange={keys => {
            const selectedValue = Array.from(keys)[0] as TimeRange;
            setTimeRange(selectedValue || "all");
          }}
          className="w-full"
          style={{ minWidth: "8rem", width: "8rem" }}
          placeholder="选择时间范围"
        >
          {TIME_RANGE_OPTIONS.map(option => (
            <SelectItem key={option.value}>{option.label}</SelectItem>
          ))}
        </Select>
      </div>

      {/* 动态列表 */}
      {initialized && filteredItems.length === 0 ? (
        <Empty className="mt-20" title={keyword.trim() || timeRange !== "all" ? "没有找到匹配的动态" : "暂无动态"} />
      ) : (
        <div className="relative flex flex-col">
          {filteredItems.map(item => (
            <DynamicItem key={item.id_str} item={item} />
          ))}
        </div>
      )}

      {/* Loading indicator / Sentinel */}
      {/* 始终保留 loadMoreRef 以支持无限滚动，即使有筛选条件也需要继续加载数据 */}
      <div ref={loadMoreRef} className="flex w-full justify-center py-6">
        {isLoading && <Spinner size="sm" color="primary" />}
        {!hasMore && items.length > 0 && filteredItems.length > 0 && (
          <div className="text-default-500 text-sm">
            {keyword.trim() || timeRange !== "all" ? "已加载全部数据" : "没有更多了"}
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicList;
