import { useMemo } from "react";

import { Card, CardBody, Skeleton } from "@heroui/react";
import { useRequest } from "ahooks";

import Ellipsis from "@/components/ellipsis";
import ScrollContainer from "@/components/scroll-container";
import { getMusicianList, type Musician } from "@/service/musician-list";

const ArtistRank = () => {
  const { loading, data, error } = useRequest(async () => {
    const res = await getMusicianList({ level_source: 1 });
    return res?.data?.musicians || [];
  });

  const allMusicians: Musician[] = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const totalCount = allMusicians.length;

  if (error) {
    return <div className="flex h-[40vh] w-full items-center justify-center text-red-500">加载失败，请稍后重试</div>;
  }

  return (
    <ScrollContainer>
      <div className="w-full px-4 py-6">
        {/* 加载骨架屏 */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, idx) => (
              <Card key={idx} shadow="sm" radius="lg" className="overflow-hidden">
                <div className="relative">
                  <Skeleton className="h-40 w-full md:h-48" />
                </div>
                <CardBody className="space-y-2 px-4 py-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-5 w-2/3 rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : totalCount === 0 ? (
          <div className="text-foreground-500 flex h-[40vh] items-center justify-center">暂无数据</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {allMusicians.map(m => {
              return (
                <Card key={m.id} shadow="sm" radius="lg" className="overflow-hidden transition-shadow hover:shadow-lg">
                  {/* 封面 + 标题遮罩 */}
                  <div className="relative">
                    <img
                      src={m.cover}
                      alt={m.title || m.username}
                      className="h-40 w-full object-cover md:h-48"
                      loading="lazy"
                    />
                    {m.title ? (
                      <div className="absolute top-2 left-2 max-w-[85%] rounded bg-black/60 px-2 py-1 text-xs text-white">
                        <Ellipsis className="text-sm leading-4">{m.title}</Ellipsis>
                      </div>
                    ) : null}
                  </div>

                  {/* 头像、用户名、描述 */}
                  <CardBody className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={m.user_profile}
                        alt={m.username}
                        className="h-12 w-12 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div className="space-y-1">
                        <div className="text-foreground text-base font-medium">
                          <span>{m.username}</span>
                        </div>
                        <Ellipsis className="text-sm text-zinc-400">{m.desc}</Ellipsis>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ScrollContainer>
  );
};

export default ArtistRank;
