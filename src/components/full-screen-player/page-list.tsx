import { useState } from "react";

import { Input } from "@heroui/react";
import { RiArrowRightSLine, RiSearchLine } from "@remixicon/react";
import { twMerge } from "tailwind-merge";

import IconButton from "@/components/icon-button";
import MusicPageList from "@/components/music-page-list";

interface Props {
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
}

const FullScreenPageList = ({
  ref,
  className,
  style,
  onClose,
}: Props & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  const [searchKeyword, setSearchKeyword] = useState("");

  return (
    <div
      ref={ref}
      className={twMerge(
        "flex flex-col overflow-hidden rounded-2xl bg-white/10 text-white ring-1 ring-white/12 backdrop-blur-md",
        className,
      )}
      style={style}
    >
      <div className="flex w-full flex-none flex-row items-center justify-between space-x-1 border-b border-white/10 px-2 py-2">
        <Input
          classNames={{
            mainWrapper: "h-full",
            input: "text-sm",
            inputWrapper: "bg-black/20 hover:bg-black/30 group-data-[focus=true]:bg-black/30",
          }}
          placeholder="搜索分集"
          size="sm"
          startContent={<RiSearchLine size={16} />}
          type="search"
          value={searchKeyword}
          onValueChange={setSearchKeyword}
        />
        <IconButton variant="flat" onPress={onClose} className="w-6 min-w-6">
          <RiArrowRightSLine size={16} className="text-white/80" />
        </IconButton>
      </div>
      <MusicPageList
        className="h-full w-full flex-1 p-1 pb-2"
        hideCover
        itemClassName="hover:bg-white/10 data-[active=true]:bg-primary/20 text-foreground/80 data-[active=true]:text-primary h-8 min-h-8 p-1 [&_span.tabular-nums]:hidden"
        itemHeight={32}
        itemTitleClassName="text-sm"
        onPressItem={onClose}
        searchKeyword={searchKeyword}
      />
    </div>
  );
};

export default FullScreenPageList;
