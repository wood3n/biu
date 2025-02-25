import { formatDuration } from "@/common/utils";
import Link from "@/components/link";
import SongBriefInfo from "@/components/song-brief-info";
import SwitchFavorite from "@/components/switch-favorite";

export const renderCell = (data: Song, columnKey: string, index: number) => {
  switch (columnKey) {
    case "index":
      return index + 1;
    case "song":
      return <SongBriefInfo coverUrl={data?.al?.picUrl} name={data?.name} ars={data?.ar} />;
    case "album":
      return (
        <Link underline="hover" className="cursor-pointer truncate text-sm" style={{ width: "calc(100% - 4px)" }} color="foreground">
          xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          {/* {data?.al?.name} */}
        </Link>
        // <Link underline="hover" className="w-full cursor-pointer truncate text-sm" color="foreground">
        //   {data?.al?.name}
        // </Link>
      );
    case "duration":
      return <span className="text-zinc-500">{formatDuration(data?.dt)}</span>;
    case "operations":
      return (
        <div className="inline-flex justify-end space-x-1">
          <SwitchFavorite id={data.id} />
        </div>
      );
    default:
      return "-";
  }
};
