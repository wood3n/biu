import React, { useState, useEffect } from 'react';
import {
  Typography,
  Progress,
  Tooltip,
  Card,
  Table,
  Image,
  Space,
  Divider,
  Button,
  List,
  Skeleton,
} from 'antd';
import Stack from '@mui/material/Stack';
import 'react-clock/dist/Clock.css';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import SongList from '@/components/song-list';
import PageContainer from '@/components/PageContainer';
import TooltipButton from '@/components/tooltip-button';
import {
  MdPlayCircle,
  MdSkipNext,
  MdQueueMusic,
  MdShuffle,
  MdAdd,
  MdDownloadForOffline,
  MdOutlineSearch,
  MdFileDownload,
  MdShare,
  MdOutlinePlaylistAddCircle,
} from 'react-icons/md';
import { useRequest } from 'ahooks';
import useUser from '@/store/userAtom';
import { getRecommendSongs } from '@/service';
import { formatDuration } from '@/common/utils';
import ListHeader from './ListHeader';
import ListRow from './ListRow';
import styles from './index.module.less';

/**
 * 每日推荐
 */
const Daily: React.FC = () => {
  const [user] = useUser();

  const { data, loading } = useRequest(getRecommendSongs);

  const timeLength = data?.data?.dailySongs?.reduce((acc, { dt }) => acc + (dt ?? 0), 0) ?? 0;

  return (
    <div>
      {/* <div className={styles.pageHeader}>
        <div className={styles.dailyGreet}>
          <Clock className={styles.clock} value={clock} renderMinuteMarks={false} size={120} />
          <div className={styles.information}>
            <Typography.Title level={2}>{moment().format('YYYY-MM-DD')}</Typography.Title>
            {user?.userInfo?.createDays && (
              <Typography.Title level={5} type="secondary">
                {`云村的第 ${user.userInfo.createDays} 天`}
              </Typography.Title>
            )}
            {data?.data?.dailySongs && (
              <Typography.Text type="secondary">
                {`${data.data.dailySongs.length} 首歌曲，${formatDuration(timeLength, 'h [小时] mm [分钟]')}`}
              </Typography.Text>
            )}
          </div>
        </div>
      </div> */}
      {/* <Stack direction="row" spacing="32px">
        <TooltipButton tooltip="播放全部">
          <MdPlayCircle className={styles.playBtn} color="#1fdf64" size={64} />
        </TooltipButton>
        <TooltipButton tooltip="随机播放">
          <MdShuffle size={36} />
        </TooltipButton>
        <TooltipButton tooltip="创建新歌单">
          <MdOutlinePlaylistAddCircle size={36} />
        </TooltipButton>
        <TooltipButton tooltip="下载全部">
          <MdDownloadForOffline size={36} />
        </TooltipButton>
      </Stack> */}
      <SongList
        data={data?.data?.dailySongs ?? []}
      />
    </div>
  );
};

export default Daily;
