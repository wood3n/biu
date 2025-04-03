import React from "react";

import clx from "classnames";
import { Input } from "@heroui/react";
import { RiPlayCircleLine, RiSearchLine } from "@remixicon/react";

import AsyncButton from "../async-button";
import If from "../if";
import { ColumnsType } from "./types";

interface Props {
  header?: React.ReactNode;
  showToolbar?: boolean;
  columns: ColumnsType<Song>;
  onSearch?: (value: string) => void;
  onPlayAll?: () => void;
}

const Header = ({ header, showToolbar, columns, onSearch, onPlayAll }: Props) => {
  return (
    <>
      {header}
      <If condition={showToolbar}>
        <div className="sticky top-[-1.5rem] z-20 mb-4 flex items-center justify-between bg-second-background">
          <div className="flex items-center space-x-4">
            <AsyncButton color="success" startContent={<RiPlayCircleLine size={16} />} onPress={onPlayAll}>
              播放
            </AsyncButton>
          </div>
          <Input className="w-60" placeholder="搜索歌名" onValueChange={onSearch} startContent={<RiSearchLine size={16} />} />
        </div>
      </If>
      <div className="mb-1 flex space-x-4 rounded-lg bg-zinc-800 py-2 text-sm text-zinc-400">
        {columns.map(({ key, title, align = "start", className }) => (
          <div key={key} className={clx(`flex items-center justify-${align}`, className)}>
            {title}
          </div>
        ))}
      </div>
    </>
  );
};

export default Header;
