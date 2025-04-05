import React, { forwardRef, useState } from "react";

import clx from "classnames";
import { Input } from "@heroui/react";
import { RiDownloadLine, RiPlayCircleLine, RiSearchLine } from "@remixicon/react";

import AsyncButton from "../async-button";

interface Props {
  onSearch: (value: string) => void;
  onPlayAll: () => void;
  onDownload: VoidFunction;
  extraTool?: React.ReactNode;
}

const Toolbar = forwardRef<HTMLDivElement, Props>(({ extraTool, onSearch, onPlayAll, onDownload }, ref) => {
  const [focusedSearch, setFocusedSearch] = useState(false);

  return (
    <div ref={ref} className="mb-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <AsyncButton color="success" startContent={<RiPlayCircleLine size={16} />} onPress={onPlayAll}>
          播放
        </AsyncButton>
        <AsyncButton isIconOnly startContent={<RiDownloadLine size={16} />} onPress={onDownload} />
        {extraTool}
      </div>
      <Input
        className={clx("w-min transition", { "w-48": focusedSearch })}
        onFocus={() => setFocusedSearch(true)}
        onBlur={() => setFocusedSearch(false)}
        onValueChange={onSearch}
        startContent={<RiSearchLine size={16} />}
      />
    </div>
  );
});

export default Toolbar;
