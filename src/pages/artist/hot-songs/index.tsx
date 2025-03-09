import React from "react";
import { useParams } from "react-router-dom";

import { useRequest } from "ahooks";

import Table from "@/components/table";
import { getArtistTopSong } from "@/service";
import { usePlayingQueue } from "@/store/playing-queue";

import { columns } from "./columns";

const HotSongs = () => {
  const { id } = useParams();
  const { currentSong, play } = usePlayingQueue();

  const { data, loading } = useRequest(() => getArtistTopSong({ id }), {
    refreshDeps: [id],
  });

  return (
    <Table
      rowKey="id"
      selectedRowKeys={currentSong ? [currentSong?.id] : undefined}
      columns={columns}
      loading={loading}
      data={data?.songs}
      onDoubleClick={song => play(song, data?.songs)}
    />
  );
};

export default HotSongs;
