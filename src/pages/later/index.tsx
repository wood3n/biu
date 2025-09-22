import { useMemo, useState } from "react";

import { Pagination } from "@heroui/react";
import { useRequest } from "ahooks";

import { MVCard, MVCardSkeleton } from "@/components/mv-card";
import ScrollContainer from "@/components/scroll-container";
import { getHistoryToViewList } from "@/service/history-toview-list";

const PAGE_SIZE = 20;
const gridClass = "grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

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
        <div className={gridClass}>
          {Array.from({ length: 16 }).map((_, idx) => (
            <MVCardSkeleton key={idx} />
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="text-foreground-500 flex h-[40vh] items-center justify-center">暂无数据</div>
      ) : (
        <>
          <div className={gridClass}>
            {pagedData.map(item => (
              <MVCard
                key={item.bvid}
                bvid={item.bvid}
                title={item.title}
                cover={item.pic}
                coverHeight={200}
                durationSeconds={item.duration}
                authorName={item.owner?.name}
                authorId={item.owner?.mid}
              />
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
