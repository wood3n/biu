import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router";

import { useRequest } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import GridList from "@/components/grid-list";
import { MVCard } from "@/components/mv-card";
import { getUserVideoArchivesList } from "@/service/user-video-archives-list";

import Info from "./info";

const VideoSeries = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mid = useMemo(() => Number(searchParams.get("mid")), [searchParams]);

  const { data, loading } = useRequest(
    async () => {
      const res = await getUserVideoArchivesList({
        season_id: Number(id),
      });
      return res?.data;
    },
    {
      ready: Boolean(id) && Boolean(mid),
      refreshDeps: [id, mid],
    },
  );

  return (
    <>
      <Info
        loading={loading}
        type={CollectionType.VideoSeries}
        title={data?.info?.title}
        cover={data?.info?.cover}
        upMid={data?.info?.upper?.mid}
        upName={data?.info?.upper?.name}
        media_count={data?.info?.media_count}
      />
      <GridList
        enablePagination
        data={data?.medias ?? []}
        loading={loading}
        itemKey="id"
        renderItem={item => (
          <MVCard
            bvid={item.bvid}
            title={item.title}
            cover={item.cover}
            authorName={item?.upper?.name}
            authorId={item.upper?.mid}
            durationSeconds={item.duration}
          />
        )}
      />
    </>
  );
};

export default VideoSeries;
