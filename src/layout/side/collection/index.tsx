import { Button, Tooltip, useDisclosure } from "@heroui/react";
import { RiAddLine, RiFolderLine, RiFolderOpenLine } from "@remixicon/react";

import CreateFolderForm from "@/components/fav-folder/form";
import { useUser } from "@/store/user";

import MenuGroup from "../menu-group";

const Collection = () => {
  const { user, ownFolder, collectedFolder } = useUser();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      {Boolean(user?.isLogin) && (
        <MenuGroup
          title="我创建的"
          titleExtra={
            <Tooltip closeDelay={0} content="新建收藏夹">
              <Button isIconOnly variant="light" size="sm" className="h-auto w-auto min-w-auto p-1" onPress={onOpen}>
                <RiAddLine size={16} />
              </Button>
            </Tooltip>
          }
          items={ownFolder.map(item => ({
            title: item.title,
            href: `/collection/${item.id}?mid=${item?.mid}`,
            icon: RiFolderLine,
            activeIcon: RiFolderOpenLine,
          }))}
        />
      )}
      {Boolean(collectedFolder?.length) && (
        <MenuGroup
          title="我收藏的"
          items={collectedFolder.map(item => ({
            title: item.title,
            href: `/collection/${item.id}?type=${item.type}&mid=${item?.mid}`,
            cover: item.cover,
            icon: RiFolderLine,
            activeIcon: RiFolderOpenLine,
          }))}
        />
      )}
      <CreateFolderForm isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export default Collection;
