import React, { HTMLAttributes } from "react";

import clx from "classnames";

import { ColumnsType, ColumnType } from "./types";

interface Props extends HTMLAttributes<HTMLDivElement> {
  columns: ColumnsType<Song>;
  render: (column: ColumnType<Song>) => React.ReactNode;
  hoverable?: boolean;
  isSelected?: boolean;
}

const Row = ({ columns, className, hoverable, isSelected, render, ...props }: Props) => {
  return (
    <div
      {...props}
      className={clx(
        "flex h-full space-x-4 rounded-lg py-2",
        {
          "bg-mid-green text-green-500": isSelected,
          "cursor-pointer hover:bg-zinc-800": hoverable && !isSelected,
        },
        className,
      )}
    >
      {columns.map(column => (
        <div
          key={column.key}
          className={clx(`flex items-center justify-${column.align || "start"} min-w-0`, column.className)}
        >
          {render(column)}
        </div>
      ))}
    </div>
  );
};

export default Row;
