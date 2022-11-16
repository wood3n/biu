import React from 'react';
import { Typography, Progress, Tooltip, Card, Table, Image, Space, Divider, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import NavigationButton from '@/components/NavigationButton';
import AvatarChip from '@/components/AvatarChip';
import moment from 'moment';
import { ReactComponent as IconTimeClock } from '@/assets/icons/time.svg';
import { ReactComponent as IconView } from '@/assets/icons/view.svg';
import { useRequest } from 'ahooks';
import { getDailySongs } from '@/service/api';
import styles from './index.module.less';

const getRemainingTimePert = () => (moment().hour() / 24) * 100;

/**
 * 每日推荐
 */
const Daily: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading } = useRequest(getDailySongs);

  const columns: ColumnsType<API.DailySong> = [
    {
      title: '封面',
      dataIndex: 'picUrl',
      width: 50,
      render: (_, record: API.DailySong) => (
        <Image
          width={48}
          src={record?.al?.picUrl}
          preview={{
            mask: <IconView color='#fff' fill='#fff'/>
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
      title: <span className={styles.timeTitle}><IconTimeClock color='#fff'/></span>,
      width: 80,
      align: 'center',
      dataIndex: 'dt',
      render: (v) => moment.utc(moment.duration(v).as('milliseconds')).format('mm:ss')
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.topBar}>
          <NavigationButton />
          <AvatarChip />
        </div>
        <div className={styles.dailyGreet}>
          <div className={styles.date}>
            <Progress
              type='circle'
              strokeColor={{
                '0%': '#fc466b',
                '100%': '#3f5efb',
              }}
              percent={getRemainingTimePert()}
              format={() => (
                <Tooltip title='今日剩余2小时'>
                  {moment().format('MM.DD')}
                </Tooltip>
              )}
            />
          </div>
          <div className={styles.information}>
            <Typography.Title level={2}>云村的第 2359 天</Typography.Title>
            <Typography.Text>32 首歌曲，1 h 15 min</Typography.Text>
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
    </div>
  );
};

export default Daily;
