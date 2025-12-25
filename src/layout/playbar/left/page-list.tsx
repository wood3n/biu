import React, { useState } from "react";

import { Input, Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@heroui/react";
import { RiListRadio, RiSearchLine } from "@remixicon/react";

import IconButton from "@/components/icon-button";
import MusicPageList from "@/components/music-page-list";

const PageListDrawer = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  return (
    <Popover disableAnimation placement="top" offset={28} radius="md" isOpen={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger>
        <IconButton onPress={onOpen}>
          <RiListRadio size={18} />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent
        className="bg-content2 w-auto min-w-[500px] overflow-hidden p-0"
        style={{ maxWidth: "min(500px, 90vw)" }}
      >
        <div className="border-b-content2 flex w-full flex-row items-center justify-between space-x-2 border-b px-4 py-3">
          <h3>分集</h3>
          <Input
            classNames={{
              base: "max-w-48 h-8",
              mainWrapper: "h-full",
              input: "text-small",
              inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
            }}
            placeholder="搜索分集"
            size="sm"
            startContent={<RiSearchLine size={14} />}
            type="search"
            value={searchKeyword}
            onValueChange={setSearchKeyword}
          />
        </div>
        <MusicPageList
          searchKeyword={searchKeyword}
          onPressItem={onClose}
          className="h-[60vh] w-full px-2"
          itemHeight={48}
        />
      </PopoverContent>
    </Popover>
  );
};

export default PageListDrawer;
