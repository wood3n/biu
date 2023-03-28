import React from 'react';
import { Space, Image, Typography } from 'antd';
import { MdOutlinePlayCircle } from 'react-icons/md';
import type { Ar } from '@/service/recommend-songs';
import styles from './index.module.less';

interface Props {
  picUrl?: string;
  name?: string;
  ar?: Ar[];
  hovering?: boolean;
}

/**
 * 表格歌曲信息列
 */
const TableSongInfo: React.FC<Props> = ({
  picUrl,
  name,
  ar,
  hovering,
}) => (
  <Space>
    <Image
      width={48}
      height={48}
      src={picUrl}
      loading="lazy"
      preview={hovering ? {
        visible: false,
        mask: <MdOutlinePlayCircle />,
      } : false}
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
        {ar?.map<React.ReactNode>(({ id, name: arName }) => (
          <a key={id} className={styles.tableLink}>{arName}</a>
        ))?.reduce((prev, curr) => [prev, ', ', curr])}
      </span>
    </Space>
  </Space>
);

export default TableSongInfo;
