import { useRequest } from "ahooks";

import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import ScrollContainer from "@/components/scroll-container";
import { getMusicHotRank } from "@/service/music-hot-rank";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

const MusicRank = () => {
  const play = usePlayList(s => s.play);
  const displayMode = useSettings(state => state.displayMode);

  const { loading, data } = useRequest(async () => {
    const res = await getMusicHotRank({
      plat: 2,
      web_location: "333.1351",
    });

    return res?.data?.list || [];
  });

  const renderMediaItem = (item: any) => (
    <MediaItem
      key={item.bvid}
      displayMode={displayMode}
      type="mv"
      bvid={item.bvid}
      aid={item.aid}
      title={item.music_title}
      cover={item.cover}
      ownerName={item.author}
      playCount={item.total_vv}
      footer={
        displayMode === "card" && <div className="w-full truncate text-left text-sm text-zinc-400">{item.author}</div>
      }
      onPress={() =>
        play({
          type: "mv",
          bvid: item.bvid,
          title: item.music_title,
        })
      }
    />
  );

  return (
    <ScrollContainer className="h-full p-4">
      <h1 className="mb-4">热歌精选</h1>
      {displayMode === "card" ? (
        <GridList
          data={data}
          loading={loading}
          skeletonCoverHeight={240}
          enablePagination
          itemKey="bvid"
          renderItem={renderMediaItem}
        />
      ) : (
        <div className="space-y-2">{data?.map(renderMediaItem)}</div>
      )}
    </ScrollContainer>
  );
};

export default MusicRank;
