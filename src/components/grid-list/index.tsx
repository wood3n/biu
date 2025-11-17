import React, { useMemo, useState } from "react";

import { Pagination } from "@heroui/react";
import { twMerge } from "tailwind-merge";

import Empty from "../empty";
import ImageCard from "../image-card";

export interface GridPageListProps<T> {
  data?: T[];
  loading?: boolean;
  itemKey: string;
  skeletonCoverHeight?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  enablePagination?: boolean;
  pageSize?: number;
  className?: string;
}

const GridList = <T,>({
  data = [],
  loading = false,
  itemKey,
  skeletonCoverHeight,
  renderItem,
  enablePagination,
  pageSize = 20,
  className,
}: GridPageListProps<T>) => {
  const gridClassName = twMerge("grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4", className);
  const [page, setPage] = useState(1);
  const total = data?.length || 0;
  const totalPage = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  const pagedData = useMemo(() => {
    if (enablePagination) {
      return data.slice((page - 1) * pageSize, page * pageSize);
    }
    return data;
  }, [enablePagination, data, page, pageSize]);

  if (loading) {
    return (
      <div className={gridClassName}>
        {Array(12)
          .fill(0)
          .map((_, index) => (
            <ImageCard.Skeleton coverHeight={skeletonCoverHeight} key={index} />
          ))}
      </div>
    );
  }

  if (data?.length === 0) {
    return <Empty className="min-h-20" />;
  }

  return (
    <>
      <div className={gridClassName}>
        {pagedData.map((item, idx) => {
          return <React.Fragment key={item[itemKey]}>{renderItem(item, idx)}</React.Fragment>;
        })}
      </div>
      {enablePagination && totalPage > 1 && (
        <div className="flex w-full items-center justify-center p-4">
          <Pagination size="lg" initialPage={1} page={page} total={totalPage} onChange={setPage} />
        </div>
      )}
    </>
  );
};

export default GridList;
