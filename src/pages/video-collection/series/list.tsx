import React, { useCallback } from "react";

import { Spinner } from "@heroui/react";

import type { Media } from "@/service/user-video-archives-list";

import { formatSecondsToDate } from "@/common/utils/time";
import Empty from "@/components/empty";
import MusicListItem from "@/components/music-list-item";
import MusicListHeader from "@/components/music-list-item/header";
import VirtualPageList from "@/components/virtual-page-list";
import { usePlayList } from "@/store/play-list";
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
  const isCompact = displayMode === "compact";

  const handlePress = useCallback((item: Media) => {
    usePlayList.getState().play({
      type: "mv",
      bvid: item.bvid,
      title: item.title,
      cover: item.cover,
      ownerName: item.upper?.name,
      ownerMid: item.upper?.mid,
    });
  }, []);

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
    <div className={className}>
      <MusicListHeader />
      <VirtualPageList
        items={data}
        rowHeight={isCompact ? 36 : 64}
        getScrollElement={getScrollElement}
        hasMore={false}
        loading={loading}
        renderItem={(item, index) => {
          return (
            <MusicListItem
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
              menus={getContextMenus()}
              onMenuAction={key => onMenuAction(key, item)}
            />
          );
        }}
      />
    </div>
  );
};

export default SeriesList;
