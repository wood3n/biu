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

import FavFolderSelect from "@/components/fav-folder/select";
import { postHistoryToViewAdd } from "@/service/history-toview-add";
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
      hidden: !user?.isLogin || (type === "mv" ? !aid : !sid),
      onPress: onOpenFavSelectModal,
    },
    {
      key: "addToLater",
      icon: <RiTimeLine size={16} />,
      title: "添加到稍后再看",
      hidden: !user?.isLogin || location.pathname === "/later",
      onPress: addToLater,
    },
    // {// 暂时隐藏，后续重构完再开放
    //   key: "download",
    //   icon: <RiDownloadLine size={16} />,
    //   title: "下载",
    //   onPress: onOpenDownloadModal,
    // },
    ...(menus || []),
  ].filter(item => !item.hidden);

  return (
    <>
      <div className="relative flex items-center justify-center">
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
            <Button size="sm" radius="full" variant="light" isIconOnly className="h-7 w-7 min-w-7 text-zinc-300">
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
    </>
  );
};

export default Action;
