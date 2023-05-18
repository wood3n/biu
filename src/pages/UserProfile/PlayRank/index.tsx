import { Typography, Tabs, Table } from 'antd';
import React, { useEffect, useState } from 'react';
// import { useUser } from '@/common/hooks';
import useUser from '@/store/userAtom';
import { getUserRecord } from '@/service';
import type { Song } from '@/service/user-record';
import { useRequest } from 'ahooks';
import type { ColumnsType } from 'antd/es/table';
import { MdAccessTime } from 'react-icons/md';
import { formatDuration } from '@/common/utils';
import SongDescription from '@/components/song-description';
import styles from './index.module.less';

/**
 * 我的听歌排行
 */
const MyPlayRank: React.FC = () => {
  const [user] = useUser();
  const [type, setType] = useState('1');

  const { data, runAsync, loading } = useRequest(getUserRecord, {
    manual: true,
  });

  useEffect(() => {
    if (user?.userInfo?.profile?.userId) {
      runAsync({
        uid: user.userInfo.profile.userId,
        type,
      });
    }
  }, [user?.userInfo?.profile?.userId, type]);

  const columns: ColumnsType<Song> = [
    {
      title: '歌曲',
      dataIndex: 'song',
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
      dataIndex: ['al', 'name'],
      render: (_, record) => (
        <a className={styles.tableLink}>{record?.al?.name ?? ''}</a>
      ),
    },
    {
      title: <span className={styles.timeTitle}><MdAccessTime size={18} /></span>,
      align: 'center',
      width: 88,
      dataIndex: 'dt',
      render: (v) => formatDuration(v),
    },
  ];

  return (
    <>
      <Typography.Title level={2}>听歌排行</Typography.Title>
      <Tabs
        size="large"
        activeKey={type}
        onChange={(key) => setType(key)}
        items={[
          {
            label: '最近一周',
            key: '1',
          },
          {
            label: '所有时间',
            key: '0',
          },
        ]}
      />
      <Table
        rowKey="id"
        size="small"
        loading={loading}
        columns={columns}
        dataSource={type === '1'
          ? data?.weekData?.map(({ song }) => song)
          : data?.allData?.map(({ song }) => song)}
        pagination={false}
      />
    </>
  );
};

export default MyPlayRank;
