import { useNavigate, useParams } from "react-router";

import { Button, Image } from "@heroui/react";
import { Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { formatSecondsToDate } from "@/common/utils";
import GridList from "@/components/grid-list";
import ImageCard from "@/components/image-card";
import { getSpaceSeasonsSeriesList } from "@/service/space-seasons-series-list";
import { useSettings } from "@/store/settings";

/** 个人空间视频合集 */
const VideoSeries = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const displayMode = useSettings(state => state.displayMode);

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

  // 渲染列表项
  const renderListItem = (item: NonNullable<typeof data>["list"][number]) => (
    <Button
      as="div"
      fullWidth
      disableAnimation
      variant="light"
      color="default"
      onPress={() => navigate(`/collection/${item.id}?type=${CollectionType.VideoSeries}`)}
      className="group flex h-auto min-h-auto w-full min-w-auto items-center justify-between space-y-2 rounded-md p-3"
    >
      <div className="m-0 flex min-w-0 flex-1 items-center">
        <div className="relative h-16 w-16 flex-none">
          <Image
            removeWrapper
            radius="md"
            src={item.cover}
            alt={item.title}
            width="100%"
            height="100%"
            className="m-0 object-cover"
          />
        </div>
        <div className="ml-3 flex min-w-0 flex-auto flex-col items-start space-y-1">
          <span className="w-full min-w-0 truncate text-base">{item.title}</span>
          <div className="flex w-full justify-between text-sm text-zinc-500">
            <span>{item.total}个视频</span>
            <span>{formatSecondsToDate(item.ctime)}</span>
          </div>
        </div>
      </div>
    </Button>
  );

  return (
    <>
      {displayMode === "card" ? (
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
      ) : (
        <div className="space-y-2">
          {loading ? (
            <div className="text-foreground-500 py-2 text-center text-sm">加载中...</div>
          ) : (
            (data?.list ?? []).map(item => renderListItem(item))
          )}
        </div>
      )}
      {pagination.totalPage > 1 && (
        <div className="flex w-full items-center justify-center py-4">
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
