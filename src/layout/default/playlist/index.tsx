import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import classNames from "classnames";
import { Button, Image } from "@heroui/react";
import { RiPlayCircleLine } from "@remixicon/react";

import ScrollContainer from "@/components/scroll-container";
import { useUserPlayList } from "@/store/user-playlist";

const PlayList = () => {
  const navigate = useNavigate();
  const urlParams = useParams();

  const { likeList, createList, collectList } = useUserPlayList();

  const list = [likeList, ...(createList ?? []), ...(collectList ?? [])];

  if (list?.length === 0) return <div>暂无数据</div>;

  return (
    <ScrollContainer className="h-full">
      <div className="flex flex-col" aria-label="我的歌单列表">
        {list.map((item, index) => {
          const isSelected = item?.id === urlParams?.pid;

          return (
            <div
              key={item?.id || String(index)}
              className={classNames("flex cursor-pointer items-center space-x-2 rounded-lg p-2", {
                "hover:bg-zinc-800": !isSelected,
                "bg-mid-green text-green-500": isSelected,
              })}
              onPointerDown={() => navigate(`/playlist/${item?.id}`)}
            >
              <span className="flex-none">
                <Image radius="sm" src={item?.coverImgUrl} width={40} height={40} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col space-y-1">
                <span className="truncate text-sm">{item?.name}</span>
                <span className="text-xs text-zinc-500">{item?.trackCount}首</span>
              </div>
              <div className="flex items-center">
                <Button color="success" isIconOnly size="sm" variant="light">
                  <RiPlayCircleLine />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollContainer>
  );
};

export default PlayList;
