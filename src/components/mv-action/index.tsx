import { useLocation } from "react-router";

import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  type MenuItemProps,
  addToast,
} from "@heroui/react";
import { RiMore2Line, RiPlayListAddLine, RiStarLine, RiTimeLine } from "@remixicon/react";
import clx from "classnames";

import { ReactComponent as AudioDownloadIcon } from "@/assets/icons/audio-download.svg";
import { ReactComponent as VideoDownloadIcon } from "@/assets/icons/video-download.svg";
import { postHistoryToViewAdd } from "@/service/history-toview-add";
import { useModalStore } from "@/store/modal";
import { usePlayList, type PlayDataType } from "@/store/play-list";
import { useUser } from "@/store/user";

export interface ImageCardMenu {
  key: string;
  icon: React.ReactNode;
  hidden?: boolean;
  title: React.ReactNode;
  color?: MenuItemProps["color"];
  onPress?: () => void;
}

export interface ActionProps {
  type: PlayDataType;
  /** 标题 */
  title: string;
  /** 封面 */
  cover?: string;
  /** 视频稿件bvid */
  bvid?: string;
  /** 视频稿件avid */
  aid?: string;
  /** 音频sid */
  sid?: number;
  /** UP名 */
  ownerName?: string;
  /** UP mid */
  ownerMid?: number;
  menus?: ImageCardMenu[];
  collectMenuTitle?: string;
  onChangeFavSuccess?: () => void;
  className?: string;
  buttonClassName?: string;
}

const MVAction = ({
  type,
  title,
  cover,
  ownerName,
  ownerMid,
  bvid,
  aid,
  sid,
  menus,
  collectMenuTitle,
  onChangeFavSuccess,
  className,
  buttonClassName,
}: ActionProps) => {
  const user = useUser(s => s.user);
  const addToNext = usePlayList(s => s.addToNext);
  const location = useLocation();

  const onOpenFavSelectModalStore = useModalStore(s => s.onOpenFavSelectModal);
  const onOpenVideoPageDownloadModal = useModalStore(s => s.onOpenVideoPageDownloadModal);

  const addToLater = async () => {
    await postHistoryToViewAdd({
      bvid,
    });

    addToast({
      title: "已添加到稍后再看",
      color: "success",
    });
  };

  const menuItems: ImageCardMenu[] = [
    {
      key: "nextPlay",
      icon: <RiPlayListAddLine size={16} />,
      title: "下一首播放",
      hidden: !type,
      onPress: () => {
        addToNext({
          type,
          title,
          bvid,
          sid,
          cover,
          ownerName,
          ownerMid,
        });
      },
    },
    {
      key: "collect",
      icon: <RiStarLine size={16} />,
      title: collectMenuTitle || "收藏",
      hidden: !user?.isLogin,
      onPress: () => {
        onOpenFavSelectModalStore({
          rid: type === "mv" ? (aid as string) : String(sid),
          title: collectMenuTitle || "收藏",
          afterSubmit: onChangeFavSuccess,
        });
      },
    },
    {
      key: "addToLater",
      icon: <RiTimeLine size={16} />,
      title: "添加到稍后再看",
      hidden: !user?.isLogin || location.pathname === "/later",
      onPress: addToLater,
    },
    {
      key: "downloadAudio",
      icon: <AudioDownloadIcon className="relative top-px left-px h-[15px] w-[15px]" />,
      title: "下载音乐",
      hidden: type !== "audio",
      onPress: async () => {
        await window.electron.addMediaDownloadTask({
          outputFileType: "audio",
          title,
          cover,
          sid: String(sid),
        });

        addToast({
          title: "已添加到下载队列",
          color: "success",
        });
      },
    },
    {
      key: "downloadAudio",
      icon: <AudioDownloadIcon className="relative top-px left-px h-[15px] w-[15px]" />,
      title: "下载音频",
      hidden: type === "audio",
      onPress: () => {
        onOpenVideoPageDownloadModal({
          outputFileType: "audio",
          title,
          cover,
          bvid: bvid!,
        });
      },
    },
    {
      key: "downloadVideo",
      hidden: type === "audio",
      icon: <VideoDownloadIcon className="relative top-px left-px h-[15px] w-[15px]" />,
      title: "下载视频",
      onPress: () => {
        onOpenVideoPageDownloadModal({
          outputFileType: "video",
          title,
          cover,
          bvid: bvid!,
        });
      },
    },
    ...(menus || []),
  ].filter(item => !item.hidden);

  return (
    <>
      <div className={clx("relative flex items-center justify-center", className)}>
        <Dropdown
          shouldBlockScroll={false}
          disableAnimation
          trigger="press"
          placement="bottom-end"
          classNames={{
            content: "min-w-[120px]",
          }}
        >
          <DropdownTrigger>
            <Button
              size="sm"
              radius="full"
              variant="light"
              isIconOnly
              className={clx("text-zinc-300", buttonClassName)}
            >
              <RiMore2Line size={16} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu shouldFocusWrap selectionMode="none" items={menuItems}>
            {item => (
              <DropdownItem key={item.key} color={item.color} startContent={item.icon} onPress={item.onPress}>
                {item.title}
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>
    </>
  );
};

export default MVAction;
