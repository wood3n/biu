import { useEffect, useState } from "react";

import { addToast, Button, Link, Pagination } from "@heroui/react";
import { RiDeleteBinLine, RiRefreshLine } from "@remixicon/react";
import { usePagination } from "ahooks";

import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import ScrollContainer from "@/components/scroll-container";
import { postHistoryToViewDel } from "@/service/history-toview-del";
import { getHistoryToViewList } from "@/service/history-toview-list";
import { useModalStore } from "@/store/modal";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

const Later = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const play = usePlayList(s => s.play);
  const displayMode = useSettings(state => state.displayMode);

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

  const onOpenConfirmModal = useModalStore(s => s.onOpenConfirmModal);

  const handleOpenDeleteModal = (item: any) => {
    onOpenConfirmModal({
      title: "确认删除吗？",
      confirmText: "删除",
      onConfirm: async () => {
        const res = await postHistoryToViewDel({
          aid: item.aid,
        });

        if (res.code === 0) {
          addToast({
            title: "删除成功",
            color: "success",
          });
          setTimeout(() => {
            refreshAsync();
          }, 500);
        }

        return res.code === 0;
      },
    });
  };

  const renderMediaItem = (item: any) => (
    <div className="mb-4">
      <MediaItem
        displayMode={displayMode}
        type="mv"
        bvid={item.bvid}
        aid={String(item.aid)}
        title={item.title}
        cover={item.pic}
        coverHeight={200}
        playCount={item.stat.view}
        ownerName={item.owner?.name}
        ownerMid={item.owner?.mid}
        menus={[
          {
            key: "delete",
            title: "删除",
            icon: <RiDeleteBinLine size={16} />,
            onPress: () => handleOpenDeleteModal(item),
          },
        ]}
        footer={
          displayMode === "card" && (
            <div className="text-foreground-500 flex w-full items-center justify-between text-sm">
              <Link href={`/user/${item.owner?.mid}`} className="text-foreground-500 text-sm hover:underline">
                {item.owner?.name}
              </Link>
              <span>{formatDuration(item.duration as number)}</span>
            </div>
          )
        }
        onPress={() =>
          play({
            type: "mv",
            bvid: item.bvid,
            title: item.title,
            cover: item.pic,
            ownerName: item.owner?.name,
            ownerMid: item.owner?.mid,
          })
        }
      />
    </div>
  );

  return (
    <>
      <ScrollContainer className="h-full w-full p-4">
        <div className="mb-4 flex items-center space-x-1">
          <h1>稍后再看</h1>
          <Button isIconOnly variant="light" size="sm" onPress={refreshAsync}>
            <RiRefreshLine size={18} />
          </Button>
        </div>
        {displayMode === "card" ? (
          <GridList loading={initialLoading} data={data?.list} itemKey="bvid" renderItem={renderMediaItem} />
        ) : (
          <div>{data?.list?.map((item: any) => renderMediaItem(item))}</div>
        )}
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
