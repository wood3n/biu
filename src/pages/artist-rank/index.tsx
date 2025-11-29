import { useMemo } from "react";
import { useNavigate } from "react-router";

import { Card, CardBody, Skeleton } from "@heroui/react";
import { useRequest } from "ahooks";

import Ellipsis from "@/components/ellipsis";
import ScrollContainer from "@/components/scroll-container";
import { getMusicianList, type Musician } from "@/service/musician-list";

const gridClass = "grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4";

const ArtistRank = () => {
  const navigate = useNavigate();

  const { loading, data, error } = useRequest(async () => {
    const famousList = await getMusicianList({ level_source: 1 });
    const newList = await getMusicianList({ level_source: 2 });

    return [...(famousList?.data?.musicians || []), ...(newList?.data?.musicians || [])];
  });

  const allMusicians: Musician[] = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const totalCount = allMusicians.length;

  if (error) {
    return <div className="flex h-[40vh] w-full items-center justify-center text-red-500">加载失败，请稍后重试</div>;
  }

  return (
    <ScrollContainer className="h-full p-4">
      <h1 className="mb-4">音乐大咖</h1>
      <div className="w-full">
        {/* 加载骨架屏 */}
        {loading ? (
          <div className={gridClass}>
            {Array.from({ length: 12 }).map((_, idx) => (
              <Card key={idx} radius="md" className="overflow-hidden">
                <Skeleton className="h-40 w-full md:h-48" />
                <CardBody className="flex flex-row items-center space-x-2 px-4 py-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3 rounded" />
                    <Skeleton className="h-4 w-5/6 rounded" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : totalCount === 0 ? (
          <div className="text-foreground-500 flex h-[40vh] items-center justify-center">暂无数据</div>
        ) : (
          <div className={gridClass}>
            {allMusicians.map(m => {
              return (
                <Card
                  key={m.id}
                  isHoverable
                  isPressable
                  shadow="sm"
                  radius="lg"
                  onPress={() => navigate(`/user/${m.uid}`)}
                >
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
                        <Ellipsis className="text-left text-sm leading-4" tooltipClassName="max-w-[200px]">
                          {m.title}
                        </Ellipsis>
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
                      <div className="min-w-0 space-y-1">
                        <div className="text-foreground text-base font-medium">
                          <span>{m.username}</span>
                        </div>
                        <p className="w-full truncate text-sm text-zinc-400">{m.desc}</p>
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
