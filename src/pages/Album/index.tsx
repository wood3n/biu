import { useEffect, useState } from 'react';
import { Card } from 'antd';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/PageContainer';
import { getAlbum, getArtistDetail } from '@/service';
import { type Album as AlBumDetailType } from '@/service/album';
import AlbumDescription from '@components/AlbumDescription';

const Album = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [albumDetail, setAlbumDetail] = useState<AlBumDetailType>();

  const getAlbumDetail = async () => {
    setLoading(true);
    try {
      const getAlbumRes = await getAlbum({ id: String(id) });
      if (getAlbumRes?.album?.artists?.length) {
        const arsDetailRes = await Promise.all(getAlbumRes.album.artists.map(({ id }) => getArtistDetail({
          id: String(id),
        })));

        setAlbumDetail({
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
        });
      } else if (getAlbumRes?.album) {
        setAlbumDetail(getAlbumRes.album);
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

  return (
    <PageContainer loading={loading}>
      <Card bordered={false}>
        <AlbumDescription
          {...albumDetail}
        />
      </Card>
    </PageContainer>
  );
};

export default Album;
