import React, { useCallback } from "react";

import type { FavMedia } from "@/service/fav-resource";

import MusicCard from "@/components/music-card";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { usePlayList } from "@/store/play-list";

import { getContextMenus } from "./menu";

interface FavoriteGridListProps {
  items: FavMedia[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  isCreatedBySelf: boolean;
  onMenuAction: (key: string, item: FavMedia) => void;
}

const FavoriteGridList: React.FC<FavoriteGridListProps> = ({
  items,
  hasMore,
  loading,
  onLoadMore,
  getScrollElement,
  isCreatedBySelf,
  onMenuAction,
}) => {
  const renderGridItem = useCallback(
    (item: FavMedia) => {
      return (
        <MusicCard
          key={item.id}
          title={item.title}
          cover={item.cover}
          playCount={item.cnt_info.play}
          duration={item.duration}
          ownerName={item.upper?.name}
          ownerMid={item.upper?.mid}
          time={item.fav_time}
          menus={getContextMenus({
            isCreatedBySelf,
            isPlaying: false,
            type: item.type === 2 ? "mv" : "audio",
          })}
          onMenuAction={key => {
            onMenuAction(key, item);
          }}
          onPress={() => {
            usePlayList.getState().play({
              type: item.type === 2 ? "mv" : "audio",
              sid: item.id,
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
    [isCreatedBySelf, onMenuAction],
  );

  return (
    <VirtualGridPageList
      items={items}
      hasMore={hasMore}
      loading={loading}
      itemKey="id"
      renderItem={renderGridItem}
      getScrollElement={getScrollElement}
      onLoadMore={onLoadMore}
    />
  );
};

export default FavoriteGridList;
