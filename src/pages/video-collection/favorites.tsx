import React from "react";
import { useParams } from "react-router";

import { Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import GridList from "@/components/grid-list";
import { MVCard } from "@/components/mv-card";
import { getFavResourceList } from "@/service/fav-resource";

import Info from "./info";

const Favorites: React.FC = () => {
  const { id } = useParams();

  const {
    data,
    pagination,
    loading,
    runAsync: getPageData,
  } = usePagination(
    async ({ current, pageSize }) => {
      const res = await getFavResourceList({
        media_id: String(id ?? ""),
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
      ready: Boolean(id),
      refreshDeps: [id],
      defaultPageSize: 20,
    },
  );

  return (
    <>
      <Info
        loading={loading}
        type={CollectionType.Favorite}
        cover={data?.info?.cover}
        title={data?.info?.title}
        upMid={data?.info?.upper?.mid}
        upName={data?.info?.upper?.name}
        media_count={data?.info?.media_count}
      />
      <GridList
        data={data?.list ?? []}
        loading={loading}
        itemKey="id"
        renderItem={item => (
          <MVCard
            bvid={item.bvid}
            title={item.title}
            cover={item.cover}
            authorName={item?.upper?.name}
            authorId={item.upper?.mid}
            durationSeconds={item.duration}
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
