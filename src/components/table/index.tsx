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
    return `${prev} minmax(${typeof curr.minWidth === "string" ? curr.minWidth : `${curr.minWidth}px`}, ${curr.columnFraction}fr)`;
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
      <div
        className={`sticky top-0 z-50 mb-1 grid gap-2 rounded-lg bg-zinc-800 text-sm text-zinc-400`}
        style={{
          gridTemplateColumns,
        }}
      >
        {[indexColumn, ...columns].map(column => {
          return (
            <div
              key={column.key}
              className={clx(column.className, "flex", `justify-${column.align ?? "start"}`, "items-center", {
                "p-2": column.key !== indexColumn.key,
              })}
            >
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
            className={clx(`grid cursor-pointer gap-2 rounded-lg`, {
              "bg-mid-green text-green-500": isSelected,
              "hover:bg-zinc-800": !isSelected,
            })}
            onDoubleClick={() => {
              onDoubleClick?.(rowData);
            }}
            style={{
              gridTemplateColumns,
            }}
          >
            {[indexColumn, ...columns].map(column => (
              <div
                key={column.key}
                className={clx(column.className, "flex", `justify-${column.align ?? "start"}`, "items-center", {
                  "p-2": column.key !== indexColumn.key,
                })}
              >
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
