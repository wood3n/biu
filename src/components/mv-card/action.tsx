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
import { RiDownloadLine, RiHistoryLine, RiMore2Line, RiPlayListAddLine, RiStarLine } from "@remixicon/react";

import FavFolderSelect from "@/components/fav-folder/select";
import MVDownloadModal from "@/components/mv-download-modal";
import { postHistoryToViewAdd } from "@/service/history-toview-add";
import { usePlayingQueue } from "@/store/playing-queue";
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
  title: string;
  cover: string;
  bvid: string;
  aid: string;
  cid?: string;
  menus?: ImageCardMenu[];
  collectMenuTitle?: string;
  onChangeFavSuccess?: () => void;
}

const Action = ({ title, cover, bvid, aid, cid, menus, collectMenuTitle, onChangeFavSuccess }: ActionProps) => {
  const user = useUser(s => s.user);
  const { current: currentPlayMV, addToNext } = usePlayingQueue();

  const {
    isOpen: isOpenDownloadModal,
    onOpen: onOpenDownloadModal,
    onOpenChange: onOpenChangeDownloadModal,
  } = useDisclosure();
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
      hidden: currentPlayMV?.bvid === bvid,
      onPress: () => {
        addToNext({
          title,
          bvid,
          cid,
          coverImageUrl: cover,
          singer: "",
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
      icon: <RiHistoryLine size={16} />,
      title: "添加到稍后再看",
      hidden: !user?.isLogin,
      onPress: addToLater,
    },
    {
      key: "download",
      icon: <RiDownloadLine size={16} />,
      title: "下载",
      onPress: onOpenDownloadModal,
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
      <MVDownloadModal bvid={bvid} isOpen={isOpenDownloadModal} onOpenChange={onOpenChangeDownloadModal} />
      <FavFolderSelect
        title="收藏"
        rid={aid}
        isOpen={isOpenFavSelectModal}
        onOpenChange={onOpenChangeFavSelectModal}
        afterSubmit={onChangeFavSuccess}
      />
    </>
  );
};

export default Action;
