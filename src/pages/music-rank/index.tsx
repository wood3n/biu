import { Button } from "@heroui/react";
import { RiPlayFill } from "@remixicon/react";
import { useRequest } from "ahooks";

import GridList from "@/components/grid-list";
import ImageCard from "@/components/image-card";
import ScrollContainer from "@/components/scroll-container";
import { getMusicHotRank } from "@/service/music-hot-rank";
import { usePlayingQueue } from "@/store/playing-queue";

const MusicRank = () => {
  const play = usePlayingQueue(s => s.play);
  const playList = usePlayingQueue(s => s.playList);

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
      <div className="mb-4">
        <Button
          color="success"
          startContent={<RiPlayFill />}
          onPress={() =>
            playList(
              data?.map(item => ({
                id: item.id,
                bvid: item.bvid,
                cid: item.cid,
                title: item.music_title,
                singer: item.author,
                coverImageUrl: item.cover,
              })) || [],
            )
          }
        >
          播放全部
        </Button>
      </div>
      <GridList
        data={data}
        loading={loading}
        skeletonCoverHeight={240}
        enablePagination
        itemKey="bvid"
        renderItem={item => (
          <ImageCard
            showPlayIcon
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
