import React from "react";
import { useParams } from "react-router";

import { Alert, Button, Pagination, Skeleton } from "@heroui/react";
import { usePagination } from "ahooks";

import { MVCard, MVCardSkeleton } from "@/components/mv-card";
import ScrollContainer from "@/components/scroll-container";
import { getFavResourceList } from "@/service/fav-resource";

const gridClass = "grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

const Folder: React.FC = () => {
  const { id } = useParams();

  // 使用 useInfiniteScroll 管理分页数据与加载状态
  const {
    data,
    pagination,
    error,
    loading,
    refreshAsync,
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
    <ScrollContainer className="h-full w-full">
      <div className="w-full p-4">
        {!loading && <h1 className="mb-4">{data?.info?.title ?? ""}</h1>}

        {/* 错误提示（整页） */}
        {error && data?.list.length === 0 && (
          <div className="flex h-[40vh] flex-col items-center justify-center space-y-3">
            <Alert color="danger" title="加载失败">
              出错了：{String(error.message)}
            </Alert>
            <Button color="primary" onPress={refreshAsync} isLoading={loading}>
              重试
            </Button>
          </div>
        )}

        {/* 初始加载骨架屏 */}
        {loading && (
          <>
            <Skeleton className="mb-4 h-8 w-40 rounded" />
            <div className={gridClass}>
              {Array.from({ length: 10 }).map((_, idx) => (
                <MVCardSkeleton key={idx} />
              ))}
            </div>
          </>
        )}

        {/* 数据网格 */}
        {!loading && data!.list!.length > 0 && (
          <div className={gridClass}>
            {data?.list.map(item => (
              <MVCard
                key={item.id}
                bvid={item.bvid}
                title={item.title}
                cover={item.cover}
                coverHeight={200}
                authorName={item?.upper?.name}
                authorId={item.upper?.mid}
                durationSeconds={item.duration}
              />
            ))}
          </div>
        )}

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
      </div>
    </ScrollContainer>
  );
};

export default Folder;
