import React, { useRef } from "react";
import { useParams } from "react-router";

import { Alert, Button, Card, CardBody, Image, Skeleton, Spinner, addToast } from "@heroui/react";
import { useInfiniteScroll } from "ahooks";

import { formatDuration } from "@/common/utils";
import ScrollContainer, { type ScrollRefObject } from "@/components/scroll-container";
import { getFavResourceList, type FavMedia } from "@/service/fav-resource";

const PAGE_SIZE = 20;

const Folder: React.FC = () => {
  const { id } = useParams();

  const scrollerRef = useRef<ScrollRefObject>(null);

  // 使用 useInfiniteScroll 管理分页数据与加载状态
  const { data, error, loading, loadingMore, /* loadMore,*/ reload, noMore } = useInfiniteScroll(
    async (currentData?: { list: FavMedia[]; hasMore?: boolean; page?: number }) => {
      const nextPage = (currentData?.page ?? 0) + 1;

      const res = await getFavResourceList({
        media_id: String(id ?? ""),
        ps: PAGE_SIZE,
        pn: nextPage,
        platform: "web",
      });

      return {
        info: res?.data?.info,
        list: res?.data?.medias ?? [],
        hasMore: !!res?.data?.has_more,
        page: nextPage,
      };
    },
    {
      target: () => scrollerRef.current?.osInstance()?.elements().viewport as HTMLElement | null,
      threshold: 100,
      isNoMore: d => (d ? !d.hasMore : false),
      reloadDeps: [id],
      onError: e => {
        const msg = (e as any)?.message || "加载失败";
        addToast({ title: msg, color: "danger" });
      },
    },
  );

  return (
    <ScrollContainer ref={scrollerRef} className="h-full w-full">
      <div className="w-full p-4">
        {!loading && <h1 className="mb-4">{data?.info?.title ?? ""}</h1>}

        {/* 错误提示（整页） */}
        {error && data?.list.length === 0 && (
          <div className="flex h-[40vh] flex-col items-center justify-center space-y-3">
            <Alert color="danger" title="加载失败">
              出错了：{String(error.message)}
            </Alert>
            <Button color="primary" onPress={reload} isLoading={loading}>
              重试
            </Button>
          </div>
        )}

        {/* 初始加载骨架屏 */}
        {loading && (
          <>
            <Skeleton className="mb-4 h-8 w-40 rounded" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, idx) => (
                <Card key={idx} shadow="sm" radius="lg" className="p-0">
                  <Skeleton className="aspect-square w-full rounded-none" style={{ height: 170 }} />
                  <CardBody className="space-y-2">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                  </CardBody>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* 数据网格 */}
        {!loading && data!.list!.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data?.list.map(item => (
              <Card key={item.id} shadow="sm" radius="lg" isHoverable className="transition-shadow hover:shadow-lg">
                <Image
                  height={170}
                  width="100%"
                  src={item.cover}
                  alt={item.title}
                  loading="lazy"
                  className="w-full object-cover"
                />
                <CardBody className="px-3 py-3">
                  <p className="truncate text-xl font-medium" title={(item as any).music_title ?? item.title}>
                    {(item as any).music_title ?? item.title}
                  </p>
                  <div className="text-foreground-500 mt-1 flex items-center justify-between space-x-2 text-sm">
                    <span className="min-w-0 truncate" title={(item as any).author ?? item?.upper?.name}>
                      {(item as any).author ?? item?.upper?.name}
                    </span>
                    <span>{formatDuration(item.duration, false)}</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* 加载更多/无更多 提示区 */}
        <div className="flex w-full items-center justify-center py-6">
          {loadingMore && (
            <div className="text-default-500 flex items-center space-x-2 text-sm">
              <Spinner size="sm" />
              <span>加载更多中...</span>
            </div>
          )}
          {noMore && <div className="text-default-400 text-sm">没有更多了</div>}
        </div>
      </div>
    </ScrollContainer>
  );
};

export default Folder;
