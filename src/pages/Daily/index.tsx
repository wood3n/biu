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
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import PageContainer from '@/components/PageContainer';
import { BiTime } from 'react-icons/bi';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { useRequest } from 'ahooks';
import { getDailySongs } from '@/service';
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

  const { data, loading } = useRequest(getDailySongs);

  const columns: ColumnsType<API.DailySong> = [
    {
      title: '封面',
      dataIndex: 'picUrl',
      width: 50,
      render: (_, record: API.DailySong) => (
        <Image
          width={48}
          height={48}
          src={record?.al?.picUrl}
          loading='lazy'
          preview={{
            mask: <MdOutlineRemoveRedEye />
          }}
        />
      )
    },
    {
      title: '歌名',
      width: 200,
      dataIndex: 'name',
      render: v => (
        <Typography.Text ellipsis={{ tooltip: v }} style={{ maxWidth: 200 }}>{v}</Typography.Text>
      )
    },
    {
      title: '专辑',
      width: 160,
      dataIndex: 'al',
      render: (_, record: API.DailySong) => (
        <Typography.Text ellipsis={{ tooltip: record?.al?.name }} style={{ maxWidth: 160 }}>
          <a>{record?.al?.name ?? '-'}</a>
        </Typography.Text>
      )
    },
    {
      title: '歌手',
      width: 200,
      dataIndex: 'singer',
      render: (_, record: API.DailySong) => {
        const arts = record?.ar?.map(({ name }) => name) ?? [];
        return (
          <Typography.Text
            ellipsis={{
              tooltip: (
                <Space size={2} split={<Divider type='vertical' />}>
                  {arts.map((name) => (
                    <a key={name}>{name}</a>
                  ))}
                </Space>
              )
            }}
            style={{ maxWidth: 80 }}
          >
            {(arts.length ?? 0) <= 1 ? <a>{arts}</a> : arts.join(' | ')}
          </Typography.Text>
        );
      }
    },
    {
      title: <BiTime size={16}/>,
      width: 80,
      align: 'center',
      dataIndex: 'dt',
      render: (v) => moment.utc(moment.duration(v).as('milliseconds')).format('mm:ss')
    }
  ];

  const timeLength = data?.data?.dailySongs?.reduce((acc, { dt }) => acc + (dt ?? 0), 0);

  return (
    <PageContainer contentStyle={{ margin: 0 }}>
      <div className={styles.pageHeader}>
        <div className={styles.dailyGreet}>
          <Clock className={styles.clock} value={clock} renderMinuteMarks={false} size={120}/>
          <div className={styles.information}>
            <Typography.Title level={2}>{moment().format('YYYY-MM-DD')}</Typography.Title>
            <Typography.Title level={5} type='secondary'>云村的第 2359 天</Typography.Title>
            {data?.data?.dailySongs && (
              <Typography.Text type='secondary'>
                {`${data.data.dailySongs.length} 首歌曲，${moment.utc(moment.duration(timeLength).as('milliseconds')).format('h [小时] mm [分钟]')}`}
              </Typography.Text>
            )}
          </div>
        </div>
      </div>
      <Card bordered={false}>
        <Table<API.DailySong>
          rowKey='id'
          columns={columns}
          loading={loading}
          dataSource={data?.data?.dailySongs}
          pagination={false}
        />
      </Card>
    </PageContainer>
  );
};

export default Daily;
