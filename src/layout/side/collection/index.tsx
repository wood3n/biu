import { useEffect } from "react";

import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button, Tooltip } from "@heroui/react";
import { RiAddLine } from "@remixicon/react";

import MenuGroup from "@/components/menu/menu-group";
import SortableMenuItem from "@/layout/side/collection/sortable-menu-item";
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
  const reorderCreatedFavorites = useFavoritesStore(state => state.reorderCreatedFavorites);
  const reorderCollectedFavorites = useFavoritesStore(state => state.reorderCollectedFavorites);
  const hiddenMenuKeys = useSettings(state => state.hiddenMenuKeys);

  const filteredCollectedFavorites = collectedFavorites.filter(item => !hiddenMenuKeys.includes(String(item.id)));
  const filteredCreatedFavorites = createdFavorites.filter(item => !hiddenMenuKeys.includes(String(item.id)));
  const isDragEnabled = !isCollapsed;
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  useEffect(() => {
    if (!user?.mid) {
      return;
    }

    updateCreatedFavorites(user.mid);
    updateCollectedFavorites(user.mid);
  }, [updateCreatedFavorites, updateCollectedFavorites, user?.mid]);

  const handleCreatedDragEnd = (event: DragEndEvent) => {
    if (isCollapsed) {
      return;
    }

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    reorderCreatedFavorites(Number(active.id), Number(over.id));
  };

  const handleCollectedDragEnd = (event: DragEndEvent) => {
    if (isCollapsed) {
      return;
    }

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    reorderCollectedFavorites(Number(active.id), Number(over.id));
  };

  const renderCreatedGroup = () => {
    if (!user?.isLogin) {
      return null;
    }

    const items = filteredCreatedFavorites.map(item => ({
      id: item.id,
      title: item.title,
      href: `/collection/${item.id}?mid=${item?.mid}`,
      cover: item.cover,
      className: "px-2 py-1 h-auto",
    }));

    if (!items.length) {
      return null;
    }

    const group = (
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
        items={items}
        renderItem={item => (
          <SortableMenuItem
            key={item.id}
            id={item.id as number}
            collapsed={isCollapsed}
            disabled={!isDragEnabled}
            {...item}
          />
        )}
      />
    );

    if (!isDragEnabled) {
      return group;
    }

    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleCreatedDragEnd} sensors={sensors}>
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {group}
        </SortableContext>
      </DndContext>
    );
  };

  const renderCollectedGroup = () => {
    if (!filteredCollectedFavorites?.length) {
      return null;
    }

    const items = filteredCollectedFavorites.map(item => ({
      id: item.id,
      title: item.title,
      href: `/collection/${item.id}?type=${item.type}&mid=${item?.mid}`,
      cover: item.cover,
      className: "px-2 py-1 h-auto",
    }));

    const group = (
      <MenuGroup
        title="我收藏的"
        items={items}
        collapsed={isCollapsed}
        renderItem={item => (
          <SortableMenuItem
            key={item.id}
            id={item.id as number}
            collapsed={isCollapsed}
            disabled={!isDragEnabled}
            {...item}
          />
        )}
      />
    );

    if (!isDragEnabled) {
      return group;
    }

    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleCollectedDragEnd} sensors={sensors}>
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {group}
        </SortableContext>
      </DndContext>
    );
  };

  return (
    <>
      {renderCreatedGroup()}
      {renderCollectedGroup()}
    </>
  );
};

export default Collection;
