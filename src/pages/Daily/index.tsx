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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import PageContainer from '@/components/PageContainer';
import SongDescription from '@/components/SongDescription';
import { CgLoadbarSound } from 'react-icons/cg';
import { MdAccessTime } from 'react-icons/md';
import { useRequest } from 'ahooks';
import { getRecommendSongs } from '@/service';
import type { DailySong } from '@/service/recommend-songs';
import { formatDuration } from '@/common/utils';
import styles from './index.module.less';

/**
 * 每日推荐
 */
const Daily: React.FC = () => {
  const navigate = useNavigate();
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const { data, loading } = useRequest(getRecommendSongs);

  const columns: ColumnsType<DailySong> = [
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
          picUrl={record?.al?.picUrl}
          name={record?.name}
          ar={record?.ar}
        />
      ),
    },
    {
      title: '专辑',
      width: 320,
      dataIndex: 'al',
      render: (_, record) => (
        <Typography.Text ellipsis={{ tooltip: record?.al?.name }} style={{ maxWidth: 160 }}>
          <a className={styles.tableLink}>{record?.al?.name ?? '-'}</a>
        </Typography.Text>
      ),
    },
    {
      title: <span className={styles.timeTitle}><MdAccessTime size={18} /></span>,
      width: 88,
      align: 'center',
      dataIndex: 'dt',
      render: (v) => formatDuration(v),
    },
  ];

  const timeLength = data?.data?.dailySongs?.reduce((acc, { dt }) => acc + (dt ?? 0), 0) ?? 0;

  return (
    <PageContainer contentStyle={{ margin: 0 }}>
      <div className={styles.pageHeader}>
        <div className={styles.dailyGreet}>
          <Clock className={styles.clock} value={clock} renderMinuteMarks={false} size={120} />
          <div className={styles.information}>
            <Typography.Title level={2}>{moment().format('YYYY-MM-DD')}</Typography.Title>
            <Typography.Title level={5} type="secondary">云村的第 2359 天</Typography.Title>
            {data?.data?.dailySongs && (
              <Typography.Text type="secondary">
                {`${data.data.dailySongs.length} 首歌曲，${formatDuration(timeLength, 'h [小时] mm [分钟]')}`}
              </Typography.Text>
            )}
          </div>
        </div>
      </div>
      <Card bordered={false}>
        <Table<DailySong>
          rowKey="id"
          columns={columns}
          loading={loading}
          dataSource={data?.data?.dailySongs}
          pagination={false}
          rowClassName={styles.tableRow}
          onRow={(record) => ({
            onClick: (event) => {}, // 点击行
            onDoubleClick: (event) => {},
            onContextMenu: (event) => {},
            onMouseEnter: (event) => {}, // 鼠标移入行
            onMouseLeave: (event) => {},
          })}
        />
      </Card>
    </PageContainer>
  );
};

export default Daily;
