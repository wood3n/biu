import React from "react";

import { Drawer, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAtomValue } from "jotai";

import { formatDuration } from "@/common/utils";
import type { Song } from "@/service/playlist-track-all";
import { playQueueAtom } from "@/store/play-queue-atom";

import SongDescription from "../song-description";

interface Props {
  visible: boolean;
  onClose: VoidFunction;
}

/**
 * 当前播放列表队列
 */
const PlaylistDrawer: React.FC<Props> = ({ visible, onClose }) => {
  const playQueue = useAtomValue(playQueueAtom);

  const columns: ColumnsType<Song> = [
    {
      dataIndex: "song",
      render: (_, record) => <SongDescription picUrl={record?.al?.picUrl} name={record.name} ar={record.ar} />,
    },
    {
      dataIndex: "dt",
      render: v => formatDuration(v),
    },
  ];

  return (
    <Drawer title="当前播放列表" closable={false} placement="right" onClose={onClose} open={visible} width={600}>
      <Table dataSource={playQueue} columns={columns} pagination={false} rowKey="id" size="small" />
    </Drawer>
  );
};

export default PlaylistDrawer;
