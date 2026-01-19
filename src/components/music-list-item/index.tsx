import type { ReactNode } from "react";
import { useNavigate } from "react-router";

import { Button } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import { formatNumber } from "@/common/utils/number";
import { formatDuration } from "@/common/utils/time";
import Image from "@/components/image";
import { isSame, usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import type { ContextMenuItem } from "../context-menu";

import ContextMenu from "../context-menu";
import OperationMenu from "./operation";
import { getMusicListItemGrid } from "./styles";

interface Props {
  title: ReactNode;
  type: "audio" | "mv";
  bvid?: string;
  sid?: number;
  cover?: string;
  upName?: string;
  upMid?: number;
  onPress?: () => void;
  playCount?: number;
  duration?: number | string;
  index?: number;
  pubTime?: string;
  menus: ContextMenuItem[];
  onMenuAction?: (key: string) => void;
  hidePubTime?: boolean;
}

const MusicListItem = ({
  title,
  type,
  bvid,
  sid,
  cover,
  upName,
  upMid,
  menus,
  onMenuAction,
  onPress,
  playCount,
  duration,
  index,
  pubTime,
  hidePubTime,
}: Props) => {
  const navigate = useNavigate();
  const playId = usePlayList(state => state.playId);
  const list = usePlayList(state => state.list);
  const playItem = list.find(item => item.id === playId);
  const isPlay = isSame(playItem, { type, bvid, sid });
  const displayMode = useSettings(state => state.displayMode);
  const isCompact = displayMode === "compact";

  const gridCols = getMusicListItemGrid(isCompact, hidePubTime);

  return (
    <ContextMenu items={menus} onAction={onMenuAction}>
      <Button
        as="div"
        radius="md"
        fullWidth
        disableAnimation
        variant={isPlay ? "flat" : "light"}
        color={isPlay ? "primary" : "default"}
        onDoubleClick={onPress}
        className={clx(
          "group flex w-full items-center justify-between rounded-md",
          isCompact ? "h-9 min-h-9 min-w-0 px-0 text-sm" : "h-auto min-h-auto min-w-auto space-y-2 p-2",
        )}
      >
        <div className={clx("grid w-full items-center gap-4", gridCols)}>
          {/* 1. 序号 */}
          <div className="text-foreground-500 min-w-8 text-center text-xs tabular-nums">{index}</div>

          {/* 2. 音乐信息 */}
          {isCompact ? (
            <div className="min-w-0 truncate text-left">
              <span className={clx("truncate", { "text-primary": isPlay })}>{title}</span>
            </div>
          ) : (
            <div className="flex min-w-0 items-center overflow-hidden">
              <div className="relative h-12 w-12 flex-none">
                <Image
                  removeWrapper
                  radius="md"
                  src={cover}
                  width="100%"
                  height="100%"
                  className="m-0"
                  params="672w_378h_1c.avif"
                />
                {!isPlay && typeof onPress === "function" && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-[rgba(0,0,0,0.35)] opacity-0 group-hover:opacity-100">
                    <RiPlayFill
                      size={20}
                      className="text-white transition-transform duration-200 group-hover:scale-110"
                    />
                  </div>
                )}
              </div>
              <div className="ml-2 flex min-w-0 flex-col items-start justify-center space-y-1">
                <span className={clx("w-full truncate text-left text-base", { "text-primary": isPlay })}>{title}</span>
                {Boolean(upName) && (
                  <span
                    className={clx("text-foreground-500 w-fit truncate text-sm", {
                      "cursor-pointer hover:underline": Boolean(upMid),
                    })}
                    onClick={e => {
                      e.stopPropagation();
                      if (!upMid) return;
                      navigate(`/user/${upMid}`);
                    }}
                  >
                    {upName || "未知"}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 3. UP名称 (Compact only) */}
          {isCompact && (
            <div className="min-w-0 truncate">
              <span
                className={clx("text-foreground-500 w-fit truncate text-sm", {
                  "cursor-pointer hover:underline": Boolean(upMid),
                })}
                onClick={e => {
                  e.stopPropagation();
                  if (!upMid) return;
                  navigate(`/user/${upMid}`);
                }}
              >
                {upName || "未知"}
              </span>
            </div>
          )}

          {/* 4. 播放量 */}
          <div className="text-foreground-500 flex justify-end text-xs">
            {playCount !== undefined && playCount > 0 ? formatNumber(playCount) : "-"}
          </div>

          {/* 5. 投稿时间 */}
          {!hidePubTime && (
            <div className="text-foreground-500 flex justify-end text-xs">{pubTime && <span>{pubTime}</span>}</div>
          )}

          {/* 6. 时长 */}
          <div className="text-foreground-500 flex justify-end text-xs tabular-nums">
            {Boolean(duration) && <span>{typeof duration === "number" ? formatDuration(duration) : duration}</span>}
          </div>

          {/* 7. 操作 */}
          <div className="flex h-full items-center justify-end">
            {Boolean(menus.length) && <OperationMenu items={menus} onAction={onMenuAction} />}
          </div>
        </div>
      </Button>
    </ContextMenu>
  );
};

export default MusicListItem;
