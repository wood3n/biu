import React, { useCallback } from "react";

import type { SpaceArcVListItem } from "@/service/space-wbi-arc-search";

import { formatSecondsToDate } from "@/common/utils";
import MusicListItem from "@/components/music-list-item";
import MusicListHeader from "@/components/music-list-item/header";
import VirtualPageList from "@/components/virtual-page-list";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import { getContextMenus } from "./menu";

interface PostListProps {
  items: SpaceArcVListItem[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: SpaceArcVListItem) => void;
}

const PostList: React.FC<PostListProps> = ({ items, hasMore, loading, onLoadMore, getScrollElement, onMenuAction }) => {
  const displayMode = useSettings(state => state.displayMode);
  const isCompact = displayMode === "compact";

  const handlePress = useCallback((item: SpaceArcVListItem) => {
    usePlayList.getState().play({
      type: "mv",
      bvid: item.bvid,
      title: item.title,
      cover: item.pic,
      ownerName: item.author,
      ownerMid: item.mid,
    });
  }, []);

  return (
    <div className="w-full">
      <MusicListHeader />
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
              key={item.bvid}
              index={index + 1}
              title={item.title}
              type="mv"
              bvid={item.bvid}
              sid={item.aid}
              cover={item.pic}
              upName={item.author}
              upMid={item.mid}
              playCount={item.play}
              duration={item.length}
              pubTime={formatSecondsToDate(item.created)}
              onPress={() => handlePress(item)}
              menus={getContextMenus()}
              onMenuAction={key => onMenuAction(key, item)}
            />
          );
        }}
      />
    </div>
  );
};

export default PostList;
