import React from 'react';
import { Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import NavigationButton from '@/components/NavigationButton';
import AvatarChip from '@/components/AvatarChip';
import Today from '@/components/Today';
import { useAntdTable } from 'ahooks';
import { getDailySongs } from '@/service/api';
import styles from './index.module.less';

/**
 * 每日推荐
 */
const Daily = React.memo(() => {
  // FIXME:
  // TODO:
  // const { tableProps } = useAntdTable(getDailySongs);

  const columns: ColumnsType<API.DailySong> = [
    {
      title: '封面',
      dataIndex: 'pic'
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
            <Today />
          </div>
          <div className={styles.information}>
            <Typography.Title level={1}>Good Morning</Typography.Title>
            <Typography.Title level={4}>云村的第 2359 天</Typography.Title>
            <Typography.Text>32 首歌曲，1 h 15 min</Typography.Text>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Daily;
