import React from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import type { Ar } from '@/service/recommend-songs';
import OverflowText from '../overflow-text';
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
    <Stack direction="row" alignItems="center" spacing={2}>
      {picUrl && (
        <img
          alt="name"
          width={48}
          height={48}
          src={picUrl}
          loading="lazy"
        />
      )}
      <Stack spacing={1}>
        <OverflowText title={name}>
          {name}
        </OverflowText>
        <Stack direction="row" spacing={1}>
          {ar?.map<React.ReactNode>(({ id, name: arName }) => (
            <OverflowText
              key={id}
              className={styles.arLink}
              onClick={() => navigate(`/artist/${id}`)}
              title={arName}
              style={{
                maxWidth: 100,
              }}
            >
              {arName}
            </OverflowText>
          ))?.reduce((prev, curr) => [prev, ', ', curr])}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default SongDescription;
