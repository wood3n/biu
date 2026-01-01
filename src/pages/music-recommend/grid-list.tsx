import React, { useCallback } from "react";

import MusicCard from "@/components/music-card";
import VirtualGridPageList from "@/components/virtual-grid-page-list";
import { type Data as MusicItem } from "@/service/music-comprehensive-web-rank";
import { usePlayList } from "@/store/play-list";
import { useUser } from "@/store/user";

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
  const user = useUser(state => state.user);

  const renderGridItem = useCallback(
    (item: MusicItem) => {
      return (
        <MusicCard
          key={item.id}
          title={item.related_archive.title}
          cover={item.related_archive.cover}
          playCount={item.related_archive.vv_count}
          duration={item.related_archive.duration}
          ownerName={item.related_archive.username}
          ownerMid={item.related_archive.uid}
          menus={getContextMenus({
            isLogin: user?.isLogin,
          })}
          onMenuAction={key => {
            onMenuAction(key, item);
          }}
          onPress={() => {
            usePlayList.getState().play({
              type: "mv",
              bvid: item.related_archive.bvid,
              title: item.related_archive.title,
              cover: item.related_archive.cover,
              ownerName: item.related_archive.username,
              ownerMid: item.related_archive.uid,
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
