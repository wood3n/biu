import React from "react";

import clx from "classnames";
import { Image } from "@heroui/react";
import { RiDownloadLine, RiPlayCircleLine } from "@remixicon/react";

import AsyncButton from "../async-button";
import { StyleConfig } from "./config";

interface Props {
  visible?: boolean;
  coverImageUrl?: string;
  title?: string;
  extraTool?: React.ReactNode;
  onPlayAll: VoidFunction;
  onDownload: VoidFunction;
  style?: React.CSSProperties;
}

const StickyHeader = ({ visible, coverImageUrl, title, extraTool, onPlayAll, onDownload, style }: Props) => {
  return (
    <div
      className={clx(
        "sticky -top-16 z-20 -mt-16 flex h-16 w-full items-center justify-between bg-second-background px-6 py-4 shadow-md transition-[transform,top] duration-300",
        {
          "translate-y-16": visible,
        },
      )}
      style={style}
    >
      <div className="flex items-center space-x-2">
        <Image src={coverImageUrl} className="h-10 w-10" />
        <span className="truncate">{title}</span>
      </div>
      <div className="flex items-center space-x-2">
        <AsyncButton
          isIconOnly
          color="success"
          startContent={<RiPlayCircleLine size={StyleConfig.ToolbarIconSize} />}
          onPress={onPlayAll}
        />
        <AsyncButton
          isIconOnly
          startContent={<RiDownloadLine size={StyleConfig.ToolbarIconSize} />}
          onPress={onDownload}
        />
        {extraTool}
      </div>
    </div>
  );
};

export default StickyHeader;
