import React, { useCallback } from "react";

import MusicCard from "@/components/music-card";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { type Data as MusicItem } from "@/service/music-comprehensive-web-rank";
import { usePlayList, isSame } from "@/store/play-list";

import { getContextMenus } from "./menu";

interface MusicRecommendGridListProps {
  items: MusicItem[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: MusicItem) => void;
}

const MusicRecommendGridList: React.FC<MusicRecommendGridListProps> = ({
  items,
  hasMore,
  loading,
  onLoadMore,
  getScrollElement,
  onMenuAction,
}) => {
  const playId = usePlayList(state => state.playId);
  const playList = usePlayList(state => state.list);
  const playItem = playList.find(item => item.id === playId);

  const renderGridItem = useCallback(
    (item: MusicItem) => {
      const isPlaying = isSame(playItem, {
        type: "mv",
        bvid: item.bvid,
      });

      return (
        <MusicCard
          key={item.id}
          title={item.music_title}
          cover={item.cover}
          playCount={item.related_archive.vv_count}
          duration={item.related_archive.duration}
          ownerName={item.author}
          menus={getContextMenus({
            isPlaying,
            type: "mv",
          })}
          onMenuAction={key => {
            onMenuAction(key, item);
          }}
          onPress={() => {
            usePlayList.getState().play({
              type: "mv",
              bvid: item.bvid,
              title: item.music_title,
              cover: item.cover,
              ownerName: item.author,
            });
          }}
        />
      );
    },
    [onMenuAction, playItem],
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

export default MusicRecommendGridList;
