import React, { HTMLAttributes, useState } from "react";

import clx from "classnames";

import { ColumnsType, ColumnType } from "./types";

interface Props extends HTMLAttributes<HTMLDivElement> {
  columns: ColumnsType<Song>;
  render: (column: ColumnType<Song>, isHovered: boolean) => React.ReactNode;
  hoverable?: boolean;
  isSelected?: boolean;
}

const Row = ({ columns, className, hoverable, isSelected, render, ...props }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      {...props}
      className={clx(
        "flex space-x-4 rounded-lg py-2",
        {
          "bg-mid-green text-green-500": isSelected,
          "cursor-pointer hover:bg-zinc-800": hoverable && !isSelected,
        },
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {columns.map(column => (
        <div
          key={column.key}
          className={clx(`flex items-center justify-${column.align || "start"} min-w-0`, column.className)}
        >
          {render(column, isHovered)}
        </div>
      ))}
    </div>
  );
};

export default Row;
