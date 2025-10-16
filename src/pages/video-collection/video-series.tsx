import { useParams } from "react-router";

import { Link } from "@heroui/react";
import { useRequest } from "ahooks";

import { CollectionType } from "@/common/constants/collection";
import { formatDuration } from "@/common/utils";
import GridList from "@/components/grid-list";
import ImageCard from "@/components/image-card";
import { getUserVideoArchivesList } from "@/service/user-video-archives-list";
import { usePlayingQueue } from "@/store/playing-queue";
import { useUser } from "@/store/user";

import Info from "./info";

const VideoSeries = () => {
  const { id } = useParams();
  const { collectedFolder } = useUser();
  const isCollected = collectedFolder?.some(item => item.id === Number(id));
  const play = usePlayingQueue(s => s.play);

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
        media_count={data?.info?.media_count}
        afterChangeInfo={refreshAsync}
      />
      <GridList
        enablePagination
        data={data?.medias ?? []}
        loading={loading}
        itemKey="bvid"
        renderItem={item => (
          <ImageCard
            showPlayIcon
            title={item.title}
            titleExtra={
              isCollected ? <div className="ml-2 text-zinc-500">{formatDuration(item.duration as number)}</div> : null
            }
            cover={item.cover}
            footer={
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
                bvid: item.bvid,
                title: item.title,
                singer: item.upper?.name,
                coverImageUrl: item.cover,
              })
            }
          />
        )}
      />
    </>
  );
};

export default VideoSeries;
