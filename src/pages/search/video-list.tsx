import React from "react";

import { Link } from "@heroui/react";

import type { SearchVideoItem } from "@/service/web-interface-search-type";

import { formatUrlProtocal } from "@/common/utils/url";
import Empty from "@/components/empty";
import GridList from "@/components/grid-list";
import MVCard from "@/components/mv-card";
import { usePlayList } from "@/store/play-list";

export type SearchVideoProps = {
  items: SearchVideoItem[];
};

export default function SearchVideo({ items }: SearchVideoProps) {
  const play = usePlayList(s => s.play);

  if (!items?.length) return <Empty className="min-h-[280px]" />;

  return (
    <GridList
      data={items ?? []}
      itemKey="id"
      className="px-4"
      renderItem={item => (
        <MVCard
          isTitleIncludeHtmlTag
          type="mv"
          bvid={item.bvid}
          aid={String(item.aid)}
          title={item.title}
          cover={formatUrlProtocal(item.pic)}
          ownerName={item.author}
          ownerMid={item.mid}
          playCount={item.play}
          footer={
            <div className="text-foreground-500 flex w-full items-center justify-between text-sm">
              <Link href={`/user/${item.mid}`} className="text-foreground-500 text-sm hover:underline">
                {item.author}
              </Link>
              <span>{item.duration}</span>
            </div>
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
      )}
    />
  );
}
