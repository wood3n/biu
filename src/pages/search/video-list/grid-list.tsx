import React, { useCallback } from "react";

import { stripHtml } from "@/common/utils/str";
import MusicCard from "@/components/music-card";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { type SearchVideoItem } from "@/service/web-interface-search-type";
import { usePlayList } from "@/store/play-list";

import { getContextMenus } from "./menu";

interface GridListProps {
  items: SearchVideoItem[];
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: SearchVideoItem) => void;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const GridList: React.FC<GridListProps> = ({ items, getScrollElement, onMenuAction, loading, hasMore, onLoadMore }) => {
  const renderGridItem = useCallback(
    (item: SearchVideoItem) => {
      return (
        <MusicCard
          key={item.aid}
          title={<span dangerouslySetInnerHTML={{ __html: item.title }} />}
          cover={item.pic}
          playCount={item.play}
          duration={item.duration}
          ownerName={item.author}
          ownerMid={item.mid}
          time={item.pubdate}
          menus={getContextMenus()}
          onMenuAction={key => {
            onMenuAction(key, item);
          }}
          onPress={() => {
            usePlayList.getState().play({
              type: "mv",
              bvid: item.bvid,
              title: stripHtml(item.title),
              cover: item.pic,
              ownerName: item.author,
              ownerMid: item.mid,
            });
          }}
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
      loading={loading}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      className="px-4"
    />
  );
};

export default GridList;
