import React from "react";
import { useParams } from "react-router";

import { addToast, Link, Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import MVCard from "@/components/mv-card";
import { getFavResourceList } from "@/service/fav-resource";
import { usePlayQueue } from "@/store/play-queue";
import { useUser } from "@/store/user";

import Info from "./info";

/** 收藏夹详情 */
const Favorites: React.FC = () => {
  const { id: favFolderId } = useParams();
  const { ownFolder, collectedFolder } = useUser();
  const isOwn = ownFolder?.some(item => item.id === Number(favFolderId));
  const isCollected = collectedFolder?.some(item => item.id === Number(favFolderId));
  const playMV = usePlayQueue(s => s.play);
  const playList = usePlayQueue(s => s.playList);

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
      ready: Boolean(favFolderId),
      refreshDeps: [favFolderId],
      defaultPageSize: 20,
    },
  );

  const onPlayAll = async () => {
    const totalCount = data?.info?.media_count ?? 0;
    if (!totalCount) {
      addToast({ title: "收藏夹为空", color: "warning" });
      return;
    }

    try {
      const pageSize = 20;
      const allRes = await Promise.all(
        Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) =>
          getFavResourceList({
            media_id: String(favFolderId ?? ""),
            ps: pageSize,
            pn: i + 1,
            platform: "web",
          }),
        ),
      );

      const allMedias = allRes
        .filter(res => res.code === 0 && res?.data?.medias?.length)
        .flatMap(res =>
          res.data.medias
            .filter(item => item.attr === 0) // 过滤失效稿件
            .map(item => ({
              bvid: item.bvid,
              title: item.title,
              cover: item.cover,
              ownerMid: item.upper?.mid,
              ownerName: item.upper?.name,
            })),
        );

      if (allMedias.length) {
        playList(allMedias);
      } else {
        addToast({ title: "无法获取收藏夹全部歌曲", color: "danger" });
      }
    } catch (error) {
      console.error("[Favorites] 获取收藏夹全部歌曲失败:", error);
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
      />
      <GridList
        data={data?.list ?? []}
        loading={loading}
        itemKey="id"
        renderItem={item => (
          <MVCard
            bvid={item.bvid}
            aid={String(item.id)}
            title={item.title}
            cover={item.cover}
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
            onPress={() => playMV(item.bvid)}
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
