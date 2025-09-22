import { useMemo, useState } from "react";

import { Card, CardBody, Image, Pagination, Skeleton } from "@heroui/react";
import { useRequest } from "ahooks";

import { formatDuration } from "@/common/utils";
import ScrollContainer from "@/components/scroll-container";
import { getHistoryToViewList } from "@/service/history-toview-list";

const PAGE_SIZE = 20; // 每页显示 32 条

const Later = () => {
  const [page, setPage] = useState(1);

  const { data, loading } = useRequest(async () => {
    const res = await getHistoryToViewList();
    return res?.data?.list || [];
  });

  const totalCount = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const pagedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return data?.slice(start, start + PAGE_SIZE) || [];
  }, [data, page]);

  return (
    <ScrollContainer className="w-full px-4 py-6">
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 16 }).map((_, idx) => (
            <Card key={idx} shadow="sm" radius="lg" className="p-0">
              <Skeleton className="aspect-video w-full rounded-none" />
              <CardBody className="space-y-2">
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="text-foreground-500 flex h-[40vh] items-center justify-center">暂无数据</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {pagedData.map(item => (
              <Card
                key={item.bvid || item.aid}
                shadow="sm"
                radius="lg"
                isHoverable
                isPressable
                className="transition-shadow hover:shadow-lg"
              >
                <div className="relative">
                  <Image
                    removeWrapper
                    src={item.pic}
                    alt={item.title}
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                  <span className="absolute right-2 bottom-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                    {formatDuration(item.duration, false)}
                  </span>
                </div>
                <CardBody className="px-3 py-3">
                  <p className="truncate text-xl font-medium" title={item.title}>
                    {item.title}
                  </p>
                  <p className="text-foreground-500 mt-1 truncate text-base" title={item.owner?.name}>
                    {item.owner?.name}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex w-full justify-center">
            <Pagination size="lg" total={totalPages} page={page} onChange={setPage} showControls />
          </div>
        </>
      )}
    </ScrollContainer>
  );
};

export default Later;
