import { Link } from "@heroui/react";
import { RiPulseFill, RiTimeLine } from "@remixicon/react";

import { formatDuration } from "@/common/utils";
import Collection from "@/components/collection";
import SongBriefInfo from "@/components/song-brief-info";
import SwitchFavorite from "@/components/switch-favorite";
import { ColumnsType } from "@/components/table/types";

interface Params {
  hideAlbum?: boolean;
}

export const getColumns = ({ hideAlbum }: Params) => {
  const columns: ColumnsType<Song> = [
    {
      title: "#",
      key: "index",
      align: "center",
      className: "text-zinc-400 text-sm",
      render: ({ index, isSelected }) => (isSelected ? <RiPulseFill className="text-green-500" /> : index + 1),
    },
    {
      title: "歌曲",
      key: "song",
      align: "start",
      minWidth: 320,
      columnFraction: 6,
      render: ({ rowData }) => <SongBriefInfo coverUrl={rowData?.al?.picUrl} name={rowData?.name} ars={rowData?.ar} />,
    },
    {
      title: "专辑",
      key: "album",
      align: "start",
      hidden: hideAlbum,
      minWidth: 120,
      columnFraction: 5,
      render: ({ rowData }) => (
        <Link underline="hover" href={`/album/${rowData?.al?.id}`} className="inline-block cursor-pointer truncate text-sm" color="foreground">
          {rowData?.al?.name}
        </Link>
      ),
    },
    {
      title: <RiTimeLine size={16} />,
      key: "duration",
      align: "center",
      className: "text-sm",
      minWidth: 90,
      columnFraction: 2,
      render: ({ rowData }) => <span className="text-zinc-500">{formatDuration(rowData?.dt)}</span>,
    },
    {
      title: "操作",
      key: "operations",
      align: "center",
      minWidth: 100,
      columnFraction: 3,
      render: ({ rowData }) => (
        <div className="inline-flex justify-end space-x-1">
          <SwitchFavorite id={rowData.id} />
          <Collection id={rowData.id} />
        </div>
      ),
    },
  ];

  return columns;
};
