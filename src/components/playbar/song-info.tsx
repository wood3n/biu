import React from "react";

import { Button, Card, Image } from "@heroui/react";
import { RiFullscreenLine } from "@remixicon/react";

import Artists from "../artists";
import Collection from "../collection";
import SwitchFavorite from "../switch-favorite";

interface Props {
  song: Song;
}

const SongInfo = ({ song }: Props) => {
  return (
    <div className="flex h-full w-full items-center justify-start space-x-4">
      <div className="flex min-w-0 items-center space-x-4">
        <Card
          className="group relative h-12 w-12 flex-none cursor-pointer border-none"
          radius="sm"
          isHoverable
          isPressable
        >
          <Image src={`${song.al?.picUrl}?param=96y96`} radius="sm" width="100%" height="100%" />
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/10 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
            <Button isIconOnly size="sm">
              <RiFullscreenLine size={16} />
            </Button>
          </div>
        </Card>
        <div className="flex min-w-0 flex-col space-y-1">
          <span title={song.name} className="truncate text-base">
            {song.name}
          </span>
          {Boolean(song.ar?.length) && <Artists ars={song.ar} />}
        </div>
      </div>
      <div className="flex min-w-0 items-center space-x-2">
        <SwitchFavorite id={song.id} />
        <Collection id={song.id} />
      </div>
    </div>
  );
};

export default SongInfo;
