import React, { useMemo } from "react";
import { useNavigate } from "react-router";

import { Chip } from "@heroui/react";
import { RiArrowUpSLine } from "@remixicon/react";

import { openBiliVideoLink } from "@/common/utils/url";
import Image from "@/components/image";
import MusicFavButton from "@/components/music-fav-button";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useUser } from "@/store/user";

import PageListDrawer from "./page-list";

const LeftControl = () => {
  const navigate = useNavigate();
  const user = useUser(s => s.user);
  const open = useModalStore(s => s.openFullScreenPlayer);
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);

  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);

  return (
    <div className="flex h-full w-full items-center justify-start space-x-2">
      <div data-id="full-screen-player-open" className="group relative flex-none cursor-pointer" onClick={open}>
        <Image
          radius="md"
          src={playItem?.pageCover || playItem?.cover}
          width={56}
          height={56}
          classNames={{
            wrapper: "flex-none",
          }}
          params="672w_378h_1c.avif"
        />
        <div className="text-primary absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-md bg-[rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100">
          <RiArrowUpSLine size={32} />
        </div>
      </div>
      <div className="flex min-w-0 flex-col items-start space-y-1">
        <span className="flex w-full items-center">
          <span
            title={playItem?.pageTitle || playItem?.title}
            className="min-w-0 flex-1 cursor-pointer truncate hover:underline"
            onClick={() => openBiliVideoLink(playItem!)}
          >
            {playItem?.pageTitle || playItem?.title}
          </span>
          {Boolean(playItem?.isLossless) && (
            <Chip size="sm" className="h-auto px-0 py-0.5 text-[10px]">
              无损
            </Chip>
          )}
          {Boolean(playItem?.isDolby) && (
            <Chip size="sm" className="h-auto px-0 py-0.5 text-[10px]">
              杜比
            </Chip>
          )}
        </span>
        {Boolean(playItem?.ownerName) && (
          <span
            className="text-foreground-500 max-w-full cursor-pointer truncate text-sm whitespace-nowrap hover:underline"
            onClick={e => {
              e.stopPropagation();
              navigate(`/user/${playItem?.ownerMid}`);
            }}
          >
            {playItem?.ownerName}
          </span>
        )}
      </div>
      <div className="flex items-center">
        {Boolean(playItem?.hasMultiPart) && <PageListDrawer />}
        {Boolean(user?.isLogin) && Boolean(playId) && <MusicFavButton />}
      </div>
    </div>
  );
};

export default LeftControl;
