import React from "react";

import { Link } from "@heroui/react";

import type { SearchVideoItem } from "@/service/web-interface-search-type";

import { formatUrlProtocal } from "@/common/utils/url";
import GridList from "@/components/grid-list";
import ImageCard from "@/components/image-card";
import { usePlayingQueue } from "@/store/playing-queue";

export type SearchVideoProps = {
  items: SearchVideoItem[];
};

export default function SearchVideo({ items }: SearchVideoProps) {
  const play = usePlayingQueue(s => s.play);

  return (
    <GridList
      data={items ?? []}
      itemKey="id"
      renderItem={item => (
        <ImageCard
          showPlayIcon
          title={<p dangerouslySetInnerHTML={{ __html: item.title }} />}
          cover={formatUrlProtocal(item.pic)}
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
              bvid: item.bvid,
              title: item.title,
              singer: item.author,
              coverImageUrl: item.pic,
            })
          }
        />
      )}
    />
  );
}
