import { Link } from "@heroui/react";
import { RiPulseFill } from "@remixicon/react";

import { formatDuration } from "@/common/utils";
import Collection from "@/components/collection";
import SongBriefInfo from "@/components/song-brief-info";
import SwitchFavorite from "@/components/switch-favorite";

export const columns: ColumnsType<Song> = [
  {
    title: "#",
    key: "index",
    align: "center",
    className: "text-zinc-400",
    render: ({ index, isSelected }) => (isSelected ? <RiPulseFill className="text-green-500" /> : index + 1),
  },
  {
    title: "歌曲",
    key: "song",
    align: "start",
    render: ({ rowData }) => <SongBriefInfo coverUrl={rowData?.al?.picUrl} name={rowData?.name} ars={rowData?.ar} />,
  },
  {
    title: "专辑",
    key: "album",
    align: "start",
    render: ({ rowData }) => (
      <Link underline="hover" className="cursor-pointer truncate text-sm" color="foreground">
        {rowData?.al?.name}
      </Link>
    ),
  },
  {
    title: "时长",
    key: "duration",
    align: "center",
    className: "text-sm",
    render: ({ rowData }) => <span className="text-zinc-500">{formatDuration(rowData?.dt)}</span>,
  },
  {
    title: "操作",
    key: "operations",
    align: "center",
    render: ({ rowData }) => (
      <div className="inline-flex justify-end space-x-1">
        <SwitchFavorite id={rowData.id} />
        <Collection id={rowData.id} />
      </div>
    ),
  },
];
