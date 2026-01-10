import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

import { addToast, useDisclosure } from "@heroui/react";
import { useRequest } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { openBiliVideoLink } from "@/common/utils/url";
import FavoritesEditModal from "@/components/favorites-edit-modal";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { postFavFolderFav } from "@/service/fav-folder-fav";
import { getFavFolderInfo } from "@/service/fav-folder-info";
import { postFavFolderUnfav } from "@/service/fav-folder-unfav";
import { getFavResourceList, type FavMedia } from "@/service/fav-resource";
import { postFavResourceBatchDel } from "@/service/fav-resource-batch-del";
import { postFavResourceClean } from "@/service/fav-resource-clean";
import { useFavFolderItemsStore } from "@/store/fav-folder-items";
import { useFavoritesStore } from "@/store/favorite";
import { useModalStore } from "@/store/modal";
import { useMusicFavStore } from "@/store/music-fav";
import { isSame, usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import Header from "../header";
import Operations from "../operation";
import { getAllFavMedia } from "../utils";
import FavoriteGridList from "./grid-list";
import FavoriteList from "./list";

/** 收藏夹详情 TODO:加上创建的视频合集 */
const Favorites = () => {
  const { id: favFolderId } = useParams();
  const user = useUser(state => state.user);
  const addCollectedFavorite = useFavoritesStore(state => state.addCollectedFavorite);
  const rmCollectedFavorite = useFavoritesStore(state => state.rmCollectedFavorite);
  const displayMode = useSettings(state => state.displayMode);

  const playList = usePlayList(state => state.playList);
  const addToPlayList = usePlayList(state => state.addList);

  const items = useFavFolderItemsStore(state => state.items);
  const setItems = useFavFolderItemsStore(state => state.setItems);
  const appendItems = useFavFolderItemsStore(state => state.appendItems);
  const removeItem = useFavFolderItemsStore(state => state.removeItem);
  const clearItems = useFavFolderItemsStore(state => state.clearItems);

  const [keyword, setKeyword] = useState<string>("");
  const [order, setOrder] = useState("mtime");
  const [hasMore, setHasMore] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const pageRef = useRef(1);
  const scrollRef = useRef<ScrollRefObject>(null);
  const currentFavFolderIdRef = useRef(favFolderId);
  const isSwitchingFavFolderRef = useRef(false);

  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditChange } = useDisclosure();

  const {
    loading,
    data: favInfo,
    refreshAsync: refreshInfo,
    mutate: mutateInfo,
  } = useRequest(
    async () => {
      const res = await getFavFolderInfo({
        media_id: String(favFolderId ?? ""),
      });

      return res?.data;
    },
    {
      ready: Boolean(favFolderId),
      refreshDeps: [favFolderId],
      onSuccess: newData => {
        if (newData?.id) {
          useFavoritesStore.getState().modifyCreatedFavorite({
            id: newData.id,
            cover: newData.cover,
            title: newData.title,
          });
        }
      },
    },
  );

  const isFavorite = favInfo?.fav_state === 1;

  const fetchPageData = useCallback(
    async (targetPage: number): Promise<{ medias: FavMedia[]; hasMore: boolean } | null> => {
      if (!favFolderId) {
        return null;
      }

      const res = await getFavResourceList({
        media_id: favFolderId,
        ps: 20,
        pn: targetPage,
        platform: "web",
        keyword: keyword || undefined,
        order,
        tid: 0,
        type: 0,
      });

      if (!res?.data) {
        return null;
      }

      return {
        medias: res.data.medias ?? [],
        hasMore: res.data.has_more ?? false,
      };
    },
    [favFolderId, keyword, order],
  );

  const loadPage = useCallback(
    async (targetPage: number) => {
      setListLoading(true);
      try {
        const pageData = await fetchPageData(targetPage);
        if (!pageData) {
          setHasMore(false);
          return;
        }

        setHasMore(pageData.hasMore);
        if (targetPage === 1) {
          setItems(pageData.medias);
        } else {
          appendItems(pageData.medias);
        }
      } catch (error) {
        addToast({
          title: error instanceof Error ? error.message : "获取收藏夹内容失败",
          color: "danger",
        });
        setHasMore(false);
      } finally {
        setListLoading(false);
      }
    },
    [appendItems, fetchPageData, setItems],
  );

  // 统一处理数据加载：当收藏夹ID变化时重置并重新加载
  useEffect(() => {
    pageRef.current = 1;
    // 设置标志表示正在切换收藏夹
    isSwitchingFavFolderRef.current = true;
    // 重置状态
    setKeyword("");
    setOrder("mtime");
    clearItems();
    // 更新当前收藏夹ID引用
    currentFavFolderIdRef.current = favFolderId;
    // 直接使用默认值加载数据，不依赖状态更新
    const loadData = async () => {
      setListLoading(true);
      try {
        const res = await getFavResourceList({
          media_id: favFolderId,
          ps: 20,
          pn: 1,
          platform: "web",
          keyword: undefined,
          order: "mtime",
          tid: 0,
          type: 0,
        });

        if (res?.data) {
          setHasMore(res.data.has_more ?? false);
          setItems(res.data.medias ?? []);
        }
      } catch (error) {
        addToast({
          title: error instanceof Error ? error.message : "获取收藏夹内容失败",
          color: "danger",
        });
        setHasMore(false);
      } finally {
        setListLoading(false);
        // 加载完成后清除标志
        isSwitchingFavFolderRef.current = false;
      }
    };

    loadData();
  }, [clearItems, favFolderId, setItems]);

  // 当排序方式或搜索关键字变化时重新加载数据（不包括收藏夹切换时的状态重置）
  useEffect(() => {
    // 只有当pageRef.current为1、收藏夹ID没有变化且不是正在切换收藏夹时才重新加载
    // 避免在收藏夹切换时因为状态重置而触发重复请求
    if (pageRef.current === 1 && currentFavFolderIdRef.current === favFolderId && !isSwitchingFavFolderRef.current) {
      loadPage(1);
    }
  }, [order, keyword, loadPage, favFolderId]);

  const handleLoadMore = useCallback(() => {
    if (!listLoading && hasMore) {
      pageRef.current += 1;
      loadPage(pageRef.current);
    }
  }, [listLoading, hasMore, loadPage]);

  const handleRemoveItem = useCallback(
    (id: number) => {
      removeItem(id);
    },
    [removeItem],
  );

  const handleOrderChange = useCallback((order: string) => {
    setOrder(order);
    pageRef.current = 1;
  }, []);

  const handleKeywordSearch = useCallback(
    (keyword?: string) => {
      setKeyword(keyword || "");
      pageRef.current = 1;
      loadPage(1);
    },
    [loadPage],
  );

  const handleItemPress = useCallback((item: FavMedia) => {
    usePlayList.getState().play({
      type: item.type === 2 ? "mv" : "audio",
      bvid: item.type === 2 ? item.bvid : undefined,
      sid: item.type === 12 ? item.id : undefined,
      title: item.title,
      cover: item.cover,
      ownerName: item.upper?.name,
      ownerMid: item.upper?.mid,
    });
  }, []);

  const onPlayAll = async () => {
    if (!favFolderId) {
      addToast({ title: "收藏夹 ID 无效", color: "danger" });
      return;
    }

    const totalCount = favInfo?.media_count ?? 0;
    if (!totalCount) {
      addToast({ title: "收藏夹为空", color: "warning" });
      return;
    }

    try {
      const allMedias = await getAllFavMedia({
        id: favFolderId,
      });

      if (allMedias.length) {
        playList(allMedias);
      } else {
        addToast({ title: "无法获取收藏夹全部歌曲", color: "danger" });
      }
    } catch {
      addToast({ title: "获取收藏夹全部歌曲失败", color: "danger" });
    }
  };
  const addAllMedia = async () => {
    if (!favFolderId) {
      addToast({ title: "收藏夹 ID 无效", color: "danger" });
      return;
    }

    const totalCount = favInfo?.media_count ?? 0;
    if (!totalCount) {
      addToast({ title: "收藏夹为空", color: "warning" });
      return;
    }

    try {
      const allMedias = await getAllFavMedia({
        id: favFolderId,
      });

      if (allMedias.length) {
        addToPlayList(allMedias);
        addToast({ title: `已添加 ${allMedias.length} 首到播放列表`, color: "success" });
      } else {
        addToast({ title: "无法获取收藏夹全部歌曲", color: "danger" });
      }
    } catch {
      addToast({ title: "获取收藏夹全部歌曲失败", color: "danger" });
    }
  };

  const toggleFavorite = async () => {
    if (isFavorite) {
      // 取消收藏
      const res = await postFavFolderUnfav({
        media_id: Number(favFolderId),
        platform: "web",
      });

      if (res.code === 0) {
        rmCollectedFavorite(Number(favFolderId));
        await new Promise(resolve =>
          setTimeout(() => {
            refreshInfo();
            resolve(null);
          }, 500),
        );
      }
    } else {
      // 收藏
      const res = await postFavFolderFav({
        media_id: Number(favFolderId),
        platform: "web",
      });

      if (res.code === 0) {
        addCollectedFavorite({
          id: favInfo?.id as number,
          title: favInfo?.title || "未命名收藏夹",
          cover: favInfo?.cover,
          type: CollectionType.Favorite,
          mid: favInfo?.upper?.mid,
        });
        await new Promise(resolve =>
          setTimeout(() => {
            refreshInfo();
            resolve(null);
          }, 500),
        );
      }
    }
  };

  const clearInvalid = async () => {
    const res = await postFavResourceClean({
      media_id: Number(favFolderId),
    });

    if (res.code === 0) {
      await loadPage(1);
    }
  };

  const isCreatedBySelf = Boolean(favInfo?.upper) && Boolean(user?.mid) && user?.mid === favInfo?.upper?.mid;

  const handleMenuAction = useCallback(
    async (key: string, item: FavMedia) => {
      switch (key) {
        case "favorite":
          useModalStore.getState().onOpenFavSelectModal({
            rid: item.id,
            type: item.type,
            title: item.title,
            onSuccess: selectedIds => {
              if (isCreatedBySelf && !selectedIds.includes(Number(favFolderId))) {
                handleRemoveItem(item.id);
              }
            },
          });
          break;
        case "cancelFavorite":
          useModalStore.getState().onOpenConfirmModal({
            title: `确认取消收藏${item.title}？`,
            onConfirm: async () => {
              if (!favFolderId) return false;

              const res = await postFavResourceBatchDel({
                resources: `${item.id}:${item.type}`,
                media_id: favFolderId,
                platform: "web",
              });

              if (res.code === 0) {
                handleRemoveItem(item.id);
                // 当前正在播放的歌曲
                if (
                  isSame(
                    {
                      type: item.type === 2 ? "mv" : "audio",
                      bvid: item.bvid,
                      sid: item.type === 12 ? item.id : undefined,
                    },
                    usePlayList.getState().getPlayItem(),
                  )
                ) {
                  await useMusicFavStore.getState().refreshIsFav();
                }

                await new Promise(resolve =>
                  setTimeout(() => {
                    refreshInfo();
                    resolve(null);
                  }, 1000),
                );
              } else {
                addToast({ title: res.message, color: "danger" });
              }

              return res.code === 0;
            },
          });
          break;
        case "play-next":
          usePlayList.getState().addToNext({
            type: item.type === 2 ? "mv" : "audio",
            title: item.title,
            cover: item.cover,
            bvid: item.bvid,
            sid: item.id,
            ownerName: item.upper?.name,
            ownerMid: item.upper?.mid,
          });
          break;
        case "add-to-playlist":
          usePlayList.getState().addList([
            {
              type: item.type === 2 ? "mv" : "audio",
              title: item.title,
              cover: item.cover,
              bvid: item.bvid,
              sid: item.id,
              ownerName: item.upper?.name,
              ownerMid: item.upper?.mid,
            },
          ]);
          break;
        case "download-audio":
          await window.electron.addMediaDownloadTask({
            outputFileType: "audio",
            title: item.title,
            cover: item.cover,
            bvid: item.bvid,
            sid: item.type === 12 ? item.id : undefined,
          });
          addToast({
            title: "已添加下载任务",
            color: "success",
          });
          break;
        case "download-video":
          await window.electron.addMediaDownloadTask({
            outputFileType: "video",
            title: item.title,
            cover: item.cover,
            bvid: item.bvid,
          });
          addToast({
            title: "已添加下载任务",
            color: "success",
          });
          break;
        case "bililink":
          openBiliVideoLink({
            type: item.type === 2 ? "mv" : "audio",
            bvid: item.bvid,
            sid: item.type === 12 ? item.id : undefined,
          });
          break;
        default:
          break;
      }
    },
    [favFolderId, isCreatedBySelf, handleRemoveItem, refreshInfo],
  );

  return (
    <ScrollContainer enableBackToTop ref={scrollRef} resetOnChange={favFolderId} className="h-full w-full px-4 pb-6">
      <Header
        loading={loading}
        type={CollectionType.Favorite}
        cover={favInfo?.cover}
        attr={favInfo?.attr}
        title={favInfo?.title}
        desc={favInfo?.intro}
        upMid={favInfo?.upper?.mid}
        upName={favInfo?.upper?.name}
        mediaCount={favInfo?.media_count}
        onEdit={isCreatedBySelf ? onEditOpen : undefined}
      />
      <Operations
        loading={loading}
        type={CollectionType.Favorite}
        order={order}
        onOrderChange={handleOrderChange}
        onKeywordSearch={handleKeywordSearch}
        orderOptions={[
          { key: "mtime", label: "最近收藏" },
          { key: "view", label: "最多播放" },
          { key: "pubtime", label: "最近投稿" },
        ]}
        mediaCount={favInfo?.media_count}
        attr={favInfo?.attr}
        isFavorite={isFavorite}
        isCreatedBySelf={isCreatedBySelf}
        onToggleFavorite={toggleFavorite}
        onPlayAll={onPlayAll}
        onAddToPlayList={addAllMedia}
        onClearInvalid={clearInvalid}
      />

      {displayMode === "card" ? (
        <FavoriteGridList
          items={items}
          hasMore={hasMore}
          loading={listLoading}
          getScrollElement={() => (scrollRef.current?.osInstance()?.elements().viewport as HTMLElement | null) ?? null}
          onLoadMore={handleLoadMore}
          isCreatedBySelf={isCreatedBySelf}
          onMenuAction={handleMenuAction}
          onItemPress={handleItemPress}
        />
      ) : (
        <FavoriteList
          items={items}
          hasMore={hasMore}
          loading={listLoading}
          onLoadMore={handleLoadMore}
          getScrollElement={() => (scrollRef.current?.osInstance()?.elements().viewport as HTMLElement | null) ?? null}
          isCreatedBySelf={isCreatedBySelf}
          onMenuAction={handleMenuAction}
          onItemPress={handleItemPress}
        />
      )}
      <FavoritesEditModal
        mid={Number(favFolderId)}
        isOpen={isEditOpen}
        onOpenChange={onEditChange}
        onSuccess={mutateInfo}
      />
    </ScrollContainer>
  );
};

export default Favorites;
