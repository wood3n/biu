import React from "react";

import clx from "classnames";
import { Image } from "@heroui/react";
import { RiDownloadLine, RiPlayCircleLine } from "@remixicon/react";

import AsyncButton from "../async-button";

interface Props {
  visible?: boolean;
  coverImageUrl?: string;
  title?: string;
  extraTool?: React.ReactNode;
  onPlayAll: VoidFunction;
  onDownload: VoidFunction;
  style?: React.CSSProperties;
}

const StickyHeader = ({ visible = false, coverImageUrl, title, extraTool, onPlayAll, onDownload, style }: Props) => {
  return (
    <div
      className={clx(
        "sticky top-0 z-20 -mt-16 flex h-16 w-full items-center justify-between bg-second-background px-6 py-4 shadow-md transition",
        {
          "-top-16": !visible,
          "-translate-y-16": !visible,
          "translate-y-0": visible,
        },
      )}
      style={style}
    >
      <div className="flex items-center space-x-2">
        <Image src={coverImageUrl} className="h-10 w-10" />
        <span className="truncate">{title}</span>
      </div>
      <div className="flex items-center space-x-2">
        <AsyncButton isIconOnly startContent={<RiPlayCircleLine size={16} />} onPress={onPlayAll} />
        <AsyncButton isIconOnly startContent={<RiDownloadLine size={16} />} onPress={onDownload} />
        {extraTool}
      </div>
    </div>
  );
};

export default StickyHeader;
