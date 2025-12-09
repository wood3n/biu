import React from "react";

import { Link } from "@heroui/react";

import type { SearchVideoItem } from "@/service/web-interface-search-type";

import { formatUrlProtocal } from "@/common/utils/url";
import Empty from "@/components/empty";
import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

export type SearchVideoProps = {
  items: SearchVideoItem[];
};

export default function SearchVideo({ items }: SearchVideoProps) {
  const play = usePlayList(s => s.play);
  const displayMode = useSettings(state => state.displayMode);

  if (!items?.length) return <Empty className="min-h-[280px]" />;

  const renderMediaItem = (item: SearchVideoItem) => (
    <MediaItem
      key={item.aid}
      isTitleIncludeHtmlTag
      displayMode={displayMode}
      type="mv"
      bvid={item.bvid}
      aid={String(item.aid)}
      title={item.title}
      cover={formatUrlProtocal(item.pic)}
      ownerName={item.author}
      ownerMid={item.mid}
      playCount={item.play}
      footer={
        displayMode === "card" && (
          <div className="text-foreground-500 flex w-full items-center justify-between text-sm">
            <Link href={`/user/${item.mid}`} className="text-foreground-500 text-sm hover:underline">
              {item.author}
            </Link>
            <span>{item.duration}</span>
          </div>
        )
      }
      onPress={() =>
        play({
          type: "mv",
          bvid: item.bvid,
          title: item.title,
          cover: formatUrlProtocal(item.pic),
          ownerName: item.author,
          ownerMid: item.mid,
        })
      }
    />
  );

  return displayMode === "card" ? (
    <GridList data={items ?? []} itemKey="id" className="px-4" renderItem={renderMediaItem} />
  ) : (
    <div className="space-y-2 px-4">{items?.map(renderMediaItem)}</div>
  );
}
