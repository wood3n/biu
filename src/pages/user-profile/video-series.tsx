import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { addToast, Spinner } from "@heroui/react";

import { CollectionType } from "@/common/constants/collection";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { getSpaceSeasonsSeriesList } from "@/service/space-seasons-series-list";

import GridCard from "./grid-card";

interface VideoSeriesItem {
  id: number;
  title: string;
  cover: string;
  ctime: number;
  total: number;
}

interface Props {
  getScrollElement: () => HTMLElement | null;
}

/** 个人空间视频合集 */
const VideoSeries = ({ getScrollElement }: Props) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [list, setList] = useState<VideoSeriesItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (pn: number) => {
      if (!id) return { items: [], total: 0 };
      const res = await getSpaceSeasonsSeriesList({
        mid: Number(id),
        page_size: 20,
        page_num: pn,
        web_location: "0.0",
      });

      const seasonsList =
        res?.data?.items_lists?.seasons_list?.map(item => ({
          id: item.meta.season_id,
          title: item.meta.name,
          cover: item.meta.cover,
          ctime: item.meta.ptime,
          total: item.meta.total,
        })) ?? [];
      const seriesList =
        res?.data?.items_lists?.series_list?.map(item => ({
          id: item.meta.series_id,
          title: item.meta.name,
          cover: item.meta.cover,
          total: item.meta.total,
          ctime: item.meta.ctime,
        })) ?? [];

      const items: VideoSeriesItem[] = [...seasonsList, ...seriesList];
      const total = res?.data?.items_lists?.page?.total ?? 0;

      return { items, total };
    },
    [id],
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
    if (!id) return;
    try {
      setInitialLoading(true);
      setPage(1);
      const { items, total } = await fetchPage(1);
      setList(items);
      setHasMore(items.length < total);
    } catch {
      addToast({ title: "加载失败", color: "danger" });
    } finally {
      setInitialLoading(false);
    }
  }, [fetchPage, id]);

  useEffect(() => {
    retryInitial();
  }, [retryInitial]);

  if (initialLoading) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <Spinner label="加载中" />
      </div>
    );
  }

  return (
    <VirtualGridPageList
      items={list}
      loading={loadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
      getScrollElement={getScrollElement}
      itemKey="id"
      renderItem={item => (
        <GridCard
          title={item?.title}
          cover={item?.cover}
          createTime={item.ctime}
          mediaCount={item.total}
          onPress={() => navigate(`/collection/${item.id}?type=${CollectionType.VideoSeries}`)}
        />
      )}
    />
  );
};

export default VideoSeries;
