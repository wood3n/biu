import React from "react";
import { useParams } from "react-router";

import { Alert, Button, Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import { MVCard } from "@/components/mv-card";
import MVCardList from "@/components/mv-card-list";
import ScrollContainer from "@/components/scroll-container";
import { getFavResourceList } from "@/service/fav-resource";

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
        <MVCardList
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
      </div>
    </ScrollContainer>
  );
};

export default Folder;
