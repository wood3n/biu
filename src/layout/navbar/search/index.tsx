import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { Chip, Input, Listbox, ListboxItem } from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";
import { useRequest, useClickAway, useDebounceFn } from "ahooks";
import classNames from "classnames";

import { getSearchSuggestMain } from "@/service/main-suggest";
import { useSearchHistory } from "@/store/search-history";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

interface SearchInputProps {
  onFocusChange?: (focused: boolean) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onFocusChange }) => {
  const navigate = useNavigate();
  const user = useUser(s => s.user);

  const location = useLocation();
  const searchHistoryItems = useSearchHistory(s => s.items);
  const keyword = useSearchHistory(s => s.keyword);
  const addSearchHistory = useSearchHistory(s => s.add);
  const deleteSearchHistory = useSearchHistory(s => s.delete);
  const clearSearchHistory = useSearchHistory(s => s.clear);
  const showSearchHistory = useSettings(s => s.showSearchHistory);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(keyword);

  useClickAway(() => {
    setOpen(false);
  }, containerRef);

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
    if (!keyword?.trim()) {
      return;
    }
    addSearchHistory(keyword);
    if (location.pathname !== "/search") {
      navigate("/search");
    }
    setOpen(false);
  };

  const { run: debounceSubmitSearch } = useDebounceFn(
    (keyword: string) => {
      submitSearch(keyword);
    },
    { wait: 300 },
  );

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const next = e.relatedTarget as HTMLElement | null;
    if (next && containerRef.current?.contains(next)) {
      return;
    }
    setOpen(false);
    onFocusChange?.(false);
  };

  return (
    <div ref={containerRef} className="relative w-[280px]">
      <Input
        ref={inputRef}
        value={value}
        onValueChange={setValue}
        onKeyDown={e => {
          if (e.key === "Enter") {
            debounceSubmitSearch(e.currentTarget.value);
          }
        }}
        onBlur={handleBlur}
        onFocus={() => {
          setOpen(true);
          onFocusChange?.(true);
        }}
        placeholder="搜索"
        isClearable
        startContent={<RiSearchLine size={16} />}
        className="window-no-drag w-full"
        classNames={{
          inputWrapper:
            "bg-default-400/20 dark:bg-default-500/20 hover:bg-default-400/30 dark:hover:bg-default-500/30 group-data-[focus=true]:bg-default-400/30 dark:group-data-[focus=true]:bg-default-500/30",
        }}
      />
      <div
        className={classNames(
          "bg-content2 rounded-medium absolute top-full left-0 z-100 mt-1 min-h-[200px] w-[360px] px-1 py-2 shadow-2xl",
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
            showSearchHistory &&
            searchHistoryItems.length > 0 && (
              <>
                <div className="mb-1 flex items-center justify-between px-1">
                  <span className="text-sm">搜索历史</span>
                  <span
                    className="text-foreground-400 hover:text-foreground-600 cursor-pointer text-xs"
                    onClick={() => {
                      clearSearchHistory();
                      inputRef.current?.focus();
                    }}
                  >
                    清除全部
                  </span>
                </div>
                <div className="mb-1 flex flex-wrap gap-2">
                  {searchHistoryItems.slice(0, 10).map(item => (
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
                      className="min-w-0 cursor-pointer"
                      classNames={{
                        content: "truncate",
                      }}
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
