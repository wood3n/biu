import { Link } from "@heroui/react";
import { RiPulseFill, RiTimeLine } from "@remixicon/react";

import { formatDuration } from "@/common/utils";
import SongBriefInfo from "@/components/song-brief-info";

import { StyleConfig } from "./config";
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
      className: "flex-[5_0]",
      render: ({ rowData }) => (
        <SongBriefInfo coverUrl={rowData?.al?.picUrl} name={rowData?.name} ars={rowData?.ar} className="w-full" />
      ),
    },
    {
      title: "专辑",
      key: "album",
      hidden: hideAlbum,
      className: "flex-[4_0]",
      render: ({ rowData }) =>
        rowData?.al?.name ? (
          <Link
            underline="hover"
            href={`/album/${rowData?.al?.id}`}
            className="inline-block cursor-pointer truncate text-sm"
            color="foreground"
          >
            {rowData?.al?.name}
          </Link>
        ) : (
          <span className="text-sm opacity-70">未知</span>
        ),
    },
    {
      title: <RiTimeLine size={StyleConfig.RowHeaderIconSize} />,
      key: "duration",
      align: "center",
      className: "w-[100px] text-sm",
      render: ({ rowData }) => <span className="text-zinc-500">{formatDuration(rowData?.dt)}</span>,
    },
  ];

  return columns;
};
