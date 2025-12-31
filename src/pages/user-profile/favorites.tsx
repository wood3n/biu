import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { addToast, Spinner } from "@heroui/react";

import { CollectionType } from "@/common/constants/collection";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { getFavFolderCreatedList, type FavFolderCreatedList } from "@/service/fav-folder-created-list";

import GridCard from "./grid-card";

interface Props {
  getScrollElement: () => HTMLElement | null;
}

/** 收藏夹 */
const Favorites = ({ getScrollElement }: Props) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [list, setList] = useState<FavFolderCreatedList[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (pn: number) => {
      if (!id) return { items: [], total: 0 };
      const res = await getFavFolderCreatedList({
        up_mid: Number(id),
        ps: 20,
        pn,
      });
      const items = res?.data?.list ?? [];
      const total = res?.data?.count ?? 0;
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
          title={item.title}
          cover={item.cover}
          createTime={item.ctime}
          mediaCount={item.media_count}
          onPress={() => navigate(`/collection/${item.id}?type=${CollectionType.Favorite}`)}
        />
      )}
    />
  );
};

export default Favorites;
