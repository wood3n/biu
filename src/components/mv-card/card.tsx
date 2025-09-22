import { useNavigate } from "react-router";

import { Card, CardBody, CardFooter, Image } from "@heroui/react";
import { RiTimeLine } from "@remixicon/react";

import { ReactComponent as PlayIcon } from "@/assets/icons/play-circle.svg";
import { formatDuration } from "@/common/utils";
import { usePlayingQueue } from "@/store/playing-queue";

export type MVCardProps = {
  bvid: string;
  cover: string;
  title: string;
  authorName: string;
  authorId?: string | number;
  durationSeconds?: number;
  coverHeight?: number; // 默认封面高度
  onPress?: () => void; // 可选：点击卡片整体的回调
};

export default function MVCard({
  bvid,
  cover,
  title,
  authorName,
  authorId,
  durationSeconds,
  coverHeight = 180,
}: MVCardProps) {
  const navigate = useNavigate();
  const { play } = usePlayingQueue();

  const goAuthor = () => {
    navigate(`/profile/${authorId}`);
  };

  const hasAuthorLink = Boolean(authorId);

  return (
    <Card
      isHoverable
      shadow="sm"
      isPressable
      onPress={() =>
        play({
          bvid,
          title,
          singer: authorName,
          coverImageUrl: cover,
        })
      }
      className="w-full"
    >
      <CardBody className="flex-grow-0 overflow-visible p-0">
        <div className="group relative">
          <Image
            alt={typeof title === "string" ? title : "video cover"}
            className={"w-full object-cover"}
            height={coverHeight}
            radius="lg"
            shadow="sm"
            src={cover}
            width="100%"
          />
          <div className="text-success pointer-events-none absolute right-4 bottom-4 z-10 overflow-hidden rounded-full opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
            <PlayIcon style={{ width: 48, height: 48 }} />
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex flex-grow-1 flex-col items-start justify-between gap-1">
        <div className="line-clamp-2 w-full text-start text-base wrap-anywhere break-all">{title}</div>
        <div className="text-foreground-500 flex w-full items-center justify-between text-sm">
          <div
            role="button"
            tabIndex={0}
            className={`flex cursor-pointer items-center space-x-1 truncate text-sm text-zinc-400 ${hasAuthorLink ? "hover:text-primary" : ""}`}
            onKeyDown={e => {
              if (hasAuthorLink) {
                e.stopPropagation();
                goAuthor();
              }
            }}
            onClick={e => {
              if (hasAuthorLink) {
                e.stopPropagation();
                goAuthor();
              }
            }}
          >
            {authorName}
          </div>
          {Boolean(durationSeconds) && (
            <div className="inline-flex shrink-0 items-center gap-1 text-sm/normal">
              <RiTimeLine size={16} />
              <span>{formatDuration(durationSeconds as number, false)}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
