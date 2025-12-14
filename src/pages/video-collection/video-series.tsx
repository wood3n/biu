import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";

import { Link, Pagination } from "@heroui/react";
import { useRequest } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import MediaItem from "@/components/media-item";
import { getUserVideoArchivesList } from "@/service/user-video-archives-list";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

import Info from "./info";

/** 视频合集 */
const VideoSeries = () => {
  const { id } = useParams();
  const collectedFolder = useUser(state => state.collectedFolder);

  const isCollected = collectedFolder?.some(item => item.id === Number(id));
  const displayMode = useSettings(state => state.displayMode);
  const play = usePlayList(state => state.play);
  const playList = usePlayList(state => state.playList);
  const addList = usePlayList(state => state.addList);

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, loading, refreshAsync } = useRequest(
    async () => {
      const res = await getUserVideoArchivesList({
        season_id: Number(id),
      });
      return res?.data;
    },
    {
      ready: Boolean(id),
      refreshDeps: [id],
    },
  );

  useEffect(() => {
    setPage(1);
  }, [id, displayMode]);

  const total = data?.medias?.length ?? 0;
  const totalPage = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);
  const pagedMedias = useMemo(() => {
    const medias = data?.medias ?? [];
    return medias.slice((page - 1) * pageSize, page * pageSize);
  }, [data?.medias, page, pageSize]);

  const onPlayAll = () => {
    if (Array.isArray(data?.medias)) {
      playList(
        data.medias.map(item => ({
          type: "mv",
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
          ownerMid: item.upper?.mid,
          ownerName: item.upper?.name,
        })),
      );
    }
  };

  const addToPlayList = () => {
    if (Array.isArray(data?.medias)) {
      addList(
        data.medias.map(item => ({
          type: "mv",
          bvid: item.bvid,
          title: item.title,
          cover: item.cover,
          ownerMid: item.upper?.mid,
          ownerName: item.upper?.name,
        })),
      );
    }
  };

  const renderMediaItem = (item: any) => (
    <MediaItem
      key={item.bvid}
      displayMode={displayMode}
      type="mv"
      bvid={item.bvid}
      aid={String(item.id)}
      title={item.title}
      playCount={item.cnt_info.play}
      cover={item.cover}
      ownerName={item.upper?.name}
      ownerMid={item.upper?.mid}
      duration={item.duration as number}
      footer={
        displayMode === "card" &&
        !isCollected && (
          <div className="text-foreground-500 flex w-full items-center justify-between text-sm">
            <Link href={`/user/${item.upper?.mid}`} className="text-foreground-500 text-sm hover:underline">
              {item.upper?.name}
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
          cover: item.cover,
          ownerName: item.upper?.name,
          ownerMid: item.upper?.mid,
        })
      }
    />
  );

  return (
    <>
      <Info
        loading={loading}
        type={CollectionType.VideoSeries}
        title={data?.info?.title}
        desc={data?.info?.intro}
        cover={data?.info?.cover}
        upMid={data?.info?.upper?.mid}
        upName={data?.info?.upper?.name}
        mediaCount={data?.info?.media_count}
        afterChangeInfo={refreshAsync}
        onPlayAll={onPlayAll}
        onAddToPlayList={addToPlayList}
      />
      {displayMode === "card" ? (
        <GridList data={pagedMedias} loading={loading} itemKey="bvid" renderItem={renderMediaItem} />
      ) : (
        <div className="space-y-2">{pagedMedias.map(renderMediaItem)}</div>
      )}
      {totalPage > 1 && (
        <div className="flex w-full items-center justify-center py-6">
          <Pagination initialPage={1} page={page} total={totalPage} onChange={setPage} />
        </div>
      )}
    </>
  );
};

export default VideoSeries;
