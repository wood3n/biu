import { useParams } from "react-router";

import { Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import { formatSecondsToDate } from "@/common/utils";
import GridList from "@/components/grid-list";
import ImageCard from "@/components/image-card";
import { getSpaceWbiArcSearch } from "@/service/space-wbi-arc-search";
import { usePlayingQueue } from "@/store/playing-queue";

const VideoPost = () => {
  const { id } = useParams();
  const play = usePlayingQueue(s => s.play);

  const {
    data,
    pagination,
    loading,
    runAsync: getPageData,
  } = usePagination(
    async ({ current, pageSize }) => {
      const res = await getSpaceWbiArcSearch({
        mid: Number(id ?? ""),
        ps: pageSize,
        pn: current,
      });

      return {
        total: res?.data?.page?.count ?? 0,
        list: res?.data?.list?.vlist ?? [],
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
            showPlayIcon
            title={item.title}
            cover={item.pic}
            footer={
              <div className="flex w-full justify-between text-sm text-zinc-500">
                <span>{formatSecondsToDate(item.created)}</span>
                <span>{item.length}</span>
              </div>
            }
            onPress={() =>
              play({
                bvid: item.bvid,
                title: item.title,
                coverImageUrl: item.pic,
                singer: item.author,
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

export default VideoPost;
