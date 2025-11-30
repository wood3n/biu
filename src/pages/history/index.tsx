import { useEffect, useState } from "react";

import { addToast, Button, Link, Pagination } from "@heroui/react";
import { RiRefreshLine } from "@remixicon/react";
import { usePagination } from "ahooks";
import moment from "moment";

import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import MVCard from "@/components/mv-card";
import ScrollContainer from "@/components/scroll-container";
import {
  getWebInterfaceHistoryCursor,
  type HistoryBusinessType,
  type HistoryListItem,
} from "@/service/web-interface-history-cursor";
import { usePlayQueue } from "@/store/play-queue";

const HISTORY_PAGE_SIZE = 30;

const History = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [allList, setAllList] = useState<HistoryListItem[]>([]);
  const playMV = usePlayQueue(s => s.play);

  const {
    data,
    pagination,
    runAsync: getPageData,
  } = usePagination(
    async ({ current, pageSize }) => {
      // 从已加载的所有数据中分页返回
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      return {
        total: allList.length,
        list: allList.slice(start, end),
      };
    },
    {
      ready: allList.length > 0,
      defaultPageSize: HISTORY_PAGE_SIZE,
    },
  );

  const fetchAllHistory = async () => {
    try {
      setInitialLoading(true);
      const allHistoryList: HistoryListItem[] = [];
      let cursor: { max: number; business: string; view_at: number } | null = null;
      let hasMore = true;

      while (hasMore) {
        const res = await getWebInterfaceHistoryCursor({
          type: "archive",
          ps: HISTORY_PAGE_SIZE,
          max: cursor ? cursor.max : 0,
          business: cursor?.business ? (cursor.business as HistoryBusinessType) : undefined,
          view_at: cursor ? cursor.view_at : 0,
        });

        if (res.code !== 0) {
          if (res.code === -101) {
            throw new Error("请先登录");
          }
          throw new Error(res.message || "获取历史记录失败");
        }

        const newList = res.data?.list || [];
        allHistoryList.push(...newList);

        if (newList.length > 0 && res.data.cursor) {
          cursor = {
            max: res.data.cursor.max,
            business: res.data.cursor.business || "",
            view_at: res.data.cursor.view_at,
          };
          hasMore = true;
        } else {
          hasMore = false;
        }
      }

      setAllList(allHistoryList);
    } catch (error: any) {
      addToast({
        title: error?.message || "获取历史记录失败",
        color: "danger",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAllHistory();
  }, []);

  const handlePlay = (item: HistoryListItem) => {
    if (item.history.bvid) {
      playMV(item.history.bvid);
    } else {
      addToast({
        title: "无法播放此类型内容",
        color: "warning",
      });
    }
  };

  return (
    <>
      <ScrollContainer className="h-full w-full p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1>历史记录</h1>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => {
              setAllList([]);
              fetchAllHistory();
            }}
          >
            <RiRefreshLine size={18} />
          </Button>
        </div>
        <GridList
          loading={initialLoading}
          data={data?.list}
          itemKey={item => `${item.history.oid}-${item.view_at}`}
          renderItem={item => (
            <MVCard
              bvid={item.history.bvid || ""}
              aid={String(item.history.oid)}
              title={item.title}
              cover={item.cover}
              coverHeight={200}
              footer={
                <div className="flex w-full flex-col space-y-1 text-sm">
                  <div className="text-foreground-500 flex items-center justify-between">
                    {item.author_mid ? (
                      <Link href={`/user/${item.author_mid}`} className="text-foreground-500 text-sm hover:underline">
                        {item.author_name}
                      </Link>
                    ) : (
                      <span>{item.author_name}</span>
                    )}
                    {item.duration && <span>{formatDuration(item.duration)}</span>}
                  </div>
                  <div className="text-foreground-400 flex items-center justify-between text-xs">
                    <span>{moment.unix(item.view_at).format("YYYY-MM-DD HH:mm")}</span>
                    {item.progress !== undefined && item.duration && (
                      <span>
                        观看进度: {formatDuration(item.progress)} / {formatDuration(item.duration)}
                      </span>
                    )}
                  </div>
                </div>
              }
              onPress={() => handlePlay(item)}
            />
          )}
        />
        {pagination.totalPage > 1 && (
          <div className="flex w-full items-center justify-center py-6">
            <Pagination
              initialPage={1}
              total={pagination.totalPage}
              page={pagination.current}
              onChange={next => getPageData({ current: next, pageSize: HISTORY_PAGE_SIZE })}
            />
          </div>
        )}
      </ScrollContainer>
    </>
  );
};

export default History;
