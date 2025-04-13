import React, { forwardRef } from "react";

import clx from "classnames";
import { RiDownloadCloudLine, RiPlayCircleLine } from "@remixicon/react";

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
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SongListToolbar = forwardRef<HTMLDivElement, Props>(
  ({ songs, size, extra, showSearch, isIconOnly, onSearch, className }, ref) => {
    const { playAll } = usePlayingQueue();

    const handlePlayAll = () => {
      playAll(songs);
    };

    const handleDownload = () => {};

    return (
      <div ref={ref} className={clx("flex items-center justify-between", className)}>
        <div className="flex items-center space-x-2">
          <If condition={isIconOnly}>
            <AsyncButton isIconOnly size={size} color="success" onPress={handlePlayAll}>
              <RiPlayCircleLine size={StyleConfig.ToolbarIconSize} />
            </AsyncButton>
          </If>
          <If condition={!isIconOnly}>
            <AsyncButton
              size={size}
              color="success"
              startContent={<RiPlayCircleLine size={StyleConfig.ToolbarIconSize} />}
              onPress={handlePlayAll}
            >
              播放
            </AsyncButton>
          </If>
          {extra}
          <AsyncButton size={size} isIconOnly onPress={handleDownload}>
            <RiDownloadCloudLine size={StyleConfig.ToolbarIconSize} />
          </AsyncButton>
        </div>
        <If condition={showSearch}>
          <Search onSearch={onSearch} />
        </If>
      </div>
    );
  },
);

export default SongListToolbar;
