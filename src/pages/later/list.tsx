import React, { useCallback } from "react";

import type { ToViewVideoItem } from "@/service/history-toview-list";

import { formatSecondsToDate } from "@/common/utils";
import MusicListItem from "@/components/music-list-item";
import MusicListHeader from "@/components/music-list-item/header";
import VirtualPageList from "@/components/virtual-page-list";
import { usePlayList, isSame } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import { getContextMenus } from "./menu";

interface LaterListProps {
  items: ToViewVideoItem[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: ToViewVideoItem) => void;
}

const LaterList: React.FC<LaterListProps> = ({
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
    (item: ToViewVideoItem) => {
      play({
        type: "mv",
        bvid: item.bvid,
        title: item.title,
        cover: item.pic,
        ownerName: item.owner?.name,
        ownerMid: item.owner?.mid,
      });
    },
    [play],
  );

  return (
    <div className="w-full">
      <MusicListHeader isCompact={isCompact} />
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
              isCompact={isCompact}
              key={item.aid}
              index={index + 1}
              title={item.title}
              type="mv"
              bvid={item.bvid}
              cover={item.pic}
              upName={item.owner?.name}
              upMid={item.owner?.mid}
              playCount={item.stat?.view}
              duration={item.duration}
              pubTime={formatSecondsToDate(item.pubdate)}
              onPress={() => handlePress(item)}
              menus={getContextMenus({
                isPlaying,
              })}
              onMenuAction={key => onMenuAction(key, item)}
            />
          );
        }}
      />
    </div>
  );
};

export default LaterList;
