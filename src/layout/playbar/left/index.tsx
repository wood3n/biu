import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

import { Chip } from "@heroui/react";
import { RiArrowUpSLine, RiMusic2Line } from "@remixicon/react";
import clsx from "classnames";

import { openBiliVideoLink } from "@/common/utils/url";
import Image from "@/components/image";
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

  // 本地文件无封面时按需读取内嵌封面并回填，左下角与播放面板共用同一份 cover
  const playItemId = playItem?.id;
  const playItemSource = playItem?.source;
  const playItemCover = playItem?.cover;
  const playItemAudioUrl = playItem?.audioUrl;
  useEffect(() => {
    if (playItemSource !== "local" || playItemCover || !playItemAudioUrl || !playItemId) return;
    let cancelled = false;
    window.electron.readLocalCover(playItemAudioUrl).then(cover => {
      if (!cancelled && cover) {
        usePlayList.getState().setItemCover(playItemId, cover);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [playItemId, playItemSource, playItemCover, playItemAudioUrl]);

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
            className={clsx("min-w-0 flex-1 truncate", {
              "cursor-pointer": isClickable,
              "hover:underline": isClickable,
            })}
            onClick={() => {
              if (!isClickable || !playItem) return;
              openBiliVideoLink(playItem);
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
          className={clsx("text-foreground-500 max-w-full truncate text-sm whitespace-nowrap", {
            "cursor-pointer hover:underline": Boolean(playItem?.ownerMid),
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
