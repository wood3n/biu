import React from "react";

import { Button } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";
import clx from "classnames";
import { twMerge } from "tailwind-merge";

import { formatDuration } from "@/common/utils";
import Image from "@/components/image";
import { usePlayList, type PlayData } from "@/store/play-list";

import Menus from "./menu";
import { getDisplayCover, getDisplayTitle } from "./utils";

interface Props {
  data: PlayData;
  isActive: boolean;
  onPressItem?: VoidFunction;
  hideCover?: boolean;
  className?: string;
  titleClassName?: string;
}

const ListItem = ({ data, isActive, onPressItem, hideCover, className, titleClassName }: Props) => {
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
        onPressItem?.();
      }}
      className={twMerge(
        "group flex h-auto min-h-auto w-full min-w-auto items-center justify-between space-y-2 rounded-md p-2",
        className,
      )}
    >
      <div className="m-0 flex min-w-0 flex-1 items-center">
        {!hideCover && (
          <div className="relative h-12 w-12 flex-none">
            <Image
              removeWrapper
              radius="md"
              src={getDisplayCover(data)}
              alt={getDisplayTitle(data)}
              width="100%"
              height="100%"
              className="m-0"
              params="672w_378h_1c.avif"
            />
            {!isActive && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-[rgba(0,0,0,0.35)] opacity-0 group-hover:opacity-100">
                <RiPlayFill size={20} className="text-white transition-transform duration-200 group-hover:scale-110" />
              </div>
            )}
          </div>
        )}
        <div className={clx("flex min-w-0 flex-auto flex-col items-start space-y-1", { "ml-2": !hideCover })}>
          <span
            className={twMerge(
              "w-full min-w-0 truncate text-base",
              isActive ? "text-primary" : "text-foreground",
              titleClassName,
            )}
          >
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
