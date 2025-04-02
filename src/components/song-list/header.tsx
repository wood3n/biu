import React from "react";

import { Card, CardBody, Input } from "@heroui/react";
import { RiPlayCircleLine, RiSearchLine, RiTimeLine } from "@remixicon/react";

import AsyncButton from "../async-button";
import If from "../if";

interface Props {
  header?: React.ReactNode;
  showToolbar?: boolean;
  hideAlbum?: boolean;
  onSearch?: (value: string) => void;
  onPlayAll?: () => void;
}

const Header = ({ header, showToolbar, hideAlbum, onSearch, onPlayAll }: Props) => {
  return (
    <>
      {header}
      <Card className="sticky top-0 z-20" shadow="none">
        <CardBody>
          <If condition={showToolbar}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <AsyncButton color="success" startContent={<RiPlayCircleLine size={16} />} onPress={onPlayAll}>
                  播放
                </AsyncButton>
              </div>
              <Input className="w-60" placeholder="搜索歌名" onValueChange={onSearch} startContent={<RiSearchLine size={16} />} />
            </div>
          </If>
          <div className="mb-1 flex rounded-lg bg-zinc-800 px-6 text-sm text-zinc-400">
            <div className="flex w-12 items-center justify-center p-2">#</div>
            <div className="flex-[5] p-2">歌曲</div>
            <If condition={!hideAlbum}>
              <div className="flex-[4] p-2">专辑</div>
            </If>
            <div className="flex w-[100px] items-center justify-center p-2 text-zinc-500">
              <RiTimeLine size={16} />
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default Header;
