import React, { useCallback } from "react";

import { Skeleton } from "@heroui/react";

import type { Media } from "@/service/user-video-archives-list";

import Empty from "@/components/empty";
import MusicCard from "@/components/music-card";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { usePlayList, isSame } from "@/store/play-list";

import { getContextMenus } from "./menu";

export interface SeriesGridListProps {
  data: Media[];
  loading?: boolean;
  className?: string;
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: Media) => void;
}

const SeriesGridList = ({ data, loading, className, getScrollElement, onMenuAction }: SeriesGridListProps) => {
  const playId = usePlayList(state => state.playId);
  const list = usePlayList(state => state.list);
  const playItem = list.find(item => item.id === playId);

  const renderGridItem = useCallback(
    (item: Media) => {
      const isPlaying = isSame(playItem, {
        type: "mv",
        bvid: item.bvid,
      });

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
          menus={getContextMenus({
            isPlaying,
          })}
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
    [onMenuAction, playItem],
  );

  if (loading && data.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
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
