import React, { useCallback } from "react";

import MusicCard from "@/components/music-card";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { type ToViewVideoItem } from "@/service/history-toview-list";
import { isSame, usePlayList } from "@/store/play-list";

import { getContextMenus } from "./menu";

interface GridListProps {
  items: ToViewVideoItem[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: ToViewVideoItem) => void;
}

const GridList: React.FC<GridListProps> = ({ items, hasMore, loading, onLoadMore, getScrollElement, onMenuAction }) => {
  const playList = usePlayList(state => state.list);
  const playId = usePlayList(state => state.playId);
  const playItem = playList.find(item => item.id === playId);

  const renderGridItem = useCallback(
    (item: ToViewVideoItem) => {
      const isPlaying = isSame(playItem, {
        type: "mv",
        bvid: item.bvid,
      });

      return (
        <MusicCard
          key={item.aid}
          title={item.title}
          cover={item.pic}
          playCount={item.stat?.view}
          duration={item.duration}
          ownerName={item.owner?.name}
          ownerMid={item.owner?.mid}
          time={item.pubdate}
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
              cover: item.pic,
              ownerName: item.owner?.name,
              ownerMid: item.owner?.mid,
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
      itemKey="aid"
      renderItem={renderGridItem}
      getScrollElement={getScrollElement}
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      loading={loading}
    />
  );
};

export default GridList;
