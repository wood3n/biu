import { useState } from "react";

import { Select, SelectItem } from "@heroui/react";
import { RiCalendarLine } from "@remixicon/react";
import { useRequest } from "ahooks";

import { formatSecondsToDate } from "@/common/utils";
import { MVCard } from "@/components/mv-card";
import MVCardList from "@/components/mv-card-list";
import ScrollContainer from "@/components/scroll-container";
import { type AudioRankPeriodItem, getAudioRankAllPeriod, getAudioRankMusicList } from "@/service/audio-rank";

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

        <MVCardList
          data={periodMusicList}
          loading={loadingPeriodMusicList}
          itemKey="music_id"
          renderItem={item => (
            <MVCard
              bvid={item.mv_bvid || item.creation_bvid}
              key={item.music_id}
              title={item.music_title}
              cover={item.mv_cover}
              authorName={item.creation_nickname}
              authorId={item.creation_up}
              durationSeconds={item.creation_duration}
            />
          )}
        />
      </div>
    </ScrollContainer>
  );
};

export default Home;
