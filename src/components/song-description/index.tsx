import React from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import { MdOutlineMoreHoriz } from 'react-icons/md';
import type { Ar } from '@/service/recommend-songs';
import Image from '../image';
import OverflowText from '../overflow-text';
import DropDown from '../dropdown';
import styles from './index.module.less';

interface Props {
  picUrl?: string;
  name?: string;
  ar: Ar[];
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
        <Image
          width={50}
          height={50}
          src={picUrl}
        />
      )}
      <Stack spacing="4px">
        <OverflowText title={name}>
          {name}
        </OverflowText>
        <div className={styles.ars}>
          {ar?.slice(0, 3)?.map<React.ReactNode>(({ id, name: arName }) => (
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
          ))?.reduce((prev, curr) => [prev, '，', curr])}
          {ar?.length > 3 && (
            <DropDown menus={ar?.slice(3).map(({ id, name: arName }) => ({
              key: id,
              label: arName,
              onClick: () => navigate(`/artist/${id}`),
            }))}
            >
              <MdOutlineMoreHoriz size={18} />
            </DropDown>
          )}
        </div>
      </Stack>
    </Stack>
  );
};

export default SongDescription;
