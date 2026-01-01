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
          selectedKeys={order ? [order] : []}
          onSelectionChange={keys => {
            const selectedValue = Array.from(keys)[0];
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
          {item => <SelectItem>{item.label}</SelectItem>}
        </Select>
      )}
    </div>
  );
};

export default SearchWithSort;
