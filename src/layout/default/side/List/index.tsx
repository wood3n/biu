import React from "react";

import { Skeleton } from "@heroui/react";

import Item from "./item";

interface Props<T> extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  list?: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}

type ListComponentType = (<T extends object = any>(props: Props<T>) => React.ReactElement) & {
  Item: typeof Item;
};

const List: ListComponentType = ({ loading, list, renderItem, ...props }) => {
  if (loading) {
    return (
      <div className="flex flex-col justify-stretch space-y-4 p-2">
        {Array(6)
          .fill(null)
          .map((_, index) => {
            return (
              <div key={String(index)} className="flex items-center space-x-4">
                <Skeleton className="rounded-lg">
                  <div className="h-12 w-12 rounded-lg" />
                </Skeleton>
                <div className="flex flex-grow flex-col justify-stretch space-y-4">
                  <Skeleton className="rounded-lg">
                    <div className="h-4 w-full rounded-lg" />
                  </Skeleton>
                  <Skeleton className="rounded-lg">
                    <div className="h-4 w-full rounded-lg" />
                  </Skeleton>
                </div>
              </div>
            );
          })}
      </div>
    );
  }

  if (!list?.length) {
    return <div>暂无数据</div>;
  }

  return (
    <div className="flex flex-col" {...props}>
      {list?.map((item, index) => {
        return renderItem(item, index);
      })}
    </div>
  );
};

List.Item = Item;

export default List;
