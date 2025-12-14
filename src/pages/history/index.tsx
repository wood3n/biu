import { useEffect, useState } from "react";

import { addToast, Button, Link } from "@heroui/react";
import { RiRefreshLine } from "@remixicon/react";
import moment from "moment";

import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import ScrollContainer from "@/components/scroll-container";
import {
  getWebInterfaceHistoryCursor,
  type HistoryBusinessType,
  type HistoryListItem,
} from "@/service/web-interface-history-cursor";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

const HISTORY_PAGE_SIZE = 30;

const History = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [list, setList] = useState<HistoryListItem[]>([]);
  const [cursor, setCursor] = useState<{ max: number; business: HistoryBusinessType | ""; view_at: number } | null>(
    null,
  );
  const [hasMore, setHasMore] = useState(true);
  const play = usePlayList(s => s.play);
  const displayMode = useSettings(state => state.displayMode);

  const fetchHistory = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const res = await getWebInterfaceHistoryCursor({
        type: "archive",
        ps: HISTORY_PAGE_SIZE,
        max: cursor ? cursor.max : 0,
        business: cursor?.business || undefined,
        view_at: cursor ? cursor.view_at : 0,
      });

      if (res.code !== 0) {
        if (res.code === -101) {
          throw new Error("请先登录");
        }
        throw new Error(res.message || "获取历史记录失败");
      }

      const newList = res.data?.list || [];
      if (isLoadMore) {
        setList(prev => [...prev, ...newList]);
      } else {
        setList(newList);
      }

      if (newList.length > 0 && res.data.cursor) {
        setCursor({
          max: res.data.cursor.max,
          business: res.data.cursor.business || "",
          view_at: res.data.cursor.view_at,
        });
      }
      setHasMore(!!(newList.length > 0 && res.data.cursor));
    } catch (error: any) {
      addToast({
        title: error?.message || "获取历史记录失败",
        color: "danger",
      });
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleLoadMore = () => {
    fetchHistory(true);
  };

  const handleRefresh = () => {
    setList([]);
    setCursor(null);
    setHasMore(true);
    fetchHistory(false);
  };

  useEffect(() => {
    fetchHistory(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlay = (item: HistoryListItem) => {
    if (item.history.bvid) {
      play({
        type: "mv",
        bvid: item.history.bvid,
        title: item.title,
        cover: item.cover,
        ownerName: item.author_name,
        ownerMid: item.author_mid,
      });
    } else {
      addToast({
        title: "无法播放此类型内容",
        color: "warning",
      });
    }
  };

  // 提取MediaItem公共渲染函数，避免重复代码
  const renderMediaItem = (item: HistoryListItem) => {
    const commonProps = {
      key: `${item.history.oid}-${item.view_at}`,
      displayMode,
      type: "mv" as const, // 音频播放不会出现在历史记录中
      bvid: item.history.bvid || "",
      aid: String(item.history.oid),
      title: item.title,
      cover: item.cover,
      ownerName: item.author_name,
      ownerMid: item.author_mid,
      onPress: () => handlePlay(item),
    };

    // 卡片模式下添加额外属性
    if (displayMode === "card") {
      return (
        <MediaItem
          {...commonProps}
          coverHeight={200}
          footer={
            <div className="flex w-full flex-col space-y-1 text-sm">
              <div className="text-foreground-500 flex w-full items-center justify-between text-sm">
                {item.author_mid ? (
                  <Link href={`/user/${item.author_mid}`} className="text-foreground-500 text-sm hover:underline">
                    {item.author_name}
                  </Link>
                ) : (
                  <span>{item.author_name}</span>
                )}
                {item.duration && <span>{formatDuration(item.duration)}</span>}
              </div>
              <div className="text-foreground-400 flex w-full items-center justify-between text-xs">
                <span>{moment.unix(item.view_at).format("YYYY-MM-DD HH:mm")}</span>
                {item.progress !== undefined && item.duration && (
                  <span>
                    观看进度: {formatDuration(item.progress)} / {formatDuration(item.duration)}
                  </span>
                )}
              </div>
            </div>
          }
        />
      );
    }

    // 列表模式下直接返回
    return <MediaItem {...commonProps} />;
  };

  return (
    <>
      <ScrollContainer className="h-full w-full p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1>历史记录</h1>
          <Button isIconOnly variant="light" size="sm" onPress={handleRefresh}>
            <RiRefreshLine size={18} />
          </Button>
        </div>
        {displayMode === "card" ? (
          <GridList
            loading={loading}
            data={list}
            itemKey={item => `${item.history.oid}-${item.view_at}`}
            renderItem={renderMediaItem}
          />
        ) : (
          <div className="space-y-2">{list.map(renderMediaItem)}</div>
        )}
        {hasMore && (
          <div className="flex w-full items-center justify-center py-6">
            <Button
              variant="flat"
              color="primary"
              isLoading={loadingMore}
              onPress={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? "加载中..." : "加载更多"}
            </Button>
          </div>
        )}
      </ScrollContainer>
    </>
  );
};

export default History;
