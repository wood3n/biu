import React, { useState } from "react";

import { Spinner, Pagination, Tabs, Tab } from "@heroui/react";
import { usePagination } from "ahooks";

import ScrollContainer from "@/components/scroll-container";
import {
  getWebInterfaceWbiSearchType,
  type SearchUserItem,
  type SearchVideoItem,
} from "@/service/web-interface-search-type";
import { useSearchHistory } from "@/store/search-history";

import { SearchType, SearchTypeOptions } from "./search-type";
import UserList from "./user-list";
import VideoList from "./video-list";

const Search = () => {
  const [searchType, setSearchType] = useState(SearchType.Video);
  const { keyword } = useSearchHistory();

  const {
    loading,
    data,
    pagination,
    error,
    runAsync: search,
  } = usePagination(
    async ({ current = 1, pageSize = 24 }) => {
      const res = await getWebInterfaceWbiSearchType<
        typeof searchType extends SearchType.Video ? SearchVideoItem : SearchUserItem
      >({
        search_type: searchType,
        keyword,
        page: current,
        page_size: pageSize,
      });

      return {
        total: res?.data?.numResults ?? 0,
        list: res?.data?.result ?? [],
      };
    },
    {
      ready: Boolean(keyword),
      defaultPageSize: 24,
      refreshDeps: [searchType, keyword],
    },
  );

  return (
    <>
      <div className="p-4">
        <h1 className="mb-4">搜索【{keyword}】的结果</h1>
        <Tabs
          color="primary"
          variant="solid"
          radius="md"
          classNames={{
            cursor: "rounded-medium",
          }}
          items={SearchTypeOptions}
          selectedKey={searchType}
          onSelectionChange={v => setSearchType(v as SearchType)}
        >
          {item => <Tab key={item.value} title={item.label} />}
        </Tabs>
      </div>
      <ScrollContainer style={{ flexGrow: 1, minHeight: 0 }}>
        {loading && (
          <div className="flex h-full items-center justify-center">
            <Spinner label="加载中" />
          </div>
        )}
        {!loading && !error && (
          <div className="flex px-4">
            {searchType === SearchType.Video && <VideoList items={(data?.list ?? []) as SearchVideoItem[]} />}
            {searchType === SearchType.User && <UserList items={(data?.list ?? []) as SearchUserItem[]} />}
          </div>
        )}
        {!loading && !error && (
          <div className="my-4 flex justify-center">
            <Pagination
              initialPage={1}
              page={pagination?.current ?? 1}
              total={pagination?.totalPage}
              onChange={page => search({ current: page, pageSize: 24 })}
            />
          </div>
        )}
      </ScrollContainer>
    </>
  );
};

export default Search;
