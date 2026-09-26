import { useNavigate } from "react-router";

import { Button } from "@heroui/react";
import { RiMusic2Line, RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import ContextMenu, { type ContextMenuItem } from "@/components/context-menu";
import Image from "@/components/image";
import MarqueeText from "@/components/marquee-text";
import { type PlayData } from "@/store/play-list";

import { getMenus } from "../music-playlist-drawer/menu";

interface Props {
  data: PlayData;
  isLogin: boolean;
  isPlaying?: boolean;
  onAction: (key: string) => void;
  onClose: VoidFunction;
  onPress?: VoidFunction;
}

const PlayListItem = ({ data, isLogin, isPlaying, onAction, onClose, onPress }: Props) => {
  const navigate = useNavigate();
  const items: ContextMenuItem[] = getMenus({ isLogin, isLocal: data.source === "local" });

  return (
    <ContextMenu items={items} onAction={onAction} className="h-full">
      <Button
        as="div"
        key={data.id}
        fullWidth
        disableAnimation
        variant="light"
        onPress={onPress}
        className={clx(
          "group flex h-full min-h-auto w-full min-w-auto items-center justify-between rounded-md p-2",
          isPlaying ? "bg-success/15" : "hover:bg-white/10",
        )}
      >
        <div className="m-0 flex min-w-0 flex-1 items-center">
          <div className="relative h-12 w-12 flex-none">
            <Image
              removeWrapper
              radius="md"
              src={data.cover}
              alt={data.title}
              width={48}
              height={48}
              emptyPlaceholder={<RiMusic2Line className="text-default-500" />}
            />
            {!isPlaying && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-[rgba(0,0,0,0.35)] opacity-0 group-hover:opacity-100">
                <RiPlayFill size={20} className="text-white transition-transform duration-200 group-hover:scale-110" />
              </div>
            )}
          </div>
          <div className="ml-2 flex min-w-0 flex-auto flex-col items-start space-y-1">
            <MarqueeText className={clx("text-base", isPlaying && "text-success")} active={isPlaying}>
              {data.title}
            </MarqueeText>
            <MarqueeText
              className={clx("text-foreground-500 text-sm", {
                "cursor-pointer hover:underline": Boolean(data?.ownerMid),
              })}
              onClick={e => {
                e.stopPropagation();
                if (!data?.ownerMid) return;
                navigate(`/user/${data?.ownerMid}`);
                onClose();
              }}
            >
              {data?.source === "local" ? "本地音乐" : data?.ownerName || "未知"}
            </MarqueeText>
          </div>
        </div>
      </Button>
    </ContextMenu>
  );
};

export default PlayListItem;
