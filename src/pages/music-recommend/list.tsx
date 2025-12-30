import React, { useCallback } from "react";

import type { Data as MusicItem } from "@/service/music-comprehensive-web-rank";

import MusicListItem from "@/components/music-list-item";
import MusicListHeader from "@/components/music-list-item/header";
import VirtualPageList from "@/components/virtual-page-list";
import { usePlayList, isSame } from "@/store/play-list";
import { useSettings } from "@/store/settings";

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
  const playId = usePlayList(state => state.playId);
  const list = usePlayList(state => state.list);
  const playItem = list.find(item => item.id === playId);
  const play = usePlayList(state => state.play);
  const displayMode = useSettings(state => state.displayMode);
  const isCompact = displayMode === "compact";

  const handlePress = useCallback(
    (item: MusicItem) => {
      play({
        type: "mv",
        bvid: item.bvid,
        title: item.music_title,
        cover: item.cover,
        ownerName: item.author,
      });
    },
    [play],
  );

  return (
    <div className="w-full">
      <MusicListHeader hidePubTime isCompact={isCompact} />
      <VirtualPageList
        items={items}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={onLoadMore}
        getScrollElement={getScrollElement}
        rowHeight={isCompact ? 36 : 64}
        renderItem={(item, index) => {
          const isPlaying = isSame(playItem, {
            type: "mv",
            bvid: item.bvid,
          });

          return (
            <MusicListItem
              hidePubTime
              isCompact={isCompact}
              key={item.id}
              index={index + 1}
              title={item.music_title}
              type="mv"
              bvid={item.bvid}
              cover={item.cover}
              upName={item.author}
              playCount={item.related_archive.vv_count}
              duration={item.related_archive.duration}
              onPress={() => handlePress(item)}
              menus={getContextMenus({
                isPlaying,
                type: "mv",
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
