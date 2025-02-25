import { formatDuration } from "@/common/utils";
import Link from "@/components/link";
import SongBriefInfo from "@/components/song-brief-info";
import SwitchFavorite from "@/components/switch-favorite";

export const columns: ColumnsType<Song> = [
  {
    title: "#",
    key: "index",
    align: "center",
    colSpan: 1,
    render: (_, __, index) => index + 1,
  },
  {
    title: "歌曲",
    key: "song",
    align: "start",
    colSpan: 5,
    render: (_, rowData) => <SongBriefInfo coverUrl={rowData?.al?.picUrl} name={rowData?.name} ars={rowData?.ar} />,
  },
  {
    title: "专辑",
    key: "album",
    align: "start",
    colSpan: 3,
    render: (_, rowData) => (
      <Link underline="hover" className="cursor-pointer truncate text-sm" style={{ width: "calc(100% - 4px)" }} color="foreground">
        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        {/* {rowData?.al?.name} */}
      </Link>
    ),
  },
  {
    title: "时长",
    key: "duration",
    align: "center",
    colSpan: 1,
    render: (_, rowData) => <span className="text-zinc-500">{formatDuration(rowData?.dt)}</span>,
  },
  {
    title: "操作",
    key: "operations",
    align: "center",
    colSpan: 2,
    render: (_, rowData) => (
      <div className="inline-flex justify-end space-x-1">
        <SwitchFavorite id={rowData.id} />
      </div>
    ),
  },
];
