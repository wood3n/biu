import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, useDisclosure } from "@heroui/react";
import { RiDeleteBinLine, RiExternalLinkLine, RiMoreFill, RiStarLine } from "@remixicon/react";

import { openBiliVideoLink } from "@/common/utils/url";
import FavFolderSelect from "@/components/fav-folder/select";
import { usePlayList, type PlayData } from "@/store/play-list";

interface Props {
  data: PlayData;
}

const Menus = ({ data }: Props) => {
  const del = usePlayList(state => state.del);
  const { isOpen, onOpenChange } = useDisclosure();

  const { onOpen: onFavOpen, isOpen: isFavOpen, onOpenChange: onFavOpenChange } = useDisclosure();

  return (
    <>
      <Dropdown
        disableAnimation
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          content: "min-w-fit",
        }}
      >
        <DropdownTrigger>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            className={`flex-none transition-opacity duration-200 ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} group-hover:pointer-events-auto group-hover:opacity-100`}
          >
            <RiMoreFill size={16} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="播放列表操作菜单">
          <DropdownItem key="favorite" startContent={<RiStarLine size={16} />} onPress={onFavOpen}>
            收藏
          </DropdownItem>
          <DropdownItem
            key="bililink"
            startContent={<RiExternalLinkLine size={16} />}
            onPress={() => {
              openBiliVideoLink(data);
            }}
          >
            在 B 站打开
          </DropdownItem>
          <DropdownItem
            key="del"
            color="danger"
            startContent={<RiDeleteBinLine size={16} />}
            onPress={() => del(data.id)}
          >
            从列表删除
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <FavFolderSelect
        title="收藏"
        rid={data?.type === "mv" ? String(data?.aid) : String(data?.sid)}
        isOpen={isFavOpen}
        onOpenChange={onFavOpenChange}
      />
    </>
  );
};

export default Menus;
