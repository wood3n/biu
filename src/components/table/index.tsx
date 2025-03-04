import React from "react";

import clx from "classnames";
import { Skeleton } from "@heroui/react";

import { indexColumn } from "./columns";
import { ColumnsType } from "./types";

interface Props<T> {
  loading?: boolean;
  rowKey: string | number;
  data: T[] | undefined;
  columns: ColumnsType<T>;
  selectedRowKeys?: (string | number)[];
  onDoubleClick?: (rowData: T) => void;
  className?: string;
  style?: React.CSSProperties;
}

const Table = <T extends object = any>({ loading, data, rowKey, selectedRowKeys, columns, onDoubleClick, className, style }: Props<T>) => {
  const gridTemplateColumns = columns.reduce((prev, curr) => {
    return `${prev}_minmax(${typeof curr.minWidth === "string" ? curr.minWidth : `${curr.minWidth}px`},_${curr.columnFraction}fr)`;
  }, "48px");

  if (loading) {
    return (
      <div className="flex flex-col justify-stretch space-y-4 p-2">
        {Array(10)
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

  return (
    <div className={className} style={style}>
      <div className={`sticky top-0 z-50 mb-1 grid grid-cols-[${gridTemplateColumns}] gap-6 rounded-lg bg-zinc-800 py-2 text-sm text-zinc-400`}>
        {[indexColumn, ...columns].map(column => {
          return (
            <div key={column.key} className={clx(column.className, "flex", "items-center", `justify-${column.align ?? "start"}`)}>
              {column.title}
            </div>
          );
        })}
      </div>
      {data?.map((rowData, rowIndex) => {
        const isSelected = Boolean(selectedRowKeys?.includes(rowData[rowKey]));

        return (
          <div
            key={rowData[rowKey]}
            className={clx(`grid cursor-pointer grid-cols-[${gridTemplateColumns}] gap-6 rounded-lg py-2`, {
              "bg-mid-green text-green-500": isSelected,
              "hover:bg-zinc-800": !isSelected,
            })}
            onDoubleClick={() => {
              onDoubleClick?.(rowData);
            }}
          >
            {[indexColumn, ...columns].map(column => (
              <div key={column.key} className={clx(column.className, "flex", "items-center", `justify-${column.align ?? "start"}`)}>
                {column.render
                  ? column.render({
                      value: rowData[column.key],
                      index: rowIndex,
                      rowData,
                      isSelected,
                    })
                  : rowData[column.key]}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default Table;
