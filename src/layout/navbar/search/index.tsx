import React, { useState } from "react";

import { Button, Modal, ModalBody, ModalContent, ModalHeader, Spinner, useDisclosure, Pagination } from "@heroui/react";
import { RiCloseLine, RiSearchLine } from "@remixicon/react";
import { usePagination } from "ahooks";

import ScrollContainer from "@/components/scroll-container";
import {
  getWebInterfaceWbiSearchType,
  SearchUserItem,
  type SearchVideoItem,
} from "@/service/web-interface-search-type";

import { SearchType, SearchTypeOptions } from "./search-type";
import SearchUser from "./search-user";
import SearchVideo from "./search-video";

const SearchBox = () => {
  const [keyword, setKeyword] = useState("");
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [searchType, setSearchType] = useState(SearchType.Video);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

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
      manual: true,
      defaultPageSize: 24,
      refreshDeps: [searchType],
    },
  );

  return (
    <>
      <Button
        startContent={<RiSearchLine size={16} />}
        onPress={() => {
          onOpen();
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 0);
        }}
        className="window-no-drag w-[280px] justify-start text-zinc-500"
      >
        搜索
      </Button>
      <Modal
        disableAnimation
        hideCloseButton
        shouldBlockScroll={false}
        isOpen={isOpen}
        isDismissable={false}
        onOpenChange={onOpenChange}
        size="5xl"
      >
        <ModalContent>
          <ModalHeader className="flex items-center space-x-2 border-b-1 border-b-zinc-800 py-3">
            <RiSearchLine color="#71717A" size={20} />
            <input
              ref={searchInputRef}
              className="h-8 flex-1 border-none pl-2 outline-0"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  search({ current: 1, pageSize: 24 });
                }
              }}
            />
            <Button size="sm" variant="light" isIconOnly onPress={onClose}>
              <RiCloseLine color="#71717A" />
            </Button>
          </ModalHeader>
          <ModalBody className="relative flex h-[700px] min-h-[700px] flex-none flex-col gap-0 p-0">
            <div className="flex items-center space-x-2 p-4">
              {SearchTypeOptions.map(o => (
                <Button
                  size="sm"
                  key={o.value}
                  startContent={o.icon}
                  color={searchType === o.value ? "primary" : undefined}
                  onPress={() => setSearchType(o.value)}
                >
                  {o.label}
                </Button>
              ))}
            </div>
            <ScrollContainer style={{ flexGrow: 1, minHeight: 0 }}>
              {loading && (
                <div className="flex h-full items-center justify-center">
                  <Spinner label="加载中" />
                </div>
              )}
              {!loading && !error && (
                <div className="flex px-4">
                  {searchType === SearchType.Video && <SearchVideo items={data?.list ?? []} />}
                  {searchType === SearchType.User && <SearchUser items={data?.list ?? []} />}
                </div>
              )}
              {data?.list?.length === 0 && (
                <div className="text-foreground-500 text-sm">没有找到与“{keyword}”相关的结果</div>
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
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SearchBox;
