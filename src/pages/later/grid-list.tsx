import React, { useCallback } from "react";

import MusicCard from "@/components/music-card";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { type ToViewVideoItem } from "@/service/history-toview-list";
import { usePlayList } from "@/store/play-list";

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
  const renderGridItem = useCallback(
    (item: ToViewVideoItem) => {
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
            is_pgc: item.is_pgc,
          })}
          onMenuAction={key => {
            onMenuAction(key, item);
          }}
          onPress={
            item.is_pgc
              ? undefined
              : () => {
                  usePlayList.getState().play({
                    type: "mv",
                    bvid: item.bvid,
                    title: item.title,
                    cover: item.pic,
                    ownerName: item.owner?.name,
                    ownerMid: item.owner?.mid,
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
