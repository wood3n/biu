import { useNavigate } from "react-router";

import { Button, Image } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import { ReactComponent as AudioAnimation } from "@/assets/icons/audio-animation.svg";
import { usePlayList, type PlayData } from "@/store/play-list";

import Menus from "./menu";

interface Props {
  data: PlayData;
  isPlaying: boolean;
  onClose: VoidFunction;
  virtualOffset?: number;
}

const ListItem = ({ data, isPlaying, onClose, virtualOffset }: Props) => {
  const navigate = useNavigate();
  const playListItem = usePlayList(state => state.playListItem);

  return (
    <div
      style={{
        transform: `translate3d(0, ${virtualOffset || 0}px, 0)`,
        position: "absolute" as const,
        top: 0,
        left: 0,
        width: "100%",
        transformOrigin: "0 0",
        willChange: "transform",
      }}
    >
      <Button
        as="div"
        key={data.id}
        fullWidth
        disableAnimation
        variant="light"
        color={isPlaying ? "primary" : "default"}
        onPress={() => playListItem(data.id)}
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
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-[rgba(0,0,0,0.35)] opacity-0 group-hover:opacity-100">
              <RiPlayFill size={20} className="text-white transition-transform duration-200 group-hover:scale-110" />
            </div>
            {isPlaying && (
              <div className="text-primary rounded-medium absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.2)]">
                <AudioAnimation style={{ width: 20, height: 20 }} />
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
    </div>
  );
};

export default ListItem;
