import { useParams } from "react-router-dom";

import { useRequest } from "ahooks";
import { RiStarFill, RiStarLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import PlaylistPage from "@/components/virtual-list-container";
import { getAlbum, getAlbumSub } from "@/service";
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
      t: isSubed ? 2 : 1,
    });
  };

  return (
    <PlaylistPage
      loading={loading}
      hideAlbum
      songs={albumData?.songs}
      coverImageUrl={albumData?.album?.picUrl}
      title={albumData?.album?.name}
      description={albumData?.album?.description}
      owner={{
        avatarUrl: albumData?.album?.artist?.picUrl,
        name: albumData?.album?.artist?.name,
        userId: albumData?.album?.artist?.id,
        link: `/artist/${albumData?.album?.artist?.id}`,
      }}
      extraTool={
        <AsyncButton
          isIconOnly
          onPress={subscribe}
          startContent={isSubed ? <RiStarFill size={16} /> : <RiStarLine size={16} />}
        />
      }
    />
  );
}

export default Album;
