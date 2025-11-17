import { useNavigate, useParams } from "react-router";

import { Dropdown, DropdownTrigger, Button, DropdownMenu, DropdownItem, useDisclosure } from "@heroui/react";
import { RiDeleteBinLine, RiEditLine, RiMoreLine } from "@remixicon/react";

import ConfirmModal from "@/components/confirm-modal";
import EditFavForm from "@/components/fav-folder/form";
import { postFavFolderDel } from "@/service/fav-folder-del";
import { useUser } from "@/store/user";

interface MenuProps {
  afterChangeInfo: VoidFunction;
}

const Menu = ({ afterChangeInfo }: MenuProps) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { updateCollectedFolder } = useUser();

  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onOpenChange: onDeleteConfirmChange,
  } = useDisclosure();

  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditChange } = useDisclosure();

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
        <DropdownMenu aria-label="收藏夹操作">
          <DropdownItem key="edit" startContent={<RiEditLine size={18} />} onPress={onEditOpen}>
            修改信息
          </DropdownItem>
          <DropdownItem
            key="delete"
            startContent={<RiDeleteBinLine size={18} />}
            className="text-danger"
            color="danger"
            onPress={onDeleteConfirmOpen}
          >
            删除
          </DropdownItem>
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
            await updateCollectedFolder();
            navigate("/");
          }

          return res.code === 0;
        }}
      />
      <EditFavForm mid={Number(id)} isOpen={isEditOpen} onOpenChange={onEditChange} afterSubmit={afterChangeInfo} />
    </>
  );
};

export default Menu;
