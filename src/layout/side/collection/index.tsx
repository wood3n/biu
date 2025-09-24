import { Button, Tooltip, useDisclosure } from "@heroui/react";
import { RiAddLine } from "@remixicon/react";

import CreateFolderForm from "@/components/folder/form";
import ScrollContainer from "@/components/scroll-container";
import { useUser } from "@/store/user";

import FolderItem from "./item";

const Collection = () => {
  const { ownFolder, otherFolder } = useUser();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="min-h-0 flex-grow">
      <ScrollContainer className="px-2" style={{ height: "100%" }}>
        {Boolean(ownFolder?.length) && (
          <>
            <div className="flex items-center justify-between p-2 text-sm text-zinc-500">
              <span>我创建的</span>
              <Tooltip closeDelay={0} content="新建收藏夹">
                <Button isIconOnly variant="light" size="sm" className="h-auto w-auto min-w-auto p-1" onPress={onOpen}>
                  <RiAddLine size={16} />
                </Button>
              </Tooltip>
            </div>
            <div className="flex flex-col space-y-1">
              {ownFolder.map(item => (
                <FolderItem editable key={item.id} title={item.title} mid={item.id} />
              ))}
            </div>
          </>
        )}

        {Boolean(otherFolder?.length) && (
          <>
            <div className="p-2 text-sm text-zinc-500">我收藏的</div>
            <div className="flex flex-col space-y-1">
              {otherFolder.map(item => (
                <FolderItem key={item.id} title={item.title} mid={item.id} cover={item.cover} />
              ))}
            </div>
          </>
        )}
      </ScrollContainer>
      <CreateFolderForm isOpen={isOpen} onOpenChange={onOpenChange} />
    </div>
  );
};

export default Collection;
