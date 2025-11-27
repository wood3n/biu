import React, { useState } from "react";

import { Spinner, Pagination, Tabs, Tab, Switch } from "@heroui/react";
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
  const [musicOnly, setMusicOnly] = useState(true); // 默认只搜索音乐
  const keyword = useSearchHistory(s => s.keyword);

  const {
    loading,
    data,
    pagination,
    error,
    runAsync: search,
  } = usePagination(
    async ({ current = 1, pageSize = 24 }) => {
      if (searchType === SearchType.Video) {
        const res = await getWebInterfaceWbiSearchType<SearchVideoItem>({
          search_type: "video",
          keyword,
          page: current,
          page_size: pageSize,
          ...(musicOnly && { tids: 3 }), // 音乐分区ID为3
        });
        return {
          total: res?.data?.numResults ?? 0,
          list: res?.data?.result ?? [],
        };
      } else {
        const res = await getWebInterfaceWbiSearchType<SearchUserItem>({
          search_type: "bili_user",
          keyword,
          page: current,
          page_size: pageSize,
        });
        return {
          total: res?.data?.numResults ?? 0,
          list: res?.data?.result ?? [],
        };
      }
    },
    {
      ready: Boolean(keyword),
      defaultPageSize: 24,
      refreshDeps: [searchType, keyword, musicOnly],
    },
  );

  return (
    <>
      <div className="p-4">
        <h1 className="mb-4">搜索【{keyword}】的结果</h1>
        <div className="mb-4 flex items-center justify-between">
          <Tabs
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
          {searchType === SearchType.Video && (
            <Switch isSelected={musicOnly} onValueChange={setMusicOnly} size="sm">
              仅音乐
            </Switch>
          )}
        </div>
      </div>
      <ScrollContainer style={{ flexGrow: 1, minHeight: 0 }}>
        {loading && (
          <div className="flex min-h-[280px] items-center justify-center">
            <Spinner label="加载中" />
          </div>
        )}
        {!loading && !error && (
          <>
            {searchType === SearchType.Video && <VideoList items={(data?.list ?? []) as SearchVideoItem[]} />}
            {searchType === SearchType.User && <UserList items={(data?.list ?? []) as SearchUserItem[]} />}
          </>
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
