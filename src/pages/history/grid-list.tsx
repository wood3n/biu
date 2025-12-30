import React, { useCallback } from "react";

import MusicCard from "@/components/music-card";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { type HistoryListItem } from "@/service/web-interface-history-search";
import { isSame, usePlayList } from "@/store/play-list";

import { getContextMenus } from "./menu";

interface GridListProps {
  items: HistoryListItem[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: HistoryListItem) => void;
}

const GridList: React.FC<GridListProps> = ({ items, hasMore, loading, onLoadMore, getScrollElement, onMenuAction }) => {
  const playList = usePlayList(state => state.list);
  const playId = usePlayList(state => state.playId);
  const playItem = playList.find(item => item.id === playId);

  const renderGridItem = useCallback(
    (item: HistoryListItem) => {
      const isPlaying = isSame(playItem, {
        type: "mv",
        bvid: item.history.bvid,
      });

      return (
        <MusicCard
          key={`${item.history.oid}-${item.view_at}`}
          title={item.title}
          cover={item.cover}
          duration={item.duration}
          ownerName={item.author_name}
          ownerMid={item.author_mid}
          time={item.view_at}
          menus={getContextMenus({
            isPlaying,
          })}
          onMenuAction={key => {
            onMenuAction(key, item);
          }}
          onPress={() => {
            usePlayList.getState().play({
              type: "mv",
              bvid: item.history.bvid,
              title: item.title,
              cover: item.cover,
              ownerName: item.author_name,
              ownerMid: item.author_mid,
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
      itemKey={item => `${item.history.oid}-${item.view_at}`}
      renderItem={renderGridItem}
      getScrollElement={getScrollElement}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loading={loading}
    />
  );
};

export default GridList;
