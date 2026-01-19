import React, { useCallback } from "react";

import MusicListItem from "@/components/music-list-item";
import MusicListHeader from "@/components/music-list-item/header";
import VirtualPageList from "@/components/virtual-page-list";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import type { RecommendItem } from "./types";

import { getContextMenus } from "./menu";

interface MusicRecommendListProps {
  items: RecommendItem[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: RecommendItem) => void;
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

  const handlePress = useCallback((item: RecommendItem) => {
    if (!item.bvid) return;
    usePlayList.getState().play({
      type: "mv",
      bvid: item.bvid,
      title: item.title,
      cover: item.cover,
      ownerName: item.author,
      ownerMid: item.authorMid,
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
              title={item.title}
              type="mv"
              bvid={item.bvid}
              cover={item.cover}
              upName={item.author}
              upMid={item.authorMid}
              playCount={item.playCount}
              duration={item.duration}
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
