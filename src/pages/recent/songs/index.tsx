import SongList from "@/components/song-list";
import { getRecentSongs } from "@/service/record-recent-song";

const Songs = () => {
  return (
    <SongList
      service={async () => {
        const res = await getRecentSongs();

        return {
          data: res?.data?.list?.map(item => item.data) ?? [],
          hasMore: false,
        };
      }}
    />
  );
};

export default Songs;
