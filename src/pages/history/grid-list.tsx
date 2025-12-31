import React, { useCallback } from "react";

import MusicCard from "@/components/music-card";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { type HistoryListItem } from "@/service/web-interface-history-search";
import { usePlayList } from "@/store/play-list";

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
  const renderGridItem = useCallback(
    (item: HistoryListItem) => {
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
            business: item.history.business,
          })}
          onMenuAction={key => {
            onMenuAction(key, item);
          }}
          onPress={
            item.history.business === "pgc"
              ? undefined
              : () => {
                  usePlayList.getState().play({
                    type: "mv",
                    bvid: item.history.bvid,
                    title: item.title,
                    cover: item.cover,
                    ownerName: item.author_name,
                    ownerMid: item.author_mid,
                  });
                }
          }
        />
      );
    },
    [onMenuAction],
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
