import { useParams } from "react-router-dom";

import { useRequest } from "ahooks";
import { RiStarFill, RiStarLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import VirtualSongListContainer from "@/components/virtual-songlist-container";
import { getAlbum, getAlbumSub } from "@/service";
import { AlbumSubState } from "@/service/album-sub";
import { useFavoriteAlbums } from "@/store/user-favorite-album";

function Album() {
  const { id } = useParams();
  const userSubscribeAlbums = useFavoriteAlbums(store => store.albums);

  const { data: albumData, loading } = useRequest(() => getAlbum({ id: String(id) }), {
    refreshDeps: [id],
  });

  const isSubed = userSubscribeAlbums?.find(album => album?.id === albumData?.album?.id);

  const subscribe = async () => {
    await getAlbumSub({
      id,
      t: isSubed ? AlbumSubState.Unsubscribed : AlbumSubState.Subscribed,
    });
  };

  return (
    <VirtualSongListContainer
      loading={loading}
      hideAlbum
      songs={albumData?.songs}
      coverImageUrl={albumData?.album?.picUrl}
      title={albumData?.album?.name}
      description={albumData?.album?.description}
      user={{
        avatarUrl: albumData?.album?.artist?.picUrl,
        name: albumData?.album?.artist?.name,
        userId: albumData?.album?.artist?.id,
        link: `/artist/${albumData?.album?.artist?.id}`,
      }}
      trackCount={albumData?.album?.size}
      extraTool={
        <AsyncButton isIconOnly onPress={subscribe}>
          {isSubed ? <RiStarFill size={18} /> : <RiStarLine size={18} />}
        </AsyncButton>
      }
    />
  );
}

export default Album;
