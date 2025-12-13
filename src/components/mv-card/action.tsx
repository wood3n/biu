import { useLocation } from "react-router";

import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  type MenuItemProps,
  useDisclosure,
  addToast,
} from "@heroui/react";
import { RiMore2Line, RiPlayListAddLine, RiStarLine, RiTimeLine } from "@remixicon/react";

import { ReactComponent as AudioDownloadIcon } from "@/assets/icons/audio-download.svg";
import { ReactComponent as VideoDownloadIcon } from "@/assets/icons/video-download.svg";
import FavFolderSelect from "@/components/fav-folder/select";
import { postHistoryToViewAdd } from "@/service/history-toview-add";
import { usePlayList, type PlayDataType } from "@/store/play-list";
import { useUser } from "@/store/user";

import AudioSelect from "./audio-select";
import VideoSelect from "./video-select";

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
  cover: string;
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
}

const Action = ({
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
}: ActionProps) => {
  const user = useUser(s => s.user);
  const addToNext = usePlayList(s => s.addToNext);
  const location = useLocation();

  const {
    isOpen: isOpenFavSelectModal,
    onOpen: onOpenFavSelectModal,
    onOpenChange: onOpenChangeFavSelectModal,
  } = useDisclosure();

  const {
    isOpen: isOpenAudioSelectModal,
    onOpen: onOpenAudioSelectModal,
    onOpenChange: onOpenChangeAudioSelectModal,
  } = useDisclosure();

  const {
    isOpen: isOpenVideoSelectModal,
    onOpen: onOpenVideoSelectModal,
    onOpenChange: onOpenChangeVideoSelectModal,
  } = useDisclosure();

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
      onPress: onOpenFavSelectModal,
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
      onPress: onOpenAudioSelectModal,
    },
    {
      key: "downloadVideo",
      hidden: type === "audio",
      icon: <VideoDownloadIcon className="relative top-px left-px h-[15px] w-[15px]" />,
      title: "下载视频",
      onPress: onOpenVideoSelectModal,
    },
    ...(menus || []),
  ].filter(item => !item.hidden);

  return (
    <>
      <div className="relative ml-4 flex items-center justify-center">
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
              className="absolute -top-[2px] -right-[12px] h-7 w-7 min-w-7 text-zinc-300"
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
      <FavFolderSelect
        title="收藏"
        rid={type === "mv" ? (aid as string) : String(sid)}
        isOpen={isOpenFavSelectModal}
        onOpenChange={onOpenChangeFavSelectModal}
        afterSubmit={onChangeFavSuccess}
      />
      <AudioSelect
        title={title}
        cover={cover}
        bvid={bvid!}
        isOpen={isOpenAudioSelectModal}
        onOpenChange={onOpenChangeAudioSelectModal}
      />
      <VideoSelect
        title={title}
        cover={cover}
        bvid={bvid!}
        isOpen={isOpenVideoSelectModal}
        onOpenChange={onOpenChangeVideoSelectModal}
      />
    </>
  );
};

export default Action;
