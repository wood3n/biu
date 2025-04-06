import React, { forwardRef, useState } from "react";

import { RiDownloadLine, RiPlayCircleLine } from "@remixicon/react";

import AsyncButton from "../async-button";
import { StyleConfig } from "./config";
import Search from "./search";

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
        <AsyncButton
          color="success"
          startContent={<RiPlayCircleLine size={StyleConfig.ToolbarIconSize} />}
          onPress={onPlayAll}
        >
          播放
        </AsyncButton>
        <AsyncButton
          isIconOnly
          startContent={<RiDownloadLine size={StyleConfig.ToolbarIconSize} />}
          onPress={onDownload}
        />
        {extraTool}
      </div>
      <Search onSearch={onSearch} />
    </div>
  );
});

export default Toolbar;
