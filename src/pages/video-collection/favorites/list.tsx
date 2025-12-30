import React, { useCallback } from "react";

import type { FavMedia } from "@/service/fav-resource";

import { formatSecondsToDate } from "@/common/utils/time";
import MusicListItem from "@/components/music-list-item";
import MusicListHeader from "@/components/music-list-item/header";
import VirtualPageList from "@/components/virtual-page-list";
import { usePlayList, isSame } from "@/store/play-list";

import { getContextMenus } from "./menu";

interface FavoriteListProps {
  items: FavMedia[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  isCreatedBySelf: boolean;
  onMenuAction: (key: string, item: FavMedia) => void;
}

const FavoriteList: React.FC<FavoriteListProps> = ({
  items,
  hasMore,
  loading,
  onLoadMore,
  getScrollElement,
  isCreatedBySelf,
  onMenuAction,
}) => {
  const playId = usePlayList(state => state.playId);
  const list = usePlayList(state => state.list);
  const playItem = list.find(item => item.id === playId);
  const play = usePlayList(state => state.play);

  const handlePress = useCallback(
    (item: FavMedia) => {
      play({
        type: item.type === 2 ? "mv" : "audio",
        bvid: item.type === 2 ? item.bvid : undefined,
        sid: item.type === 2 ? undefined : item.id,
        title: item.title,
        cover: item.cover,
        ownerName: item.upper?.name,
        ownerMid: item.upper?.mid,
      });
    },
    [play],
  );

  return (
    <div className="w-full">
      <MusicListHeader />
      <VirtualPageList
        items={items}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={onLoadMore}
        getScrollElement={getScrollElement}
        rowHeight={64}
        renderItem={(item, index) => {
          const isPlaying = isSame(playItem, {
            type: item.type === 2 ? "mv" : "audio",
            bvid: item.type === 2 ? item.bvid : undefined,
            sid: item.type === 2 ? undefined : item.id,
          });

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
              onPress={() => handlePress(item)}
              menus={getContextMenus({
                isCreatedBySelf,
                isPlaying,
                type: item.type === 2 ? "mv" : "audio",
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
