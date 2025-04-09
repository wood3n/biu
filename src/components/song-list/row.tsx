import React, { HTMLAttributes } from "react";

import clx from "classnames";

import { ColumnsType, ColumnType } from "./types";

interface Props extends HTMLAttributes<HTMLDivElement> {
  columns: ColumnsType<Song>;
  render: (column: ColumnType<Song>) => React.ReactNode;
}

const Row = ({ columns, className, render, ...props }: Props) => {
  return (
    <div {...props} className={clx("flex space-x-4 rounded-lg py-2", className)}>
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
