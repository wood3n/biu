import React, { useCallback } from "react";

import type { FavMedia } from "@/service/fav-resource";

import MusicCard from "@/components/music-card";
import VirtualGridPageList from "@/components/virtual-grid-page-list";

import { getContextMenus } from "./menu";

interface FavoriteGridListProps {
  items: FavMedia[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  isCreatedBySelf: boolean;
  onMenuAction: (key: string, item: FavMedia) => void;
  onItemPress: (item: FavMedia) => void;
}

const FavoriteGridList: React.FC<FavoriteGridListProps> = ({
  items,
  hasMore,
  loading,
  onLoadMore,
  getScrollElement,
  isCreatedBySelf,
  onMenuAction,
  onItemPress,
}) => {
  const renderGridItem = useCallback(
    (item: FavMedia) => {
      const canPlay = [2, 12].includes(item.type);

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
            type: item.type,
          })}
          onMenuAction={key => {
            onMenuAction(key, item);
          }}
          onPress={canPlay ? () => onItemPress(item) : undefined}
        />
      );
    },
    [isCreatedBySelf, onItemPress, onMenuAction],
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
