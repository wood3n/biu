import React from "react";

import { Tab, Tabs, Switch } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import type { WebSearchTypeVideoParams } from "@/service/web-interface-search-type";

export type SortOrder = WebSearchTypeVideoParams["order"];

interface SearchHeaderProps {
  order: SortOrder;
  onOrderChange: (order: SortOrder) => void;
  musicOnly: boolean;
  onMusicOnlyChange: (value: boolean) => void;
  onPlayAll: () => void;
  playAllDisabled?: boolean;
}

const sortOptions: { label: string; value: SortOrder }[] = [
  { label: "综合排序", value: "totalrank" },
  { label: "最多播放", value: "click" },
  { label: "最新发布", value: "pubdate" },
  { label: "最多弹幕", value: "dm" },
  { label: "最多收藏", value: "stow" },
];

export default function SearchHeader({
  order,
  onOrderChange,
  musicOnly,
  onMusicOnlyChange,
  onPlayAll,
  playAllDisabled,
}: SearchHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 pb-4">
      <Tabs
        variant="light"
        radius="md"
        classNames={{
          cursor: "rounded-medium",
        }}
        className="-ml-1"
        selectedKey={order}
        onSelectionChange={key => onOrderChange(key as SortOrder)}
      >
        {sortOptions.map(option => (
          <Tab key={option.value} title={option.label} />
        ))}
      </Tabs>

      <div className="flex items-center gap-4">
        <AsyncButton
          color="primary"
          size="sm"
          startContent={<RiPlayFill size={18} />}
          isDisabled={playAllDisabled}
          onPress={onPlayAll}
          className="dark:text-black"
        >
          全部播放
        </AsyncButton>
        <Switch isSelected={musicOnly} onValueChange={onMusicOnlyChange} size="sm">
          仅音乐分区
        </Switch>
      </div>
    </div>
  );
}
