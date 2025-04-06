import React, { HTMLAttributes } from "react";

import clx from "classnames";

import { ColumnsType } from "./types";

interface Props extends HTMLAttributes<HTMLDivElement> {
  index: number;
  data: Song;
  columns: ColumnsType<Song>;
  hoverable?: boolean;
  isSelected?: boolean;
  style?: React.CSSProperties;
}

const Row = ({ index, data, columns, hoverable, isSelected, className, ...props }: Props) => {
  return (
    <div
      {...props}
      className={clx("flex h-full space-x-4 rounded-lg py-2", className, {
        "bg-mid-green text-green-500": isSelected,
        "cursor-pointer hover:bg-zinc-800": hoverable && !isSelected,
      })}
    >
      {columns.map(({ key, align = "start", render, className }) => (
        <div key={key} className={clx(`flex items-center justify-${align} min-w-0`, className)}>
          {render({ index, rowData: data, isSelected })}
        </div>
      ))}
    </div>
  );
};

export default Row;
