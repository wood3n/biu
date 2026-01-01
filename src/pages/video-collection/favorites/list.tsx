import React from "react";

import type { FavMedia } from "@/service/fav-resource";

import { formatSecondsToDate } from "@/common/utils/time";
import MusicListItem from "@/components/music-list-item";
import MusicListHeader from "@/components/music-list-item/header";
import VirtualPageList from "@/components/virtual-page-list";
import { useSettings } from "@/store/settings";

import { getContextMenus } from "./menu";

interface FavoriteListProps {
  items: FavMedia[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  isCreatedBySelf: boolean;
  onMenuAction: (key: string, item: FavMedia) => void;
  onItemPress: (item: FavMedia) => void;
}

const FavoriteList: React.FC<FavoriteListProps> = ({
  items,
  hasMore,
  loading,
  onLoadMore,
  getScrollElement,
  isCreatedBySelf,
  onMenuAction,
  onItemPress,
}) => {
  const displayMode = useSettings(state => state.displayMode);
  const isCompact = displayMode === "compact";

  return (
    <div className="w-full">
      <MusicListHeader timeTitle="收藏时间" />
      <VirtualPageList
        items={items}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={onLoadMore}
        getScrollElement={getScrollElement}
        rowHeight={isCompact ? 36 : 64}
        renderItem={(item, index) => {
          const canPlay = [2, 12].includes(item.type);

          return (
            <MusicListItem
              key={item.id}
              index={index + 1}
              title={item.title}
              type={item.type === 2 ? "mv" : "audio"}
              bvid={item.bvid}
              sid={item.id}
              cover={item.cover}
              upName={item.upper?.name}
              upMid={item.upper?.mid}
              playCount={item.cnt_info.play}
              duration={item.duration}
              pubTime={formatSecondsToDate(item.fav_time)}
              onPress={canPlay ? () => onItemPress(item) : undefined}
              menus={getContextMenus({
                isCreatedBySelf,
                type: item.type,
              })}
              onMenuAction={key => onMenuAction(key, item)}
            />
          );
        }}
      />
    </div>
  );
};

export default FavoriteList;
