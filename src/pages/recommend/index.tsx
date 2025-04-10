import React from "react";

import { useRequest } from "ahooks";

import ScrollContainer from "@/components/scroll-container";
import { getRecommendSongs } from "@/service";

import Daily from "./daily";

/** 推荐 */
const Recommend = () => {
  const { data: dailyRecommend, loading } = useRequest(getRecommendSongs);

  return (
    <ScrollContainer className="p-6">
      <Daily songs={dailyRecommend?.data?.dailySongs} />
    </ScrollContainer>
  );
};

export default Recommend;
