import React from "react";

import clx from "classnames";

import { ColumnsType } from "./types";

interface Props {
  columns: ColumnsType<Song>;
}

const RowHeader = ({ columns }: Props) => {
  return (
    <div className="mb-1 flex space-x-4 rounded-lg bg-zinc-800 py-2 text-sm text-zinc-400">
      {columns.map(({ key, title, align = "start", className }) => (
        <div key={key} className={clx(`flex items-center justify-${align}`, className)}>
          {title}
        </div>
      ))}
    </div>
  );
};

export default RowHeader;
