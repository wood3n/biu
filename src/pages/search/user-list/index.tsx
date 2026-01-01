import React, { useCallback, useEffect, useState } from "react";

import { Spinner, addToast } from "@heroui/react";

import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { getRelationRelations } from "@/service/relation-relations";
import { getWebInterfaceWbiSearchType, type SearchUserItem } from "@/service/web-interface-search-type";

import SearchHeader from "./search-header";
import UserCard from "./user-card";
import { getSortParams, type SearchUserItemWithRelation, type UserSortKey } from "./utils";

interface UserListProps {
  keyword: string;
  getScrollElement: () => HTMLElement | null;
}

export default function UserList({ keyword, getScrollElement }: UserListProps) {
  const [list, setList] = useState<SearchUserItemWithRelation[]>([]);
  const [sortKey, setSortKey] = useState<UserSortKey>("default");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (pn: number) => {
      const { order, order_sort } = getSortParams(sortKey);
      const res = await getWebInterfaceWbiSearchType<SearchUserItem>({
        search_type: "bili_user",
        keyword,
        page: pn,
        page_size: 24,
        order,
        order_sort,
      });
      let items: SearchUserItemWithRelation[] = [];
      const rawItems = res?.data?.result ?? [];
      const total = res?.data?.numResults ?? 0;

      if (rawItems.length > 0) {
        try {
          const fids = rawItems.map(item => item.mid).join(",");
          const relationRes = await getRelationRelations({ fids });
          if (relationRes.code === 0 && relationRes.data) {
            items = rawItems.map(item => {
              const rel = relationRes.data[item.mid];
              // attribute: 0:未关注 1:悄悄关注 2:已关注 6:已互粉 128:已拉黑
              const is_followed = rel ? rel.attribute === 2 || rel.attribute === 6 : false;
              return { ...item, is_followed };
            });
          } else {
            items = rawItems.map(item => ({ ...item, is_followed: false }));
          }
        } catch {
          items = rawItems.map(item => ({ ...item, is_followed: false }));
        }
      }

      return { items, total };
    },
    [keyword, sortKey],
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
    if (!keyword) return;
    setInitialLoading(true);
    setList([]);
    setPage(1);
    setHasMore(true);
    try {
      const { items, total } = await fetchPage(1);
      setList(items);
      setHasMore(items.length < total);
    } catch {
      addToast({ title: "加载失败", color: "danger" });
    } finally {
      setInitialLoading(false);
    }
  }, [fetchPage, keyword]);

  useEffect(() => {
    retryInitial();
  }, [retryInitial]);

  if (initialLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Spinner label="加载中" />
      </div>
    );
  }

  const renderItem = (u: SearchUserItemWithRelation) => <UserCard key={u.mid} u={u} />;

  return (
    <>
      <SearchHeader sortKey={sortKey} onSortChange={setSortKey} />
      <VirtualGridPageList
        items={list}
        itemKey="mid"
        renderItem={renderItem}
        getScrollElement={getScrollElement}
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={loadingMore}
        rowHeight={240}
        className="px-4"
      />
    </>
  );
}
