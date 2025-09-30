import { useNavigate, useParams } from "react-router";

import { Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { formatSecondsToDate } from "@/common/utils";
import GridList from "@/components/grid-list";
import ImageCard from "@/components/image-card";
import { getFavFolderCreatedList } from "@/service/fav-folder-created-list";

const Favorites = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data,
    pagination,
    loading,
    runAsync: getPageData,
  } = usePagination(
    async ({ current, pageSize }) => {
      const res = await getFavFolderCreatedList({
        up_mid: Number(id ?? ""),
        ps: pageSize,
        pn: current,
      });

      return {
        total: res?.data?.count ?? 0,
        list: res?.data?.list ?? [],
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
      <GridList
        data={data?.list ?? []}
        loading={loading}
        itemKey="id"
        renderItem={item => (
          <ImageCard
            title={item.title}
            cover={item.cover}
            footer={
              <div className="flex w-full justify-between text-sm text-zinc-500">
                <span>{formatSecondsToDate(item.ctime)}</span>
                <span>{item.media_count}个视频</span>
              </div>
            }
            onPress={() => navigate(`/collection/${item.id}?type=${CollectionType.Favorite}`)}
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
