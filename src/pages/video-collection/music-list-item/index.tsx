import { useNavigate } from "react-router";

import { Button, Image } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import { formatDuration } from "@/common/utils";
import { formatNumber } from "@/common/utils/number";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import MVAction, { type ActionProps } from "./menu";

interface Props extends ActionProps {
  isTitleIncludeHtmlTag?: boolean;
  onPress?: () => void;
  playCount?: number;
  duration?: number;
  index?: number;
}

const MusicListItem = ({
  type,
  isTitleIncludeHtmlTag,
  bvid,
  aid,
  sid,
  title,
  cover,
  ownerName,
  ownerMid,
  menus,
  collectMenuTitle,
  onChangeFavSuccess,
  onPress,
  playCount,
  duration,
  index,
}: Props) => {
  const navigate = useNavigate();
  const playId = usePlayList(state => state.playId);
  const list = usePlayList(state => state.list);
  const playItem = list.find(item => item.id === playId);
  const isActive = playItem?.type === "audio" ? playItem?.sid === sid : playItem?.bvid === bvid;
  const displayMode = useSettings(state => state.displayMode);

  if (displayMode === "compact") {
    return (
      <Button
        as="div"
        fullWidth
        disableAnimation
        variant={isActive ? "flat" : "light"}
        color={isActive ? "primary" : "default"}
        onDoubleClick={onPress}
        className={clx("group flex h-9 min-h-9 w-full min-w-0 items-center justify-between rounded-md px-2 text-sm")}
      >
        <div
          className={clx(
            "grid w-full items-center gap-3",
            typeof index === "number"
              ? "grid-cols-[32px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto]"
              : "grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto]",
          )}
        >
          {typeof index === "number" && (
            <div className="text-foreground-500 w-8 text-right text-xs tabular-nums">{index}</div>
          )}
          <div className="min-w-0 truncate text-left">
            <span className={clx("truncate", { "text-primary": isActive })}>
              {isTitleIncludeHtmlTag ? <span dangerouslySetInnerHTML={{ __html: title }} /> : title}
            </span>
          </div>
          <div className="min-w-0 truncate">
            <span
              className={clx("text-foreground-500 w-fit truncate text-sm hover:underline", {
                "cursor-pointer": Boolean(ownerMid),
              })}
              onClick={e => {
                e.stopPropagation();
                if (!ownerMid) return;
                navigate(`/user/${ownerMid}`);
              }}
            >
              {ownerName || "未知"}
            </span>
          </div>
          <div className="text-foreground-500 min-w-0 text-sm">
            {playCount !== undefined && playCount > 0 && <span>{formatNumber(playCount)}</span>}
          </div>
          <div className="text-foreground-500 flex min-w-0 items-center text-sm">
            {Boolean(duration) && <span className="tabular-nums">{formatDuration(duration as number)}</span>}
          </div>
          <div className="flex items-center justify-end">
            <MVAction
              type={type}
              title={title}
              cover={cover}
              bvid={bvid}
              aid={aid}
              sid={sid}
              ownerName={ownerName}
              ownerMid={ownerMid}
              menus={menus}
              collectMenuTitle={collectMenuTitle}
              onChangeFavSuccess={onChangeFavSuccess}
            />
          </div>
        </div>
      </Button>
    );
  }

  return (
    <Button
      as="div"
      fullWidth
      disableAnimation
      variant={isActive ? "flat" : "light"}
      color={isActive ? "primary" : "default"}
      onDoubleClick={onPress}
      className="group flex h-auto min-h-auto w-full min-w-auto items-center justify-between space-y-2 rounded-md"
    >
      <div className="m-0 grid w-full grid-cols-[32px_1fr_100px_60px_80px] items-center gap-6">
        <div className="text-foreground-500 w-8 text-right text-xs tabular-nums">{index}</div>
        <div className="flex min-w-0 items-center overflow-hidden">
          <div className="relative h-12 w-12 flex-none">
            <Image
              removeWrapper
              radius="md"
              src={cover}
              alt={title}
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
          <div className="ml-2 flex min-w-0 flex-col items-start justify-center space-y-1">
            <span className={clx("w-full truncate text-left text-base", { "text-primary": isActive })}>
              {isTitleIncludeHtmlTag ? <span dangerouslySetInnerHTML={{ __html: title }} /> : title}
            </span>
            <span
              className={clx("text-foreground-500 w-fit truncate text-sm hover:underline", {
                "cursor-pointer": Boolean(ownerMid),
              })}
              onClick={e => {
                e.stopPropagation();
                if (!ownerMid) return;
                navigate(`/user/${ownerMid}`);
              }}
            >
              {ownerName || "未知"}
            </span>
          </div>
        </div>

        <div className="text-foreground-500 flex flex-col items-start justify-center text-sm">
          {playCount !== undefined && playCount > 0 && <span>{formatNumber(playCount)}</span>}
        </div>

        <div className="text-foreground-500 flex h-full items-center justify-end">
          {Boolean(duration) && <span className="tabular-nums">{formatDuration(duration as number)}</span>}
        </div>
        <div className="text-foreground-500 flex h-full items-center justify-end">
          <MVAction
            type={type}
            title={title}
            cover={cover}
            bvid={bvid}
            aid={aid}
            sid={sid}
            ownerName={ownerName}
            ownerMid={ownerMid}
            menus={menus}
            collectMenuTitle={collectMenuTitle}
            onChangeFavSuccess={onChangeFavSuccess}
          />
        </div>
      </div>
    </Button>
  );
};

export default MusicListItem;
