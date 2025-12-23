import { Button, Tooltip, useDisclosure } from "@heroui/react";
import { RiAddLine, RiFolderLine, RiFolderOpenLine } from "@remixicon/react";

import FavoritesEditModal from "@/components/favorites-edit-modal";
import MenuGroup from "@/components/menu/menu-group";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

const Collection = () => {
  const user = useUser(state => state.user);
  const ownFolder = useUser(state => state.ownFolder);
  const collectedFolder = useUser(state => state.collectedFolder);
  const hiddenMenuKeys = useSettings(state => state.hiddenMenuKeys);
  const collectedFolderHasMore = useUser(state => state.collectedFolderHasMore);
  const collectedFolderTotal = useUser(state => state.collectedFolderTotal);
  const loadMoreCollectedFolder = useUser(state => state.loadMoreCollectedFolder);

  const filteredCollectedFolder = collectedFolder.filter(item => !hiddenMenuKeys.includes(String(item.id)));

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
          items={ownFolder
            .filter(item => !hiddenMenuKeys.includes(String(item.id)))
            .map(item => ({
              title: item.title,
              href: `/collection/${item.id}?mid=${item?.mid}`,
              icon: RiFolderLine,
              activeIcon: RiFolderOpenLine,
            }))}
        />
      )}
      {Boolean(filteredCollectedFolder?.length) && (
        <>
          <MenuGroup
            title="我收藏的"
            items={filteredCollectedFolder.map(item => ({
              title: item.title,
              href: `/collection/${item.id}?type=${item.type}&mid=${item?.mid}`,
              cover: item.cover,
              icon: RiFolderLine,
              activeIcon: RiFolderOpenLine,
            }))}
            itemClassName="pl-3"
          />
          {collectedFolderHasMore && (
            <div
              className="cursor-pointer p-2 text-center text-sm text-zinc-500 transition-colors hover:text-zinc-700"
              onClick={loadMoreCollectedFolder}
            >
              显示剩余{collectedFolderTotal - collectedFolder.length}个
            </div>
          )}
        </>
      )}
      <FavoritesEditModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
};

export default Collection;
