import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { Chip, Input, Listbox, ListboxItem } from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";
import { useRequest } from "ahooks";
import classNames from "classnames";

import { getSearchSuggestMain } from "@/service/main-suggest";
import { useSearchHistory } from "@/store/search-history";
import { useUser } from "@/store/user";

const SearchInput: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser(s => s.user);

  const location = useLocation();
  const { items: searchHistoryItems, add: addSearchHistory, delete: deleteSearchHistory } = useSearchHistory();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPointerDownInsideRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const { data: suggestionsData } = useRequest(
    async () => {
      if (!value?.trim()) {
        return [];
      }

      const res = await getSearchSuggestMain({ term: value, userid: user?.mid });
      return res?.result?.tag || [];
    },
    { debounceWait: 300, refreshDeps: [value] },
  );

  const submitSearch = (keyword: string) => {
    addSearchHistory(keyword);
    if (location.pathname !== "/search") {
      navigate("/search");
    }
  };

  return (
    <div ref={containerRef} className="window-no-drag relative w-[360px] pr-[100px]">
      <Input
        ref={inputRef}
        value={value}
        onValueChange={setValue}
        onKeyDown={e => {
          if (e.key === "Enter" && e.target?.value?.trim()) {
            submitSearch(e.target.value);
            setOpen(false);
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false);
        }}
        placeholder="搜索"
        endContent={<RiSearchLine size={16} />}
        className="window-no-drag w-full"
      />
      <div
        className={classNames(
          "bg-content1 rounded-medium absolute top-full left-0 z-[100] mt-1 min-h-[200px] w-full px-1 py-2 shadow",
          {
            hidden: !open,
            block: open,
          },
        )}
      >
        <Listbox
          aria-label="搜索建议"
          selectionMode="none"
          items={
            suggestionsData?.map(item => ({
              key: item.value,
              value: item.value,
              name: item.name,
            })) || []
          }
          emptyContent="暂无搜索建议"
          topContent={
            searchHistoryItems.length > 0 && (
              <>
                <span className="mb-2 text-sm">搜索历史</span>
                <div className="mb-1 flex gap-2">
                  {searchHistoryItems.map(item => (
                    <Chip
                      key={item.time}
                      isCloseable
                      size="sm"
                      onClose={() => {
                        deleteSearchHistory(item);
                        inputRef.current?.focus();
                      }}
                      onClick={() => {
                        setOpen(false);
                        setValue(item.value);
                        submitSearch(item.value);
                      }}
                      className="cursor-pointer"
                    >
                      {item.value}
                    </Chip>
                  ))}
                </div>
              </>
            )
          }
        >
          {item => (
            <ListboxItem
              key={item.key}
              onPress={() => {
                setOpen(false);
                setValue(item.value);
                submitSearch(item.value);
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: item.name }} />
            </ListboxItem>
          )}
        </Listbox>
      </div>
    </div>
  );
};

export default SearchInput;
