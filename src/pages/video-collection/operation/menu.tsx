import { useState } from "react";
import { useNavigate, useParams } from "react-router";

import { Dropdown, DropdownTrigger, Button, DropdownMenu, DropdownItem, useDisclosure } from "@heroui/react";
import { RiDeleteBinLine, RiEraserLine, RiFileMusicLine, RiFileVideoLine, RiMoreLine } from "@remixicon/react";

import { CollectionType } from "@/common/constants/collection";
import { isDefaultFav } from "@/common/utils/fav";
import { postFavFolderDel } from "@/service/fav-folder-del";
import { useFavoritesStore } from "@/store/favorite";
import { useModalStore } from "@/store/modal";

import DownloadSelectModal from "../download-select-modal";

export interface MenuProps {
  type: CollectionType;
  isCreatedBySelf?: boolean;
  mediaCount?: number;
  /** 0：公开, 1：私密 */
  attr?: number;
  onClearInvalid?: () => Promise<void>;
}

const Menu = ({ type, isCreatedBySelf, mediaCount, attr, onClearInvalid }: MenuProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [outputFileType, setOutputFileType] = useState<MediaDownloadOutputFileType>("audio");

  const onOpenConfirmModal = useModalStore(s => s.onOpenConfirmModal);

  const {
    isOpen: isDownloadSelectOpen,
    onOpen: onDownloadSelectOpen,
    onOpenChange: onDownloadSelectChange,
  } = useDisclosure();

  const menus = [
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
      key: "clear-invalid",
      show: Boolean(onClearInvalid) && isCreatedBySelf,
      startContent: <RiEraserLine size={18} />,
      label: "清除失效内容",
      onPress: () => {
        onOpenConfirmModal({
          title: "确认清除失效内容吗？",
          type: "warning",
          onConfirm: async () => {
            await onClearInvalid?.();
            return true;
          },
        });
      },
    },
    {
      key: "delete",
      show: isCreatedBySelf && !isDefaultFav(attr),
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

            if (res.code === 0 && res.data === 0) {
              useFavoritesStore.getState().rmCreatedFavorite(Number(id));
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
        disableAnimation
        placement="bottom-start"
        shouldBlockScroll={false}
        trigger="press"
        classNames={{
          content: "min-w-[120px]",
        }}
      >
        <DropdownTrigger>
          <Button isIconOnly variant="flat" className="hover:text-primary">
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
