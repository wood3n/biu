import { useEffect, useMemo, useState } from "react";

import { Pagination } from "@heroui/react";
import { useRequest } from "ahooks";

import { MVCard, MVCardSkeleton } from "@/components/mv-card";
import ScrollContainer from "@/components/scroll-container";
import { getMusicHotRank, type Data as MusicHotRankItem } from "@/service/music-hot-rank";

const PAGE_SIZE = 20;

const gridClass = "grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

const MusicRank = () => {
  const { loading, data } = useRequest(async () => {
    const res = await getMusicHotRank({
      plat: 2,
      web_location: "333.1351",
    });

    return res?.data?.list || [];
  });

  // 限制最多展示100条并分页
  const allData: MusicHotRankItem[] = useMemo(() => (Array.isArray(data) ? data.slice(0, 100) : []), [data]);
  const totalCount = allData.length;

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    // 数据变化时，校正当前页避免越界
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return allData.slice(start, start + PAGE_SIZE);
  }, [allData, page]);

  return (
    <ScrollContainer>
      <div className="w-full px-4 py-6">
        {/* 加载状态：骨架屏 */}
        {loading ? (
          <div className={gridClass}>
            {Array.from({ length: PAGE_SIZE / 2 }).map((_, idx) => (
              <MVCardSkeleton key={idx} />
            ))}
          </div>
        ) : totalCount === 0 ? (
          // 空数据状态
          <div className="text-foreground-500 flex h-[40vh] items-center justify-center">暂无数据</div>
        ) : (
          // 数据列表
          <>
            <div className={gridClass}>
              {pagedData.map(item => (
                <MVCard
                  key={item.id}
                  bvid={item.bvid}
                  title={item.music_title}
                  cover={item.cover}
                  coverHeight={200}
                  authorName={item.author}
                />
              ))}
            </div>

            {/* 分页器 */}
            <div className="mt-6 flex w-full justify-center">
              <Pagination size="lg" total={totalPages} page={page} onChange={setPage} showControls />
            </div>
          </>
        )}
      </div>
    </ScrollContainer>
  );
};

export default MusicRank;
