import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Space, Image, Typography } from 'antd';
import type { Ar } from '@/service/recommend-songs';
import styles from './index.module.less';

interface Props {
  picUrl?: string;
  name?: string;
  ar?: Ar[];
}

/**
 * 歌曲信息描述、图片、歌名、歌手名
 */
const SongDescription: React.FC<Props> = ({
  picUrl,
  name,
  ar,
}) => {
  const navigate = useNavigate();

  return (
    <Space>
      {picUrl && (
        <Image
          width={48}
          height={48}
          src={picUrl}
          loading="lazy"
          preview={false}
        />
      )}
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
            <a
              key={id}
              className={styles.tableLink}
              onClick={() => navigate(`/artist/${id}`)}
            >
              {arName}
            </a>
          ))?.reduce((prev, curr) => [prev, ', ', curr])}
        </span>
      </Space>
    </Space>
  );
};

export default SongDescription;
