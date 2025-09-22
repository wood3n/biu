import React from "react";

import { Card, CardBody, Avatar } from "@heroui/react";

import type { SearchUserItem } from "@/service/web-interface-search-type";

export type SearchUserProps = {
  items: SearchUserItem[];
};

export default function SearchUser({ items }: SearchUserProps) {
  if (!items || items.length === 0) {
    return <div className="text-foreground-500 text-sm">暂无用户结果</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map(u => (
        <Card key={u.mid} isHoverable isPressable className="h-full">
          <CardBody className="flex items-center space-y-2">
            <Avatar className="text-large h-32 w-32 flex-none" src={u.upic} />
            <div className="flex w-full flex-col items-center space-y-1">
              <span className="text-lg">{u.uname}</span>
              <span className="text-foreground-500 w-full truncate text-center text-sm">{u.usign}</span>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
