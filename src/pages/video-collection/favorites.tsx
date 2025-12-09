import React, { useCallback, useEffect, useRef, useState } from "react";
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

const LIST_PAGE_SIZE = 20;

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

  // 列表模式：无限下拉分页
  const [listModeData, setListModeData] = useState<{ info: any; list: any[] }>({ info: null, list: [] });
  const [listModeLoading, setListModeLoading] = useState(false);
  const [listModePage, setListModePage] = useState(1);
  const [listModeHasMore, setListModeHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchListPage = useCallback(
    async (page: number, { reset = false } = {}) => {
      if (!favFolderId) return;

      setListModeLoading(true);
      try {
        const res = await getFavResourceList({
          media_id: String(favFolderId),
          ps: LIST_PAGE_SIZE,
          pn: page,
          platform: "web",
        });

        if (res.code === 0 && res.data) {
          const medias = res.data.medias ?? [];

          setListModeData(prev => {
            const baseInfo = res.data?.info ?? prev.info;
            const baseList = reset || page === 1 ? [] : (prev.list ?? []);
            const mergedList = [...baseList, ...medias];
            const totalCount = res.data?.info?.media_count ?? baseInfo?.media_count ?? mergedList.length;
            const nextHasMore =
              typeof res.data?.has_more === "boolean" ? res.data.has_more : mergedList.length < totalCount;
            setListModeHasMore(nextHasMore);
            return { info: baseInfo, list: mergedList };
          });

          setListModePage(page);
        } else {
          setListModeHasMore(false);
        }
      } catch (error) {
        console.error("获取列表数据失败:", error);
        addToast({ title: "获取数据失败", color: "danger" });
      } finally {
        setListModeLoading(false);
      }
    },
    [favFolderId],
  );

  // 切换到列表模式或收藏夹变化时重置并拉取第一页
  useEffect(() => {
    if (displayMode === "list" && favFolderId) {
      setListModeData({ info: null, list: [] });
      setListModePage(1);
      setListModeHasMore(true);
      fetchListPage(1, { reset: true });
    }
  }, [displayMode, favFolderId, fetchListPage]);

  // 监听列表底部元素实现下拉加载
  useEffect(() => {
    if (displayMode !== "list") return;

    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting && listModeHasMore && !listModeLoading) {
          fetchListPage(listModePage + 1);
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 },
    );

    const target = loadMoreRef.current;
    if (target) observer.observe(target);

    return () => observer.disconnect();
  }, [displayMode, fetchListPage, listModeHasMore, listModeLoading, listModePage]);

  // 根据当前模式获取显示数据
  const currentData = displayMode === "list" ? listModeData : data;
  const currentLoading = displayMode === "list" ? listModeLoading : loading;

  // 刷新当前模式的数据
  const handleRefresh = () => {
    if (displayMode === "list") {
      setListModeHasMore(true);
      fetchListPage(1, { reset: true });
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
        <div className="space-y-2">
          {(listModeData?.list ?? []).map(renderMediaItem)}
          <div ref={loadMoreRef} className="h-10" />
          {listModeLoading && <div className="text-foreground-500 py-2 text-center text-sm">加载中...</div>}
          {!listModeHasMore && !listModeLoading && (
            <div className="text-foreground-500 py-2 text-center text-sm">没有更多了</div>
          )}
        </div>
      )}
    </>
  );
};

export default Favorites;
