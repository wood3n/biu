import { useRequest } from "ahooks";

import { MVCard } from "@/components/mv-card";
import MVCardList from "@/components/mv-card-list";
import ScrollContainer from "@/components/scroll-container";
import { getMusicHotRank } from "@/service/music-hot-rank";

const MusicRank = () => {
  const { loading, data } = useRequest(async () => {
    const res = await getMusicHotRank({
      plat: 2,
      web_location: "333.1351",
    });

    return res?.data?.list || [];
  });

  return (
    <ScrollContainer>
      <MVCardList
        data={data}
        loading={loading}
        enablePagination
        itemKey="bvid"
        renderItem={item => (
          <MVCard
            bvid={item.bvid}
            title={item.music_title}
            cover={item.cover}
            coverHeight={200}
            authorName={item.author}
          />
        )}
        className="p-4"
      />
    </ScrollContainer>
  );
};

export default MusicRank;
