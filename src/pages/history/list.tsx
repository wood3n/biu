import React, { useCallback } from "react";

import moment from "moment";

import VirtualPageList from "@/components/virtual-page-list";
import { type HistoryListItem as HistoryListItemType } from "@/service/web-interface-history-search";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import HistoryListHeader from "./header";
import HistoryListItem from "./item";
import { getContextMenus } from "./menu";

interface HistoryListProps {
  items: HistoryListItemType[];
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  getScrollElement: () => HTMLElement | null;
  onMenuAction: (key: string, item: HistoryListItemType) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({
  items,
  hasMore,
  loading,
  onLoadMore,
  getScrollElement,
  onMenuAction,
}) => {
  const displayMode = useSettings(state => state.displayMode);
  const isCompact = displayMode === "compact";

  const handlePress = useCallback((item: HistoryListItemType) => {
    if (item.history.bvid) {
      usePlayList.getState().play({
        type: "mv",
        bvid: item.history.bvid,
        title: item.title,
        cover: item.cover,
        ownerName: item.author_name,
        ownerMid: item.author_mid,
      });
    }
  }, []);

  return (
    <div className="w-full">
      <HistoryListHeader isCompact={isCompact} />
      <VirtualPageList
        items={items}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={onLoadMore}
        getScrollElement={getScrollElement}
        rowHeight={isCompact ? 36 : 64}
        renderItem={(item, index) => {
          return (
            <HistoryListItem
              key={`${item.history.oid}-${item.view_at}`}
              index={index + 1}
              title={item.title}
              type="mv"
              bvid={item.history.bvid}
              cover={item.cover}
              upName={item.author_name}
              upMid={item.author_mid}
              progress={item.progress}
              duration={item.duration}
              viewAt={moment.unix(item.view_at).format("YYYY-MM-DD HH:mm")}
              onPress={item.history.business === "pgc" ? undefined : () => handlePress(item)}
              menus={getContextMenus({
                business: item.history.business,
              })}
              onMenuAction={key => onMenuAction(key, item)}
              isCompact={isCompact}
            />
          );
        }}
      />
    </div>
  );
};

export default HistoryList;
