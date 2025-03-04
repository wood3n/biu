import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useUserPlayList } from "@/store/user-playlist";

import List from "./List";

const PlayList = () => {
  const navigate = useNavigate();
  const urlParams = useParams();

  const { likeList, createList, collectList } = useUserPlayList();

  const list = [likeList, ...(createList ?? []), ...(collectList ?? [])].filter(Boolean);

  if (list?.length === 0) return <div>暂无数据</div>;

  return (
    <List
      list={list}
      aria-label="我的歌单列表"
      renderItem={playlist => (
        <List.Item
          key={playlist?.id}
          imgUrl={playlist?.coverImgUrl}
          title={playlist?.name}
          description={`${playlist?.trackCount}首`}
          isSelected={String(playlist?.id) === urlParams?.pid}
          onPointerDown={() => navigate(`/playlist/${playlist?.id}`)}
        />
      )}
    />
  );
};

export default PlayList;
