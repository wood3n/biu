import React, { useCallback } from "react";

import type { Data as MusicItem } from "@/service/music-comprehensive-web-rank";

import MusicListItem from "@/components/music-list-item";
import MusicListHeader from "@/components/music-list-item/header";
import VirtualPageList from "@/components/virtual-page-list";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import { getContextMenus } from "./menu";

interface MusicRecommendListProps {
  items: MusicItem[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: MusicItem) => void;
}

const MusicRecommendList: React.FC<MusicRecommendListProps> = ({
  items,
  hasMore,
  loading,
  onLoadMore,
  getScrollElement,
  onMenuAction,
}) => {
  const user = useUser(state => state.user);
  const displayMode = useSettings(state => state.displayMode);
  const isCompact = displayMode === "compact";

  const handlePress = useCallback((item: MusicItem) => {
    usePlayList.getState().play({
      type: "mv",
      bvid: item.related_archive.bvid,
      title: item.related_archive.title,
      cover: item.related_archive.cover,
      ownerName: item.related_archive.username,
      ownerMid: item.related_archive.uid,
    });
  }, []);

  return (
    <div className="w-full">
      <MusicListHeader hidePubTime />
      <VirtualPageList
        items={items}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={onLoadMore}
        getScrollElement={getScrollElement}
        rowHeight={isCompact ? 36 : 64}
        renderItem={(item, index) => {
          return (
            <MusicListItem
              hidePubTime
              key={item.id}
              index={index + 1}
              title={item.related_archive.title}
              type="mv"
              bvid={item.related_archive.bvid}
              cover={item.related_archive.cover}
              upName={item.related_archive.username}
              upMid={item.related_archive.uid}
              playCount={item.related_archive.vv_count}
              duration={item.related_archive.duration}
              onPress={() => handlePress(item)}
              menus={getContextMenus({
                isLogin: user?.isLogin,
              })}
              onMenuAction={key => onMenuAction(key, item)}
            />
          );
        }}
      />
    </div>
  );
};

export default MusicRecommendList;
