import React from "react";

import { useRequest } from "ahooks";

import { SongList } from "@/components/song-list";
import { getRecommendSongs } from "@/service";

const Daily = () => {
  const { data, loading } = useRequest(getRecommendSongs);

  return (
    <div className="p-4">
      <SongList loading={loading} songs={data?.data?.dailySongs} />
    </div>
  );
};

export default Daily;
