import { useCallback, useEffect, useMemo, type ReactNode } from "react";

import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button, Tooltip, addToast } from "@heroui/react";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiDeleteBinLine,
  RiEdit2Line,
  RiEyeOffLine,
  RiPlayCircleLine,
  RiPlayListAddLine,
  RiStarOffLine,
} from "@remixicon/react";

import { CollectionType } from "@/common/constants/collection";
import { getAllFavMedia } from "@/common/utils/fav";
import { type ContextMenuItem } from "@/components/context-menu";
import MenuGroup from "@/components/menu/menu-group";
import SortableMenuItem from "@/layout/side/collection/sortable-menu-item";
import { postFavFolderDel } from "@/service/fav-folder-del";
import { postFavFolderUnfav } from "@/service/fav-folder-unfav";
import { getUserVideoArchivesList } from "@/service/user-video-archives-list";
import { useFavoritesStore, type FavoriteItem } from "@/store/favorite";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

interface Props {
  isCollapsed?: boolean;
  onOpenAddFavorite?: () => void;
  onOpenEditFavorite?: (id: number) => void;
}

interface CollectionMenuItem {
  id: number;
  title: string;
  href: string;
  cover?: string;
  className: string;
  type?: number;
  mid?: number;
}

const Collection = ({ isCollapsed, onOpenAddFavorite, onOpenEditFavorite }: Props) => {
  const user = useUser(state => state.user);
  const createdFavorites = useFavoritesStore(state => state.createdFavorites);
  const collectedFavorites = useFavoritesStore(state => state.collectedFavorites);
  const updateCreatedFavorites = useFavoritesStore(state => state.updateCreatedFavorites);
  const updateCollectedFavorites = useFavoritesStore(state => state.updateCollectedFavorites);
  const rmCreatedFavorite = useFavoritesStore(state => state.rmCreatedFavorite);
  const rmCollectedFavorite = useFavoritesStore(state => state.rmCollectedFavorite);
  const reorderCreatedFavorites = useFavoritesStore(state => state.reorderCreatedFavorites);
  const reorderCollectedFavorites = useFavoritesStore(state => state.reorderCollectedFavorites);
  const hiddenMenuKeys = useSettings(state => state.hiddenMenuKeys);
  const collectionFolded = useSettings(state => state.sideMenuCollectionFolded);
  const updateSettings = useSettings(state => state.update);
  const onOpenConfirmModal = useModalStore(state => state.onOpenConfirmModal);

  const createdFolded = collectionFolded?.created ?? false;
  const collectedFolded = collectionFolded?.collected ?? false;

  const handleToggleCreatedFolded = useCallback(() => {
    updateSettings({
      sideMenuCollectionFolded: {
        created: !createdFolded,
        collected: collectedFolded,
      },
    });
  }, [createdFolded, collectedFolded, updateSettings]);

  const handleToggleCollectedFolded = useCallback(() => {
    updateSettings({
      sideMenuCollectionFolded: {
        created: createdFolded,
        collected: !collectedFolded,
      },
    });
  }, [createdFolded, collectedFolded, updateSettings]);

  const createdContextMenus = useMemo<ContextMenuItem[]>(
    () => [
      { key: "play", label: "播放", icon: <RiPlayCircleLine size={20} /> },
      { key: "add-to-playlist", label: "添加到播放列表", icon: <RiPlayListAddLine size={18} /> },
      { key: "edit", label: "修改", icon: <RiEdit2Line size={18} /> },
      { key: "hide", label: "隐藏", icon: <RiEyeOffLine size={18} /> },
      { key: "delete", label: "删除", icon: <RiDeleteBinLine size={18} />, color: "danger", className: "text-danger" },
    ],
    [],
  );

  const collectedContextMenus = useMemo<ContextMenuItem[]>(
    () => [
      { key: "play", label: "播放", icon: <RiPlayCircleLine size={20} /> },
      { key: "add-to-playlist", label: "添加到播放列表", icon: <RiPlayListAddLine size={18} /> },
      { key: "hide", label: "隐藏", icon: <RiEyeOffLine size={18} /> },
      {
        key: "unfavorite",
        label: "取消收藏",
        icon: <RiStarOffLine size={18} />,
        color: "danger",
        className: "text-danger",
      },
    ],
    [],
  );

  const filteredCollectedFavorites = collectedFavorites.filter(item => !hiddenMenuKeys.includes(String(item.id)));
  const filteredCreatedFavorites = createdFavorites.filter(item => !hiddenMenuKeys.includes(String(item.id)));
  const isDragEnabled = !isCollapsed;
  const isCreatedDragEnabled = isDragEnabled && !createdFolded;
  const isCollectedDragEnabled = isDragEnabled && !collectedFolded;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (!user?.mid) {
      return;
    }

    updateCreatedFavorites(user.mid);
    updateCollectedFavorites(user.mid);
  }, [updateCreatedFavorites, updateCollectedFavorites, user?.mid]);

  const handlePlayFavorite = useCallback(async (favoriteId: number, title?: string) => {
    try {
      const medias = await getAllFavMedia({ id: String(favoriteId) });

      if (!medias.length) {
        addToast({ title: title ? `「${title}」暂无可播放内容` : "暂无可播放内容", color: "warning" });
        return;
      }

      await usePlayList.getState().playList(medias);
    } catch (error) {
      addToast({ title: "播放收藏夹失败", color: "danger" });
      console.error(error);
    }
  }, []);

  const handleAddFavoriteToPlaylist = useCallback(async (favoriteId: number, title?: string) => {
    try {
      const medias = await getAllFavMedia({ id: String(favoriteId) });

      if (!medias.length) {
        addToast({ title: title ? `「${title}」暂无可播放内容` : "暂无可播放内容", color: "warning" });
        return;
      }

      usePlayList.getState().addList(medias);
      addToast({ title: `已添加${title ? `「${title}」` : "收藏夹"}到播放列表`, color: "success" });
    } catch (error) {
      addToast({ title: "添加到播放列表失败", color: "danger" });
      console.error(error);
    }
  }, []);

  const handlePlaySeries = useCallback(async (id: number) => {
    try {
      const res = await getUserVideoArchivesList({
        season_id: Number(id),
      });

      const sortedMapped = res?.data?.medias
        ?.toSorted((a, b) => b.pubtime - a.pubtime)
        .map(item => ({
          type: "mv" as const,
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
          ownerMid: item.upper?.mid,
          ownerName: item.upper?.name,
        }));

      if (!sortedMapped?.length) {
        addToast({ title: "暂无可播放内容", color: "warning" });
        return;
      }

      await usePlayList.getState().playList(sortedMapped);
    } catch {
      addToast({ title: "播放合集失败", color: "danger" });
    }
  }, []);

  const handleAddSeriesToPlaylist = useCallback(async (id: number) => {
    try {
      const res = await getUserVideoArchivesList({
        season_id: Number(id),
      });

      const sortedMapped = res?.data?.medias
        ?.toSorted((a, b) => b.pubtime - a.pubtime)
        .map(item => ({
          type: "mv" as const,
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
          ownerMid: item.upper?.mid,
          ownerName: item.upper?.name,
        }));

      if (!sortedMapped?.length) {
        addToast({ title: "暂无可播放内容", color: "warning" });
        return;
      }

      usePlayList.getState().addList(sortedMapped);
      addToast({ title: "已添加合集到播放列表", color: "success" });
    } catch {
      addToast({ title: "添加到播放列表失败", color: "danger" });
    }
  }, []);

  const handleHideMenu = useCallback(
    (key: string) => {
      if (hiddenMenuKeys.includes(key)) {
        return;
      }

      const nextHiddenKeys = Array.from(new Set([...hiddenMenuKeys, key]));
      updateSettings({ hiddenMenuKeys: nextHiddenKeys });
      addToast({ title: "已隐藏该菜单项", color: "success" });
    },
    [hiddenMenuKeys, updateSettings],
  );

  const handleDeleteFavorite = useCallback(
    (favorite: FavoriteItem) => {
      onOpenConfirmModal({
        title: favorite.title ? `确认删除「${favorite.title}」吗？` : "确认删除该收藏夹吗？",
        type: "danger",
        onConfirm: async () => {
          try {
            const res = await postFavFolderDel({ media_ids: String(favorite.id) });

            if (res.code === 0 && res.data === 0) {
              rmCreatedFavorite(Number(favorite.id));
              addToast({ title: "删除成功", color: "success" });
              return true;
            }

            addToast({ title: res.message || "删除失败", color: "danger" });
            return false;
          } catch {
            addToast({ title: "删除失败", color: "danger" });
            return false;
          }
        },
      });
    },
    [onOpenConfirmModal, rmCreatedFavorite],
  );

  const handleUnfavoriteFavorite = useCallback(
    (favorite: FavoriteItem) => {
      onOpenConfirmModal({
        title: favorite.title ? `确认取消收藏「${favorite.title}」吗？` : "确认取消收藏吗？",
        onConfirm: async () => {
          try {
            const res = await postFavFolderUnfav({ media_id: favorite.id, platform: "web" });

            if (res.code === 0) {
              rmCollectedFavorite(Number(favorite.id));
              addToast({ title: "已取消收藏", color: "success" });
              return true;
            }

            addToast({ title: res.message || "取消收藏失败", color: "danger" });
            return false;
          } catch {
            addToast({ title: "取消收藏失败", color: "danger" });
            return false;
          }
        },
      });
    },
    [onOpenConfirmModal, rmCollectedFavorite],
  );

  const handleCreatedMenuAction = useCallback(
    async (action: string, item: FavoriteItem) => {
      switch (action) {
        case "play":
          await handlePlayFavorite(item.id, item.title);
          break;
        case "add-to-playlist":
          await handleAddFavoriteToPlaylist(item.id, item.title);
          break;
        case "edit":
          onOpenEditFavorite?.(Number(item.id));
          break;
        case "hide":
          handleHideMenu(String(item.id));
          break;
        case "delete":
          handleDeleteFavorite(item);
          break;
        default:
          break;
      }
    },
    [handleAddFavoriteToPlaylist, handleDeleteFavorite, handleHideMenu, handlePlayFavorite, onOpenEditFavorite],
  );

  const handleCollectedMenuAction = useCallback(
    async (action: string, item: FavoriteItem) => {
      switch (action) {
        case "play":
          if (item.type === CollectionType.Favorite) {
            await handlePlayFavorite(item.id, item.title);
          } else if (item.type === CollectionType.VideoSeries) {
            await handlePlaySeries(item.id);
          } else {
            addToast({ title: "无法识别收藏夹类型", color: "warning" });
          }
          break;
        case "add-to-playlist":
          if (item.type === CollectionType.Favorite) {
            await handleAddFavoriteToPlaylist(item.id, item.title);
          } else if (item.type === CollectionType.VideoSeries) {
            await handleAddSeriesToPlaylist(item.id);
          } else {
            addToast({ title: "无法识别收藏夹类型", color: "warning" });
          }
          break;
        case "hide":
          handleHideMenu(String(item.id));
          break;
        case "unfavorite":
          handleUnfavoriteFavorite(item);
          break;
        default:
          break;
      }
    },
    [
      handleAddFavoriteToPlaylist,
      handleHideMenu,
      handlePlayFavorite,
      handlePlaySeries,
      handleAddSeriesToPlaylist,
      handleUnfavoriteFavorite,
    ],
  );

  const handleCreatedDragEnd = (event: DragEndEvent) => {
    if (isCollapsed || createdFolded) {
      return;
    }

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    reorderCreatedFavorites(Number(active.id), Number(over.id));
  };

  const handleCollectedDragEnd = (event: DragEndEvent) => {
    if (isCollapsed || collectedFolded) {
      return;
    }

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    reorderCollectedFavorites(Number(active.id), Number(over.id));
  };

  const renderFavoriteGroup = ({
    title,
    items,
    isFolded,
    onToggleFolded,
    titleExtra,
    isDragEnabled: isGroupDragEnabled,
    onDragEnd,
    contextMenuItems,
    onContextMenuAction,
  }: {
    title: string;
    items: CollectionMenuItem[];
    isFolded: boolean;
    onToggleFolded: () => void;
    titleExtra?: ReactNode;
    isDragEnabled: boolean;
    onDragEnd: (event: DragEndEvent) => void;
    contextMenuItems: ContextMenuItem[];
    onContextMenuAction: (action: string, item: CollectionMenuItem) => void;
  }) => {
    if (!items.length) {
      return null;
    }

    const header = !isCollapsed ? (
      <div className="flex items-center justify-between p-2 text-sm text-zinc-500">
        <button
          type="button"
          aria-expanded={!isFolded}
          onClick={onToggleFolded}
          className="hover:text-foreground flex items-center gap-1 text-sm text-zinc-500 transition-colors"
        >
          <RiArrowDownSLine size={16} className={`transition-transform ${isFolded ? "-rotate-90" : "rotate-0"}`} />
          <span>{title}</span>
        </button>
        {titleExtra}
      </div>
    ) : null;

    if (isFolded) {
      return header;
    }

    const group = (
      <>
        {header}
        <MenuGroup
          items={items}
          collapsed={isCollapsed}
          renderItem={item => (
            <SortableMenuItem
              key={item.id}
              id={item.id}
              collapsed={isCollapsed}
              disabled={!isGroupDragEnabled}
              contextMenuItems={contextMenuItems}
              onContextMenuAction={action => onContextMenuAction(action, item)}
              {...item}
            />
          )}
        />
      </>
    );

    if (!isGroupDragEnabled) {
      return group;
    }

    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {group}
        </SortableContext>
      </DndContext>
    );
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
      type: item.type,
      mid: item.mid,
    }));

    const titleExtra = onOpenAddFavorite ? (
      <Tooltip closeDelay={0} content="新建收藏夹">
        <Button
          isIconOnly
          variant="light"
          radius="md"
          size="sm"
          className="h-auto w-auto min-w-auto p-1"
          onPress={onOpenAddFavorite}
        >
          <RiAddLine size={16} />
        </Button>
      </Tooltip>
    ) : null;

    return renderFavoriteGroup({
      title: "我创建的",
      items,
      isFolded: createdFolded,
      onToggleFolded: handleToggleCreatedFolded,
      titleExtra,
      isDragEnabled: isCreatedDragEnabled,
      onDragEnd: handleCreatedDragEnd,
      contextMenuItems: createdContextMenus,
      onContextMenuAction: (action, item) =>
        handleCreatedMenuAction(action, {
          id: item.id,
          title: item.title,
        }),
    });
  };

  const renderCollectedGroup = () => {
    const items = filteredCollectedFavorites.map(item => ({
      id: item.id,
      title: item.title,
      href: `/collection/${item.id}?type=${item.type}&mid=${item?.mid}`,
      cover: item.cover,
      className: "px-2 py-1 h-auto",
      type: item.type,
      mid: item.mid,
    }));

    return renderFavoriteGroup({
      title: "我收藏的",
      items,
      isFolded: collectedFolded,
      onToggleFolded: handleToggleCollectedFolded,
      isDragEnabled: isCollectedDragEnabled,
      onDragEnd: handleCollectedDragEnd,
      contextMenuItems: collectedContextMenus,
      onContextMenuAction: (action, item) =>
        handleCollectedMenuAction(action, {
          id: item.id,
          title: item.title,
          type: item.type,
        }),
    });
  };

  return (
    <>
      {renderCreatedGroup()}
      {renderCollectedGroup()}
    </>
  );
};

export default Collection;
