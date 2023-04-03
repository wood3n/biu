import React from 'react';
import {
  Typography, Image, Space, Modal,
} from 'antd';
import type { Playlist } from '@/service/playlist-detail';
import { formatMillisecond } from '@/common/utils';
import { IMAGE_ERR } from '@/common/constants';
import styles from './index.module.less';

interface Props extends Playlist{
}

/**
 * 歌曲详情描述
 */
const PlaylistDescription: React.FC<Props> = ({
  name,
  coverImgUrl,
  description,
  trackCount,
  createTime,
}) => (
  <div className={styles.playlistDescription}>
    <Image
      preview={false}
      width={200}
      height={200}
      src={coverImgUrl}
      fallback={IMAGE_ERR}
      className={styles.coverImage}
    />
    <Space direction="vertical">
      <Typography.Title>{name}</Typography.Title>
      <Typography.Text>
        创建时间：
        {formatMillisecond(createTime)}
      </Typography.Text>
      <Typography.Text>
        歌曲数：
        {trackCount}
      </Typography.Text>
      <Typography.Paragraph
        ellipsis={{
          rows: 2,
          expandable: true,
          symbol: (
            <a
              onClick={(e) => {
                e.stopPropagation();
                Modal.info({
                  title: '歌单详情信息',
                  content: description,
                });
              }}
            >
              more
            </a>
          ),
        }}
      >
        {description}
      </Typography.Paragraph>
    </Space>
  </div>
);

export default PlaylistDescription;
