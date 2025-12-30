import type { ReactNode } from "react";
import { useNavigate } from "react-router";

import { Button, Image } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import { formatDuration } from "@/common/utils";
import { formatNumber } from "@/common/utils/number";
import { isSame, usePlayList } from "@/store/play-list";

import type { ContextMenuItem } from "../context-menu";

import ContextMenu from "../context-menu";
import OperationMenu from "./operation";
import { getMusicListItemGrid } from "./styles";

interface Props {
  isCompact?: boolean;
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
  isCompact,
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

  const gridCols = getMusicListItemGrid(isCompact, hidePubTime);

  return (
    <ContextMenu items={menus} onAction={onMenuAction}>
      <Button
        as="div"
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
                <Image removeWrapper radius="md" src={cover} width="100%" height="100%" className="m-0 object-cover" />
                {!isPlay && (
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
            {playCount !== undefined && playCount > 0 && <span>{formatNumber(playCount)}</span>}
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
          <div className="flex justify-end">
            <OperationMenu items={menus} onAction={onMenuAction} />
          </div>
        </div>
      </Button>
    </ContextMenu>
  );
};

export default MusicListItem;
