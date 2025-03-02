import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getAlbum, getArtistDetail } from "@/service";
import type { GetAlbumRes } from "@/service/album";
import { useUser } from "@/store/user";

function Album() {
  const { id } = useParams();
  const user = useUser(store => store.user);
  const [loading, setLoading] = useState(false);
  const [albumDetail, setAlbumDetail] = useState<GetAlbumRes>();

  const getAlbumDetail = async () => {
    setLoading(true);
    try {
      const getAlbumRes = await getAlbum({ id: String(id) });
      if (getAlbumRes?.album?.artists?.length) {
        const arsDetailRes = await Promise.all(
          getAlbumRes.album.artists.map(({ id }) =>
            getArtistDetail({
              id: String(id),
            }),
          ),
        );

        setAlbumDetail({
          ...getAlbumRes,
          album: {
            ...getAlbumRes.album,
            artists: getAlbumRes!.album!.artists!.map(oldAr => {
              const newAr = arsDetailRes.find(newArItem => oldAr.id === newArItem?.data?.artist?.id);
              if (newAr?.data?.artist?.cover) {
                return {
                  ...oldAr,
                  picUrl: newAr.data.artist.cover,
                };
              }

              return oldAr;
            }),
          },
        });
      } else if (getAlbumRes) {
        setAlbumDetail(getAlbumRes);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getAlbumDetail();
    }
  }, [id]);

  return <div>专辑</div>;
}

export default Album;
