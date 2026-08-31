import React, { useState } from "react";

import { Button, Input, Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@heroui/react";
import { RiListRadio, RiSearchLine } from "@remixicon/react";
import { twMerge } from "tailwind-merge";

import { glassMenuClassName } from "@/common/constants/glass";
import MusicPageList from "@/components/music-page-list";

const PageListDrawer = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  return (
    <Popover
      shadow="lg"
      disableAnimation
      placement="top"
      offset={28}
      radius="md"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <PopoverTrigger>
        <Button
          isIconOnly
          variant="light"
          radius="md"
          size="sm"
          title="分集"
          onPress={onOpen}
          className="hover:text-primary !px-0 text-inherit hover:!bg-transparent"
        >
          <RiListRadio size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={twMerge(glassMenuClassName, "w-auto min-w-[500px] overflow-hidden p-0")}
        style={{ maxWidth: "min(500px, 90vw)" }}
      >
        <div className="border-default-300/40 dark:border-default-100/10 flex w-full flex-row items-center justify-between space-x-2 border-b px-4 py-3">
          <h3>分集</h3>
          <Input
            classNames={{
              base: "max-w-48 h-8",
              mainWrapper: "h-full",
              input: "text-small",
              inputWrapper:
                "h-full font-normal text-default-500 bg-default-200/50 dark:bg-default-100/10 backdrop-blur-md",
            }}
            placeholder="搜索分集"
            radius="md"
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
          itemHeight={64}
        />
      </PopoverContent>
    </Popover>
  );
};

export default PageListDrawer;
