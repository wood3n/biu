import { RiTimeLine } from "@remixicon/react";

import { formatDuration } from "@/common/utils";
import Collection from "@/components/collection";
import SongBriefInfo from "@/components/song-brief-info";
import SwitchFavorite from "@/components/switch-favorite";
import { ColumnsType } from "@/components/table/types";

export const columns: ColumnsType<Song> = [
  {
    title: "歌曲",
    key: "song",
    align: "start",
    minWidth: 120,
    columnFraction: 6,
    render: ({ rowData }) => <SongBriefInfo name={rowData?.name} ars={rowData?.ar} />,
  },
  {
    title: <RiTimeLine size={16} />,
    key: "duration",
    align: "center",
    className: "text-sm",
    minWidth: 120,
    columnFraction: 1,
    render: ({ rowData }) => <span className="text-zinc-500">{formatDuration(rowData?.dt)}</span>,
  },
  {
    title: "操作",
    key: "operations",
    align: "center",
    minWidth: 120,
    columnFraction: 1,
    render: ({ rowData }) => (
      <div className="inline-flex justify-end space-x-1">
        <SwitchFavorite id={rowData.id} />
        <Collection id={rowData.id} />
      </div>
    ),
  },
];
