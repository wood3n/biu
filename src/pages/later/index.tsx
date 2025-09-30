import { useRequest } from "ahooks";

import MVCardList from "@/components/grid-list";
import { MVCard } from "@/components/mv-card";
import ScrollContainer from "@/components/scroll-container";
import { getHistoryToViewList } from "@/service/history-toview-list";

const Later = () => {
  const { data, loading } = useRequest(async () => {
    const res = await getHistoryToViewList();
    return res?.data?.list || [];
  });

  return (
    <ScrollContainer className="w-full">
      <MVCardList
        loading={loading}
        data={data}
        itemKey="bvid"
        renderItem={item => (
          <MVCard
            bvid={item.bvid}
            title={item.title}
            cover={item.pic}
            coverHeight={200}
            durationSeconds={item.duration}
            authorName={item.owner?.name}
            authorId={item.owner?.mid}
          />
        )}
        className="p-4"
      />
    </ScrollContainer>
  );
};

export default Later;
