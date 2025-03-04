import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useRequest } from "ahooks";

import { getArtistSublist } from "@/service";

import List from "./List";

const Artists = () => {
  const navigate = useNavigate();
  const urlParams = useParams();

  const { data, loading } = useRequest(async () => {
    const res = await getArtistSublist({
      limit: 1000,
      offset: 0,
    });

    return res?.data;
  });

  return (
    <List
      loading={loading}
      list={data}
      aria-label="我收藏的艺人列表"
      renderItem={artist => (
        <List.Item
          key={artist?.id}
          imgUrl={artist?.picUrl}
          title={artist?.name}
          description={`${artist?.albumSize}首专辑`}
          isSelected={String(artist?.id) === urlParams?.id}
          onPointerDown={() => navigate(`/artist/${artist?.id}`)}
        />
      )}
    />
  );
};

export default Artists;
