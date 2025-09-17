import { useEffect, useMemo, useState } from "react";

import { Card, CardBody, Image, Pagination, Skeleton } from "@heroui/react";
import { useRequest } from "ahooks";

import { getMusicHotRank, type Data as MusicHotRankItem } from "@/service/music-hot-rank";
import { usePlayingQueue } from "@/store/playing-queue";

const PAGE_SIZE = 20;

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

  const { play } = usePlayingQueue();

  useEffect(() => {
    // 数据变化时，校正当前页避免越界
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return allData.slice(start, start + PAGE_SIZE);
  }, [allData, page]);

  return (
    <div className="w-full px-4 py-6">
      {/* 加载状态：骨架屏 */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: PAGE_SIZE / 2 }).map((_, idx) => (
            <Card key={idx} shadow="sm" radius="lg" className="p-0">
              <Skeleton className="aspect-square w-full rounded-none" />
              <CardBody className="space-y-2">
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : totalCount === 0 ? (
        // 空数据状态
        <div className="text-foreground-500 flex h-[40vh] items-center justify-center">暂无数据</div>
      ) : (
        // 数据列表
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
            {pagedData.map(item => (
              <Card
                key={item.id}
                shadow="sm"
                radius="lg"
                isHoverable
                isPressable
                className="transition-shadow hover:shadow-lg"
                onPress={() => {
                  play({
                    bvid: item.bvid,
                    title: item.music_title,
                    singer: item.author,
                    coverImageUrl: item.cover,
                    currentPage: 1,
                  });
                }}
              >
                <Image
                  removeWrapper
                  src={item.cover}
                  alt={item.music_title}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                <CardBody className="px-3 py-3">
                  <p className="truncate text-xl font-medium" title={item.music_title}>
                    {item.music_title}
                  </p>
                  <p className="text-foreground-500 mt-1 truncate text-base" title={item.author}>
                    {item.author}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* 分页器 */}
          <div className="mt-6 flex w-full justify-center">
            <Pagination size="lg" total={totalPages} page={page} onChange={setPage} showControls />
          </div>
        </>
      )}
    </div>
  );
};

export default MusicRank;
