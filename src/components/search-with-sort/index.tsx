import { Select, SelectItem } from "@heroui/react";

import SearchButton from "@/components/search-button";

export interface SearchProps {
  onKeywordSearch?: (keyword: string) => void;
  orderOptions?: { key: string; label: string }[];
  order?: string;
  onOrderChange?: (order: string) => void;
}

const SearchWithSort = ({ onKeywordSearch, orderOptions, order, onOrderChange }: SearchProps) => {
  return (
    <div className="flex items-center space-x-2">
      <SearchButton onSearch={onKeywordSearch} />
      {Boolean(orderOptions?.length) && (
        <Select
          radius="md"
          selectedKeys={order ? new Set([order]) : new Set<string>()}
          onSelectionChange={keys => {
            if (keys === "all") return;
            const selectedValue = keys instanceof Set ? Array.from(keys)[0] : keys;
            onOrderChange?.(selectedValue as string);
          }}
          items={orderOptions}
          listboxProps={{
            color: "primary",
            hideSelectedIcon: true,
          }}
          className="max-w-xs"
          classNames={{
            innerWrapper: "w-20",
          }}
        >
          {item => (
            <SelectItem key={item.key} textValue={item.label}>
              {item.label}
            </SelectItem>
          )}
        </Select>
      )}
    </div>
  );
};

export default SearchWithSort;
