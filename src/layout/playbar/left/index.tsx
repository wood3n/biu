import React, { useMemo } from "react";
import { useNavigate } from "react-router";

import { Chip } from "@heroui/react";
import { RiArrowUpSLine, RiMusic2Line } from "@remixicon/react";
import clsx from "classnames";

import { openBiliVideoLink } from "@/common/utils/url";
import Image from "@/components/image";
import MarqueeText from "@/components/marquee-text";
import MusicFavButton from "@/components/music-fav-button";
import MusicThumb from "@/components/music-thumb";
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
  const isClickable = Boolean(playItem && playItem.source !== "local");

  return (
    <div className="flex h-full w-full items-center justify-start space-x-2">
      <div data-id="full-screen-player-open" className="group relative flex-none cursor-pointer" onClick={open}>
        <Image
          radius="md"
          src={playItem?.pageCover || playItem?.cover}
          width={56}
          height={56}
          classNames={{
            wrapper: "flex-none shadow-[0_8px_20px_-6px_rgb(0_0_0/0.4)]",
          }}
          params="672w_378h_1c.avif"
          emptyPlaceholder={<RiMusic2Line />}
        />
        <div className="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-black/20 text-white opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
          <RiArrowUpSLine size={32} />
        </div>
      </div>
      <div className="flex max-w-[80%] min-w-0 flex-col items-start space-y-1">
        <span className="flex w-full items-center">
          <MarqueeText
            title={playItem?.pageTitle || playItem?.title}
            active
            className={clsx({
              "cursor-pointer": isClickable,
              "hover:underline": isClickable,
            })}
            onClick={() => {
              if (!isClickable || !playItem) return;
              openBiliVideoLink(playItem);
            }}
          >
            {playItem?.pageTitle || playItem?.title}
          </MarqueeText>
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
        <MarqueeText
          active
          className={clsx("text-foreground-500 w-full text-sm", {
            "cursor-pointer hover:underline": Boolean(playItem?.ownerMid),
          })}
          onClick={e => {
            if (playItem?.source === "local" || !playItem?.ownerMid) return;
            e.stopPropagation();
            navigate(`/user/${playItem?.ownerMid}`);
          }}
        >
          {playItem?.source === "local" ? "本地音乐" : playItem?.ownerName || "未知"}
        </MarqueeText>
      </div>
      <div className="flex items-center">
        {Boolean(playItem?.hasMultiPart) && <PageListDrawer />}
        {Boolean(user?.isLogin) && Boolean(playItem) && playItem?.source !== "local" && (
          <>
            <MusicFavButton />
            <MusicThumb />
          </>
        )}
      </div>
    </div>
  );
};

export default LeftControl;
