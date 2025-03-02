import React from "react";

import { Tab, Tabs } from "@heroui/react";
import { RiAlbumLine, RiPlayListLine, RiUserStarLine } from "@remixicon/react";

import Album from "../album";
import Artist from "../artist";
import Playlist from "../playlist";

const Side = () => {
  return (
    <Tabs aria-label="侧边导航" variant="underlined" color="success" classNames={{ base: "justify-center", panel: "flex-grow min-h-0 overflow-y-auto pt-1" }}>
      <Tab
        key="playlist"
        title={
          <div className="flex items-center space-x-1">
            <RiPlayListLine size={15} />
            <span>歌单</span>
          </div>
        }
      >
        <Playlist />
      </Tab>
      <Tab
        key="album"
        title={
          <div className="flex items-center space-x-1">
            <RiAlbumLine size={15} />
            <span>专辑</span>
          </div>
        }
      >
        <Album />
      </Tab>
      <Tab
        key="artist"
        title={
          <div className="flex items-center space-x-1">
            <RiUserStarLine size={15} />
            <span>艺人</span>
          </div>
        }
      >
        <Artist />
      </Tab>
    </Tabs>
  );
};

export default Side;
