import { useNavigate } from "react-router";

import { Button, Image } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";
import clx from "classnames";

import { formatNumber, formatDuration } from "@/common/utils";

import Action, { type ActionProps } from "./action";

interface Props extends ActionProps {
  isTitleIncludeHtmlTag?: boolean;
  onPress?: () => void;
  playCount?: number;
  duration?: number;
  isActive?: boolean;
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
  isActive = false,
}: Props) => {
  const navigate = useNavigate();

  return (
    <Button
      as="div"
      fullWidth
      disableAnimation
      variant={isActive ? "flat" : "light"}
      color={isActive ? "primary" : "default"}
      onPress={onPress}
      className="group flex h-auto min-h-auto w-full min-w-auto items-center justify-between space-y-2 rounded-md p-2"
    >
      <div className="m-0 flex min-w-0 flex-1 items-center">
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
        <div className="ml-2 flex min-w-0 flex-auto flex-col items-start space-y-1">
          <span className={clx("w-full min-w-0 truncate text-base", { "text-primary": isActive })}>
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
            {playCount !== undefined && playCount > 0 && <span className="ml-2">{formatNumber(playCount)}</span>}
          </span>
        </div>
        {Boolean(duration) && (
          <span className="text-foreground-500 ml-2 flex-none shrink-0 text-right text-sm whitespace-nowrap tabular-nums">
            {formatDuration(duration as number)}
          </span>
        )}
        <Action
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
    </Button>
  );
};

export default MusicListItem;
