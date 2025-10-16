import { useParams } from "react-router";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from "@heroui/react";
import { RiDeleteBinLine, RiFolderTransferLine, RiMore2Line } from "@remixicon/react";

import FavFolderSelect from "@/components/folder/select";
import { postFavResourceBatchDel } from "@/service/fav-resource-batch-del";

interface Props {
  mvId: number;
  type: number;
  refreshCollectedFolder: VoidFunction;
}

const ActionDropdown = ({ mvId, type, refreshCollectedFolder }: Props) => {
  const { id: favFolderId } = useParams();

  const {
    isOpen: isSelectFolderOpen,
    onOpen: onSelectFolderOpen,
    onOpenChange: onSelectFolderOpenChange,
  } = useDisclosure();

  const deleteFromFav = async () => {
    const result = await postFavResourceBatchDel({
      resources: `${mvId}:${type}`,
      media_id: Number(favFolderId),
      platform: "web",
    });

    if (result.code === 0) {
      refreshCollectedFolder();
    }
  };

  return (
    <>
      <div className="relative h-6 w-5 shrink-0">
        <Dropdown disableAnimation placement="bottom-end" classNames={{ content: "min-w-[140px]" }}>
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="light"
              radius="full"
              size="sm"
              className="absolute -top-[4px] -right-[12px] text-zinc-300"
            >
              <RiMore2Line size={16} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="收藏夹视频操作">
            <DropdownItem key="move" startContent={<RiFolderTransferLine size={16} />} onPress={onSelectFolderOpen}>
              修改收藏夹
            </DropdownItem>
            <DropdownItem
              key="del"
              color="danger"
              className="text-danger"
              startContent={<RiDeleteBinLine size={16} />}
              onPress={deleteFromFav}
            >
              取消收藏
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <FavFolderSelect
        title="修改收藏夹"
        rid={String(mvId)}
        isOpen={isSelectFolderOpen}
        onOpenChange={onSelectFolderOpenChange}
        afterSubmit={favFolderIds => {
          if (!favFolderIds.includes(Number(favFolderId))) {
            refreshCollectedFolder();
          }
        }}
      />
    </>
  );
};

export default ActionDropdown;
