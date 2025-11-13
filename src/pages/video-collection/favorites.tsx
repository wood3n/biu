import React from "react";
import { useParams } from "react-router";

import { Link, Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import ImageCard from "@/components/image-card";
import { getFavResourceList } from "@/service/fav-resource";
import { usePlayingQueue } from "@/store/playing-queue";
import { useUser } from "@/store/user";

import ActionDropdown from "./action-dropdown";
import Info from "./info";

const Favorites: React.FC = () => {
  const { id: favFolderId } = useParams();
  const { user, collectedFolder } = useUser();
  const isCollected = collectedFolder?.some(item => item.id === Number(favFolderId));
  const play = usePlayingQueue(s => s.play);

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
        media_count={data?.info?.media_count}
        afterChangeInfo={refreshAsync}
      />
      <GridList
        data={data?.list ?? []}
        loading={loading}
        itemKey="id"
        renderItem={item => (
          <ImageCard
            showPlayIcon
            title={item.title}
            titleExtra={
              isCollected ? (
                <div className="ml-2 text-zinc-500">{formatDuration(item.duration as number)}</div>
              ) : data?.info?.upper?.mid === user?.mid ? (
                <ActionDropdown mvId={item.id} type={item.type} refreshCollectedFolder={refreshAsync} />
              ) : null
            }
            cover={item.cover}
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
              play({
                bvid: item.bvid,
                title: item.title,
                singer: item.upper?.name,
                coverImageUrl: item.cover,
              })
            }
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
