import { useRequest } from "ahooks";

import GridList from "@/components/grid-list";
import MVCard from "@/components/mv-card";
import ScrollContainer from "@/components/scroll-container";
import { getMusicHotRank } from "@/service/music-hot-rank";
import { usePlayingQueue } from "@/store/playing-queue";

const MusicRank = () => {
  const play = usePlayingQueue(s => s.play);

  const { loading, data } = useRequest(async () => {
    const res = await getMusicHotRank({
      plat: 2,
      web_location: "333.1351",
    });

    return res?.data?.list || [];
  });

  return (
    <ScrollContainer className="p-4">
      <h1 className="mb-4">热歌精选</h1>
      <GridList
        data={data}
        loading={loading}
        skeletonCoverHeight={240}
        enablePagination
        itemKey="bvid"
        renderItem={item => (
          <MVCard
            bvid={item.bvid}
            aid={item.aid}
            cid={item.cid}
            title={item.music_title}
            cover={item.cover}
            coverHeight={240}
            footer={<div className="w-full truncate text-left text-sm text-zinc-400">{item.author}</div>}
            onPress={() =>
              play({
                bvid: item.bvid,
                cid: item.cid,
                title: item.music_title,
                singer: item.author,
                coverImageUrl: item.cover,
              })
            }
          />
        )}
      />
    </ScrollContainer>
  );
};

export default MusicRank;
