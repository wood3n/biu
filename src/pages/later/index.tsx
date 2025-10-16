import { useEffect, useState } from "react";

import { Link, Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import ImageCard from "@/components/image-card";
import ScrollContainer from "@/components/scroll-container";
import { getHistoryToViewList } from "@/service/history-toview-list";
import { usePlayingQueue } from "@/store/playing-queue";

import Action from "./action";

const Later = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const play = usePlayingQueue(s => s.play);

  const {
    data,
    error,
    pagination,
    runAsync: getData,
    refreshAsync,
  } = usePagination(
    async ({ current = 1, pageSize }) => {
      const res = await getHistoryToViewList({
        pn: current,
        ps: pageSize,
        viewed: 0,
      });
      return {
        total: res?.data?.count ?? 0,
        list: res?.data?.list ?? [],
      };
    },
    {
      defaultPageSize: 20,
      manual: true,
    },
  );

  const initData = async () => {
    try {
      setInitialLoading(true);
      await getData({ current: 1, pageSize: 20 });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <ScrollContainer className="w-full p-4">
      <h1 className="mb-4">稍后再看</h1>
      <GridList
        loading={initialLoading}
        data={data?.list}
        itemKey="bvid"
        renderItem={item => (
          <ImageCard
            showPlayIcon
            title={item.title}
            titleExtra={<Action data={item} refresh={refreshAsync} />}
            cover={item.pic}
            coverHeight={200}
            footer={
              <div className="text-foreground-500 flex w-full items-center justify-between text-sm">
                <Link href={`/user/${item.owner?.mid}`} className="text-foreground-500 text-sm hover:underline">
                  {item.owner?.name}
                </Link>
                <span>{formatDuration(item.duration as number)}</span>
              </div>
            }
            onPress={() =>
              play({
                title: item.title,
                singer: item.owner?.name,
                bvid: item.bvid,
                cid: item.cid,
                coverImageUrl: item.pic,
              })
            }
          />
        )}
      />
      {!error && pagination?.totalPage > 1 && (
        <div className="flex w-full items-center justify-center py-6">
          <Pagination
            initialPage={1}
            total={pagination?.totalPage}
            page={pagination?.current}
            onChange={next => getData({ current: next, pageSize: pagination?.pageSize })}
          />
        </div>
      )}
    </ScrollContainer>
  );
};

export default Later;
