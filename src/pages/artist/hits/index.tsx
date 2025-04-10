import React from "react";
import { useParams } from "react-router-dom";

import { useRequest } from "ahooks";

import If from "@/components/if";
import { SongList } from "@/components/song-list";
import SonglistToolbar from "@/components/song-list-toolbar";
import { getArtistTopSong } from "@/service";

const Hits = () => {
  const { id } = useParams();

  const { data, loading } = useRequest(() => getArtistTopSong({ id }), {
    refreshDeps: [id],
  });

  return (
    <>
      <If condition={Boolean(data?.songs?.length)}>
        <SonglistToolbar songs={data?.songs as Song[]} className="mb-4" />
      </If>
      <SongList loading={loading} songs={data?.songs} />
    </>
  );
};

export default Hits;
