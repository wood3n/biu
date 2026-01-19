import React, { useCallback } from "react";

import MusicCard from "@/components/music-card";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { usePlayList } from "@/store/play-list";
import { useUser } from "@/store/user";

import type { RecommendItem } from "./types";

import { getContextMenus } from "./menu";

interface MusicRecommendGridListProps {
  items: RecommendItem[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: RecommendItem) => void;
}

const MusicRecommendGridList: React.FC<MusicRecommendGridListProps> = ({
  items,
  hasMore,
  loading,
  onLoadMore,
  getScrollElement,
  onMenuAction,
}) => {
  const user = useUser(state => state.user);

  const renderGridItem = useCallback(
    (item: RecommendItem) => {
      return (
        <MusicCard
          key={item.id}
          title={item.title}
          cover={item.cover}
          playCount={item.playCount}
          duration={item.duration}
          ownerName={item.author}
          ownerMid={item.authorMid}
          menus={getContextMenus({
            isLogin: user?.isLogin,
          })}
          onMenuAction={key => {
            onMenuAction(key, item);
          }}
          onPress={() => {
            if (!item.bvid) return;
            usePlayList.getState().play({
              type: "mv",
              bvid: item.bvid,
              title: item.title,
              cover: item.cover,
              ownerName: item.author,
              ownerMid: item.authorMid,
            });
          }}
        />
      );
    },
    [onMenuAction, user?.isLogin],
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
