import React, { useMemo } from "react";
import { useNavigate } from "react-router";

import { Chip } from "@heroui/react";
import { RiArrowUpSLine, RiMusic2Line } from "@remixicon/react";
import clsx from "classnames";

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
          emptyPlaceholder={<RiMusic2Line />}
        />
        <div className="text-primary absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-md bg-[rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100">
          <RiArrowUpSLine size={32} />
        </div>
      </div>
      <div className="flex min-w-0 flex-col items-start space-y-1">
        <span className="flex w-full items-center">
          <span
            title={playItem?.pageTitle || playItem?.title}
            className={clsx("min-w-0 flex-1 cursor-pointer truncate", {
              "hover:underline": playItem?.source !== "local",
            })}
            onClick={() => {
              if (playItem?.source !== "local") {
                openBiliVideoLink(playItem!);
              }
            }}
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
        <span
          className={clsx("text-foreground-500 max-w-full cursor-pointer truncate text-sm whitespace-nowrap", {
            "hover:underline": Boolean(playItem?.ownerMid),
          })}
          onClick={e => {
            if (playItem?.source === "local" || !playItem?.ownerMid) return;
            e.stopPropagation();
            navigate(`/user/${playItem?.ownerMid}`);
          }}
        >
          {playItem?.source === "local" ? "本地音乐" : playItem?.ownerName || "未知"}
        </span>
      </div>
      <div className="flex items-center">
        {Boolean(playItem?.hasMultiPart) && <PageListDrawer />}
        {Boolean(user?.isLogin) && Boolean(playId) && playItem?.source !== "local" && <MusicFavButton />}
      </div>
    </div>
  );
};

export default LeftControl;
