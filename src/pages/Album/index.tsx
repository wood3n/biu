import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/PageContainer';
import { Table } from 'antd';
import { getAlbum, getArtistDetail } from '@/service';
import { type GetAlbumRes, type Song } from '@/service/album';
import AlbumDescription from '@components/AlbumDescription';
import SongDescription from '@components/SongDescription';
import TableDurationIcon from '@components/TableDurationIcon';
import { type ColumnsType } from 'antd/es/table';
import { formatDuration } from '@/common/utils';

const Album = () => {
  const { id } = useParams();
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

  const columns: ColumnsType<Song> = [
    {
      title: '#',
      dataIndex: 'index',
      width: 10,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: '歌曲',
      dataIndex: 'picUrl',
      render: (_, record) => (
        <SongDescription
          // picUrl={record?.al?.picUrl}
          name={record?.name}
          ar={record?.ar}
        />
      ),
    },
    {
      title: <TableDurationIcon />,
      width: 88,
      align: 'center',
      dataIndex: 'dt',
      render: (v) => formatDuration(v),
    },
  ];

  return (
    <PageContainer loading={loading}>
      <AlbumDescription
        {...albumDetail?.album}
      />
      <Table<Song>
        columns={columns}
        dataSource={albumDetail?.songs}
        rowKey="id"
        pagination={false}
        onRow={(record) => ({
          // 双击播放
          onDoubleClick: () => {},
        })}
      />
    </PageContainer>
  );
};

export default Album;
