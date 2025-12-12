import React, { useState } from "react";
import { useParams } from "react-router";

import { addToast, Button, Input, Link, Pagination, Radio, RadioGroup } from "@heroui/react";
import { RiSearch2Line } from "@remixicon/react";
import { usePagination } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import MVCard from "@/components/mv-card";
import { getFavResourceList, type FavResourceListRequestParams } from "@/service/fav-resource";
import { usePlayList } from "@/store/play-list";
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

  const isOwn = ownFolder?.some(item => item.id === Number(favFolderId));
  const isCollected = collectedFolder?.some(item => item.id === Number(favFolderId));
  const play = usePlayList(state => state.play);
  const playList = usePlayList(state => state.playList);
  const addToPlayList = usePlayList(state => state.addList);

  // 搜索和过滤参数
  const [searchParams, setSearchParams] = useState<
    Omit<FavResourceListRequestParams, "media_id" | "ps" | "pn" | "platform">
  >({
    keyword: "",
    tid: 0,
    order: "mtime",
    type: 0,
  });

  const {
    data,
    pagination,
    loading,
    runAsync: getPageData,
    refreshAsync,
  } = usePagination(
    async ({ current, pageSize }) => {
      try {
        const res = await getFavResourceList({
          media_id: String(favFolderId ?? ""),
          ps: pageSize,
          pn: current,
          platform: "web",
          ...searchParams,
        });

        return {
          info: res?.data?.info,
          total: res?.data?.info?.media_count,
          list: res?.data?.medias ?? [],
          hasMore: res?.data?.has_more ?? false,
        };
      } catch (error) {
        addToast({
          title: error instanceof Error ? error.message : "获取收藏夹内容失败",
          color: "danger",
        });
        return {
          info: undefined,
          total: 0,
          list: [],
          hasMore: false,
        };
      }
    },
    {
      ready: Boolean(favFolderId),
      refreshDeps: [favFolderId, searchParams],
      defaultPageSize: 20,
    },
  );

  const onPlayAll = async () => {
    if (!favFolderId) {
      addToast({ title: "收藏夹 ID 无效", color: "danger" });
      return;
    }

    const totalCount = data?.info?.media_count ?? 0;
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

  const addAllMedia = async () => {
    if (!favFolderId) {
      addToast({ title: "收藏夹 ID 无效", color: "danger" });
      return;
    }

    const totalCount = data?.info?.media_count ?? 0;
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
        addToPlayList(allMedias);
      } else {
        addToast({ title: "无法获取收藏夹全部歌曲", color: "danger" });
      }
    } catch {
      addToast({ title: "获取收藏夹全部歌曲失败", color: "danger" });
    }
  };

  return (
    <>
      <Info
        loading={loading}
        type={CollectionType.Favorite}
        cover={data?.info?.cover}
        attr={data?.info?.attr}
        title={data?.info?.title}
        desc={data?.info?.intro}
        upMid={data?.info?.upper?.mid}
        upName={data?.info?.upper?.name}
        mediaCount={data?.info?.media_count}
        afterChangeInfo={refreshAsync}
        onPlayAll={onPlayAll}
        onAddToPlayList={addAllMedia}
      />

      {/* 搜索和过滤区域 */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* 搜索框 */}
        <div className="relative w-full max-w-md">
          <Input
            placeholder="搜索标题或简介..."
            value={searchParams.keyword}
            onChange={e => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
            startContent={<RiSearch2Line size={20} />}
            endContent={
              searchParams.keyword && (
                <Button variant="flat" size="sm" onPress={() => setSearchParams(prev => ({ ...prev, keyword: "" }))}>
                  清除
                </Button>
              )
            }
          />
        </div>

        {/* 排序方式 */}
        <div className="flex items-center gap-2">
          <span className="text-sm">排序：</span>
          <RadioGroup
            orientation="horizontal"
            value={searchParams.order}
            onValueChange={value => {
              setSearchParams(prev => ({ ...prev, order: value }));
            }}
          >
            <Radio value="mtime">收藏时间</Radio>
            <Radio value="view">播放量</Radio>
            <Radio value="pubtime">投稿时间</Radio>
          </RadioGroup>
        </div>
      </div>

      <GridList
        data={data?.list ?? []}
        loading={loading}
        itemKey="id"
        renderItem={item => (
          <MVCard
            type={item.type === 2 ? "mv" : "audio"}
            bvid={item.bvid}
            aid={String(item.id)}
            sid={item.id}
            title={item.title}
            cover={item.cover}
            ownerName={item.upper?.name}
            ownerMid={item.upper?.mid}
            playCount={item.cnt_info.play}
            collectMenuTitle={isOwn ? "修改收藏夹" : "收藏"}
            footer={
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
            onChangeFavSuccess={refreshAsync}
          />
        )}
      />
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
  );
};

export default Favorites;
