import React, { useCallback } from "react";

import { formatSecondsToDate } from "@/common/utils";
import { formatUrlProtocal } from "@/common/utils/url";
import MusicListItem from "@/components/music-list-item";
import MusicListHeader from "@/components/music-list-item/header";
import VirtualPageList from "@/components/virtual-page-list";
import { type SearchVideoItem } from "@/service/web-interface-search-type";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import { getContextMenus } from "./menu";

interface ListProps {
  items: SearchVideoItem[];
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: SearchVideoItem) => void;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const List: React.FC<ListProps> = ({ items, getScrollElement, onMenuAction, loading, hasMore, onLoadMore }) => {
  const displayMode = useSettings(state => state.displayMode);
  const isCompact = displayMode === "compact";

  const handlePress = useCallback((item: SearchVideoItem) => {
    usePlayList.getState().play({
      type: "mv",
      bvid: item.bvid,
      title: item.title,
      cover: formatUrlProtocal(item.pic),
      ownerName: item.author,
      ownerMid: item.mid,
    });
  }, []);

  return (
    <div className="w-full px-4">
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
              key={item.aid}
              index={index + 1}
              title={<span dangerouslySetInnerHTML={{ __html: item.title }} />}
              type="mv"
              bvid={item.bvid}
              cover={formatUrlProtocal(item.pic)}
              upName={item.author}
              upMid={item.mid}
              playCount={item.play}
              duration={item.duration}
              pubTime={formatSecondsToDate(item.pubdate)}
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

export default List;
