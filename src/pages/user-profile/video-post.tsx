import { useParams } from "react-router";

import { Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import GridList from "@/components/grid-list";
import { MVCard } from "@/components/mv-card";
import { getSpaceWbiArcSearch } from "@/service/space-wbi-arc-search";

const VideoPost = () => {
  const { id } = useParams();

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
          <MVCard bvid={item.bvid} title={item.title} cover={item.pic} authorName={item?.author} authorId={item?.mid} />
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
