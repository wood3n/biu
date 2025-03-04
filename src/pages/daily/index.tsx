import React from "react";

import { useRequest } from "ahooks";

import Table from "@/components/table";
import { getRecommendSongs } from "@/service";
import { usePlayingQueue } from "@/store/playing-queue";

import { columns } from "./columns";

const Daily = () => {
  const { data, loading } = useRequest(getRecommendSongs);
  const { currentSong, play } = usePlayingQueue();

  return (
    <div className="p-4">
      <Table
        rowKey="id"
        selectedRowKeys={currentSong ? [currentSong?.id] : undefined}
        columns={columns}
        loading={loading}
        data={data?.data?.dailySongs}
        onDoubleClick={song => play(song, data?.data?.dailySongs)}
      />
    </div>
  );
};

export default Daily;
