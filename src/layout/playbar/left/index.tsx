import React, { useMemo } from "react";
import { useNavigate } from "react-router";

import { Chip, Image } from "@heroui/react";
import { RiArrowUpSLine } from "@remixicon/react";

import { openBiliVideoLink } from "@/common/utils/url";
import Ellipsis from "@/components/ellipsis";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";

import VideoPageList from "./video-page-list";

const LeftControl = () => {
  const navigate = useNavigate();
  const open = useModalStore(s => s.openFullScreenPlayer);
  const list = usePlayList(s => s.list);
  const playId = usePlayList(s => s.playId);

  const playItem = useMemo(() => list.find(item => item.id === playId), [list, playId]);

  return (
    <div className="flex h-full w-full items-center justify-start space-x-2">
      <div className="group relative flex-none cursor-pointer" onClick={open}>
        <Image
          removeWrapper
          radius="md"
          src={playItem?.pageCover || playItem?.cover}
          width={56}
          height={56}
          classNames={{
            wrapper: "flex-none",
          }}
          className="object-cover"
        />
        <div className="text-primary absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center overflow-hidden bg-[rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100">
          <RiArrowUpSLine size={32} />
        </div>
      </div>
      <div className="flex min-w-0 flex-col items-start space-y-1">
        <span className="flex items-center space-x-2">
          <Ellipsis className="cursor-pointer hover:underline" onClick={() => openBiliVideoLink(playItem!)}>
            {playItem?.pageTitle || playItem?.title}
          </Ellipsis>
          {Boolean(playItem?.isLossless) && <Chip size="sm">无损</Chip>}
          {Boolean(playItem?.isDolby) && <Chip size="sm">杜比音频</Chip>}
        </span>
        {Boolean(playItem?.ownerName) && (
          <span
            className="text-foreground-500 cursor-pointer text-sm hover:underline"
            onClick={e => {
              e.stopPropagation();
              navigate(`/user/${playItem?.ownerMid}`);
            }}
          >
            {playItem?.ownerName}
          </span>
        )}
      </div>
      {Boolean(playItem?.hasMultiPart) && <VideoPageList />}
    </div>
  );
};

export default LeftControl;
