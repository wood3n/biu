import React from 'react';
import { Space, Image, Typography } from 'antd';
import type { Ar } from '@/service/recommend-songs';
import styles from './index.module.less';

interface Props {
  picUrl?: string;
  name?: string;
  ar?: Ar[];
}

/**
 * 表格歌曲信息列
 */
const TableSongInfo: React.FC<Props> = ({
  picUrl,
  name,
  ar,
}) => (
  <Space>
    <Image
      width={48}
      height={48}
      src={picUrl}
      loading="lazy"
      preview={false}
    />
    <Space direction="vertical">
      <Typography.Text
        strong
        ellipsis={{ tooltip: name }}
        style={{ maxWidth: '100%' }}
      >
        {name}
      </Typography.Text>
      <span>
        {ar?.map<React.ReactNode>(({ id, name }) => (
          <a key={id} className={styles.tableLink}>{name}</a>
        ))?.reduce((prev, curr) => [prev, ', ', curr])}
      </span>
    </Space>
  </Space>
);

export default TableSongInfo;
