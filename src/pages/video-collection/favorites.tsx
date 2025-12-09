import React, { useState, useEffect } from "react";
import { useParams } from "react-router";

import { addToast, Link, Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import { getFavResourceList } from "@/service/fav-resource";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import Info from "./info";

const getAllMedia = async ({ id: favFolderId, totalCount }: { id: string; totalCount: number }) => {
  const FAVORITES_PAGE_SIZE = 20;
  const allResSettled = await Promise.allSettled(
    Array.from({ length: Math.ceil(totalCount / FAVORITES_PAGE_SIZE) }, (_, i) =>
      getFavResourceList({
        media_id: String(favFolderId),
        ps: FAVORITES_PAGE_SIZE,
        pn: i + 1,
        platform: "web",
      }),
    ),
  );

  return allResSettled
    .filter(res => res.status === "fulfilled")
    .map(res => res.value)
    .filter(res => res.code === 0 && res?.data?.medias?.length)
    .flatMap(res =>
      res.data.medias
        .filter(item => item.attr === 0)
        .map(item =>
          item.type === 2
            ? {
                type: "mv" as const,
                bvid: item.bvid,
                title: item.title,
                cover: item.cover,
                ownerMid: item.upper?.mid,
                ownerName: item.upper?.name,
              }
            : {
                type: "audio" as const,
                sid: item.id,
                title: item.title,
                cover: item.cover,
                ownerMid: item.upper?.mid,
                ownerName: item.upper?.name,
              },
        ),
    );
};

/** 收藏夹详情 */
const Favorites: React.FC = () => {
  const { id: favFolderId } = useParams();
  const ownFolder = useUser(state => state.ownFolder);
  const collectedFolder = useUser(state => state.collectedFolder);
  const displayMode = useSettings(state => state.displayMode);

  const isOwn = ownFolder?.some(item => item.id === Number(favFolderId));
  const isCollected = collectedFolder?.some(item => item.id === Number(favFolderId));
  const play = usePlayList(state => state.play);
  const playList = usePlayList(state => state.playList);
  const addToPlayList = usePlayList(state => state.addList);

  // 分页模式（卡片模式）
  const {
    data,
    pagination,
    loading,
    runAsync: getPageData,
    refreshAsync,
  } = usePagination(
    async ({ current, pageSize }) => {
      const res = await getFavResourceList({
        media_id: String(favFolderId ?? ""),
        ps: pageSize,
        pn: current,
        platform: "web",
      });

      return {
        info: res?.data?.info,
        total: res?.data?.info?.media_count,
        list: res?.data?.medias ?? [],
      };
    },
    {
      ready: Boolean(favFolderId) && displayMode === "card",
      refreshDeps: [favFolderId, displayMode],
      defaultPageSize: 20,
    },
  );

  // 列表模式下的全量数据
  const [listModeData, setListModeData] = useState<any>({
    info: null,
    list: [],
  });
  const [listModeLoading, setListModeLoading] = useState(false);

  // 获取全量数据的函数
  const fetchAllData = async () => {
    if (!favFolderId) return;

    setListModeLoading(true);
    try {
      // 首先获取第一页数据，以获取总数量和基本信息
      const firstPageRes = await getFavResourceList({
        media_id: String(favFolderId),
        ps: 20,
        pn: 1,
        platform: "web",
      });

      if (firstPageRes.code === 0 && firstPageRes?.data?.info) {
        const totalCount = firstPageRes.data.info.media_count;
        const info = firstPageRes.data.info;

        if (totalCount <= 20) {
          // 如果数据量小于等于20，直接使用第一页数据
          setListModeData({
            info,
            list: firstPageRes.data.medias ?? [],
          });
        } else {
          // 否则获取所有页面数据
          const pageSize = 20;
          const totalPages = Math.ceil(totalCount / pageSize);

          const allPages = await Promise.all(
            Array.from({ length: totalPages }, (_, i) =>
              getFavResourceList({
                media_id: String(favFolderId),
                ps: pageSize,
                pn: i + 1,
                platform: "web",
              }),
            ),
          );

          // 合并所有页面的medias
          const allMedias = allPages.filter(res => res.code === 0).flatMap(res => res.data?.medias ?? []);

          setListModeData({
            info,
            list: allMedias,
          });
        }
      }
    } catch (error) {
      console.error("获取全量数据失败:", error);
      addToast({ title: "获取数据失败", color: "danger" });
    } finally {
      setListModeLoading(false);
    }
  };

  // 当displayMode切换到列表模式或favFolderId变化时，获取全量数据
  useEffect(() => {
    if (displayMode === "list" && favFolderId) {
      fetchAllData();
    }
  }, [displayMode, favFolderId]);

  // 根据当前模式获取显示数据
  const currentData = displayMode === "list" ? listModeData : data;
  const currentLoading = displayMode === "list" ? listModeLoading : loading;

  // 刷新当前模式的数据
  const handleRefresh = () => {
    if (displayMode === "list") {
      fetchAllData();
    } else {
      refreshAsync?.();
    }
  };

  const onPlayAll = async () => {
    if (!favFolderId) {
      addToast({ title: "收藏夹 ID 无效", color: "danger" });
      return;
    }

    const totalCount = currentData?.info?.media_count ?? 0;
    if (!totalCount) {
      addToast({ title: "收藏夹为空", color: "warning" });
      return;
    }

    try {
      const allMedias = await getAllMedia({
        id: favFolderId,
        totalCount,
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

  const renderMediaItem = (item: any) => (
    <MediaItem
      key={item.id}
      displayMode={displayMode}
      type={item.type === 2 ? "mv" : "audio"}
      bvid={item.bvid}
      aid={String(item.id)}
      sid={item.id}
      title={item.title}
      cover={item.cover}
      ownerName={item.upper?.name}
      ownerMid={item.upper?.mid}
      playCount={item.cnt_info.play}
      duration={item.duration as number}
      collectMenuTitle={isOwn ? "修改收藏夹" : "收藏"}
      footer={
        displayMode === "card" &&
        !isCollected && (
          <div className="text-foreground-500 flex w-full items-center justify-between text-sm">
            <Link href={`/user/${item.upper?.mid}`} className="text-foreground-500 text-sm hover:underline">
              {item.upper?.name}
            </Link>
            <span>{formatDuration(item.duration as number)}</span>
          </div>
        )
      }
      onPress={() =>
        play(
          item.type === 2
            ? {
                type: "mv",
                bvid: item.bvid,
                title: item.title,
                cover: item.cover,
                ownerName: item.upper?.name,
                ownerMid: item.upper?.mid,
              }
            : {
                type: "audio",
                sid: item.id,
                title: item.title,
                cover: item.cover,
                ownerName: item.upper?.name,
                ownerMid: item.upper?.mid,
              },
        )
      }
      onChangeFavSuccess={handleRefresh}
    />
  );

  return (
    <>
      <Info
        loading={currentLoading}
        type={CollectionType.Favorite}
        cover={currentData?.info?.cover}
        attr={currentData?.info?.attr}
        title={currentData?.info?.title}
        desc={currentData?.info?.intro}
        upMid={currentData?.info?.upper?.mid}
        upName={currentData?.info?.upper?.name}
        mediaCount={currentData?.info?.media_count}
        afterChangeInfo={handleRefresh}
        onPlayAll={onPlayAll}
        onAddToPlayList={() => addToPlayList([])}
      />
      {displayMode === "card" ? (
        <>
          <GridList data={data?.list ?? []} loading={loading} itemKey="id" renderItem={renderMediaItem} />
          {pagination.totalPage > 1 && (
            <div className="flex w-full items-center justify-center py-6">
              <Pagination
                initialPage={1}
                total={pagination.totalPage}
                page={pagination.current}
                onChange={next => getPageData({ current: next, pageSize: 20 })}
              />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-2">{(listModeData?.list ?? []).map(renderMediaItem)}</div>
      )}
    </>
  );
};

export default Favorites;
