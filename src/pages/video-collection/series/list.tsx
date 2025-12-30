import React, { useCallback } from "react";

import { Skeleton } from "@heroui/react";

import type { Media } from "@/service/user-video-archives-list";

import { formatSecondsToDate } from "@/common/utils";
import Empty from "@/components/empty";
import MusicListItem from "@/components/music-list-item";
import MusicListHeader from "@/components/music-list-item/header";
import VirtualPageList from "@/components/virtual-page-list";
import { usePlayList, isSame } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import { getContextMenus } from "./menu";

export interface SeriesListProps {
  data: Media[];
  loading: boolean;
  className?: string;
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: Media) => void;
}

const SeriesList = ({ data, loading, className, getScrollElement, onMenuAction }: SeriesListProps) => {
  const displayMode = useSettings(state => state.displayMode);
  const play = usePlayList(state => state.play);
  const playId = usePlayList(state => state.playId);
  const list = usePlayList(state => state.list);
  const playItem = list.find(item => item.id === playId);
  const isCompact = displayMode === "compact";

  const handlePress = useCallback(
    (item: Media) => {
      play({
        type: "mv",
        bvid: item.bvid,
        title: item.title,
        cover: item.cover,
        ownerName: item.upper?.name,
        ownerMid: item.upper?.mid,
      });
    },
    [play],
  );

  if (loading && data.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <Empty className="min-h-20" />;
  }

  return (
    <div className={className}>
      <MusicListHeader isCompact={isCompact} />
      <VirtualPageList
        items={data}
        rowHeight={isCompact ? 36 : 64}
        getScrollElement={getScrollElement}
        hasMore={false}
        loading={loading}
        renderItem={(item, index) => {
          const isPlaying = isSame(playItem, {
            type: "mv",
            bvid: item.bvid,
          });

          return (
            <MusicListItem
              isCompact={isCompact}
              key={item.bvid}
              index={index + 1}
              type="mv"
              bvid={item.bvid}
              sid={item.id}
              title={item.title}
              cover={item.cover}
              upName={item.upper?.name}
              upMid={item.upper?.mid}
              playCount={item.cnt_info?.play}
              duration={item.duration}
              pubTime={formatSecondsToDate(item.pubtime)}
              onPress={() => handlePress(item)}
              menus={getContextMenus({
                isPlaying,
              })}
              onMenuAction={key => onMenuAction(key, item)}
            />
          );
        }}
      />
    </div>
  );
};

export default SeriesList;
