import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/page-container';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import {
  getAlbum, getArtistDetail, postLike, getLikelist,
} from '@/service';
import { type GetAlbumRes, type Song } from '@/service/album';
import SongDescription from '@/components/song-description';
import TooltipButton from '@/components/tooltip-button';
import { formatDuration } from '@/common/utils';
import { HTTP_RESPONSE } from '@/common/constants';
import { useAtom, useAtomValue } from 'jotai';
import { likelistAtom } from '@/store/likelist-atom';
import { userAtom } from '@/store/user-atom';

const Album = () => {
  const { id } = useParams();
  const user = useAtomValue(userAtom);
  const [likelist, setLikelist] = useAtom(likelistAtom);
  const [loading, setLoading] = useState(false);
  const [albumDetail, setAlbumDetail] = useState<GetAlbumRes>();

  const getAlbumDetail = async () => {
    setLoading(true);
    try {
      const getAlbumRes = await getAlbum({ id: String(id) });
      if (getAlbumRes?.album?.artists?.length) {
        const arsDetailRes = await Promise.all(getAlbumRes.album.artists.map(({ id }) => getArtistDetail({
          id: String(id),
        })));

        setAlbumDetail({
          ...getAlbumRes,
          album: {
            ...getAlbumRes.album,
            artists: getAlbumRes!.album!.artists!.map((oldAr) => {
              const newAr = arsDetailRes.find((newArItem) => oldAr.id === newArItem?.data?.artist?.id);
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

  const haddleLike = async (id: number, like: boolean = true) => {
    const { code } = await postLike({ id, like });
    if (code === HTTP_RESPONSE.SUCCESS) {
      const { ids } = await getLikelist({ uid: user?.userInfo?.profile?.userId });
      setLikelist(ids);
    }
  };

  return (
    <PageContainer>
      专辑
    </PageContainer>
  );
};

export default Album;
