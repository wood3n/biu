import { useNavigate, useParams } from "react-router";

import { Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { formatSecondsToDate } from "@/common/utils";
import GridList from "@/components/grid-list";
import ImageCard from "@/components/image-card";
import { getSpaceSeasonsSeriesList } from "@/service/space-seasons-series-list";

/** 个人空间视频合集 */
const VideoSeries = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data,
    pagination,
    loading,
    runAsync: getPageData,
  } = usePagination(
    async ({ current, pageSize }) => {
      const res = await getSpaceSeasonsSeriesList({
        mid: Number(id ?? ""),
        page_size: pageSize,
        page_num: current,
        web_location: "0.0",
      });

      const seasonsList =
        res?.data?.items_lists?.seasons_list?.map(item => ({
          id: item.meta?.season_id,
          title: item.meta.name,
          cover: item.meta.cover,
          ctime: item.meta.ptime,
          total: item.meta.total,
        })) ?? [];
      const seriesList =
        res?.data?.items_lists?.series_list?.map(item => ({
          id: item.meta?.series_id,
          title: item.meta.name,
          cover: item.meta.cover,
          total: item.meta.total,
          ctime: item.meta.ctime,
        })) ?? [];

      return {
        total: res?.data?.items_lists?.page?.total ?? 0,
        list: [...seasonsList, ...seriesList],
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
            title={item?.title}
            imageUrl={item?.cover}
            onPress={() => navigate(`/collection/${item.id}?type=${CollectionType.VideoSeries}`)}
            footer={
              <div className="flex w-full justify-between text-sm text-zinc-500">
                <span>{formatSecondsToDate(item.ctime)}</span>
                <span>{item.total}个视频</span>
              </div>
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

export default VideoSeries;
