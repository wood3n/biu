import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { Card, CardBody, Avatar, Spinner, addToast } from "@heroui/react";

import { formatUrlProtocal } from "@/common/utils/url";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { getWebInterfaceWbiSearchType, type SearchUserItem } from "@/service/web-interface-search-type";

import SearchHeader from "./search-header";
import { getSortParams, type UserSortKey } from "./utils";

interface UserListProps {
  keyword: string;
  getScrollElement: () => HTMLElement | null;
}

export default function UserList({ keyword, getScrollElement }: UserListProps) {
  const navigate = useNavigate();

  const [list, setList] = useState<SearchUserItem[]>([]);
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
      const items = res?.data?.result ?? [];
      const total = res?.data?.numResults ?? 0;
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

  const renderItem = (u: SearchUserItem) => (
    <Card key={u.mid} isHoverable isPressable className="h-full" onPress={() => navigate(`/user/${u.mid}`)}>
      <CardBody className="flex items-center space-y-2">
        <Avatar className="text-large h-32 w-32 flex-none" src={formatUrlProtocal(u.upic as string)} />
        <div className="flex w-full grow flex-col items-center space-y-1">
          <span className="text-lg">{u.uname}</span>
          <span className="text-foreground-500 line-clamp-2 w-full text-center text-sm">{u.usign}</span>
        </div>
      </CardBody>
    </Card>
  );

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
