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
  RiLogoutCircleLine,
  RiPlayCircleLine,
  RiPlayListAddLine,
  RiStarOffLine,
  RiTeamLine,
} from "@remixicon/react";

import { CollectionType } from "@/common/constants/collection";
import { bbpTracksToPlayItems } from "@/common/utils/bbp-track";
import { getAllFavMedia } from "@/common/utils/fav";
import { type ContextMenuItem } from "@/components/context-menu";
import MenuGroup from "@/components/menu/menu-group";
import SortableMenuItem from "@/layout/side/collection/sortable-menu-item";
import { postFavFolderDel } from "@/service/fav-folder-del";
import { postFavFolderUnfav } from "@/service/fav-folder-unfav";
import { getUserVideoArchivesList } from "@/service/user-video-archives-list";
import { useBBPPlaylistStore } from "@/store/bbp-playlist";
import { useBBPTokenStore } from "@/store/bbp-token";
import { getItemKey, useFavoritesStore, type FavoriteItem } from "@/store/favorite";
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
  bbpId?: string;
  title: string;
  href: string;
  cover?: string;
  coverBadge?: boolean;
  className?: string;
  type?: number;
  mid?: number;
  source: "bilibili" | "bbplayer";
  role?: "owner" | "editor" | "subscriber";
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

  const bbpOwnerContextMenus = useMemo<ContextMenuItem[]>(
    () => [
      { key: "play", label: "播放", icon: <RiPlayCircleLine size={20} /> },
      { key: "add-to-playlist", label: "添加到播放列表", icon: <RiPlayListAddLine size={18} /> },
      { key: "edit", label: "修改", icon: <RiEdit2Line size={18} /> },
      { key: "manage-members", label: "管理成员", icon: <RiTeamLine size={18} /> },
      { key: "hide", label: "隐藏", icon: <RiEyeOffLine size={18} /> },
      {
        key: "leave",
        label: "退出歌单",
        icon: <RiLogoutCircleLine size={18} />,
        color: "danger",
        className: "text-danger",
      },
    ],
    [],
  );

  const bbpEditorContextMenus = useMemo<ContextMenuItem[]>(
    () => [
      { key: "play", label: "播放", icon: <RiPlayCircleLine size={20} /> },
      { key: "add-to-playlist", label: "添加到播放列表", icon: <RiPlayListAddLine size={18} /> },
      { key: "edit", label: "修改", icon: <RiEdit2Line size={18} /> },
      { key: "hide", label: "隐藏", icon: <RiEyeOffLine size={18} /> },
      {
        key: "leave",
        label: "退出歌单",
        icon: <RiLogoutCircleLine size={18} />,
        color: "danger",
        className: "text-danger",
      },
    ],
    [],
  );

  const bbpSubscriberContextMenus = useMemo<ContextMenuItem[]>(
    () => [
      { key: "play", label: "播放", icon: <RiPlayCircleLine size={20} /> },
      { key: "add-to-playlist", label: "添加到播放列表", icon: <RiPlayListAddLine size={18} /> },
      { key: "hide", label: "隐藏", icon: <RiEyeOffLine size={18} /> },
      {
        key: "leave",
        label: "退出歌单",
        icon: <RiLogoutCircleLine size={18} />,
        color: "danger",
        className: "text-danger",
      },
    ],
    [],
  );

  const filteredCollectedFavorites = collectedFavorites.filter(item => !hiddenMenuKeys.includes(getItemKey(item)));
  const filteredCreatedFavorites = createdFavorites.filter(item => !hiddenMenuKeys.includes(getItemKey(item)));
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

  const bbpToken = useBBPTokenStore(state => state.token);

  useEffect(() => {
    if (user?.mid) {
      updateCreatedFavorites(user.mid);
      updateCollectedFavorites(user.mid);
    } else if (bbpToken) {
      updateCreatedFavorites("");
      updateCollectedFavorites("");
    }
  }, [updateCreatedFavorites, updateCollectedFavorites, user?.mid, bbpToken]);

  const handlePlayFavorite = useCallback(async (item: FavoriteItem) => {
    try {
      if (item.source === "bbplayer" && item.bbpId) {
        const bbpStore = useBBPPlaylistStore.getState();
        let tracks = bbpStore.getCachedTracks(item.bbpId);
        if (!tracks.length) {
          await bbpStore.syncPlaylist(item.bbpId);
          tracks = bbpStore.getCachedTracks(item.bbpId);
        }
        if (!tracks.length) {
          addToast({ title: item.title ? `「${item.title}」暂无可播放内容` : "暂无可播放内容", color: "warning" });
          return;
        }
        const playItems = bbpTracksToPlayItems(tracks);
        await usePlayList.getState().playList(playItems);
        return;
      }

      const medias = await getAllFavMedia({ id: String(item.id) });

      if (!medias.length) {
        addToast({ title: item.title ? `「${item.title}」暂无可播放内容` : "暂无可播放内容", color: "warning" });
        return;
      }

      await usePlayList.getState().playList(medias);
    } catch (error) {
      addToast({ title: "播放收藏夹失败", color: "danger" });
      console.error(error);
    }
  }, []);

  const handleAddFavoriteToPlaylist = useCallback(async (item: FavoriteItem) => {
    try {
      if (item.source === "bbplayer" && item.bbpId) {
        const bbpStore = useBBPPlaylistStore.getState();
        let tracks = bbpStore.getCachedTracks(item.bbpId);
        if (!tracks.length) {
          await bbpStore.syncPlaylist(item.bbpId);
          tracks = bbpStore.getCachedTracks(item.bbpId);
        }
        if (!tracks.length) {
          addToast({ title: item.title ? `「${item.title}」暂无可播放内容` : "暂无可播放内容", color: "warning" });
          return;
        }
        const playItems = bbpTracksToPlayItems(tracks);
        usePlayList.getState().addList(playItems);
        addToast({ title: `已添加${item.title ? `「${item.title}」` : "歌单"}到播放列表`, color: "success" });
        return;
      }

      const medias = await getAllFavMedia({ id: String(item.id) });

      if (!medias.length) {
        addToast({ title: item.title ? `「${item.title}」暂无可播放内容` : "暂无可播放内容", color: "warning" });
        return;
      }

      usePlayList.getState().addList(medias);
      addToast({ title: `已添加${item.title ? `「${item.title}」` : "收藏夹"}到播放列表`, color: "success" });
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
            if (favorite.source === "bbplayer" && favorite.bbpId) {
              await useBBPPlaylistStore.getState().deletePlaylist(favorite.bbpId);
              rmCreatedFavorite(getItemKey(favorite));
              addToast({ title: "删除成功", color: "success" });
              return true;
            }

            const res = await postFavFolderDel({ media_ids: String(favorite.id) });

            if (res.code === 0 && res.data === 0) {
              rmCreatedFavorite(getItemKey(favorite));
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
            if (favorite.source === "bbplayer" && favorite.bbpId) {
              await useBBPPlaylistStore.getState().leavePlaylist(favorite.bbpId);
              rmCollectedFavorite(getItemKey(favorite));
              addToast({ title: "已退出歌单", color: "success" });
              return true;
            }

            const res = await postFavFolderUnfav({ media_id: favorite.id, platform: "web" });

            if (res.code === 0) {
              rmCollectedFavorite(getItemKey(favorite));
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

  const handleLeaveBBPPlaylist = useCallback(
    (favorite: FavoriteItem) => {
      onOpenConfirmModal({
        title: favorite.title ? `确认退出歌单「${favorite.title}」吗？` : "确认退出该歌单吗？",
        type: "danger",
        onConfirm: async () => {
          try {
            if (!favorite.bbpId) return false;
            await useBBPPlaylistStore.getState().leavePlaylist(favorite.bbpId);
            rmCollectedFavorite(getItemKey(favorite));
            if (favorite.role === "owner") {
              rmCreatedFavorite(getItemKey(favorite));
            }
            addToast({ title: "已退出歌单", color: "success" });
            return true;
          } catch {
            addToast({ title: "退出歌单失败", color: "danger" });
            return false;
          }
        },
      });
    },
    [onOpenConfirmModal, rmCollectedFavorite, rmCreatedFavorite],
  );

  const handleCreatedMenuAction = useCallback(
    async (action: string, item: FavoriteItem) => {
      switch (action) {
        case "play":
          await handlePlayFavorite(item);
          break;
        case "add-to-playlist":
          await handleAddFavoriteToPlaylist(item);
          break;
        case "edit":
          if (item.source === "bbplayer") {
            // BBPlayer 共享歌单编辑暂不支持从侧边栏打开，后续迭代
            addToast({ title: "请在歌单详情页编辑", color: "warning" });
          } else {
            onOpenEditFavorite?.(Number(item.id));
          }
          break;
        case "manage-members":
          if (item.bbpId) {
            // 后续迭代
            addToast({ title: "请在歌单详情页管理成员", color: "warning" });
          }
          break;
        case "hide":
          handleHideMenu(getItemKey(item));
          break;
        case "delete":
          handleDeleteFavorite(item);
          break;
        case "leave":
          handleLeaveBBPPlaylist(item);
          break;
        default:
          break;
      }
    },
    [
      handleAddFavoriteToPlaylist,
      handleDeleteFavorite,
      handleHideMenu,
      handleLeaveBBPPlaylist,
      handlePlayFavorite,
      onOpenEditFavorite,
    ],
  );

  const handleCollectedMenuAction = useCallback(
    async (action: string, item: FavoriteItem) => {
      switch (action) {
        case "play":
          if (item.source === "bbplayer") {
            await handlePlayFavorite(item);
          } else if (item.type === CollectionType.Favorite) {
            await handlePlayFavorite(item);
          } else if (item.type === CollectionType.VideoCollections) {
            await handlePlaySeries(item.id);
          } else {
            addToast({ title: "无法识别收藏夹类型", color: "warning" });
          }
          break;
        case "add-to-playlist":
          if (item.source === "bbplayer") {
            await handleAddFavoriteToPlaylist(item);
          } else if (item.type === CollectionType.Favorite) {
            await handleAddFavoriteToPlaylist(item);
          } else if (item.type === CollectionType.VideoCollections) {
            await handleAddSeriesToPlaylist(item.id);
          } else {
            addToast({ title: "无法识别收藏夹类型", color: "warning" });
          }
          break;
        case "edit":
          if (item.source === "bbplayer") {
            addToast({ title: "请在歌单详情页编辑", color: "warning" });
          } else {
            onOpenEditFavorite?.(Number(item.id));
          }
          break;
        case "manage-members":
          if (item.bbpId) {
            addToast({ title: "请在歌单详情页管理成员", color: "warning" });
          }
          break;
        case "hide":
          handleHideMenu(getItemKey(item));
          break;
        case "unfavorite":
          handleUnfavoriteFavorite(item);
          break;
        case "leave":
          handleLeaveBBPPlaylist(item);
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
      handleLeaveBBPPlaylist,
      onOpenEditFavorite,
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

    reorderCreatedFavorites(String(active.id), String(over.id));
  };

  const handleCollectedDragEnd = (event: DragEndEvent) => {
    if (isCollapsed || collectedFolded) {
      return;
    }

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    reorderCollectedFavorites(String(active.id), String(over.id));
  };

  const renderFavoriteGroup = ({
    title,
    items,
    isFolded,
    onToggleFolded,
    titleExtra,
    isDragEnabled: isGroupDragEnabled,
    onDragEnd,
    getContextMenus,
    onContextMenuAction,
  }: {
    title: string;
    items: CollectionMenuItem[];
    isFolded: boolean;
    onToggleFolded: () => void;
    titleExtra?: ReactNode;
    isDragEnabled: boolean;
    onDragEnd: (event: DragEndEvent) => void;
    getContextMenus: (item: CollectionMenuItem) => ContextMenuItem[];
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
          <span className="whitespace-nowrap">{title}</span>
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
          items={items as unknown as React.ComponentProps<typeof MenuGroup>["items"]}
          collapsed={isCollapsed}
          renderItem={item => {
            const menuItem = item as unknown as CollectionMenuItem;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id: _id, ...menuItemRest } = menuItem;
            return (
              <SortableMenuItem
                key={getItemKey(menuItem)}
                id={getItemKey(menuItem)}
                collapsed={isCollapsed}
                disabled={!isGroupDragEnabled}
                contextMenuItems={getContextMenus(menuItem)}
                onContextMenuAction={action => onContextMenuAction(action, menuItem)}
                {...menuItemRest}
              />
            );
          }}
        />
      </>
    );

    if (!isGroupDragEnabled) {
      return group;
    }

    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
        <SortableContext items={items.map(item => getItemKey(item))} strategy={verticalListSortingStrategy}>
          {group}
        </SortableContext>
      </DndContext>
    );
  };

  const renderCreatedGroup = () => {
    const hasBiliUser = Boolean(user?.isLogin);
    const hasBBP = Boolean(bbpToken);

    if (!hasBiliUser && !hasBBP) {
      return null;
    }

    const items = filteredCreatedFavorites.map(item => {
      const isBBP = item.source === "bbplayer";
      return {
        id: item.id,
        bbpId: item.bbpId,
        title: item.title,
        href: isBBP
          ? `/collection/${item.bbpId}?source=bbplayer&role=${item.role ?? "owner"}`
          : `/collection/${item.id}?mid=${item?.mid}`,
        cover: item.cover,
        coverBadge: isBBP,
        type: item.type,
        mid: item.mid,
        source: item.source,
        role: item.role,
      };
    });

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
      getContextMenus: item => {
        if (item.source === "bbplayer") {
          return item.role === "owner" ? bbpOwnerContextMenus : bbpEditorContextMenus;
        }
        return createdContextMenus;
      },
      onContextMenuAction: (action, item) =>
        handleCreatedMenuAction(action, {
          id: item.id,
          bbpId: item.bbpId,
          title: item.title,
          source: item.source,
          role: item.role,
        }),
    });
  };

  const renderCollectedGroup = () => {
    const items = filteredCollectedFavorites.map(item => {
      const isBBP = item.source === "bbplayer";
      return {
        id: item.id,
        bbpId: item.bbpId,
        title: item.title,
        href: isBBP
          ? `/collection/${item.bbpId}?source=bbplayer&role=${item.role ?? "subscriber"}`
          : `/collection/${item.id}?type=${item.type}&mid=${item?.mid}`,
        cover: item.cover,
        coverBadge: isBBP,
        type: item.type,
        mid: item.mid,
        source: item.source,
        role: item.role,
      };
    });

    return renderFavoriteGroup({
      title: "我收藏的",
      items,
      isFolded: collectedFolded,
      onToggleFolded: handleToggleCollectedFolded,
      isDragEnabled: isCollectedDragEnabled,
      onDragEnd: handleCollectedDragEnd,
      getContextMenus: item => {
        if (item.source === "bbplayer") {
          return item.role === "editor" ? bbpEditorContextMenus : bbpSubscriberContextMenus;
        }
        return collectedContextMenus;
      },
      onContextMenuAction: (action, item) =>
        handleCollectedMenuAction(action, {
          id: item.id,
          bbpId: item.bbpId,
          title: item.title,
          type: item.type,
          source: item.source,
          role: item.role,
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
