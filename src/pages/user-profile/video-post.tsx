import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { Pagination } from "@heroui/react";
import { usePagination } from "ahooks";

import { formatSecondsToDate } from "@/common/utils";
import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import SearchFilter from "@/components/search-filter";
import { getSpaceWbiArcSearch } from "@/service/space-wbi-arc-search";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

/** 个人投稿视频 */
const VideoPost = () => {
  const { id } = useParams();
  const play = usePlayList(s => s.play);
  const displayMode = useSettings(state => state.displayMode);
  const [keyword, setKeyword] = useState("");
  const [order, setOrder] = useState("pubdate"); // pubdate(默认), view(播放量), stow(收藏量)

  // 当用户ID变化时，重置搜索参数
  useEffect(() => {
    if (id) {
      setKeyword("");
      setOrder("pubdate");
    }
  }, [id]);

  const {
    data,
    pagination,
    loading,
    runAsync: getPageData,
  } = usePagination(
    async ({ current, pageSize }) => {
      const res = await getSpaceWbiArcSearch({
        mid: Number(id ?? ""),
        ps: pageSize,
        pn: current,
        keyword: keyword?.trim() || undefined,
        order,
      });

      return {
        total: res?.data?.page?.count ?? 0,
        list: res?.data?.list?.vlist ?? [],
      };
    },
    {
      ready: Boolean(id),
      refreshDeps: [id, keyword, order],
      defaultPageSize: 20,
    },
  );

  const renderMediaItem = (item: any) => (
    <MediaItem
      key={item.bvid}
      displayMode={displayMode}
      type="mv"
      bvid={item.bvid}
      aid={String(item.aid)}
      title={item.title}
      cover={item.pic}
      ownerName={item.author}
      ownerMid={item.mid}
      playCount={item.play}
      footer={
        displayMode === "card" && (
          <div className="flex w-full justify-between text-sm text-zinc-500">
            <span>{formatSecondsToDate(item.created)}</span>
            <span>{item.length}</span>
          </div>
        )
      }
      onPress={() =>
        play({
          type: "mv",
          bvid: item.bvid,
          title: item.title,
          cover: item.pic,
          ownerName: item.author,
          ownerMid: item.mid,
        })
      }
    />
  );

  return (
    <div>
      <SearchFilter
        keyword={keyword}
        order={order}
        placeholder="搜索视频标题..."
        searchIcon="search"
        orderOptions={[
          { value: "pubdate", label: "最新发布" },
          { value: "click", label: "最多播放" },
          { value: "stow", label: "最多收藏" },
        ]}
        onKeywordChange={setKeyword}
        onOrderChange={setOrder}
        containerClassName="mb-4 flex flex-col items-start gap-4 md:flex-row md:items-center"
      />
      {displayMode === "card" ? (
        <GridList data={data?.list ?? []} loading={loading} itemKey="bvid" renderItem={renderMediaItem} />
      ) : (
        <div className="space-y-2">{data?.list?.map(renderMediaItem)}</div>
      )}
      {pagination.totalPage > 1 && (
        <div className="flex w-full items-center justify-center py-4">
          <Pagination
            initialPage={1}
            total={pagination.totalPage}
            page={pagination.current}
            onChange={next => getPageData({ current: next, pageSize: 20 })}
          />
        </div>
      )}
    </div>
  );
};

export default VideoPost;
