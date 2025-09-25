import { useNavigate } from "react-router";

import { Card, CardBody, CardFooter, Image, useDisclosure } from "@heroui/react";
import { RiDownloadLine, RiHeartAddLine, RiOrderPlayLine, RiPlayCircleFill } from "@remixicon/react";

import { formatDuration } from "@/common/utils";
import { usePlayingQueue } from "@/store/playing-queue";

import DownloadModal from "../download-modal";
import FolderSelect from "../folder/select";
import Action from "./action";
import { ActionKey } from "./action-key";

export type MVCardProps = {
  bvid: string;
  cover: string;
  title: string;
  titleExtra?: React.ReactNode;
  authorName: string;
  actions?: ActionKey[];
  authorId?: string | number;
  durationSeconds?: number;
  coverHeight?: number; // 默认封面高度
};

const defaultActions = [ActionKey.AddToNext, ActionKey.AddToFolder, ActionKey.Download];

export default function MVCard({
  bvid,
  cover,
  title,
  authorName,
  authorId,
  actions = defaultActions,
  durationSeconds,
  coverHeight = 200,
}: MVCardProps) {
  const navigate = useNavigate();
  const { current, play, addToNext } = usePlayingQueue();

  const {
    isOpen: isFolderSelectOpen,
    onOpen: onFolderSelectOpen,
    onOpenChange: onFolderSelectOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDownloadModalOpen,
    onOpen: onDownloadModalOpen,
    onOpenChange: onDownloadModalOpenChange,
  } = useDisclosure();

  const goAuthor = () => {
    navigate(`/profile/${authorId}`);
  };

  const hasAuthorLink = Boolean(authorId);

  const actionItems = [
    {
      key: ActionKey.AddToNext,
      label: "下一首播放",
      icon: <RiOrderPlayLine size={16} />,
      hide: current?.bvid === bvid,
      onPress: () => addToNext({ bvid, title, singer: authorName, coverImageUrl: cover }),
    },
    {
      key: ActionKey.AddToFolder,
      label: "添加到收藏夹",
      icon: <RiHeartAddLine size={16} />,
      onPress: onFolderSelectOpen,
    },
    {
      key: ActionKey.Download,
      label: "下载",
      icon: <RiDownloadLine size={16} />,
      onPress: onDownloadModalOpen,
    },
  ].filter(item => !item.hide && actions?.includes(item.key));

  return (
    <>
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
              <RiPlayCircleFill size={48} />
            </div>
          </div>
        </CardBody>
        <CardFooter className="relative flex flex-grow-1 flex-col items-start justify-between space-y-1">
          <div className="flex w-full items-stretch justify-between">
            <div className="line-clamp-2 min-w-0 flex-grow pr-5 text-start text-base wrap-anywhere break-all">
              {title}
            </div>
            <Action items={actionItems} />
          </div>
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
              <span className="shrink-0 text-sm/normal">{formatDuration(durationSeconds as number)}</span>
            )}
          </div>
        </CardFooter>
      </Card>
      {actions?.includes(ActionKey.AddToFolder) && (
        <FolderSelect rid={""} isOpen={isFolderSelectOpen} onOpenChange={onFolderSelectOpenChange} />
      )}
      <DownloadModal bvid={bvid} title={title} isOpen={isDownloadModalOpen} onOpenChange={onDownloadModalOpenChange} />
    </>
  );
}
