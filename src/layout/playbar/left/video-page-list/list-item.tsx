import React from "react";

import { Button, Image } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import { formatDuration } from "@/common/utils";
import { usePlayList, type PlayData } from "@/store/play-list";

import Menus from "./menu";
import { getDisplayCover, getDisplayTitle } from "./utils";

interface Props {
  data: PlayData;
  isActive: boolean;
  onClose: VoidFunction;
}

const ListItem = ({ data, isActive, onClose }: Props) => {
  const playListItem = usePlayList(state => state.playListItem);

  return (
    <Button
      as="div"
      key={data.id}
      fullWidth
      disableAnimation
      variant={isActive ? "flat" : "light"}
      color={isActive ? "primary" : "default"}
      onPress={() => {
        playListItem(data.id);
        onClose();
      }}
      className="group flex h-auto min-h-auto w-full min-w-auto items-center justify-between space-y-2 rounded-md p-2"
    >
      <div className="m-0 flex min-w-0 flex-1 items-center">
        <div className="relative h-12 w-12 flex-none">
          <Image
            removeWrapper
            radius="md"
            src={getDisplayCover(data)}
            alt={getDisplayTitle(data)}
            width="100%"
            height="100%"
            className="m-0 object-cover"
          />
          {!isActive && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-[rgba(0,0,0,0.35)] opacity-0 group-hover:opacity-100">
              <RiPlayFill size={20} className="text-white transition-transform duration-200 group-hover:scale-110" />
            </div>
          )}
        </div>
        <div className="ml-2 flex min-w-0 flex-auto flex-col items-start space-y-1">
          <span className={clx("w-full min-w-0 truncate text-base", { "text-primary": isActive })}>
            {getDisplayTitle(data)}
          </span>
        </div>
        <Menus data={data} />
        {Boolean(data.duration) && (
          <span className="text-foreground-500 ml-2 flex-none shrink-0 text-right text-sm whitespace-nowrap tabular-nums">
            {formatDuration(data.duration as number)}
          </span>
        )}
      </div>
    </Button>
  );
};

export default ListItem;
