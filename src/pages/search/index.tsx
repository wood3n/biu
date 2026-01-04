import React, { useRef, useState } from "react";

import { Tabs, Tab } from "@heroui/react";

import Empty from "@/components/empty";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { useSearchHistory } from "@/store/search-history";

import { SearchType, SearchTypeOptions } from "./search-type";
import UserList from "./user-list";
import VideoList from "./video-list";

const Search = () => {
  const scrollerRef = useRef<ScrollRefObject>(null);
  const [searchType, setSearchType] = useState(SearchType.Video);
  const keyword = useSearchHistory(s => s.keyword);

  if (!keyword) {
    return <Empty />;
  }

  return (
    <ScrollContainer ref={scrollerRef} className="h-full w-full">
      <div className="px-4">
        <h1>搜索【{keyword}】的结果</h1>
        <div className="flex items-center justify-between py-4">
          <Tabs
            variant="solid"
            radius="md"
            classNames={{
              cursor: "rounded-medium",
            }}
            className="-ml-1"
            items={SearchTypeOptions}
            selectedKey={searchType}
            onSelectionChange={v => {
              setSearchType(v as SearchType);
            }}
          >
            {item => <Tab key={item.value} title={item.label} />}
          </Tabs>
        </div>
      </div>
      <>
        {searchType === SearchType.Video && (
          <VideoList
            keyword={keyword}
            getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport || null}
          />
        )}
        {searchType === SearchType.User && (
          <UserList
            keyword={keyword}
            getScrollElement={() => scrollerRef.current?.osInstance()?.elements().viewport || null}
          />
        )}
      </>
    </ScrollContainer>
  );
};

export default Search;
