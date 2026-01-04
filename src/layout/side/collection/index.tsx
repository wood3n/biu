import { useEffect } from "react";

import { Button, Tooltip } from "@heroui/react";
import { RiAddLine } from "@remixicon/react";

import MenuGroup from "@/components/menu/menu-group";
import { useFavoritesStore } from "@/store/favorite";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

interface Props {
  isCollapsed?: boolean;
  onOpenAddFavorite?: () => void;
}

const Collection = ({ isCollapsed, onOpenAddFavorite }: Props) => {
  const user = useUser(state => state.user);
  const createdFavorites = useFavoritesStore(state => state.createdFavorites);
  const collectedFavorites = useFavoritesStore(state => state.collectedFavorites);
  const updateCreatedFavorites = useFavoritesStore(state => state.updateCreatedFavorites);
  const updateCollectedFavorites = useFavoritesStore(state => state.updateCollectedFavorites);
  const hiddenMenuKeys = useSettings(state => state.hiddenMenuKeys);

  const filteredCollectedFavorites = collectedFavorites.filter(item => !hiddenMenuKeys.includes(String(item.id)));

  useEffect(() => {
    if (!user?.mid) {
      return;
    }

    updateCreatedFavorites(user.mid);
    updateCollectedFavorites(user.mid);
  }, [updateCreatedFavorites, updateCollectedFavorites, user?.mid]);

  return (
    <>
      {Boolean(user?.isLogin) && (
        <MenuGroup
          title="我创建的"
          titleExtra={
            <Tooltip closeDelay={0} content="新建收藏夹">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="h-auto w-auto min-w-auto p-1"
                onPress={onOpenAddFavorite}
              >
                <RiAddLine size={16} />
              </Button>
            </Tooltip>
          }
          collapsed={isCollapsed}
          items={createdFavorites
            .filter(item => !hiddenMenuKeys.includes(String(item.id)))
            .map(item => ({
              title: item.title,
              href: `/collection/${item.id}?mid=${item?.mid}`,
              cover: item.cover,
            }))}
          itemClassName="px-2 py-1 h-auto"
        />
      )}
      {Boolean(filteredCollectedFavorites?.length) && (
        <>
          <MenuGroup
            title="我收藏的"
            items={filteredCollectedFavorites.map(item => ({
              title: item.title,
              href: `/collection/${item.id}?type=${item.type}&mid=${item?.mid}`,
              cover: item.cover,
            }))}
            itemClassName="px-2 py-1 h-auto"
            collapsed={isCollapsed}
          />
        </>
      )}
    </>
  );
};

export default Collection;
