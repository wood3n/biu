import { Link } from "@heroui/react";
import { RiPulseFill, RiTimeLine } from "@remixicon/react";

import { formatDuration } from "@/common/utils";
import SongBriefInfo from "@/components/song-brief-info";

import { ColumnsType } from "./types";

interface Params {
  hideAlbum?: boolean;
}

export const getColumns = ({ hideAlbum }: Params) => {
  const columns: ColumnsType<Song> = [
    {
      title: "#",
      key: "index",
      align: "center",
      className: "w-12 text-sm text-zinc-500",
      render: ({ index, isSelected }) => (isSelected ? <RiPulseFill className="text-green-500" /> : index + 1),
    },
    {
      title: "歌曲",
      key: "song",
      className: "flex-[5]",
      render: ({ rowData }) => <SongBriefInfo coverUrl={rowData?.al?.picUrl} name={rowData?.name} ars={rowData?.ar} />,
    },
    {
      title: "专辑",
      key: "album",
      hidden: hideAlbum,
      className: "flex-[4]",
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
      className: "w-[100px] text-sm",
      render: ({ rowData }) => <span className="text-zinc-500">{formatDuration(rowData?.dt)}</span>,
    },
  ];

  return columns;
};
