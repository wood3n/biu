import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import ScrollContainer from "@/components/scroll-container";
import { useFavoriteAlbums } from "@/store/user-favorite-album";

import List from "./List";

const Albums = () => {
  const navigate = useNavigate();
  const urlParams = useParams();
  const albums = useFavoriteAlbums(store => store.albums);

  return (
    <ScrollContainer className="h-full">
      <List
        list={albums || []}
        aria-label="我收藏的专辑列表"
        renderItem={album => (
          <List.Item
            key={album?.id}
            imgUrl={album?.picUrl}
            title={album?.name}
            description={`${album?.size}首`}
            isSelected={String(album?.id) === urlParams?.id}
            onPointerDown={() => navigate(`/album/${album?.id}`)}
          />
        )}
      />
    </ScrollContainer>
  );
};

export default Albums;
