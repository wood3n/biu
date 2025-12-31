import React, { useCallback } from "react";

import { Spinner } from "@heroui/react";

import type { Media } from "@/service/user-video-archives-list";

import Empty from "@/components/empty";
import MusicCard from "@/components/music-card";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { usePlayList } from "@/store/play-list";

import { getContextMenus } from "./menu";

export interface SeriesGridListProps {
  data: Media[];
  loading?: boolean;
  className?: string;
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: Media) => void;
}

const SeriesGridList = ({ data, loading, className, getScrollElement, onMenuAction }: SeriesGridListProps) => {
  const renderGridItem = useCallback(
    (item: Media) => {
      return (
        <MusicCard
          key={item.bvid}
          title={item.title}
          cover={item.cover}
          playCount={item.cnt_info?.play}
          duration={item.duration}
          ownerName={item.upper?.name}
          ownerMid={item.upper?.mid}
          time={item.pubtime}
          menus={getContextMenus()}
          onMenuAction={key => {
            onMenuAction(key, item);
          }}
          onPress={() => {
            usePlayList.getState().play({
              type: "mv",
              bvid: item.bvid,
              title: item.title,
              cover: item.cover,
              ownerName: item.upper?.name,
              ownerMid: item.upper?.mid,
            });
          }}
        />
      );
    },
    [onMenuAction],
  );

  if (loading && data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center">
        <Spinner label="加载中" />
      </div>
    );
  }

  if (data.length === 0) {
    return <Empty className="min-h-20" />;
  }

  return (
    <VirtualGridPageList
      items={data}
      itemKey="bvid"
      renderItem={renderGridItem}
      getScrollElement={getScrollElement}
      className={className}
      hasMore={false}
      loading={false}
    />
  );
};

export default SeriesGridList;
