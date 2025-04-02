import clx from "classnames";
import { Link } from "@heroui/react";

import { formatDuration } from "@/common/utils";
import { usePlayingQueue } from "@/store/playing-queue";

import If from "../if";
import SongBriefInfo from "../song-brief-info";

interface Props {
  index: number;
  data?: Song;
  list?: Song[];
  hideAlbum?: boolean;
  rowHeight?: number;
}

const Row = ({ index, data, list, rowHeight = 60, hideAlbum }: Props) => {
  const { currentSong, play, playList } = usePlayingQueue();
  const isPlaying = currentSong?.id === data?.id;

  return (
    <div
      className={clx(`flex w-full cursor-pointer gap-2 rounded-lg px-6 py-2`, {
        "bg-mid-green text-green-500": isPlaying,
        "hover:bg-zinc-800": !isPlaying,
      })}
      onDoubleClick={() => play(data as Song, list)}
      style={{
        height: rowHeight,
      }}
    >
      <div className="flex w-12 items-center justify-center p-2 text-sm text-zinc-500">{index + 1}</div>
      <div className="flex flex-[5] items-center p-2">
        <SongBriefInfo coverUrl={data?.al?.picUrl} name={data?.name as string} ars={data?.ar} />
      </div>
      <If condition={!hideAlbum}>
        <div className="flex flex-[4] items-center p-2">
          <Link underline="hover" href={`/album/${data?.al?.id}`} className="inline-block cursor-pointer truncate text-sm" color="foreground">
            {data?.al?.name || "-"}
          </Link>
        </div>
      </If>
      <div className="flex w-[100px] items-center justify-center p-2 text-sm text-zinc-500">{data?.dt ? formatDuration(data.dt) : "-"}</div>
    </div>
  );
};

export default Row;
