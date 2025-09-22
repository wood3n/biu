import { useState } from "react";

import { Select, SelectItem } from "@heroui/react";
import { RiCalendarLine } from "@remixicon/react";
import { useRequest } from "ahooks";

import { formatSecondsToDate } from "@/common/utils";
import { MVCard, MVCardSkeleton } from "@/components/mv-card";
import ScrollContainer from "@/components/scroll-container";
import { type AudioRankPeriodItem, getAudioRankAllPeriod, getAudioRankMusicList } from "@/service/audio-rank";

const gridClass = "grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

const Home = () => {
  const [periodId, setPeriodId] = useState<string>("");

  const { data: periodList } = useRequest(async () => {
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
    <ScrollContainer>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">音乐热榜</h1>
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
          <div className={gridClass}>
            {Array(12)
              .fill(0)
              .map((_, index) => (
                <MVCardSkeleton key={index} coverHeight={240} />
              ))}
          </div>
        ) : (
          <div className={gridClass}>
            {periodMusicList?.map(item => (
              <MVCard
                bvid={item.mv_bvid || item.creation_bvid}
                key={item.music_id}
                title={item.music_title}
                cover={item.mv_cover}
                coverHeight={220}
                authorName={item.creation_nickname}
                authorId={item.creation_up}
                durationSeconds={item.creation_duration}
              />
            ))}
          </div>
        )}
      </div>
    </ScrollContainer>
  );
};

export default Home;
