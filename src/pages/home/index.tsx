import { useState } from "react";

import { Card, CardBody, CardHeader, Skeleton, Image as Img, CardFooter, Select, SelectItem } from "@heroui/react";
import { RiCalendarLine } from "@remixicon/react";
import { useRequest } from "ahooks";

import { formatSecondsToDate } from "@/common/utils";
import {
  type AudioRankPeriodItem,
  getAudioRankAllPeriod,
  getAudioRankDetail,
  getAudioRankMusicList,
} from "@/service/audio-rank";
import { usePlayingQueue } from "@/store/playing-queue";

const Home = () => {
  const [periodId, setPeriodId] = useState<string>("");
  const { play } = usePlayingQueue();

  const { loading: loadingPeriodList, data: periodList } = useRequest(async () => {
    const res = await getAudioRankAllPeriod({
      list_type: 1,
    });

    if (res?.data?.list) {
      const periods = Object.values(res?.data?.list)
        .flat()
        .toSorted((a, b) => b.priod - a.priod);
      setPeriodId(String(periods[0].ID));
      return periods;
    }
  });

  const { loading: loadingPeriodData, data: periodData } = useRequest(
    () =>
      getAudioRankDetail({
        list_id: periodId,
      }),
    {
      ready: Boolean(periodId),
      refreshDeps: [periodId],
    },
  );

  const { loading: loadingPeriodMusicList, data: periodMusicList } = useRequest(
    async () => {
      const res = await getAudioRankMusicList({
        list_id: periodId,
      });

      return res?.data?.list;
    },
    {
      ready: Boolean(periodId),
      refreshDeps: [periodId],
    },
  );

  return (
    <div className="px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="mb-6 text-2xl font-bold">音频热榜</h1>
        {Boolean(periodList?.length) && (
          <Select
            isVirtualized
            selectionMode="single"
            selectedKeys={new Set([periodId])}
            onSelectionChange={keys => {
              setPeriodId(String([...keys]?.[0]));
            }}
            startContent={<RiCalendarLine size={20} />}
            selectorIcon={<>{null}</>}
            className="w-[220px]"
            listboxProps={{
              variant: "flat",
              color: "primary",
            }}
          >
            {(periodList as AudioRankPeriodItem[])?.map(item => (
              <SelectItem key={String(item.ID)}>
                {`第 ${item.priod} 期 ${formatSecondsToDate(item.publish_time)}`}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>
      {loadingPeriodMusicList ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array(12)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="w-full">
                <CardHeader className="flex-col items-start px-4">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                  <Skeleton className="h-40 w-full rounded-xl" />
                </CardBody>
              </Card>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {periodMusicList?.map(item => (
            <Card
              key={item.music_id}
              isPressable
              isHoverable
              isFooterBlurred
              onPress={() =>
                play({
                  bvid: item.mv_bvid || item.creation_bvid,
                  title: item.music_title,
                  singer: item.singer,
                  coverImageUrl: item.mv_cover,
                  upMid: item.creation_up,
                  upName: item.creation_nickname,
                  currentPage: 1,
                })
              }
            >
              <Img removeWrapper alt={item.music_title} src={item.mv_cover} />
              <CardFooter className="absolute bottom-0 z-10 flex flex-col items-stretch space-y-1 border-t-1 border-zinc-100/50 bg-white/30 py-1 text-start">
                <h3 className="w-full truncate text-xl font-medium text-black">{item.music_title}</h3>
                <p className="text-tiny w-full truncate text-black">{item.singer}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
