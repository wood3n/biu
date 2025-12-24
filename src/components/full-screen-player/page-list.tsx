import { useState } from "react";

import { Input } from "@heroui/react";
import { RiSearchLine } from "@remixicon/react";

import MusicPageList from "@/components/music-page-list";

const PageList = () => {
  const [keyword, setKeyword] = useState("");

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <div className="p-3 pb-2">
        <Input
          size="sm"
          placeholder="搜索分集..."
          value={keyword}
          onValueChange={setKeyword}
          startContent={<RiSearchLine size={16} className="text-white/50" />}
          classNames={{
            inputWrapper: "bg-white/10 data-[hover=true]:bg-white/20 group-data-[focus=true]:bg-white/20",
            input: "text-white placeholder:text-white/50",
          }}
          isClearable
        />
      </div>
      <div className="min-h-0 flex-1">
        <MusicPageList
          searchKeyword={keyword}
          className="h-full w-full px-2"
          hideCover
          itemTitleClassName="text-sm text-white/80 group-data-[hover=true]:text-white"
          itemClassName="min-h-[36px] h-[36px] p-1 rounded-sm"
          itemHeight={40}
        />
      </div>
    </div>
  );
};

export default PageList;
