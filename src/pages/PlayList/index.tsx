import React from 'react';
import { useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { Card, Space, Input } from 'antd';
import PageContainer from '@/components/PageContainer';
import SongDescription from '@/components/SongDescription';
import { getPlaylistDetail, getPlaylistTrackAll } from '@/service';
import MusicTableList from '@/components/MusicTableList';
import TooltipButton from '@/components/TooltipButton';
import { MdPlayCircle, MdDownloadForOffline, MdOutlineSearch } from 'react-icons/md';
import { ReactComponent as PlayRandom } from '@/assets/icons/random.svg';
import styles from './index.module.less';

const PlayList: React.FC = () => {
  const { id } = useParams();

  const { data: playListDetailRes, loading: fetchingPlaylistDetail } = useRequest(() => getPlaylistDetail({
    id,
  }), {
    refreshDeps: [id],
  });

  const { data: playlistTrackDataRes, loading: fetchingPlaylistTrack } = useRequest((page: number = 1) => getPlaylistTrackAll({
    id,
    limit: 30,
    offset: (page - 1) * 30,
  }), {
    refreshDeps: [id],
  });

  return (
    <PageContainer loading={fetchingPlaylistDetail || fetchingPlaylistTrack}>
      <Card bordered={false}>
        <SongDescription
          {...playListDetailRes?.playlist}
        />
        <div className={styles.playlistAction}>
          <Space size={24}>
            <TooltipButton tooltip="播放全部">
              <MdPlayCircle size={64} color="#1fdf64" />
            </TooltipButton>
            <TooltipButton tooltip="随机播放">
              <PlayRandom width={32} height={32} color="#fff" />
            </TooltipButton>
            <TooltipButton tooltip="下载全部">
              <MdDownloadForOffline size={36} />
            </TooltipButton>
          </Space>
          <Input prefix={<MdOutlineSearch />} placeholder="搜索歌曲" style={{ width: 220 }} />
        </div>
        <MusicTableList
          loading={fetchingPlaylistTrack}
          rowKey="id"
          pagination={false}
          dataSource={playlistTrackDataRes?.songs}
        />
      </Card>
    </PageContainer>
  );
};

export default PlayList;
