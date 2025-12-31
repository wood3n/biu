import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

import { addToast } from "@heroui/react";
import { useRequest } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { postFavFolderFav } from "@/service/fav-folder-fav";
import { getFavFolderInfo } from "@/service/fav-folder-info";
import { postFavFolderUnfav } from "@/service/fav-folder-unfav";
import { getFavResourceList, type FavMedia } from "@/service/fav-resource";
import { postFavResourceBatchDel } from "@/service/fav-resource-batch-del";
import { postFavResourceClean } from "@/service/fav-resource-clean";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import Header from "../header";
import Operations from "../operation";
import { getAllFavMedia } from "../utils";
import FavoriteGridList from "./grid-list";
import FavoriteList from "./list";

/** 收藏夹详情 */
const Favorites: React.FC = () => {
  const { id: favFolderId } = useParams();
  const user = useUser(state => state.user);
  const displayMode = useSettings(state => state.displayMode);

  const playList = usePlayList(state => state.playList);
  const addToPlayList = usePlayList(state => state.addList);

  const [keyword, setKeyword] = useState<string>("");
  const [order, setOrder] = useState("mtime");

  const [items, setItems] = useState<FavMedia[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [listLoading, setListLoading] = useState(false);

  const {
    loading,
    data: favInfo,
    refreshAsync: refreshInfo,
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
    },
  );

  const scrollRef = useRef<ScrollRefObject>(null);
  const prevFavFolderIdRef = useRef<string | undefined>(favFolderId);

  const fetchData = useCallback(
    async (targetPage: number) => {
      if (!favFolderId) {
        setHasMore(false);
        return;
      }
      setListLoading(true);
      try {
        const res = await getFavResourceList({
          media_id: favFolderId,
          ps: 20,
          pn: targetPage,
          platform: "web",
          keyword: keyword || undefined, // 空字符串转为 undefined，避免 API 参数不一致
          order,
          tid: 0,
          type: 0,
        });

        if (res?.data) {
          setHasMore(res.data.has_more ?? false);
          setItems(prev => (targetPage === 1 ? (res.data.medias ?? []) : [...prev, ...(res.data.medias ?? [])]));
          setPage(targetPage);
        } else {
          setHasMore(false);
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
    [favFolderId, keyword, order],
  );

  // 当收藏夹ID变化时，重置搜索参数
  useEffect(() => {
    if (favFolderId && prevFavFolderIdRef.current !== favFolderId) {
      setKeyword("");
      setOrder("mtime");
      prevFavFolderIdRef.current = favFolderId;
    }
  }, [favFolderId]);

  // 统一处理数据加载：当 favFolderId、keyword 或 order 变化时重新加载
  useEffect(() => {
    if (!favFolderId) {
      return;
    }

    setItems([]);
    setPage(1);
    setHasMore(true);
    fetchData(1);
  }, [favFolderId, keyword, order, fetchData]);

  const handleLoadMore = useCallback(() => {
    if (!listLoading && hasMore) {
      fetchData(page + 1);
    }
  }, [listLoading, hasMore, page, fetchData]);

  const handleRemoveItem = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleKeywordSearch = useCallback((keyword?: string) => {
    setKeyword(keyword || "");
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
        await refreshInfo();
      }
    } else {
      // 收藏
      const res = await postFavFolderFav({
        media_id: Number(favFolderId),
        platform: "web",
      });

      if (res.code === 0) {
        await refreshInfo();
      }
    }
  };

  const clearInvalid = async () => {
    const res = await postFavResourceClean({
      media_id: Number(favFolderId),
    });

    if (res.code === 0) {
      await fetchData(1);
    }
  };

  const isFavorite = favInfo?.fav_state === 1;
  const isCreatedBySelf = user?.mid === favInfo?.upper?.mid;

  const handleMenuAction = useCallback(
    async (key: string, item: FavMedia) => {
      switch (key) {
        case "favorite":
          useModalStore.getState().onOpenFavSelectModal({
            rid: item.id,
            type: item.type,
            favId: favFolderId,
            title: item.title,
            afterSubmit: isFavorite => {
              if (isCreatedBySelf && !isFavorite) {
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
                await refreshInfo();
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
      }
    },
    [favFolderId, isCreatedBySelf, handleRemoveItem, refreshInfo],
  );

  return (
    <ScrollContainer ref={scrollRef} resetOnChange={favFolderId} className="h-full w-full px-4 pb-6">
      <Header
        loading={loading}
        type={CollectionType.Favorite}
        isCreatedBySelf={isCreatedBySelf}
        cover={favInfo?.cover}
        attr={favInfo?.attr}
        title={favInfo?.title}
        desc={favInfo?.intro}
        upMid={favInfo?.upper?.mid}
        upName={favInfo?.upper?.name}
        mediaCount={favInfo?.media_count}
        onRefresh={refreshInfo}
      />
      <Operations
        type={CollectionType.Favorite}
        order={order}
        onOrderChange={setOrder}
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
        />
      )}
    </ScrollContainer>
  );
};

export default Favorites;
