import { useState } from "react";

import { Input } from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";
import { useDebounceFn } from "ahooks";

import DateRangePicker from "@/components/date-range-picker";

interface Props {
  onSearch?: (keyword: string) => void;
  onDateRangeChange?: (range: { start?: number; end?: number } | null) => void;
}

const HistorySearch = ({ onSearch, onDateRangeChange }: Props) => {
  const [keyword, setKeyword] = useState("");

  const { run: handleSearch } = useDebounceFn(
    (val: string) => {
      onSearch?.(val);
    },
    { wait: 500 },
  );

  return (
    <div className="flex w-full items-center justify-between space-x-2 py-2">
      <DateRangePicker onDateRangeChange={onDateRangeChange} />
      <Input
        placeholder="搜索标题/UP主名称"
        startContent={<RiSearchLine size={16} />}
        value={keyword}
        onValueChange={setKeyword}
        onKeyDown={e => e.key === "Enter" && handleSearch(keyword)}
        isClearable
        onClear={() => {
          handleSearch("");
        }}
        radius="md"
        className="max-w-50 flex-auto"
      />
    </div>
  );
};

export default HistorySearch;
