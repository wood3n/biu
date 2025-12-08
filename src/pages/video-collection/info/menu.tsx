import { useNavigate, useParams } from "react-router";

import { Dropdown, DropdownTrigger, Button, DropdownMenu, DropdownItem, useDisclosure } from "@heroui/react";
import {
  RiDeleteBinLine,
  RiEditLine,
  RiMoreLine,
  RiPlayListAddLine,
  RiStarLine,
  RiStarOffLine,
} from "@remixicon/react";
import { useShallow } from "zustand/react/shallow";

import { CollectionType } from "@/common/constants/collection";
import ConfirmModal from "@/components/confirm-modal";
import EditFavForm from "@/components/fav-folder/form";
import { postFavFolderDel } from "@/service/fav-folder-del";
import { postFavFolderFav } from "@/service/fav-folder-fav";
import { postFavFolderUnfav } from "@/service/fav-folder-unfav";
import { postFavSeasonFav } from "@/service/fav-season-fav";
import { postFavSeasonUnfav } from "@/service/fav-season-unfav";
import { useUser } from "@/store/user";

interface MenuProps {
  isOwn: boolean;
  type: CollectionType;
  mediaCount?: number;
  attr?: number;
  onAddToPlayList: () => void;
  afterChangeInfo: VoidFunction;
}

const Menu = ({ type, isOwn, mediaCount, attr, onAddToPlayList, afterChangeInfo }: MenuProps) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, updateUser, collectedFolder, updateCollectedFolder } = useUser(
    useShallow(state => ({
      user: state.user,
      updateUser: state.updateUser,
      collectedFolder: state.collectedFolder,
      updateCollectedFolder: state.updateCollectedFolder,
    })),
  );
  const isCollected = collectedFolder?.some(folder => folder.id === Number(id));

  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmChange,
  } = useDisclosure();

  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditChange } = useDisclosure();

  const toggleCollect = async () => {
    if (type === CollectionType.Favorite) {
      if (isCollected) {
        // 取消收藏
        const res = await postFavFolderUnfav({
          media_id: Number(id),
          platform: "web",
        });

        if (res.code === 0) {
          await updateCollectedFolder();
        }
      } else {
        // 收藏
        const res = await postFavFolderFav({
          media_id: Number(id),
          platform: "web",
        });

        if (res.code === 0) {
          await updateCollectedFolder();
        }
      }
    } else {
      if (isCollected) {
        // 取消收藏
        const res = await postFavSeasonUnfav({
          season_id: Number(id),
          platform: "web",
        });

        if (res.code === 0) {
          await updateCollectedFolder();
        }
      } else {
        // 收藏
        const res = await postFavSeasonFav({
          season_id: Number(id),
          platform: "web",
        });

        if (res.code === 0) {
          await updateCollectedFolder();
        }
      }
    }
  };

  const menus = [
    {
      key: "add-to-playlist",
      show: Boolean(mediaCount),
      startContent: <RiPlayListAddLine size={18} />,
      label: "添加到播放列表",
      onPress: onAddToPlayList,
    },
    {
      key: "toggle-collect",
      show: user?.isLogin && !isOwn,
      startContent: isCollected ? <RiStarOffLine size={18} /> : <RiStarLine size={18} />,
      label: isCollected ? "取消收藏" : "收藏",
      className: isCollected ? "text-danger" : "text-primary",
      color: isCollected ? ("danger" as const) : ("primary" as const),
      onPress: toggleCollect,
    },
    {
      key: "edit",
      show: isOwn && attr !== 0,
      startContent: <RiEditLine size={18} />,
      label: "修改信息",
      onPress: onEditOpen,
    },
    {
      key: "delete",
      show: isOwn && attr !== 0,
      startContent: <RiDeleteBinLine size={18} />,
      label: "删除",
      className: "text-danger",
      color: "danger" as const,
      onPress: onDeleteConfirmOpen,
    },
  ];

  return (
    <>
      <Dropdown
        placement="bottom-start"
        shouldBlockScroll={false}
        trigger="press"
        classNames={{
          content: "min-w-[120px]",
        }}
      >
        <DropdownTrigger>
          <Button isIconOnly>
            <RiMoreLine />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="收藏夹操作" items={menus.filter(item => item.show)}>
          {item => (
            <DropdownItem
              key={item.key}
              className={item.className}
              color={item.color}
              startContent={item.startContent}
              onPress={item.onPress}
            >
              {item.label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
      <ConfirmModal
        type="danger"
        isOpen={isDeleteConfirmOpen}
        onOpenChange={onDeleteConfirmChange}
        title="确认删除当前收藏夹吗？"
        onConfirm={async () => {
          const res = await postFavFolderDel({
            media_ids: id as string,
          });

          if (res.code === 0) {
            await updateUser();
            navigate("/empty");
          }

          return res.code === 0;
        }}
      />
      <EditFavForm mid={Number(id)} isOpen={isEditOpen} onOpenChange={onEditChange} afterSubmit={afterChangeInfo} />
    </>
  );
};

export default Menu;
