import { useNavigate } from "react-router";

import { Button, Image } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import { ReactComponent as AudioAnimationIcon } from "@/assets/icons/audio-animation.svg";
import { formatDuration } from "@/common/utils";
import { formatNumber } from "@/common/utils/number";
import { usePlayList } from "@/store/play-list";

import MVAction, { type ActionProps } from "../mv-action";

interface Props extends ActionProps {
  isTitleIncludeHtmlTag?: boolean;
  onPress?: () => void;
  playCount?: number;
  duration?: number;
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
}: Props) => {
  const navigate = useNavigate();
  const playId = usePlayList(state => state.playId);
  const list = usePlayList(state => state.list);
  const playItem = list.find(item => item.id === playId);
  const isActive = playItem?.type === "audio" ? playItem?.sid === sid : playItem?.bvid === bvid;

  return (
    <Button
      as="div"
      fullWidth
      disableAnimation
      variant={isActive ? "flat" : "light"}
      color={isActive ? "primary" : "default"}
      onDoubleClick={onPress}
      className="group flex h-auto min-h-auto w-full min-w-auto items-center justify-between space-y-2 rounded-md p-2"
    >
      <div className="m-0 grid w-full grid-cols-[1fr_100px_140px] items-center gap-6">
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
            {isActive ? (
              <div className="text-primary rounded-medium absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center overflow-hidden bg-[rgba(0,0,0,0.5)]">
                <AudioAnimationIcon style={{ width: 20, height: 20 }} />
              </div>
            ) : (
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

        <div className="text-foreground-500 flex h-full items-center justify-end space-x-2">
          {Boolean(duration) && <span className="tabular-nums">{formatDuration(duration as number)}</span>}
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
