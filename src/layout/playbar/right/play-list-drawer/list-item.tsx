import { useNavigate } from "react-router";

import { Button, Image } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import { type PlayData } from "@/store/play-list";

import Menus from "./menu";

interface Props {
  data: PlayData;
  isPlaying?: boolean;
  onClose: VoidFunction;
  onPress?: VoidFunction;
}

const ListItem = ({ data, isPlaying, onPress, onClose }: Props) => {
  const navigate = useNavigate();

  return (
    <Button
      as="div"
      key={data.id}
      fullWidth
      disableAnimation
      variant="light"
      color={isPlaying ? "primary" : "default"}
      onPress={onPress}
      className="group flex h-auto min-h-auto w-full min-w-auto items-center justify-between space-y-2 rounded-md p-2"
    >
      <div className="m-0 flex min-w-0 flex-1 items-center">
        <div className="relative h-12 w-12 flex-none">
          <Image
            removeWrapper
            radius="md"
            src={data.cover}
            alt={data.title}
            width="100%"
            height="100%"
            className="object-cover"
          />
          {!isPlaying && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-[rgba(0,0,0,0.35)] opacity-0 group-hover:opacity-100">
              <RiPlayFill size={20} className="text-white transition-transform duration-200 group-hover:scale-110" />
            </div>
          )}
        </div>
        <div className="ml-2 flex min-w-0 flex-auto flex-col items-start space-y-1">
          <span className="w-full min-w-0 truncate text-base">{data.title}</span>
          <span
            className={clx("text-foreground-500 w-fit truncate text-sm hover:underline", {
              "cursor-pointer": Boolean(data?.ownerMid),
            })}
            onClick={e => {
              e.stopPropagation();
              if (!data?.ownerMid) return;
              navigate(`/user/${data?.ownerMid}`);
              onClose();
            }}
          >
            {data?.ownerName || "未知"}
          </span>
        </div>
        <Menus data={data} />
      </div>
    </Button>
  );
};

export default ListItem;
