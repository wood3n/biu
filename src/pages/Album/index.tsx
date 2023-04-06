import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/PageContainer';
import { Table } from 'antd';
import { type ColumnsType } from 'antd/es/table';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import {
  getAlbum, getArtistDetail, postLike, getLikelist,
} from '@/service';
import { type GetAlbumRes, type Song } from '@/service/album';
import AlbumDescription from '@components/AlbumDescription';
import SongDescription from '@components/SongDescription';
import TableDurationIcon from '@components/TableDurationIcon';
import TooltipButton from '@components/TooltipButton';
import { formatDuration } from '@/common/utils';
import { HTTP_RESPONSE } from '@/common/constants';
import { useAtom, useAtomValue } from 'jotai';
import { likelistAtom } from '@/store/likelistAtom';
import { userAtom } from '@/store/userAtom';

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

  console.log(likelist);
  const columns: ColumnsType<Song> = [
    {
      dataIndex: 'favorite',
      width: 32,
      align: 'center',
      render: (_, record) => (record.id && likelist.includes(record.id) ? (
        <TooltipButton
          tooltip="取消喜欢"
          onClick={() => haddleLike(record.id, false)}
        >
          <MdFavorite color="red" />
        </TooltipButton>
      ) : (
        <TooltipButton
          tooltip="喜欢"
          onClick={() => haddleLike(record.id)}
        >
          <MdFavoriteBorder color="red" />
        </TooltipButton>
      )),
    },
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
