import React, { forwardRef } from "react";

import clx from "classnames";
import { RiDownloadLine, RiPlayCircleLine } from "@remixicon/react";

import { usePlayingQueue } from "@/store/playing-queue";

import AsyncButton from "../async-button";
import If from "../if";
import { StyleConfig } from "./config";
import Search from "./search";

interface Props {
  songs: Song[];
  showSearch?: boolean;
  onSearch?: (value: string) => void;
  isIconOnly?: boolean;
  extra?: React.ReactNode;
  className?: string;
}

const SongListToolbar = forwardRef<HTMLDivElement, Props>(
  ({ songs, extra, showSearch, isIconOnly, onSearch, className }, ref) => {
    const { playAll } = usePlayingQueue();

    const handlePlayAll = () => {
      playAll(songs);
    };

    const handleDownload = () => {};

    return (
      <div ref={ref} className={clx("flex items-center justify-between", className)}>
        <div className="flex items-center space-x-2">
          <If condition={isIconOnly}>
            <AsyncButton
              isIconOnly
              color="success"
              startContent={<RiPlayCircleLine size={StyleConfig.ToolbarIconSize} />}
              onPress={handlePlayAll}
            />
          </If>
          <If condition={!isIconOnly}>
            <AsyncButton
              color="success"
              startContent={<RiPlayCircleLine size={StyleConfig.ToolbarIconSize} />}
              onPress={handlePlayAll}
            >
              播放
            </AsyncButton>
          </If>
          {extra}
          <AsyncButton
            isIconOnly
            startContent={<RiDownloadLine size={StyleConfig.ToolbarIconSize} />}
            onPress={handleDownload}
          />
        </div>
        <If condition={showSearch}>
          <Search onSearch={onSearch} />
        </If>
      </div>
    );
  },
);

export default SongListToolbar;
