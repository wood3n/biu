import React from "react";

import { Card, CardBody, CardFooter, Image } from "@heroui/react";
import { RiUserLine } from "@remixicon/react";

import type { SearchVideoItem } from "@/service/web-interface-search-type";

import { formatSecondsToDate } from "@/common/utils";

export type SearchVideoProps = {
  items: SearchVideoItem[];
};

export default function SearchVideo({ items }: SearchVideoProps) {
  if (!items || items.length === 0) {
    return <div className="text-foreground-500 text-sm">暂无视频结果</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(v => (
        <Card key={v.bvid} isPressable isHoverable shadow="sm" onPress={() => console.log("item pressed")}>
          <CardBody className="flex-grow-0 overflow-visible p-0">
            <Image
              alt={v.title}
              className="h-[165px] w-full object-cover"
              radius="lg"
              shadow="sm"
              src={v.pic}
              width="100%"
            />
          </CardBody>
          <CardFooter className="flex flex-grow-1 flex-col items-start space-y-1">
            <div
              className="line-clamp-2 flex-auto text-start text-base wrap-anywhere break-all"
              dangerouslySetInnerHTML={{ __html: v.title as string }}
            />
            <div className="flex w-full items-center justify-between space-x-6 text-sm text-zinc-500">
              <div className="flex min-w-0 items-center space-x-1">
                <RiUserLine size={14} className="shrink-0" />
                <span className="truncate">{v.author}</span>
              </div>
              {Boolean(v.pubdate) && <span className="shrink-0">{formatSecondsToDate(v.pubdate)}</span>}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
