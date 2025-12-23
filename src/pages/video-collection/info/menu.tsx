import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { Dropdown, DropdownTrigger, Button, DropdownMenu, DropdownItem, useDisclosure } from "@heroui/react";
import {
  RiDeleteBinLine,
  RiEditLine,
  RiFileMusicLine,
  RiFileVideoLine,
  RiMoreLine,
  RiPlayListAddLine,
  RiStarLine,
  RiStarOffLine,
} from "@remixicon/react";
import { useShallow } from "zustand/react/shallow";

import { CollectionType } from "@/common/constants/collection";
import FavoritesEditModal from "@/components/favorites-edit-modal";
import { postFavFolderDel } from "@/service/fav-folder-del";
import { postFavFolderFav } from "@/service/fav-folder-fav";
import { postFavFolderUnfav } from "@/service/fav-folder-unfav";
import { postFavSeasonFav } from "@/service/fav-season-fav";
import { postFavSeasonUnfav } from "@/service/fav-season-unfav";
import { useModalStore } from "@/store/modal";
import { useUser } from "@/store/user";

import DownloadSelectModal from "./download-select-modal";

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
  const [outputFileType, setOutputFileType] = useState<MediaDownloadOutputFileType>("audio");

  const { user, updateUser, collectedFolder, updateCollectedFolder } = useUser(
    useShallow(state => ({
      user: state.user,
      updateUser: state.updateUser,
      collectedFolder: state.collectedFolder,
      updateCollectedFolder: state.updateCollectedFolder,
    })),
  );
  const isCollected = collectedFolder?.some(folder => folder.id === Number(id));

  const onOpenConfirmModal = useModalStore(s => s.onOpenConfirmModal);

  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditChange } = useDisclosure();
  const {
    isOpen: isDownloadSelectOpen,
    onOpen: onDownloadSelectOpen,
    onOpenChange: onDownloadSelectChange,
  } = useDisclosure();

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
      key: "download-audio",
      show: Boolean(mediaCount),
      startContent: <RiFileMusicLine size={18} />,
      label: "下载全部音频",
      onPress: () => {
        setOutputFileType("audio");
        onDownloadSelectOpen();
      },
    },
    {
      key: "download-video",
      show: Boolean(mediaCount),
      startContent: <RiFileVideoLine size={18} />,
      label: "下载全部视频",
      onPress: () => {
        setOutputFileType("video");
        onDownloadSelectOpen();
      },
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
      onPress: () => {
        onOpenConfirmModal({
          title: "确认删除当前收藏夹吗？",
          type: "danger",
          onConfirm: async () => {
            const res = await postFavFolderDel({
              media_ids: id as string,
            });

            if (res.code === 0) {
              await updateUser();
              navigate("/empty");
            }

            return res.code === 0;
          },
        });
      },
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
      <FavoritesEditModal
        mid={Number(id)}
        isOpen={isEditOpen}
        onOpenChange={onEditChange}
        afterSubmit={afterChangeInfo}
      />
      <DownloadSelectModal
        outputFileType={outputFileType}
        type={type}
        mediaCount={mediaCount}
        isOpen={isDownloadSelectOpen}
        onOpenChange={onDownloadSelectChange}
      />
    </>
  );
};

export default Menu;
