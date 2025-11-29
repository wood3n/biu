import { useEffect, useState } from "react";

import { addToast, Button, Link, Pagination, useDisclosure } from "@heroui/react";
import { RiDeleteBinLine, RiRefreshLine } from "@remixicon/react";
import { usePagination } from "ahooks";

import { formatDuration } from "@/common/utils";
import ConfirmModal from "@/components/confirm-modal";
import GridList from "@/components/grid-list";
import MVCard from "@/components/mv-card";
import ScrollContainer from "@/components/scroll-container";
import { postHistoryToViewDel } from "@/service/history-toview-del";
import { getHistoryToViewList } from "@/service/history-toview-list";
import { usePlayQueue } from "@/store/play-queue";

const Later = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const play = usePlayQueue(s => s.play);

  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onOpenChange: onOpenChangeDelete } = useDisclosure();

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
    <>
      <ScrollContainer className="h-full w-full p-4">
        <div className="mb-4 flex items-center space-x-1">
          <h1>稍后再看</h1>
          <Button isIconOnly variant="light" size="sm" onPress={refreshAsync}>
            <RiRefreshLine size={18} />
          </Button>
        </div>
        <GridList
          loading={initialLoading}
          data={data?.list}
          itemKey="bvid"
          renderItem={item => (
            <>
              <MVCard
                bvid={item.bvid}
                aid={String(item.aid)}
                title={item.title}
                menus={[
                  {
                    key: "delete",
                    title: "删除",
                    icon: <RiDeleteBinLine size={16} />,
                    onPress: onOpenDelete,
                  },
                ]}
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
                onPress={() => play(item.bvid)}
              />
              <ConfirmModal
                isOpen={isOpenDelete}
                onOpenChange={onOpenChangeDelete}
                type="danger"
                title="确认删除吗？"
                confirmText="删除"
                onConfirm={async () => {
                  const res = await postHistoryToViewDel({
                    aid: item?.aid,
                  });

                  if (res.code === 0) {
                    addToast({
                      title: "删除成功",
                      color: "success",
                    });
                    setTimeout(() => {
                      refreshAsync?.();
                    }, 500);
                  }

                  return res.code === 0;
                }}
              />
            </>
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
    </>
  );
};

export default Later;
