import React from "react";

import { useRequest } from "ahooks";

import ScrollContainer from "@/components/scroll-container";
import { SongList } from "@/components/song-list";
import { getRecommendSongs } from "@/service";

const Daily = () => {
  const { data, loading } = useRequest(getRecommendSongs);

  return (
    <ScrollContainer className="p-6">
      <SongList loading={loading} songs={data?.data?.dailySongs} />
    </ScrollContainer>
  );
};

export default Daily;
